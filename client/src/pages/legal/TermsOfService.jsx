import LegalLayout, { DocSection, DocList, DocHighlight, DocContact } from '../../components/common/LegalLayout';

export default function TermsOfService() {
  return (
    <LegalLayout
      seoPage="terms"
      badge="LEGAL"
      title="Terms of Service"
      subtitle="Please read these terms before using CrackIt AI. By using our platform you agree to be bound by them."
      lastUpdated="1 January 2025"
    >

      <DocSection number="1" title="Acceptance">
        <p>
          By creating an account or using CrackIt AI ("<strong>Service</strong>"), you agree to these Terms of Service
          ("<strong>Terms</strong>") and our <a href="/privacy-policy" className="font-black underline">Privacy Policy</a>.
          If you do not agree, do not use the Service.
        </p>
        <p>
          These Terms constitute a legally binding agreement between you ("<strong>User</strong>") and
          <strong> CrackIt AI</strong>, operating from Surat, Gujarat, India.
        </p>
      </DocSection>

      <DocSection number="2" title="Eligibility">
        <DocList items={[
          'You must be at least 13 years of age to use the Service',
          'You must provide accurate and truthful registration information',
          'One account per person — multiple accounts may be terminated without notice',
          'You are responsible for all activity under your account',
        ]} />
      </DocSection>

      <DocSection number="3" title="Account responsibilities">
        <DocList items={[
          'Keep your password confidential — we will never ask for it by email',
          'Notify us immediately at pallavkanani27@mail.com if you suspect unauthorised access',
          'Do not share your account with others',
          'Do not use automated scripts or bots to interact with the Service',
          'Do not attempt to reverse-engineer, scrape, or copy our AI models, prompts, or scoring logic',
        ]} />
      </DocSection>

      <DocSection number="4" title="Subscriptions & payments">
        <p>
          Paid subscriptions are processed by <strong>Razorpay</strong>, a PCI-DSS certified payment gateway.
          We do not store your card, UPI, or bank details.
        </p>
        <DocList items={[
          'Subscription fees are billed in advance — monthly or annually depending on your plan',
          'All prices are in Indian Rupees (INR) and are inclusive of platform fees',
          'GST (if applicable) may be added at checkout based on your billing state',
          'Subscription auto-renews unless you cancel before the renewal date',
          'You can cancel auto-renewal at any time from Settings → Billing — your plan remains active until the period end',
          'We reserve the right to change pricing with 30 days\' advance notice to existing subscribers',
          'Hard session caps are enforced server-side per your plan — these are cost controls, not bugs',
        ]} />
        <DocHighlight>
          Leaderboard participation requires an active paid subscription. Free plan users can view the leaderboard but cannot earn points toward the ranked board.
        </DocHighlight>
      </DocSection>

      <DocSection number="5" title="Refunds">
        <p>
          We offer a <strong>7-day money-back guarantee</strong> on all paid subscriptions.
          See our full <a href="/refund-policy" className="font-black underline">Refund Policy</a> for details.
        </p>
        <DocList items={[
          'Request within 7 days of purchase (14 days for annual plans)',
          'Refunds are processed to your original payment method within 5–7 business days',
          'One refund per user account — subsequent subscriptions are non-refundable',
          'Refunds are not available for accounts found to have violated these Terms',
        ]} />
      </DocSection>

      <DocSection number="6" title="Acceptable use">
        <p>You agree NOT to:</p>
        <DocList items={[
          'Use the Service for any unlawful purpose',
          'Attempt to circumvent session caps or rate limits',
          'Create fake interviews or manipulate the leaderboard',
          'Upload malicious files (malware, scripts) as resume files',
          'Impersonate any person or organisation',
          'Use the Service to collect data about other users without consent',
          'Resell or sublicense access to the Service',
          'Use the Service to train competing AI models',
        ]} />
        <DocHighlight variant="red">
          Anti-gaming enforcement: our system detects and discards points from sessions that do not meet minimum duration and answer-count thresholds. Accounts found gaming the leaderboard may be banned without refund.
        </DocHighlight>
      </DocSection>

      <DocSection number="7" title="AI-generated content">
        <DocList items={[
          'All interview questions, scores, and feedback are AI-generated and may contain errors',
          'Scores are for practice purposes only — they do not guarantee real interview performance',
          'We do not guarantee that using our Service will result in job offers or placements',
          'AI responses may occasionally be inaccurate, biased, or inappropriate — report issues to pallavkanani27@mail.com',
        ]} />
      </DocSection>

      <DocSection number="8" title="Intellectual property">
        <p>
          All content, branding, prompts, and software on CrackIt AI are owned by or licensed to us.
          You may not copy, modify, or distribute our content without written permission.
        </p>
        <p className="mt-3">
          <strong>Your content:</strong> you retain ownership of your resume content, interview answers,
          and any data you submit. By using the Service, you grant us a limited, non-exclusive licence
          to process your content solely to provide the Service to you.
        </p>
      </DocSection>

      <DocSection number="9" title="Privacy & data">
        <p>
          Our <a href="/privacy-policy" className="font-black underline">Privacy Policy</a> is incorporated
          into these Terms and explains how we collect, use, and protect your data.
        </p>
        <p className="mt-2">
          Voice interview transcripts are processed by OpenAI's API to generate scores and feedback.
          By using voice interviews, you consent to your spoken audio being transcribed and processed by OpenAI
          under their <a href="https://openai.com/policies/api-data-usage-policies" className="font-black underline" target="_blank" rel="noopener noreferrer">API data usage policy</a>.
        </p>
      </DocSection>

      <DocSection number="10" title="Service availability">
        <DocList items={[
          'We aim for 99% uptime but do not guarantee uninterrupted availability',
          'Planned maintenance will be communicated at least 24 hours in advance where possible',
          'We are not liable for losses caused by downtime, AI errors, or data loss beyond our reasonable control',
          'If a voice session fails due to a server error, the interview credit will not be deducted — contact pallavkanani27@mail.com if this occurs',
        ]} />
      </DocSection>

      <DocSection number="11" title="Termination">
        <p>
          <strong>By you:</strong> you may delete your account at any time from Settings. Data is purged within 30 days per our Privacy Policy.
        </p>
        <p className="mt-2">
          <strong>By us:</strong> we may suspend or terminate your account immediately if you violate these Terms,
          particularly around abuse, gaming, or illegal activity. Paid subscriptions will be refunded on a pro-rata
          basis in cases of wrongful termination.
        </p>
      </DocSection>

      <DocSection number="12" title="Limitation of liability">
        <p>
          To the maximum extent permitted by Indian law, CrackIt AI shall not be liable for indirect, incidental,
          or consequential damages arising from your use of the Service, including but not limited to loss of income,
          missed job opportunities, or reliance on AI-generated scores.
        </p>
        <p className="mt-2">Our total liability shall not exceed the amount you paid us in the 3 months preceding the claim.</p>
      </DocSection>

      <DocSection number="13" title="Governing law">
        <p>
          These Terms are governed by the laws of India. Any dispute shall be subject to the exclusive jurisdiction
          of the courts in Surat, Gujarat, India.
        </p>
        <p className="mt-2">
          We encourage users to contact us first at <a href="mailto:pallavkanani27@mail.com" className="font-black underline">pallavkanani27@mail.com</a> —
          most issues can be resolved without litigation.
        </p>
      </DocSection>

      <DocSection number="14" title="Changes to these terms">
        <p>
          We may update these Terms. For material changes, we'll notify you by email at least 14 days before the
          change takes effect. Continued use after the effective date constitutes acceptance of the new Terms.
        </p>
      </DocSection>

      <DocSection number="15" title="Contact">
        <DocContact label="Legal"   href="mailto:pallavkanani27@mail.com"   value="pallavkanani27@mail.com" />
        <DocContact label="Support" href="mailto:pallavkanani27@mail.com" value="pallavkanani27@mail.com" />
        <DocContact label="Address" href="#" value="CrackIt AI, Surat, Gujarat — 395001, India" />
      </DocSection>

    </LegalLayout>
  );
}
