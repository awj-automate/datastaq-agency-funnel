'use client';

function genEventId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function getEventSourceUrl() {
  if (typeof window === 'undefined') return null;
  return window.location.href;
}

function getBrowserTestCode() {
  if (typeof process === 'undefined') return null;
  return process.env.NEXT_PUBLIC_META_TEST_EVENT_CODE || null;
}

function fireBrowser(name, params, eventId, { custom = false } = {}) {
  if (typeof window === 'undefined' || typeof window.fbq !== 'function') return;
  try {
    const eventInfo = { eventID: eventId };
    const testCode = getBrowserTestCode();
    if (testCode) eventInfo.test_event_code = testCode;
    window.fbq(custom ? 'trackCustom' : 'track', name, params || {}, eventInfo);
  } catch {}
}

function fireServer(payload) {
  if (typeof fetch === 'undefined') return;
  try {
    fetch('/api/meta/capi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {});
  } catch {}
}

function trackEvent(name, fbqParams = {}, capiExtras = {}, { variantName } = {}) {
  const eventId = genEventId();
  const eventSourceUrl = getEventSourceUrl();
  const eventTime = Math.floor(Date.now() / 1000);

  fireBrowser(name, fbqParams, eventId);
  fireServer({
    event_name: name,
    event_id: eventId,
    event_source_url: eventSourceUrl,
    event_time: eventTime,
    ...capiExtras,
  });

  // Paired V2 custom event — same event_id, identical payload, fires alongside
  // the standard event so we can collect fresh signal under a new name without
  // disturbing the existing Lead/Schedule pixel + CAPI flow.
  if (variantName) {
    fireBrowser(variantName, fbqParams, eventId, { custom: true });
    fireServer({
      event_name: variantName,
      event_id: eventId,
      event_source_url: eventSourceUrl,
      event_time: eventTime,
      ...capiExtras,
    });
  }

  return eventId;
}

export function trackPageView() {
  return trackEvent('PageView');
}

export function trackViewContent(extras = {}) {
  return trackEvent('ViewContent', extras);
}

export function trackLead({ email, first_name, phone, content_name } = {}) {
  return trackEvent(
    'Lead',
    { content_name: content_name || 'pick_a_time' },
    { email, first_name, phone },
    { variantName: 'LeadV2' }
  );
}

export function trackSchedule({ email, first_name, phone, content_name } = {}) {
  return trackEvent(
    'Schedule',
    { content_name: content_name || 'strategy_call_booked' },
    { email, first_name, phone },
    { variantName: 'ScheduleV2' }
  );
}

export function trackPurchase({ email, first_name, phone, value, currency } = {}) {
  const params = {};
  if (value !== undefined) params.value = value;
  if (currency) params.currency = currency;
  return trackEvent('Purchase', params, { email, first_name, phone, ...params });
}

// CTA-click engagement event. Fires a distinct GA4 / GTM dataLayer event name
// per CTA (cta_hero, cta_vsl, cta_problem, ...) — mirrors the vsl_* pattern in
// VSL.js — plus a single Meta Pixel custom event (CTAClick) tagged with
// cta_name. Used by the /ad-agency-visibility funnel CTAs.
export function trackCtaClick(name, params = {}) {
  if (typeof window !== 'undefined') {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: `cta_${name}`, cta_name: name, ...params });
    if (typeof window.gtag === 'function') {
      window.gtag('event', `cta_${name}`, { cta_name: name, ...params });
    }
  }
  fireBrowser('CTAClick', { cta_name: name, ...params }, genEventId(), { custom: true });
}
