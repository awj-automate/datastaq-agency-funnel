import crypto from 'node:crypto';

const PIXEL_ID = process.env.META_PIXEL_ID || '1983404682281698';
const API_VERSION = process.env.META_GRAPH_API_VERSION || 'v25.0';

function hashLower(value) {
  if (value === undefined || value === null) return null;
  const trimmed = value.toString().trim().toLowerCase();
  if (!trimmed) return null;
  return crypto.createHash('sha256').update(trimmed).digest('hex');
}

function normalizePhone(phone) {
  if (!phone) return null;
  const digits = phone.toString().replace(/[^0-9]/g, '');
  return digits || null;
}

export function readMetaCookies(cookieHeader = '') {
  const fbpMatch = cookieHeader.match(/(?:^|; )_fbp=([^;]+)/);
  const fbcMatch = cookieHeader.match(/(?:^|; )_fbc=([^;]+)/);
  return {
    fbp: fbpMatch ? decodeURIComponent(fbpMatch[1]) : null,
    fbc: fbcMatch ? decodeURIComponent(fbcMatch[1]) : null,
  };
}

export async function sendMetaEvent({
  eventName,
  eventId,
  eventSourceUrl,
  eventTime,
  ip,
  userAgent,
  fbp,
  fbc,
  email,
  firstName,
  phone,
  value,
  currency,
}) {
  const accessToken = process.env.META_CAPI_ACCESS_TOKEN;
  if (!accessToken) return { skipped: true, reason: 'no_access_token' };
  if (!eventName) return { skipped: true, reason: 'no_event_name' };

  const eventTimeUnix = eventTime || Math.floor(Date.now() / 1000);
  const userData = {};

  // Pass IP/UA on every event (improves Meta match quality across the board)
  if (userAgent) userData.client_user_agent = userAgent;
  if (ip) userData.client_ip_address = ip;

  // Hash identifiers on every event when provided — same applies to Lead,
  // Schedule, Purchase, etc. Meta dedupes against the browser pixel by event_id.
  const emHash = hashLower(email);
  const fnHash = hashLower(firstName);
  const phHash = hashLower(normalizePhone(phone));
  if (emHash) userData.em = [emHash];
  if (fnHash) userData.fn = [fnHash];
  if (phHash) userData.ph = [phHash];

  // fbp/fbc improve match quality on every event when available
  if (fbp) userData.fbp = fbp;
  if (fbc) userData.fbc = fbc;

  const event = {
    event_name: eventName,
    event_time: eventTimeUnix,
    action_source: 'website',
    user_data: userData,
  };
  if (eventSourceUrl) event.event_source_url = eventSourceUrl;
  if (eventId) event.event_id = eventId;

  if (eventName === 'Purchase') {
    event.custom_data = {
      currency: currency || process.env.META_BOOKING_CURRENCY || 'USD',
      value: value !== undefined && value !== null ? Number(value) : Number(process.env.META_BOOKING_VALUE || 1),
    };
  }

  const body = { data: [event] };
  if (process.env.META_TEST_EVENT_CODE) {
    body.test_event_code = process.env.META_TEST_EVENT_CODE;
  }

  try {
    const res = await fetch(
      `https://graph.facebook.com/${API_VERSION}/${PIXEL_ID}/events?access_token=${encodeURIComponent(accessToken)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }
    );
    const result = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.error('Meta CAPI error:', JSON.stringify(result));
      return { ok: false, status: res.status, error: result };
    }
    return { ok: true, result };
  } catch (err) {
    console.error('Meta CAPI request failed:', err);
    return { ok: false, error: err.message };
  }
}
