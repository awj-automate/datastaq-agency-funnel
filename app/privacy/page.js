// Privacy Policy — plain-language template copy generated for DataStaq AI.
// Reasonable and reflects what the site actually does (lead forms, GA4, Meta
// Pixel/CAPI, Calendly, Neon), but it is NOT legal advice. Have counsel review,
// and confirm the legal entity name before relying on it.

import SiteNav from '../components/SiteNav';

export const metadata = {
  title: 'Privacy Policy | DataStaq AI',
  description: 'How DataStaq AI collects, uses, and protects information from visitors to our site.',
};

export default function PrivacyPage() {
  return (
    <div className="legal">
      <SiteNav cta={{ href: '/schedule', label: 'Book a Call →' }} />

      <main className="legal-main">
        <h1>Privacy Policy</h1>
        <div className="legal-updated">Last updated: May 14, 2026</div>

        <p className="legal-intro">
          This Privacy Policy explains how DataStaq AI ("DataStaq," "we," "us") collects, uses, and
          shares information when you visit our website or contact us about our services.
        </p>

        <h2>Information we collect</h2>
        <p>
          <strong>Information you give us.</strong> When you fill out a form or book a call, we
          collect the details you provide — typically your name, email address, phone number, and
          anything you choose to tell us about your business.
        </p>
        <p>
          <strong>Information collected automatically.</strong> Like most websites, we automatically
          collect technical data such as your IP address, browser and device type, the pages you
          view, and how you arrived at our site. We collect this through cookies and similar
          technologies.
        </p>

        <h2>How we use information</h2>
        <ul>
          <li>To respond to your inquiries and schedule calls.</li>
          <li>To provide, operate, and improve our website and services.</li>
          <li>To measure and improve our marketing and advertising.</li>
          <li>To comply with legal obligations and protect against fraud or misuse.</li>
        </ul>

        <h2>Analytics and advertising</h2>
        <p>
          We use Google Analytics 4 and the Meta Pixel (including Meta's Conversions API) to
          understand how visitors use our site and to measure ad performance. These tools may set
          cookies and receive information about your visit. You can opt out of Google Analytics with
          the{' '}
          <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer">
            Google Analytics Opt-out Browser Add-on
          </a>
          , and you can manage ad personalization in your{' '}
          <a href="https://www.facebook.com/adpreferences" target="_blank" rel="noopener noreferrer">
            Meta ad settings
          </a>
          .
        </p>

        <h2>Service providers</h2>
        <p>
          We share information with vendors that help us run our business — for example, scheduling
          (Calendly), website hosting, and database and infrastructure providers. These vendors may
          only use the information to provide services to us. We do not sell your personal
          information.
        </p>

        <h2>Cookies</h2>
        <p>
          Cookies are small files stored on your device. We use them for analytics, advertising
          measurement, and to make the site work. You can control cookies through your browser
          settings, though some features may not work without them.
        </p>

        <h2>Data retention</h2>
        <p>
          We keep personal information for as long as needed to fulfill the purposes described in
          this policy and as required by law. When it is no longer needed, we delete or anonymize
          it.
        </p>

        <h2>Your rights</h2>
        <p>
          Depending on where you live, you may have the right to access, correct, or delete the
          personal information we hold about you, or to object to certain processing. To make a
          request, email us at <a href="mailto:john@datastaqai.com">john@datastaqai.com</a>.
        </p>

        <h2>Data security</h2>
        <p>
          We use reasonable technical and organizational measures to protect personal information.
          No method of transmission or storage is completely secure, so we cannot guarantee absolute
          security.
        </p>

        <h2>Children's privacy</h2>
        <p>
          Our site is not directed to children under 13, and we do not knowingly collect their
          personal information.
        </p>

        <h2>Changes to this policy</h2>
        <p>
          We may update this policy from time to time. When we do, we will revise the "Last updated"
          date above.
        </p>

        <h2>Contact us</h2>
        <p>
          Questions about this policy? Email{' '}
          <a href="mailto:john@datastaqai.com">john@datastaqai.com</a>.
        </p>
      </main>

      <footer>
        <div className="footer-inner">
          <a href="/" className="logo">
            <img src="/logo.png" alt="DataStaqAI" className="logo-mark" />
            <span>DataStaq<span className="logo-accent">AI</span></span>
          </a>
          <div className="footer-meta">Richmond, Virginia · © 2026 DataStaq AI</div>
        </div>
      </footer>
    </div>
  );
}
