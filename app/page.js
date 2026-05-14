'use client';

import { useEffect, useState } from 'react';
import SiteNav from './components/SiteNav';
import VSL from './components/VSL';
import { trackViewContent, trackCtaClick } from './lib/meta';

// Home page — the DataStaq AI "Fractional Ad Visibility" funnel.
// Single-purpose paid-traffic landing: visitor arrives from a Meta/Google ad,
// watches the VSL, books a call. Booking lives on /schedule (no Calendly
// embed/modal in this repo — every CTA routes there).

const AUDIENCE = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 17l6-6 4 4 7-7" />
        <path d="M14 8h6v6" />
      </svg>
    ),
    title: <>Agency owners at <em>100K+/mo</em> ad spend</>,
    body: 'You are running real budget across Meta and Google — and reporting quietly eats the margin.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 3l9 5-9 5-9-5 9-5z" />
        <path d="M3 13l9 5 9-5" />
      </svg>
    ),
    title: <>Scaled past <em>10-20</em> active clients</>,
    body: 'The spreadsheet stack that worked at 5 clients is now the thing holding you back.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M7 3h7l5 5v13a1 1 0 01-1 1H7a1 1 0 01-1-1V4a1 1 0 011-1z" />
        <path d="M14 3v5h5M9 13h6M9 17h6" />
      </svg>
    ),
    title: <>Account managers <em>drowning</em> in reporting</>,
    body: 'Your best AMs spend more time formatting decks than improving accounts.',
  },
];

const SOLUTION = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <ellipse cx="12" cy="6" rx="8" ry="3" />
        <path d="M4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6" />
      </svg>
    ),
    title: <>Unified <em>Data Layer</em></>,
    body: 'We pull from every client\'s ad platforms, CRM, and revenue tools into one clean, normalized source of truth — no more reconciling tabs.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18M9 21V9" />
      </svg>
    ),
    title: <>Live <em>Agency Dashboard</em></>,
    body: 'One view across every client account. Proactive alerts when spend, ROAS, or pacing drifts — so you catch it before the client emails you.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M2.5 12h19M12 2.5c2.5 2.7 3.9 6 4 9.5-.1 3.5-1.5 6.8-4 9.5-2.5-2.7-3.9-6-4-9.5.1-3.5 1.5-6.8 4-9.5z" />
      </svg>
    ),
    title: <>Client-Facing <em>Visibility</em></>,
    body: 'Automated, branded dashboards for your clients. Always current, zero AM lift — the screenshot-deck ritual is gone for good.',
  },
];

const PROCESS = [
  { step: '01', title: 'Discovery call', body: 'We map your stack — every platform, CRM, and revenue tool across your client base. 15 minutes, no prep needed.' },
  { step: '02', title: 'Build phase', body: 'We connect and normalize your data sources into one unified layer. Your team does nothing — we handle the plumbing.' },
  { step: '03', title: 'Live dashboards', body: 'Your team gets the agency-wide view. Your clients get their own. Both are live within days, not months.' },
  { step: '04', title: 'Ongoing partner', body: 'Proactive alerts, monthly reviews, and new data sources added as you grow. We stay in the loop — fractional, not fire-and-forget.' },
];

const RESULTS = [
  { num: '60-100', label: 'AM hours/week recovered' },
  { num: 'Zero', label: 'New headcount required' },
  { num: 'Days', label: 'Not months, to full visibility' },
  { num: '100%', label: 'Client-facing automation' },
];

const OBJECTIONS = [
  {
    q: 'We already have an internal reporting setup.',
    a: 'Most agencies do — usually a patchwork of spreadsheets, Looker Studio, and one person who knows how it all connects. DataStaq replaces the patchwork with real infrastructure: it does not break when that person is on vacation, and it scales when you add the next 10 clients.',
  },
  {
    q: 'How is this different from hiring an analyst?',
    a: 'An analyst is labor — 80-100K/year, weeks to ramp, and a single point of failure. DataStaq is infrastructure: fractional cost, live in days, and it does not quit. You get the output of an analytics team without the headcount.',
  },
  {
    q: 'What data sources do you support?',
    a: 'All the major ad platforms (Meta, Google, TikTok, LinkedIn), the CRMs your clients run on (HubSpot, Salesforce, and more), and revenue tools like Stripe and Shopify. If your clients use it, we can almost certainly pull it.',
  },
];

