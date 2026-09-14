import LegalLayout, { DocSection, DocList, DocHighlight } from '../../components/common/LegalLayout';

export default function CookiePolicy() {
  return (
    <LegalLayout
      badge="LEGAL"
      title="Cookie Policy"
      subtitle="How CrackIt AI uses cookies and similar technologies. Replace bracketed placeholders with your final legal details before relying on this as a complete legal document."
      lastUpdated="14 September 2026"
    >
      <DocSection number="01" title="What this covers">
        <p>
          This page describes cookies used on the CrackIt AI website. It is a product-facing summary,
          not a substitute for independent legal advice. [LEGAL ENTITY NAME] should confirm this
          policy before public launch.
        </p>
      </DocSection>

      <DocSection number="02" title="What cookies we use">
        <p>Depending on how you use the site, cookies or local storage may include:</p>
        <DocList items={[
          'Session and authentication tokens so you stay signed in',
          'Preferences needed for the app to function (for example, UI state)',
          'Vercel Analytics, if enabled in production, to understand aggregate traffic',
          'Advertising scripts present in the site template (Google AdSense), if they set cookies',
        ]} />
      </DocSection>

      <DocSection number="03" title="What we do not do here">
        <DocHighlight>
          This policy does not claim third-party certifications or list every cookie name until those
          details are audited in production. We do not use cookies to invent audience sizes or sell
          personal interview transcripts.
        </DocHighlight>
      </DocSection>

      <DocSection number="04" title="Your choices">
        <p>
          You can block cookies in your browser. Blocking essential cookies may stop sign-in and
          dashboard features from working. For account data requests, see the Privacy Policy.
        </p>
      </DocSection>
    </LegalLayout>
  );
}
