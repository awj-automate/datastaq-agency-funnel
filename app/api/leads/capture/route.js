import { neon } from '@neondatabase/serverless';
import { Client as QstashClient } from '@upstash/qstash';

let schemaInitialized = false;

async function ensureSchema(sql) {
  if (schemaInitialized) return;
  await sql`
    CREATE TABLE IF NOT EXISTS leads (
      id BIGSERIAL PRIMARY KEY,
      first_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      phone_country TEXT,
      source TEXT,
      ip TEXT,
      user_agent TEXT,
      referrer TEXT,
      utm JSONB,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending'`;
  await sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS booked_at TIMESTAMPTZ`;
  await sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS webhook_dispatched_at TIMESTAMPTZ`;
  await sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS webhook_attempts INT NOT NULL DEFAULT 0`;
  await sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS webhook_last_status_code INT`;
  await sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS qstash_message_id TEXT`;
  await sql`CREATE INDEX IF NOT EXISTS leads_email_idx ON leads (email)`;
  await sql`CREATE INDEX IF NOT EXISTS leads_created_at_idx ON leads (created_at DESC)`;
  await sql`CREATE INDEX IF NOT EXISTS leads_email_status_idx ON leads (email, status)`;
  // Backfill: emails are matched case-insensitively, so canonicalise any
  // legacy mixed-case rows. Idempotent — no-op once everything is lowercase.
  await sql`UPDATE leads SET email = LOWER(email) WHERE email <> LOWER(email)`;
  schemaInitialized = true;
}

function resolveBaseUrl(request) {
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/$/, '');
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  const host = request.headers.get('host');
  if (host) return `https://${host}`;
  return null;
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const first_name = (body.first_name || '').toString().trim();
  const email = (body.email || '').toString().trim().toLowerCase();
  const phone = (body.phone || '').toString().trim() || null;
  const phone_country = (body.phone_country || '').toString().trim() || null;
  const source = (body.source || 'pick_a_time').toString().trim();
  const referrer = (body.referrer || '').toString().trim() || null;
  const utm = body.utm && typeof body.utm === 'object' ? body.utm : null;

  if (!first_name || !email) {
    return Response.json({ error: 'first_name and email are required' }, { status: 400 });
  }

  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    null;
  const userAgent = request.headers.get('user-agent') || null;

  const databaseUrl = process.env.DATABASE_URL;
  let leadId = null;

  if (databaseUrl) {
    try {
      const sql = neon(databaseUrl);
      await ensureSchema(sql);
      const rows = await sql`
        INSERT INTO leads (first_name, email, phone, phone_country, source, ip, user_agent, referrer, utm, status)
        VALUES (${first_name}, ${email}, ${phone}, ${phone_country}, ${source}, ${ip}, ${userAgent}, ${referrer}, ${utm}, 'pending')
        RETURNING id
      `;
      leadId = rows[0]?.id ?? null;
    } catch (err) {
      console.error('Lead DB write failed:', err);
    }
  }

  // Schedule a one-shot delayed message via QStash. After the delay, QStash
  // POSTs to /api/leads/dispatch-webhook which checks if the lead is still
  // 'pending' (i.e. they didn't book) and only then fires the external webhook.
  if (leadId && process.env.QSTASH_TOKEN) {
    const timeoutMinutes = parseInt(process.env.LEAD_PENDING_TIMEOUT_MINUTES || '10', 10);
    const baseUrl = resolveBaseUrl(request);
    if (baseUrl) {
      try {
        const qstash = new QstashClient({ token: process.env.QSTASH_TOKEN });
        const result = await qstash.publishJSON({
          url: `${baseUrl}/api/leads/dispatch-webhook`,
          body: { lead_id: leadId },
          delay: timeoutMinutes * 60,
        });
        if (databaseUrl && result?.messageId) {
          try {
            const sql = neon(databaseUrl);
            await sql`UPDATE leads SET qstash_message_id = ${result.messageId} WHERE id = ${leadId}`;
          } catch {}
        }
      } catch (err) {
        console.error('Failed to schedule QStash dispatch:', err);
      }
    } else {
      console.warn('Could not resolve base URL for QStash callback. Set SITE_URL env var.');
    }
  } else if (leadId && !process.env.QSTASH_TOKEN) {
    console.warn('QSTASH_TOKEN not set — lead saved but no webhook will be dispatched.');
  }

  return Response.json({ ok: true, lead_id: leadId, status: 'pending' });
}
