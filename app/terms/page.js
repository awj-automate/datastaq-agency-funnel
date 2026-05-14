// Terms of Service — plain-language template copy generated for DataStaq AI.
// Reasonable for an informational marketing site, but it is NOT legal advice.
// Have counsel review, and confirm the legal entity name and governing-law
// jurisdiction before relying on it.

import SiteNav from '../components/SiteNav';

export const metadata = {
  title: 'Terms of Service | DataStaq AI',
  description: 'The terms that govern your use of the DataStaq AI website.',
};

export default function TermsPage() {
  return (
    <div className="legal">
      <SiteNav cta={{ href: '/schedule', label: 'Book a Call →' }} />

      <main className="legal-main">
        <h1>Terms of Service</h1>
        <div className="legal-updated">Last updated: May 14, 2026</div>

        <p className="legal-intro">
          These Terms of Service ("Terms") govern your use of the DataStaq AI ("DataStaq," "we,"
          "us") website. By using the site, you agree to these Terms. If you do not agree, please do
          not use the site.
        </p>

        <h2>Use of the site</h2>
        <p>
          You may use this site for lawful, informational purposes. You agree not to misuse it —
          for example, by attempting to disrupt the site, access it through automated means without
          permission, or interfere with other visitors.
        </p>

        <h2>Services and engagements</h2>
        <p>
          This site describes DataStaq's services. Any engagement is governed by a separate written
          agreement between you and DataStaq. Nothing on this site is an offer, a contract, or a
          guarantee of any particular result. Statistics and outcomes shown are illustrative unless
          a specific source is cited.
        </p>

        <h2>Intellectual property</h2>
        <p>
          The content on this site — including text, design, graphics, and logos — is owned by
          DataStaq or its licensors and is protected by intellectual property laws. You may not
          copy, reproduce, or reuse it without our prior written permission.
        </p>

        <h2>No warranties</h2>
        <p>
          The site is provided "as is" and "as available," without warranties of any kind, whether
          express or implied. We do not warrant that the site will be uninterrupted, error-free, or
          free of harmful components.
        </p>

        <h2>Limitation of liability</h2>
        <p>
          To the fullest extent permitted by law, DataStaq will not be liable for any indirect,
          incidental, special, or consequential damages arising out of or related to your use of
          the site.
        </p>

        <h2>Third-party links</h2>
        <p>
          The site may link to third-party websites or services. We are not responsible for the
          content, policies, or practices of those third parties.
        </p>

        <h2>Changes to these Terms</h2>
        <p>
          We may update these Terms from time to time. When we do, we will revise the "Last
          updated" date above. Your continued use of the site after changes take effect means you
          accept the updated Terms.
        </p>

        <h2>Governing law</h2>
        <p>
          These Terms are governed by the laws of the Commonwealth of Virginia, without regard to
          its conflict-of-laws rules.
        </p>

        <h2>Contact us</h2>
        <p>
          Questions about these Terms? Email <a href="mailto:john@datastaqai.com">john@datastaqai.com</a>.
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
