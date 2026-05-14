import { neon } from '@neondatabase/serverless';

async function markLeadBooked(email) {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl || !email) return;
  // Emails are matched case-insensitively. The DB stores them lowercase
  // (canonicalised in /api/leads/capture), so lowercase the input too.
  const normalizedEmail = email.toString().trim().toLowerCase();
  if (!normalizedEmail) return;
  try {
    const sql = neon(databaseUrl);
    await sql`
      UPDATE leads
      SET status = 'booked', booked_at = NOW()
      WHERE status = 'pending' AND email = ${normalizedEmail}
    `;
  } catch (err) {
    console.error('Failed to mark lead as booked:', err);
  }
}

export async function POST(request) {
  const token = process.env.CALENDLY_API_TOKEN;
  const eventType = process.env.CALENDLY_EVENT_TYPE_URI;

  if (!token || !eventType) {
    return Response.json(
      { error: 'Calendly is not configured' },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { start_time, name, email, timezone, text_reminder_number, questions_and_answers } = body;

    if (!start_time || !name || !email || !timezone) {
      return Response.json(
        { error: 'start_time, name, email, and timezone are required' },
        { status: 400 }
      );
    }

    const payload = {
      event_type: eventType,
      start_time,
      invitee: {
        name,
        email,
        timezone,
        ...(text_reminder_number ? { text_reminder_number } : {}),
      },
      location: {
        kind: 'zoom_conference',
      },
      booking_source: 'datastaq_website',
    };

    if (questions_and_answers?.length) {
      payload.questions_and_answers = questions_and_answers;
    }

    const res = await fetch('https://api.calendly.com/invitees', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return Response.json(
        { error: 'Failed to create booking', details: err },
        { status: res.status }
      );
    }

    const data = await res.json();

    // Mark the lead as booked so the pending-webhook cron skips them.
    // Don't block the response on this.
    markLeadBooked(email.toString().trim()).catch(() => {});

    return Response.json(data, { status: 201 });
  } catch (err) {
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
