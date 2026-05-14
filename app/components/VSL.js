'use client';

import { useRef, useState } from 'react';
import { Stream } from '@cloudflare/stream-react';

const MILESTONES = [25, 50, 75];

function fireEvent(name, payload = {}) {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: `vsl_${name}`, ...payload });
  if (typeof window.gtag === 'function') {
    window.gtag('event', `vsl_${name}`, payload);
  }
}

export default function VSL({ videoId, aspect, badge, duration }) {
  const id = videoId || process.env.NEXT_PUBLIC_CF_STREAM_VIDEO_ID;
  const playerRef = useRef(null);
  const firedRef = useRef(new Set());
  const [muted, setMuted] = useState(true);

  // `aspect="16x9"` opts into the landscape container (see globals.css).
  // Default (undefined) keeps the original 3:4 portrait sizing.
  const aspectClass = aspect === '16x9' ? ' vsl-16x9' : '';

  const handleTimeUpdate = () => {
    const p = playerRef.current;
    if (!p || !p.duration) return;
    const pct = (p.currentTime / p.duration) * 100;
    for (const m of MILESTONES) {
      if (pct >= m && !firedRef.current.has(m)) {
        firedRef.current.add(m);
        fireEvent('progress', { milestone: m });
      }
    }
  };

  if (!id) {
    return (
      <div className={`video-container${aspectClass}`}>
        <div className="video-placeholder">
          <div className="video-badge"><span className="rec"></span>{badge || 'Watch before you apply'}</div>
          <div className="play-button">
            <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
          </div>
          <div className="video-duration">{duration || '06:42'}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`video-container vsl-live${aspectClass}`}>
      <Stream
        streamRef={playerRef}
        src={id}
        controls
        autoplay
        muted={muted}
        preload="auto"
        responsive
        primaryColor="#4D8BFE"
        onPlay={() => fireEvent('play')}
        onEnded={() => fireEvent('complete')}
        onTimeUpdate={handleTimeUpdate}
      />
      {muted && (
        <button
          type="button"
          className="vsl-unmute"
          onClick={() => {
            setMuted(false);
            if (playerRef.current) playerRef.current.muted = false;
            fireEvent('unmute');
          }}
          aria-label="Unmute video"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0014 7.97v8.05c1.48-.74 2.5-2.26 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
          </svg>
          Tap for sound
        </button>
      )}
    </div>
  );
}
