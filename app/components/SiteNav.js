'use client';

import { useEffect, useState } from 'react';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function SiteNav({ cta }) {
  const [segments, setSegments] = useState(['US-Based', 'Taking on 2 new clients']);

  useEffect(() => {
    const next = new Date();
    next.setDate(1);
    next.setMonth(next.getMonth() + 1);
    setSegments([
      'US-Based',
      `Taking on 2 new clients for ${MONTHS[next.getMonth()]} ${next.getFullYear()}`,
    ]);
  }, []);

  return (
    <nav>
      <a href="/" className="logo">
        <img src="/logo.png" alt="DataStaqAI" className="logo-mark" />
        <span>DataStaq<span className="logo-accent">AI</span></span>
      </a>
      <div className="nav-meta">
        <span className="dot"></span>
        <span>
          {segments.map((s, i) => (
            <span key={i}>
              {i > 0 && <span className="meta-sep" aria-hidden="true">·</span>}
              {s}
            </span>
          ))}
        </span>
      </div>
      {cta ? (
        <a href={cta.href} className="nav-cta">{cta.label}</a>
      ) : (
        <span aria-hidden="true" />
      )}
    </nav>
  );
}