export default function HomePage() {
  const [openFaq, setOpenFaq] = useState(null);

  // Fire ViewContent once on view. PageView is already tracked globally by
  // MetaPageView + the GA4 config in app/layout.js.
  useEffect(() => {
    trackViewContent({ content_name: 'ad_agency_visibility' });
  }, []);

  // Reveal-on-scroll via IntersectionObserver.
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.style.opacity = '1';
            e.target.style.transform = 'translateY(0)';
          }
        });
      },
      { threshold: 0.1 }
    );

    const els = document.querySelectorAll('.solution-card, .milestone, .result-card');
    els.forEach((el) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(30px)';
      el.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
      io.observe(el);
    });

    return () => io.disconnect();
  }, []);

  const toggleFaq = (i) => setOpenFaq(openFaq === i ? null : i);

  return (
    <>
      <SiteNav cta={{ href: '/schedule', label: 'Book a Call →' }} />

      {/* ============ 1. HERO ============ */}
      <section className="hero">
        <div className="hero-grid"></div>
        <div className="hero-content">
          <h1 className="hero-h1-centered">
            Stop Burning <span className="thirty">20+ hours</span> a Week<br />
            on <em>Client Reports</em>
          </h1>

          <p className="hero-sub">
            Fractional ad data infrastructure for agencies running <strong>100K+/month</strong> across
            Meta and Google. One system. One dashboard. Every client.
          </p>

          <div className="hero-cta-row">
            <a href="/schedule" className="btn-primary" onClick={() => trackCtaClick('hero')}>
              Book a 15-Min Strategy Call <span className="arrow">→</span>
            </a>
            <a href="#vsl" className="btn-secondary" onClick={() => trackCtaClick('hero_watch')}>
              Watch the breakdown
            </a>
          </div>

          <p className="hero-trust">US-based team · No offshore handoffs · No long-term contracts</p>
        </div>
      </section>

      {/* ============ 2. VSL ============ */}
      <section className="video-section vsl-section-funnel" id="vsl">
        <div className="video-wrap video-wrap-960">
          <div className="video-label">Watch this first</div>
          <h2 className="video-heading">
            How agencies kill the <em>reporting tax</em> in days, not months
          </h2>

          {/*
            VSL — set the Cloudflare Stream video ID in the Vercel env var
            NEXT_PUBLIC_CF_STREAM_VIDEO_ID. Until it is set, this renders the
            styled 16:9 placeholder. Play / 25 / 50 / 75 / complete milestones
            are tracked inside the VSL component.
          */}
          <VSL aspect="16x9" badge="Watch before you book" duration="03:00" />

          <div className="video-cta-below">
            <a href="/schedule" onClick={() => trackCtaClick('vsl')}>Book a Call →</a>
          </div>
        </div>
      </section>

      {/* ============ 3. WHO THIS IS FOR ============ */}
      <section className="solution no-mark">
        <div className="solution-inner">
          <div className="section-label">Who this is for</div>
          <h2>
            Built for agencies past the <em>DIY reporting</em> stage.
          </h2>

          <div className="solution-grid">
            {AUDIENCE.map((c, i) => (
              <div key={i} className="solution-card">
                <div className="feature-icon">{c.icon}</div>
                <h3>{c.title}</h3>
                <p>{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ 4. THE PROBLEM ============ */}
      <section className="problem">
        <div className="section-label">The problem</div>
        <h2>
          The <em>reporting tax</em><br />nobody talks about.
        </h2>

        <div className="problem-grid">
          <div className="problem-text">
            <p>
              Your account managers are spending 15-20+ hours a week building manual reports. That is
              time they are not spending on strategy, optimization, or the next pitch.
            </p>
            <p>
              Hire a full-time analyst? That is 80-100K a year plus benefits — and one more person to
              manage. Go the Upwork route? Sloppy work, missed deadlines, and Slack messages that get
              ghosted halfway through the month.
            </p>
            <p>
              Neither one scales with your client list. Every new logo makes the reporting problem
              worse, not better.
            </p>
            <div className="problem-cta">
              <a href="/schedule" className="btn-primary" onClick={() => trackCtaClick('problem')}>
                Book a Call <span className="arrow">→</span>
              </a>
            </div>
          </div>

          <div className="problem-list">
            <div className="problem-list-title">Where the hours actually go</div>
            <div className="problem-item">
              <div className="num">01</div>
              <div className="text">
                <strong>Pulling platform data.</strong>
                Logging into every ad account, CRM, and revenue tool, one client at a time.
              </div>
            </div>
            <div className="problem-item">
              <div className="num">02</div>
              <div className="text">
                <strong>Reformatting into decks.</strong>
                Copy, paste, screenshot, re-brand. Every client, every week.
              </div>
            </div>
            <div className="problem-item">
              <div className="num">03</div>
              <div className="text">
                <strong>Reconciling spend vs revenue.</strong>
                Stitching ad numbers to actual sales so the story holds up.
              </div>
            </div>
            <div className="problem-item">
              <div className="num">04</div>
              <div className="text">
                <strong>QA before it goes out.</strong>
                Catching the broken number before the client does.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ 5. THE SOLUTION ============ */}
      <section className="solution no-mark">
        <div className="solution-inner">
          <div className="section-label">The solution</div>
          <h2>
            DataStaq AI — your <em>fractional ad data partner.</em>
          </h2>

          <div className="solution-grid">
            {SOLUTION.map((c, i) => (
              <div key={i} className="solution-card">
                <div className="feature-icon">{c.icon}</div>
                <h3>{c.title}</h3>
                <p>{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ 6. HOW IT WORKS ============ */}
      <section className="process">
        <div className="process-header">
          <h2>
            From <em>discovery call</em> to live dashboards.
          </h2>
          <p>
            No long onboarding, no six-month implementation. The shape of the engagement is always
            the same — and most agencies are live within days.
          </p>
        </div>

        <div className="timeline">
          {PROCESS.map((m) => (
            <div key={m.step} className="milestone active">
              <div className="milestone-week">
                Step
                <strong>{m.step}</strong>
              </div>
              <h3>{m.title}</h3>
              <p>{m.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ============ 7. RESULTS ============ */}
      <section className="results">
        <div className="results-inner">
          <div className="section-label">The outcome</div>
          <h2 className="results-heading">
            What changes once the <em>reporting tax</em> is gone.
          </h2>

          <div className="results-grid">
            {RESULTS.map((r, i) => (
              <div key={i} className="result-card">
                <div className="result-num">{r.num}</div>
                <div className="result-label">{r.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ 8. OBJECTION HANDLER ============ */}
      <section className="faq">
        <div className="faq-inner">
          <div className="section-label">Still on the fence</div>
          <h2>
            Still wondering if this is <em>right for your agency?</em>
          </h2>

          {OBJECTIONS.map((f, i) => (
            <div
              key={i}
              className={`faq-item ${openFaq === i ? 'open' : ''}`}
              onClick={() => toggleFaq(i)}
            >
              <div className="faq-q">
                <h3>{f.q}</h3>
                <div className="faq-toggle">+</div>
              </div>
              <div className="faq-a">{f.a}</div>
            </div>
          ))}

          <div className="faq-cta">
            <a href="/schedule" className="btn-primary" onClick={() => trackCtaClick('objection')}>
              Book a Call to See It Live <span className="arrow">→</span>
            </a>
          </div>
        </div>
      </section>

      {/* ============ 9. FINAL CTA ============ */}
      {/* No Calendly embed/modal in this repo — booking is the dedicated
          /schedule page, where Schedule + Purchase conversion events fire. */}
      <section className="final-cta" id="book">
        <div className="final-cta-inner">
          <div className="section-label" style={{ justifyContent: 'center' }}>Book your call</div>
          <h2>
            Ready to give your AMs<br />their <em>week back?</em>
          </h2>
          <p>
            15 minutes. We map your stack and show you exactly what live visibility looks like across
            your client base.
          </p>
          <a href="/schedule" className="btn-final" onClick={() => trackCtaClick('final')}>
            Book a 15-Min Strategy Call <span className="arrow">→</span>
          </a>
          <div className="final-meta">No pitch, no pressure — 15 minutes to see if we are a fit.</div>
        </div>
      </section>

      {/* ============ 10. MINIMAL FOOTER ============ */}
      <footer>
        <div className="footer-inner">
          <a href="/" className="logo">
            <img src="/logo.png" alt="DataStaqAI" className="logo-mark" />
            <span>DataStaq<span className="logo-accent">AI</span></span>
          </a>
          <div className="footer-links">
            <a href="/privacy">Privacy Policy</a>
            <a href="/terms">Terms</a>
          </div>
          <div className="footer-meta">© 2026 DataStaq AI</div>
        </div>
      </footer>

      {/*
        ============================================================
        HOME PAGE ( / ) — CONFIG NOTES
        ============================================================
        ONLY ENV VAR NEEDED
        - NEXT_PUBLIC_CF_STREAM_VIDEO_ID — Cloudflare Stream video ID for the
          VSL (section 2). Set it in Vercel. Until set, a styled 16:9
          placeholder renders. The VSL badge ("Watch before you book") and
          duration ("03:00") are passed as props here — tweak inline if needed.

        EVERYTHING ELSE IS GENERATED / AUTOMATIC
        - OG + Twitter images: generated by app/opengraph-image.js and
          app/twitter-image.js. metadataBase (app/layout.js) resolves
          automatically from Vercel's VERCEL_PROJECT_PRODUCTION_URL.
        - Copy: hero trust line, the RESULTS stats, and the /privacy + /terms
          pages are all written in. Legal copy is template language — have
          counsel review it.

        BOOKING
        - No Calendly embed/modal. Every CTA routes to /schedule, where
          booking-completion events (Schedule + Purchase) already fire.

        TRACKING
        - PageView: global via MetaPageView + GA4 config in app/layout.js.
        - ViewContent: fires on mount (content_name: ad_agency_visibility).
        - CTA clicks: trackCtaClick() in app/lib/meta.js fires distinct events
          (cta_hero, cta_hero_watch, cta_vsl, cta_problem, cta_objection,
          cta_final) to GA4/GTM + a Meta Pixel custom event.
        - VSL play / 25 / 50 / 75 / complete: fire inside the VSL component.

        SEO
        - This is the site's home page, so it is indexable (no noindex).
          Title / description / OG / Twitter tags live in app/layout.js.
        ============================================================
      */}
    </>
  );
}
