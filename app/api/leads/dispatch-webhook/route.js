import { neon } from '@neondatabase/serverless';
import { Receiver } from '@upstash/qstash';

export async function POST(request) {
  // Read raw body once — we need it both for signature verification and JSON parsing
  const bodyText = await request.text();

  // Verify the request actually came from QStash (signed with our keys).
  // Mandatory: refuse to process if signing key isn't configured to prevent
  // anyone from triggering webhook fires by hitting this URL directly.
  if (!process.env.QSTASH_CURRENT_SIGNING_KEY) {
    return Response.json({ error: 'QSTASH_CURRENT_SIGNING_KEY not configured' }, { status: 500 });
  }

  const signature = request.headers.get('upstash-signature');
  if (!signature) {
    return Response.json({ error: 'Missing signature' }, { status: 401 });
  }

  try {
    const receiver = new Receiver({
      currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY,
      nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY || process.env.QSTASH_CURRENT_SIGNING_KEY,
    });
    const isValid = await receiver.verify({
      signature,
      body: bodyText,
    });
    if (!isValid) {
      return Response.json({ error: 'Invalid signature' }, { status: 401 });
    }
  } catch (err) {
    return Response.json({ error: 'Signature verification failed' }, { status: 401 });
  }

  let payload;
  try {
    payload = JSON.parse(bodyText);
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const leadId = payload?.lead_id;
  if (!leadId) {
    return Response.json({ error: 'lead_id required' }, { status: 400 });
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    return Response.json({ ok: false, error: 'No DATABASE_URL' }, { status: 500 });
  }

  const sql = neon(databaseUrl);
  const rows = await sql`
    SELECT id, first_name, email, phone, phone_country, source, ip, user_agent, referrer, utm, status
    FROM leads
    WHERE id = ${leadId}
    LIMIT 1
  `;

  if (rows.length === 0) {
    return Response.json({ ok: true, skipped: true, reason: 'not_found', lead_id: leadId });
  }
  const lead = rows[0];

  if (lead.status !== 'pending') {
    // User already booked (or webhook already fired). Skip.
    return Response.json({ ok: true, skipped: true, reason: lead.status, lead_id: leadId });
  }

  const webhookUrl = process.env.LEAD_WEBHOOK_URL;
  if (!webhookUrl) {
    return Response.json({ ok: false, error: 'LEAD_WEBHOOK_URL not configured' }, { status: 500 });
  }

  const utm = lead.utm || {};
  const attribution = { ...utm };
  if (lead.referrer) attribution.referrer = lead.referrer;

  const webhookPayload = {
    event: 'lead.created',
    timestamp: new Date().toISOString(),
    lead: {
      name: lead.first_name,
      first_name: lead.first_name,
      email: lead.email,
      phone: lead.phone,
      phone_country: lead.phone_country,
      source: lead.source || 'pick_a_time',
      lead_id: lead.id,
      ip: lead.ip,
      user_agent: lead.user_agent,
    },
  };
  if (Object.keys(attribution).length) webhookPayload.attribution = attribution;
  if (process.env.LEAD_WEBHOOK_SEQUENCE_ID) {
    webhookPayload.sequence_id = process.env.LEAD_WEBHOOK_SEQUENCE_ID;
  }

  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'User-Agent': 'DataStaqAI-LeadWebhook/1.0 (+https://datastaq.ai)',
  };
  if (process.env.LEAD_WEBHOOK_SECRET) headers['x-webhook-secret'] = process.env.LEAD_WEBHOOK_SECRET;
  if (process.env.LEAD_WEBHOOK_WORKSPACE_ID) headers['x-workspace-id'] = process.env.LEAD_WEBHOOK_WORKSPACE_ID;

  let statusCode = 0;
  let ok = false;

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(webhookPayload),
      redirect: 'follow',
    });
    statusCode = res.status;
    ok = res.ok;
    if (!ok) {
      const errBody = await res.text().catch(() => '');
      const truncated = errBody.length > 500 ? errBody.slice(0, 500) + '…' : errBody;
      console.error(`Webhook failed for lead ${lead.id} (status ${statusCode}):`, truncated);
    }
  } catch (err) {
    console.error(`Webhook fetch error for lead ${lead.id}:`, err);
  }

  const newStatus = ok ? 'webhook_sent' : 'webhook_failed';
  // Conditional WHERE so a race-y 'booked' update wins over us.
  await sql`
    UPDATE leads
    SET status = ${newStatus},
        webhook_dispatched_at = NOW(),
        webhook_attempts = webhook_attempts + 1,
        webhook_last_status_code = ${statusCode}
    WHERE id = ${lead.id} AND status = 'pending'
  `;

  return Response.json({
    ok: true,
    lead_id: lead.id,
    webhook_status: ok ? 'sent' : 'failed',
    status_code: statusCode,
  });
}
