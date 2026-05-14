export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const year = parseInt(searchParams.get('year'), 10);
  const month = parseInt(searchParams.get('month'), 10);

  const eventType = process.env.CALENDLY_EVENT_TYPE_URI;
  const token = process.env.CALENDLY_API_TOKEN;

  if (!eventType || !token) {
    return Response.json({ available_dates: [] });
  }

  if (!Number.isFinite(year) || !Number.isFinite(month)) {
    return Response.json({ error: 'year and month required' }, { status: 400 });
  }

  const now = new Date();
  let monthStart = new Date(Date.UTC(year, month, 1, 0, 0, 0));
  if (monthStart.getTime() < now.getTime()) {
    monthStart = new Date(now.getTime() + 60 * 1000);
  }
  const monthEnd = new Date(Date.UTC(year, month + 1, 1, 0, 0, 0) - 1);

  if (monthStart >= monthEnd) {
    return Response.json({ available_dates: [] });
  }

  const CHUNK_MS = 7 * 24 * 60 * 60 * 1000 - 60 * 1000;
  const chunks = [];
  let cursorMs = monthStart.getTime();
  while (cursorMs < monthEnd.getTime()) {
    const endMs = Math.min(cursorMs + CHUNK_MS, monthEnd.getTime());
    chunks.push({ start: new Date(cursorMs), end: new Date(endMs) });
    cursorMs = endMs + 1000;
  }

  const fetches = chunks.map(({ start, end }) => {
    const url = new URL('https://api.calendly.com/event_type_available_times');
    url.searchParams.set('event_type', eventType);
    url.searchParams.set('start_time', start.toISOString());
    url.searchParams.set('end_time', end.toISOString());
    return fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
      .then(async r => {
        if (r.ok) return r.json();
        const errBody = await r.text().catch(() => '');
        console.error(
          `[calendly month-availability] ${r.status} for ${start.toISOString()}..${end.toISOString()}: ${errBody.slice(0, 500)}`
        );
        return { collection: [] };
      })
      .catch(err => {
        console.error(
          `[calendly month-availability] fetch threw for ${start.toISOString()}..${end.toISOString()}: ${err?.message || err}`
        );
        return { collection: [] };
      });
  });

  const results = await Promise.all(fetches);

  const startTimes = [];
  for (const r of results) {
    for (const slot of r.collection || []) {
      if (slot.status === 'available' && slot.start_time) {
        startTimes.push(slot.start_time);
      }
    }
  }

  return Response.json({ start_times: startTimes });
}
