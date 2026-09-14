import LegalLayout, { DocSection, DocList, DocHighlight, DocContact } from '../../components/common/LegalLayout';
import { Link } from 'react-router-dom';

export default function PrivacyPolicy() {
  return (
    <LegalLayout
      seoPage="privacy"
      badge="LEGAL"
      title="Privacy Policy"
      subtitle="We believe in plain-language privacy. This document explains exactly what we collect, why, and what you can do about it."
      lastUpdated="1 January 2025"
    >

      <DocSection number="1" title="Who we are">
        <p>
          CrackIt AI is an AI-powered interview preparation platform operated by{' '}
          <strong>CrackIt AI</strong> ("<strong>we</strong>", "<strong>our</strong>", "<strong>us</strong>").
          We are incorporated and operating in India.
        </p>
        <p>For privacy-related matters, contact us at:</p>
        <DocContact label="Email"   href="mailto:pallavkanani27@mail.com"      value="pallavkanani27@mail.com" />
        <DocContact label="Address" href="#"                               value="Surat, Gujarat, India — 395001" />
      </DocSection>

      <DocSection number="2" title="What we collect">
        <p><strong>Information you give us directly:</strong></p>
        <DocList items={[
          'Full name and email address when you register',
          'Password (stored as a bcrypt hash — we cannot read it)',
          'College, target role, and skills from your profile',
          'Resume files you upload (PDF or DOCX) — stored temporarily, deleted after text extraction',
          'Interview answers: voice transcripts (from your microphone during voice sessions) and text answers',
          'Payment details: we do NOT store card numbers or UPI IDs. Razorpay handles payment processing. We only store a Razorpay order ID and payment ID for reconciliation.',
        ]} />
        <p className="mt-3"><strong>Information collected automatically:</strong></p>
        <DocList items={[
          'IP address and general location (country/city)',
          'Browser type, operating system, device type',
          'Pages visited, features used, session durations',
          'Interview scores and performance data',
          'AI cost logs (token counts per API call, for internal margin tracking — not shared)',
        ]} />
        <DocHighlight>
          We do NOT collect: government IDs, Aadhaar, PAN, precise GPS location, contacts, photos outside of resume upload, or any payment instrument details.
        </DocHighlight>
      </DocSection>

      <DocSection number="3" title="Why we collect it (legal basis)">
        <p>We process your data only when we have a lawful basis under applicable law (including India's Digital Personal Data Protection Act, 2023):</p>
        <DocList items={[
          'Contract performance — to provide the service you signed up for (account, interviews, scoring)',
          'Legitimate interest — to improve product quality, prevent abuse, and track AI costs',
          'Consent — for optional features like leaderboard participation and marketing emails (you can withdraw at any time)',
          'Legal obligation — to comply with tax, payment, and regulatory requirements',
        ]} />
      </DocSection>

      <DocSection number="4" title="How we use your data">
        <DocList items={[
          'Create and manage your account',
          'Conduct voice and text mock interviews and score your responses',
          'Scan and analyse your resume',
          'Show you your results, history, and leaderboard rank',
          'Process subscription payments via Razorpay',
          'Send transactional emails (account confirmation, payment receipts, subscription notices)',
          'Send optional product updates (only with your consent; unsubscribe anytime)',
          'Detect fraud, abuse, and enforce our Terms of Service',
          'Aggregate, anonymised analytics to improve the product',
        ]} />
        <DocHighlight variant="black">
          We do NOT sell your personal data to third parties. We do NOT use your interview recordings or transcripts to train AI models sold to other companies.
        </DocHighlight>
      </DocSection>

      <DocSection number="5" title="Third-party services we use">
        <p>We share limited data with trusted service providers:</p>
        <DocList items={[
          'OpenAI (USA) — receives resume text and interview transcripts to generate AI responses and scores. OpenAI\'s API data usage policy applies. Data is processed per request and not used to train GPT models by default under our API agreement.',
          'Razorpay (India) — receives your name, email, and order amount to process payments. Razorpay stores payment instrument details under their own PCI-DSS certified infrastructure.',
          'MongoDB Atlas (USA/India region) — our primary database. Data is encrypted at rest and in transit.',
          'Vercel (USA) — hosts our frontend. May log request metadata. No personal content is stored there.',
          'Google Analytics (optional) — anonymised page-view data. IP anonymisation is enabled.',
        ]} />
        <p className="mt-3 text-xs text-nb-black/60">We do not use advertising networks, tracking pixels, or social login providers.</p>
      </DocSection>

      <DocSection number="6" title="Data retention">
        <DocList items={[
          'Active accounts: we retain all data while your account is active',
          'Deleted accounts: all personal data is purged within 30 days of account deletion',
          'Interview transcripts and voice data: retained for 12 months, then automatically deleted',
          'Payment records: retained for 7 years as required by Indian taxation law',
          'Anonymised, aggregated analytics: retained indefinitely (not personal data)',
        ]} />
      </DocSection>

      <DocSection number="7" title="Your rights">
        <p>Under India's DPDP Act and applicable law, you have the right to:</p>
        <DocList items={[
          'Access — request a copy of all personal data we hold about you',
          'Correction — ask us to fix inaccurate or incomplete data',
          'Erasure — request deletion of your data (subject to legal retention requirements)',
          'Portability — receive your data in a structured, machine-readable format',
          'Withdraw consent — at any time for consent-based processing (e.g., leaderboard, marketing)',
          'Object — to processing based on legitimate interest',
          'Lodge a complaint — with India\'s Data Protection Board once operational',
        ]} />
        <p className="mt-3">To exercise any right, email <a href="mailto:pallavkanani27@mail.com" className="font-black underline">pallavkanani27@mail.com</a>. We respond within 30 days.</p>
      </DocSection>

      <DocSection number="8" title="Cookies & tracking">
        <p>We use:</p>
        <DocList items={[
          'Session cookies — to keep you logged in (JWT stored in localStorage)',
          'Preference cookies — to remember UI settings',
          'Analytics cookies (Google Analytics, optional) — to understand page usage',
        ]} />
        <p className="mt-3">No third-party advertising cookies are used. You can clear cookies in your browser at any time.</p>
      </DocSection>

      <DocSection number="9" title="Children's privacy">
        <p>CrackIt AI is not intended for users under 13 years of age. We do not knowingly collect personal data from children. If you believe a child has provided us data, contact <a href="mailto:pallavkanani27@mail.com" className="font-black underline">pallavkanani27@mail.com</a> immediately and we will delete it.</p>
      </DocSection>

      <DocSection number="10" title="Security">
        <DocList items={[
          'Passwords are bcrypt-hashed (10 salt rounds) — never stored in plaintext',
          'All API traffic uses HTTPS/TLS 1.2+',
          'Database encrypted at rest (MongoDB Atlas)',
          'JWT tokens expire after 7 days',
          'Rate limiting on all authentication and AI endpoints',
          'No payment instrument data is stored on our servers — handled entirely by Razorpay',
        ]} />
        <DocHighlight variant="red">
          If you discover a security vulnerability, please report it responsibly to pallavkanani27@mail.com. Do not publicly disclose it until we've had 30 days to address it.
        </DocHighlight>
      </DocSection>

      <DocSection number="11" title="Changes to this policy">
        <p>We may update this policy. For material changes, we'll notify you by email (if you've provided one) at least 14 days before the change takes effect. Continued use after the effective date constitutes acceptance.</p>
      </DocSection>

      <DocSection number="12" title="Contact us">
        <p>For any privacy questions or to exercise your rights:</p>
        <DocContact label="Email"   href="mailto:pallavkanani27@mail.com" value="pallavkanani27@mail.com" />
        <DocContact label="Support" href="mailto:pallavkanani27@mail.com" value="pallavkanani27@mail.com" />
        <DocContact label="Address" href="#" value="CrackIt AI, Surat, Gujarat — 395001, India" />
      </DocSection>

    </LegalLayout>
  );
}
