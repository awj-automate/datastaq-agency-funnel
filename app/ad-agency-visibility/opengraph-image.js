import { ImageResponse } from 'next/og';

// Dynamically generated 1200x630 OG / social image for the funnel.
// Next.js picks this up automatically as og:image (twitter-image.js re-exports
// it for twitter:image). No static asset to maintain.

export const runtime = 'edge';
export const alt = 'Stop Burning 20+ Hours a Week on Client Reports — DataStaq AI';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#09090B',
          padding: 80,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em' }}>
          <span style={{ color: '#E4E4E7' }}>DataStaq</span>
          <span style={{ color: '#4D8BFE' }}>AI</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: '0.16em',
              color: '#4D8BFE',
              marginBottom: 28,
            }}
          >
            FRACTIONAL AD VISIBILITY
          </div>
          <div
            style={{
              fontSize: 76,
              fontWeight: 600,
              lineHeight: 1.04,
              letterSpacing: '-0.035em',
              color: '#E4E4E7',
            }}
          >
            Stop Burning 20+ Hours a Week on Client Reports
          </div>
        </div>

        <div style={{ display: 'flex', fontSize: 30, lineHeight: 1.4, color: 'rgba(228,228,231,0.62)', maxWidth: 940 }}>
          Fractional ad data infrastructure for agencies running 100K+/month across Meta and Google.
        </div>
      </div>
    ),
    { ...size }
  );
}
