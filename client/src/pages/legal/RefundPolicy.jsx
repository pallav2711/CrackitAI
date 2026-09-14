import LegalLayout, { DocSection, DocList, DocHighlight, DocContact } from '../../components/common/LegalLayout';

export default function RefundPolicy() {
  return (
    <LegalLayout
      seoPage="refund"
      badge="LEGAL"
      title="Refund & Cancellation Policy"
      subtitle="If a paid plan is not working for you within the stated window, you can request a refund as described below."
      lastUpdated="1 January 2025"
    >

      <DocSection number="1" title="Our guarantee">
        <DocHighlight>
          All paid subscriptions come with a 7-day money-back guarantee (14 days for annual plans). If you're not satisfied for any reason, email us within this window and we'll issue a full refund.
        </DocHighlight>
        <p className="mt-4">
          This policy is our commitment that our product earns your payment — not just your sign-up.
          Razorpay processes all refunds back to your original payment instrument.
        </p>
      </DocSection>

      <DocSection number="2" title="Refund eligibility">
        <p>You are eligible for a full refund if:</p>
        <DocList items={[
          'Your refund request is made within 7 days of the original purchase (14 days for annual plans)',
          'This is your first refund request on this account',
          'Your account has not been terminated for Terms of Service violations',
          'Your account has not been flagged for abuse or leaderboard gaming',
        ]} />
        <p className="mt-4">Partial refunds (pro-rata) may be issued at our discretion for circumstances outside these criteria.</p>
      </DocSection>

      <DocSection number="3" title="Non-refundable situations">
        <DocList items={[
          'Requests made after 7 days (monthly plans) or 14 days (annual plans) from purchase date',
          'Second or subsequent subscriptions on the same account',
          'Accounts terminated for Terms of Service violations (including leaderboard abuse)',
          'Unused interview credits — we cannot refund for sessions you chose not to use',
          'Service outages shorter than 24 hours — covered by our SLA credit process instead (contact support)',
        ]} />
        <DocHighlight variant="red">
          We do not issue refunds for AI scoring results you disagree with. AI evaluations are clearly marked as automated and approximate. If you believe a session failed due to a technical error on our side, contact us within 48 hours and we will review it.
        </DocHighlight>
      </DocSection>

      <DocSection number="4" title="How to request a refund">
        <p>Email us at <a href="mailto:pallavkanani27@mail.com" className="font-black underline">pallavkanani27@mail.com</a> with:</p>
        <DocList items={[
          'Subject line: "Refund Request — [your registered email]"',
          'Your registered email address',
          'The Razorpay Order ID from your payment receipt (starts with "order_...")',
          'Brief reason (optional but helps us improve)',
        ]} />
        <p className="mt-3">We will acknowledge your request within <strong>1 business day</strong> and process the refund within <strong>3–5 business days</strong> of approval.</p>
      </DocSection>

      <DocSection number="5" title="Refund processing timeline">
        <DocList items={[
          'UPI payments: refunded within 1–3 business days',
          'Debit/credit card: 5–7 business days (bank processing times vary)',
          'Net banking: 3–5 business days',
          'EMI: per your EMI provider\'s policy — we initiate the refund immediately',
        ]} />
        <p className="mt-3 text-xs text-nb-black/60 font-medium">
          Razorpay sends a confirmation email when the refund is initiated. If you don't see the credit within the timeframe above, contact your bank with the Razorpay refund reference number.
        </p>
      </DocSection>

      <DocSection number="6" title="Cancellation (stopping auto-renewal)">
        <p>
          Cancelling auto-renewal is different from a refund. You can cancel at any time from
          <strong> Settings → Billing → Cancel auto-renew</strong> — your plan stays active until the
          current billing period ends. No refund is issued for the remaining period when you cancel.
        </p>
        <p className="mt-3">
          If you want both cancellation AND a refund, and you're within the refund window — email us and we'll handle both together.
        </p>
      </DocSection>

      <DocSection number="7" title="Annual plan downgrade">
        <p>
          If you purchased an annual plan and want to downgrade to monthly within 14 days, we will:
        </p>
        <DocList items={[
          'Refund the annual payment in full',
          'Not automatically charge you for a monthly plan — you can subscribe to a new plan yourself',
        ]} />
      </DocSection>

      <DocSection number="8" title="Contact for refunds">
        <DocContact label="Refunds"  href="mailto:pallavkanani27@mail.com"  value="pallavkanani27@mail.com" />
        <DocContact label="Support"  href="mailto:pallavkanani27@mail.com"  value="pallavkanani27@mail.com" />
        <DocContact label="Response" href="#"                           value="Within 1 business day" />
      </DocSection>

    </LegalLayout>
  );
}
