'use client';

import { useEffect, useRef, useState } from 'react';
import VSL from './components/VSL';
import SiteNav from './components/SiteNav';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function Page() {
  const [openFaq, setOpenFaq] = useState(null);
  const [finalSegments, setFinalSegments] = useState(['Taking on 2 new clients', 'US-based', 'No obligation']);
  const revealRefs = useRef([]);

  useEffect(() => {
    const next = new Date();
    next.setDate(1);
    next.setMonth(next.getMonth() + 1);
    const nextMonthLabel = `${MONTHS[next.getMonth()]} ${next.getFullYear()}`;
    setFinalSegments([`Taking on 2 new clients for ${nextMonthLabel}`, 'US-based', 'No obligation']);
  }, []);

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

    const els = document.querySelectorAll('.milestone, .solution-card, .build-card');
    els.forEach((el) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(30px)';
      el.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
      io.observe(el);
    });

    return () => io.disconnect();
  }, []);

  const toggleFaq = (i) => setOpenFaq(openFaq === i ? null : i);

  const faqs = [
    {
      q: 'What if my idea is too complex to ship in 30 days?',
      a: "On the intro call, we'll tell you honestly. If it's a 60 or 90-day build, we'll say so upfront and scope a 30-day milestone that still gets you live with something real. We don't take projects we can't deliver on. The guarantee depends on it.",
    },
    {
      q: 'How is the quality actually "production-grade"?',
      a: "Real architecture, real test coverage, real CI/CD, real monitoring. On the intro call we'll walk you through code from recent builds, the stack we use, and how we handle testing. You can also talk to current clients. We'd rather you hear it from them than from us.",
    },
    {
      q: 'What does it cost?',
      a: "A flat price, quoted before we start, based on the scope we agree to on the intro call. No hourly games, no change orders, no surprise invoices. Most 30-day builds land in a predictable range we'll share openly on the call.",
    },
    {
      q: 'What happens after the 30 days?',
      a: 'Your call. Take the code and run with it, bring it in-house to your own team, or keep us on for ongoing maintenance and new features on a simple monthly rate. No lock-in either way.',
    },
    {
      q: 'Can you work with my existing team or codebase?',
      a: (
        <>
          Yes. We also offer &ldquo;Fractional CTO&rdquo; services, so if you&rsquo;re looking for a more ongoing technical and strategic partner, <a href="/schedule">book a call</a> and we&rsquo;ll talk through it.
        </>
      ),
    },
    {
      q: 'How fast can we start?',
      a: (
        <>
          Usually in 1-2 days after onboarding. That said, we only take on a limited number of 30-day builds at a time to protect the guarantee, so availability depends on the current queue.
          <br /><br />
          <a href="/schedule">Book a call</a> to get started.
        </>
      ),
    },
  ];

  return (
    <>
      <SiteNav cta={{ href: '/schedule', label: 'Book a Call →' }} />

      {/* ============ HERO ============ */}
      <section className="hero">
        <div className="hero-grid"></div>
        <div className="hero-content">
          <h1 className="hero-h1-centered">
            Your full MVP, custom app, or internal tool.<br />
            Shipped in <span className="thirty">30 days.</span> <em>Guaranteed.</em>
          </h1>

          <div className="hero-video" id="video">
            <VSL />
          </div>

          <div className="hero-cta-row">
            <a href="/schedule" className="btn-primary">
              Book a Call <span className="arrow">→</span>
            </a>
            <a href="#problem-anchor" className="btn-secondary">How it works</a>
          </div>

          <p className="hero-sub">
            <strong>Production-grade software</strong>, fully tested, live in your users' hands, in the time most agencies take to finish discovery.
          </p>
        </div>
      </section>

      {/* ============ STAT STRIP ============ */}
      <section className="stat-strip" id="problem-anchor">
        <div className="stat-strip-inner">
          <div className="stat">
            <div className="stat-num"><em>30</em> days</div>
            <div className="stat-label">From kickoff to production shipped</div>
          </div>
          <div className="stat">
            <div className="stat-num"><em>US</em>-based</div>
            <div className="stat-label">Senior team, zero offshore handoffs</div>
          </div>
          <div className="stat">
            <div className="stat-num"><em>40+</em> builds</div>
            <div className="stat-label">SaaS, fintech, medtech, legal, agencies and more</div>
          </div>
        </div>
      </section>

      {/* ============ PROBLEM ============ */}
      <section className="problem">
        <div className="section-label">The problem</div>
        <h2>
          <em>The traditional agency quote:</em><br />
          <strike>$120,000.</strike> <strike>6 months.</strike> Wrong product.
        </h2>

        <div className="problem-grid">
          <div className="problem-text">
            <p>You sit through four scoping calls. You lock in the requirements. You sign a $80K–$150K contract. Then you wait.</p>
            <p>Six weeks in, you talk to customers and realize the scope is already stale. Your competitor ships something. The market moves. But you can't pivot. You've already paid for a plan.</p>
            <p>Every change is a change order. Every pivot is another invoice. Every question sent offshore takes 12 hours to come back.</p>
            <p>Six months later, you've burned your runway. And the product you have isn't the product you need.</p>
            <div className="problem-cta">
              <a href="/schedule" className="btn-primary">
                Grab your slot <span className="arrow">→</span>
              </a>
            </div>
          </div>

          <div className="problem-list">
            <div className="problem-list-title">What you actually need</div>
            <div className="problem-item">
              <div className="num">01</div>
              <div className="text">
                <strong>Speed.</strong>
                A real product in 30 days, not discovery decks in month two.
              </div>
            </div>
            <div className="problem-item">
              <div className="num">02</div>
              <div className="text">
                <strong>Quality.</strong>
                Production-grade code. Fully tested. Not throwaway.
              </div>
            </div>
            <div className="problem-item">
              <div className="num">03</div>
              <div className="text">
                <strong>Predictability.</strong>
                Flat price. One timeline. No change-order games.
              </div>
            </div>
            <div className="problem-item">
              <div className="num">04</div>
              <div className="text">
                <strong>Ownership.</strong>
                Your code. Your infrastructure. No lock-in.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ SOLUTION ============ */}
      <section className="solution">
        <div className="solution-inner">
          <div className="section-label">What we do differently</div>
          <h2>
            A US-based senior team. <em>AI-accelerated development.</em> Shipped in 30 days, every time.
          </h2>

          <div className="solution-grid">
            <div className="solution-card">
              <div className="num">/ 01</div>
              <h3>AI-driven <em>everywhere</em> it matters</h3>
              <p>Our pipeline runs on AI tooling. Boilerplate, scaffolding, testing, refactoring. Weeks compressed into days, without cutting quality.</p>
            </div>
            <div className="solution-card">
              <div className="num">/ 02</div>
              <h3>US-based, <em>senior</em>, actually reachable</h3>
              <p>No offshore handoffs. No timezone ping-pong. No juniors learning on your dime. The engineers writing your code are the ones in your Slack every day.</p>
            </div>
            <div className="solution-card">
              <div className="num">/ 03</div>
              <h3>Production-grade. <em>Fully tested.</em></h3>
              <p>Real architecture, test coverage, and deployment pipelines. What ships is what runs in production. Not a demo you'll rebuild in six months.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ PROCESS ============ */}
      <section className="process">
        <div className="process-header">
          <h2>Four weeks. <em>One product.</em> Live.</h2>
          <p>Every build is different, but the shape of the 30 days isn't. Here's what actually happens between the intro call and launch day.</p>
        </div>

        <div className="timeline">
          {[
            { week: '01', title: 'Scope, architecture, kickoff.', body: 'We align on what ships in 30 days (and what doesn\'t), lock the technical architecture, stand up the infrastructure, and start building. By Friday of week one you see working screens.' },
            { week: '02', title: 'Core product build.', body: 'The core flows come online. Auth, data models, primary user paths. You\'re clicking through real functionality every day. Bugs get caught and killed in real time.' },
            { week: '03', title: 'Integrations, polish, testing.', body: 'Third-party integrations, edge cases, UI polish, test coverage, performance tuning. This is where most agencies start cutting. It\'s where we double down.' },
            { week: '04', title: 'Ship to production.', body: 'Deployment, monitoring, handoff docs, and live in your users\' hands. You own the code, the infrastructure, and the keys. We optionally stay on for maintenance and next-phase builds.' },
          ].map((m) => (
            <div key={m.week} className="milestone active">
              <div className="milestone-week">
                Week
                <strong>{m.week}</strong>
              </div>
              <h3>{m.title}</h3>
              <p>{m.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ============ GUARANTEE ============ */}
      <section className="guarantee">
        <div className="guarantee-inner">
          <div className="seal">
            <div className="seal-ring"></div>
            <div className="seal-inner">
              <div className="big">30</div>
              <div className="sm">Day · Guarantee</div>
            </div>
          </div>
          <h2>If we don't ship in 30 days, <em>we keep building, on us.</em></h2>
          <p>That's the guarantee. A flat price, a hard deadline, and a team that eats the overage if we miss. We're only able to offer this because we don't miss. But if we do, the risk sits with us, not you.</p>
          <div className="guarantee-cta">
            <a href="/schedule" className="btn-primary">
              Grab your slot <span className="arrow">→</span>
            </a>
          </div>
        </div>
      </section>

      {/* ============ PROOF ============ */}
      <section className="builds">
        <div className="builds-header">
          <div className="section-label">Selected builds</div>
          <h2>What <em>30 days</em> has looked like.</h2>
        </div>

        <div className="build-card">
          <div className="build-tag">AI Workflow Platform</div>
          <div className="build-content">
            <h3>A full AI-powered workflow SaaS, ready for paying users.</h3>
            <p>Founder had been quoted 6 months and $150K by two other agencies. We shipped the first production version in 30 days. Paying users onboarded in 90.</p>
          </div>
          <div className="build-stat">
            <div className="before">6 months / $150K quoted</div>
            <div className="after">30 days</div>
            <div className="after-label">to production</div>
          </div>
        </div>

        <div className="build-card">
          <div className="build-tag">Internal Ops Tool</div>
          <div className="build-content">
            <h3>Internal ops platform for an 8-figure e-commerce brand.</h3>
            <p>They'd cycled through two offshore teams and a freelancer. Original scope: four months. We delivered the first production version in 3 weeks, then kept iterating as the ops team used it.</p>
          </div>
          <div className="build-stat">
            <div className="before">4 months prior attempts</div>
            <div className="after">21 days</div>
            <div className="after-label">in production</div>
          </div>
        </div>

        <div className="build-card">
          <div className="build-tag">B2B Lead Generation SaaS</div>
          <div className="build-content">
            <h3>Outbound lead-gen SaaS with AI enrichment and multi-channel sequences.</h3>
            <p>Founder was stitching together seven tools to run outbound and wanted to productize the workflow. We shipped scraping, AI-driven enrichment, email and LinkedIn sequencing, and pipeline tracking as one platform in 30 days. First paying customers onboarded the following week.</p>
          </div>
          <div className="build-stat">
            <div className="before">7-tool manual stack</div>
            <div className="after">30 days</div>
            <div className="after-label">to paying users</div>
          </div>
        </div>
      </section>

      {/* ============ FAQ ============ */}
      <section className="faq">
        <div className="faq-inner">
          <div className="section-label">Common questions</div>
          <h2>Everything you're <em>probably</em> wondering.</h2>

          {faqs.map((f, i) => (
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
        </div>
      </section>

      {/* ============ FINAL CTA ============ */}
      <section className="final-cta" id="apply">
        <div className="final-cta-inner">
          <div className="section-label" style={{ justifyContent: 'center' }}>Ready to build</div>
          <h2>30 days from now,<br />it's <em>live.</em></h2>
          <p>Fill out the form, tell us about your idea, and we'll personally review it. If we're a fit, we'll jump on a 20-minute call and map out exactly what ships in your first 30 days.</p>
          <a href="/schedule" className="btn-final">
            Book a Call <span className="arrow">→</span>
          </a>
          <div className="final-meta">
            {finalSegments.map((s, i) => (
              <span key={i}>
                {i > 0 && <span className="meta-sep" aria-hidden="true">·</span>}
                {s}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer>
        <div className="footer-inner">
          <a href="/" className="logo">
            <img src="/logo.png" alt="DataStaqAI" className="logo-mark" />
            <span>DataStaq<span className="logo-accent">AI</span></span>
          </a>
          <div className="footer-meta">Richmond, Virginia · © 2026 DataStaq AI</div>
        </div>
      </footer>
    </>
  );
}
