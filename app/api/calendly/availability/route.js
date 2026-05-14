export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const startTime = searchParams.get('start_time');
  const endTime = searchParams.get('end_time');

  const eventType = process.env.CALENDLY_EVENT_TYPE_URI;
  const token = process.env.CALENDLY_API_TOKEN;

  if (!eventType || !token) {
    return Response.json(
      { error: 'Calendly is not configured' },
      { status: 500 }
    );
  }

  if (!startTime || !endTime) {
    return Response.json(
      { error: 'start_time and end_time are required' },
      { status: 400 }
    );
  }

  try {
    const url = new URL('https://api.calendly.com/event_type_available_times');
    url.searchParams.set('event_type', eventType);
    url.searchParams.set('start_time', startTime);
    url.searchParams.set('end_time', endTime);

    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error(
        `[calendly availability] ${res.status} for ${startTime}..${endTime}: ${JSON.stringify(err).slice(0, 500)}`
      );
      return Response.json(
        { error: 'Failed to fetch availability', details: err },
        { status: res.status }
      );
    }

    const data = await res.json();
    return Response.json(data);
  } catch (err) {
    console.error(`[calendly availability] threw: ${err?.message || err}`);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
