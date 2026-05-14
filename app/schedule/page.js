'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import SiteNav from '../components/SiteNav';
import { COUNTRIES, findCountry } from '../lib/countries';
import { trackViewContent, trackLead, trackSchedule, trackPurchase } from '../lib/meta';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

function daysInMonth(d)  { return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate(); }
function startOfMonth(d) { return new Date(d.getFullYear(), d.getMonth(), 1); }
function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function formatTime(iso) {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}
function getTimezone() {
  try { return Intl.DateTimeFormat().resolvedOptions().timeZone; }
  catch { return 'America/New_York'; }
}
function localDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
function getUtmFromUrl() {
  if (typeof window === 'undefined') return null;
  try {
    const params = new URLSearchParams(window.location.search);
    const utm = {};
    for (const k of ['utm_source','utm_medium','utm_campaign','utm_term','utm_content','gclid','fbclid']) {
      const v = params.get(k);
      if (v) utm[k] = v;
    }
    return Object.keys(utm).length ? utm : null;
  } catch { return null; }
}

function SchedulePageInner() {
  const today = useMemo(() => { const d = new Date(); d.setHours(0,0,0,0); return d; }, []);
  const timezone = useMemo(() => getTimezone(), []);
  const searchParams = useSearchParams();

  const prefilledStep = searchParams.get('step');
  const initialStep = prefilledStep === 'calendar' ? 'calendar' : 'intake';

  const [step, setStep] = useState(initialStep);

  const [firstName, setFirstName] = useState(searchParams.get('first_name') || '');
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [phone, setPhone] = useState(searchParams.get('phone') || '');
  const [phoneCountry, setPhoneCountry] = useState(searchParams.get('phone_country') || 'US');
  const [countryDetected, setCountryDetected] = useState(false);

  const [viewMonth, setViewMonth] = useState(today);
  const [selectedDate, setSelectedDate] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const [availableDates, setAvailableDates] = useState(new Set());
  const [loadingMonth, setLoadingMonth] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [bookingResult, setBookingResult] = useState(null);

  // Fire ViewContent once when this page is viewed
  useEffect(() => {
    trackViewContent({ content_name: 'schedule_page' });
  }, []);

  // Auto-detect country on mount unless already provided via URL
  useEffect(() => {
    if (countryDetected) return;
    if (searchParams.get('phone_country')) { setCountryDetected(true); return; }
    let cancelled = false;
    fetch('/api/geo')
      .then(r => r.json())
      .then(data => {
        if (cancelled) return;
        if (data?.country) {
          const match = findCountry(data.country);
          if (match) setPhoneCountry(match.code);
        }
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setCountryDetected(true); });
    return () => { cancelled = true; };
  }, []);

  // Fetch month-level availability so we can dot the days that have times
  useEffect(() => {
    let cancelled = false;
    setLoadingMonth(true);
    fetch(`/api/calendly/month-availability?year=${viewMonth.getFullYear()}&month=${viewMonth.getMonth()}`)
      .then(r => r.json())
      .then(data => {
        if (cancelled) return;
        const set = new Set();
        for (const iso of data.start_times || []) {
          set.add(localDateKey(new Date(iso)));
        }
        setAvailableDates(set);
      })
      .catch(() => { if (!cancelled) setAvailableDates(new Set()); })
      .finally(() => { if (!cancelled) setLoadingMonth(false); });
    return () => { cancelled = true; };
  }, [viewMonth]);

  useEffect(() => {
    if (!selectedDate) { setSlots([]); return; }
    let cancelled = false;
    setLoadingSlots(true);
    setSlots([]);
    setSelectedSlot(null);

    const start = new Date(selectedDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(selectedDate);
    end.setHours(23, 59, 59, 999);

    fetch(`/api/calendly/availability?start_time=${start.toISOString()}&end_time=${end.toISOString()}`)
      .then(r => r.json())
      .then(data => {
        if (cancelled) return;
        const available = (data.collection || [])
          .filter(s => s.status === 'available')
          .map(s => s.start_time);
        setSlots(available);
      })
      .catch(() => { if (!cancelled) setSlots([]); })
      .finally(() => { if (!cancelled) setLoadingSlots(false); });

    return () => { cancelled = true; };
  }, [selectedDate]);

  const firstDay = startOfMonth(viewMonth).getDay();
  const numDays = daysInMonth(viewMonth);
  const calendarCells = [];
  for (let i = 0; i < firstDay; i++) calendarCells.push(null);
  for (let d = 1; d <= numDays; d++) calendarCells.push(d);

  function prevMonth() {
    setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1));
  }
  function nextMonth() {
    setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1));
  }
  function selectDay(day) {
    const d = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), day);
    setSelectedDate(d);
  }
  function isPast(day) {
    const d = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), day);
    return d < today;
  }
  function isSelected(day) {
    if (!selectedDate) return false;
    const d = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), day);
    return isSameDay(d, selectedDate);
  }
  function isToday(day) {
    const d = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), day);
    return isSameDay(d, today);
  }
  function hasAvailability(day) {
    const d = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), day);
    return availableDates.has(localDateKey(d));
  }

  const canGoPrev = viewMonth.getFullYear() > today.getFullYear() ||
    (viewMonth.getFullYear() === today.getFullYear() && viewMonth.getMonth() > today.getMonth());

  const country = useMemo(() => findCountry(phoneCountry), [phoneCountry]);

  function captureLead(extra = {}) {
    if (!firstName.trim() || !email.trim()) return;
    const body = {
      first_name: firstName.trim(),
      email: email.trim(),
      phone: phone.trim() ? `${country.dial} ${phone.trim()}` : null,
      phone_country: country.code,
      source: 'pick_a_time',
      referrer: typeof document !== 'undefined' ? document.referrer || null : null,
      utm: getUtmFromUrl(),
      ...extra,
    };
    fetch('/api/leads/capture', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      keepalive: true,
    }).catch(() => {});
    trackLead({
      email: email.trim(),
      first_name: firstName.trim(),
      phone: body.phone,
    });
  }

  function handleIntake(e) {
    e.preventDefault();
    captureLead();
    setStep('calendar');
  }

  async function handleBook() {
    if (!selectedSlot) return;
    setSubmitting(true);
    setError('');

    try {
      const phoneE164 = phone.trim()
        ? `${country.dial}${phone.trim().replace(/\D/g, '')}`
        : '';

      const res = await fetch('/api/calendly/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          start_time: selectedSlot,
          name: firstName.trim(),
          email: email.trim(),
          timezone,
          text_reminder_number: phoneE164 || undefined,
          questions_and_answers: phoneE164
            ? [{ question: 'Phone Number', answer: phoneE164, position: 0 }]
            : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.details?.message || data.error || 'Booking failed. Please try again.');
      } else {
        setBookingResult(data.resource);
        setStep('success');
        const phoneFull = phone.trim() ? `${country.dial} ${phone.trim()}` : null;
        trackSchedule({
          content_name: 'strategy_call_booked',
          email: email.trim(),
          first_name: firstName.trim(),
          phone: phoneFull,
        });
        trackPurchase({
          email: email.trim(),
          first_name: firstName.trim(),
          phone: phoneFull,
        });
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="sch-page">
      <SiteNav />

      <main className="sch-main">
        {step === 'intake' && (
          <div className="sch-card">
            <div className="sch-card-header">
              <div>
                <h1 className="sch-title">Book a Strategy Call</h1>
                <p className="sch-subtitle">Tell us a bit about yourself first</p>
              </div>
            </div>

            <form onSubmit={handleIntake} className="sch-form">
              <div>
                <label className="sch-label">First Name</label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  className="sch-input"
                  placeholder="Your first name"
                  autoComplete="given-name"
                />
              </div>

              <div>
                <label className="sch-label">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="sch-input"
                  placeholder="you@company.com"
                  autoComplete="email"
                />
              </div>

              <div>
                <label className="sch-label">Phone</label>
                <div className="sch-phone">
                  <select
                    value={phoneCountry}
                    onChange={e => setPhoneCountry(e.target.value)}
                    className="sch-phone-country"
                    aria-label="Country code"
                  >
                    {COUNTRIES.map(c => (
                      <option key={c.code} value={c.code}>
                        {c.code} {c.dial}
                      </option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="sch-input sch-phone-input"
                    placeholder="555 123 4567"
                    autoComplete="tel-national"
                    inputMode="tel"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={!firstName.trim() || !email.trim() || !phone.trim()}
                className="sch-submit"
              >
                Pick a Time
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M3.5 8h9M8.5 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </form>
          </div>
        )}

        {step === 'calendar' && (
          <div className="sch-card sch-card-lg">
            <div className="sch-card-header">
              <div>
                <h1 className="sch-title">Pick a Time</h1>
                <p className="sch-subtitle">30 min{firstName ? ` · ${firstName}` : ''}</p>
              </div>
              <button
                type="button"
                onClick={() => setStep('intake')}
                className="sch-back"
              >
                <svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <path d="M12 15l-5-5 5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Back
              </button>
            </div>

            <div className="sch-cal-grid">
              <div className="sch-cal">
                <div className="sch-month-nav">
                  <button
                    type="button"
                    onClick={prevMonth}
                    disabled={!canGoPrev}
                    className="sch-month-btn"
                    aria-label="Previous month"
                  >
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                      <path d="M12 15l-5-5 5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <span className="sch-month-label">
                    {MONTHS[viewMonth.getMonth()]} {viewMonth.getFullYear()}
                    {loadingMonth && <span className="sch-month-loading" aria-hidden="true" />}
                  </span>
                  <button
                    type="button"
                    onClick={nextMonth}
                    className="sch-month-btn"
                    aria-label="Next month"
                  >
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                      <path d="M8 5l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>

                <div className="sch-day-headers">
                  {DAYS.map(d => (
                    <div key={d} className="sch-day-header">{d}</div>
                  ))}
                </div>

                <div className="sch-days">
                  {calendarCells.map((day, i) => {
                    if (day === null) return <div key={`e${i}`} />;
                    const past = isPast(day);
                    const sel = isSelected(day);
                    const tod = isToday(day);
                    const avail = !past && hasAvailability(day);
                    const cls = ['sch-day'];
                    if (sel) cls.push('selected');
                    if (tod && !sel) cls.push('today');
                    if (avail && !sel) cls.push('has-availability');
                    return (
                      <button
                        key={day}
                        type="button"
                        disabled={past}
                        onClick={() => selectDay(day)}
                        className={cls.join(' ')}
                      >
                        <span className="sch-day-num">{day}</span>
                        {avail && !sel && <span className="sch-day-dot" aria-hidden="true" />}
                      </button>
                    );
                  })}
                </div>

                <div className="sch-cal-legend">
                  <span className="sch-legend-item">
                    <span className="sch-legend-dot" aria-hidden="true" />
                    Available
                  </span>
                </div>

                <p className="sch-timezone">
                  <svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                    <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.4" />
                    <path d="M10 5v5l3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                  {timezone}
                </p>
              </div>

              <div className="sch-slots">
                {!selectedDate ? (
                  <div className="sch-empty">
                    Select a date to view<br />available times
                  </div>
                ) : (
                  <>
                    <p className="sch-slots-day">
                      {selectedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                    </p>

                    {loadingSlots ? (
                      <div className="sch-loading">
                        <svg className="sch-spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.2" />
                          <path d="M12 2a10 10 0 019.95 9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                        </svg>
                        <span style={{ marginLeft: 8 }}>Loading times...</span>
                      </div>
                    ) : slots.length === 0 ? (
                      <div className="sch-empty">
                        No available times<br />on this date
                      </div>
                    ) : (
                      <div className="sch-slots-list">
                        {slots.map(slot => {
                          const active = selectedSlot === slot;
                          return (
                            <button
                              key={slot}
                              type="button"
                              onClick={() => setSelectedSlot(slot)}
                              className={`sch-slot ${active ? 'active' : ''}`}
                            >
                              {formatTime(slot)}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {error && <p className="sch-error">{error}</p>}

                    {selectedSlot && (
                      <button
                        type="button"
                        onClick={handleBook}
                        disabled={submitting}
                        className="sch-submit"
                        style={{ marginTop: 16 }}
                      >
                        {submitting ? (
                          <>
                            <svg className="sch-spinner" width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.2" />
                              <path d="M12 2a10 10 0 019.95 9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                            </svg>
                            Booking...
                          </>
                        ) : (
                          <>
                            Confirm Booking
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                              <path d="M3.5 8h9M8.5 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </>
                        )}
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="sch-card">
            <div className="sch-success">
              <div className="sch-success-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M5 13l4 4L19 7" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h2>You&apos;re booked!</h2>
              <p>
                A confirmation has been sent to <strong>{bookingResult?.email || email}</strong>.<br />
                We&apos;ll see you on{' '}
                <strong>
                  {selectedDate && selectedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                </strong>{' '}
                at <strong>{selectedSlot && formatTime(selectedSlot)}</strong>.
              </p>
              <a href="/" className="sch-submit" style={{ textDecoration: 'none', width: 'auto', padding: '16px 32px', marginTop: 8 }}>
                Back to Home
              </a>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function SchedulePage() {
  return (
    <Suspense fallback={<div className="sch-page"><SiteNav /><main className="sch-main" /></div>}>
      <SchedulePageInner />
    </Suspense>
  );
}
