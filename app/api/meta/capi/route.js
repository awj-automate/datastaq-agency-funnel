import { sendMetaEvent, readMetaCookies } from '../../../lib/metaCapi';

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const {
    event_name,
    event_id,
    event_source_url,
    event_time,
    email,
    first_name,
    phone,
    value,
    currency,
  } = body || {};

  if (!event_name) {
    return Response.json({ error: 'event_name required' }, { status: 400 });
  }

  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    null;
  const userAgent = request.headers.get('user-agent') || null;
  const { fbp, fbc } = readMetaCookies(request.headers.get('cookie') || '');

  const result = await sendMetaEvent({
    eventName: event_name,
    eventId: event_id,
    eventSourceUrl: event_source_url,
    eventTime: event_time,
    ip,
    userAgent,
    fbp,
    fbc,
    email,
    firstName: first_name,
    phone,
    value,
    currency,
  });

  return Response.json(result);
}
