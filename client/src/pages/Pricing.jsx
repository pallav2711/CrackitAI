/**
 * Pricing page — Razorpay-ready
 * Shows all plans with CTAs wired to /register (for unauthenticated users)
 * or /billing (for logged-in users). Fully neo-brutalist.
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Check, X, Zap, FileText, Trophy, ArrowRight,
  Shield, RefreshCw, CreditCard, Briefcase, HelpCircle,
} from 'lucide-react';
import Navbar from '../components/landing/Navbar';
import Footer from '../components/landing/Footer';
import useAuthStore from '../store/useAuthStore';

/* ─── Plan data ───────────────────────────────────────────────────────────── */
const PLANS = [
  {
    key: 'free',
    name: 'Free',
    price: '₹0',
    period: 'forever',
    highlight: false,
    badge: null,
    color: 'bg-white',
    cta: 'Get started free',
    ctaVariant: 'ghost',
    features: [
      { text: '1 JD match per month',             ok: true  },
      { text: '1 resume scan',                     ok: true  },
      { text: '1 AI quiz (30 questions)',           ok: true  },
      { text: 'ATS score & skill gap',             ok: true  },
      { text: 'Cover letter generation',           ok: true  },
      { text: 'Resume tailoring',                  ok: false },
      { text: 'Unlimited scans',                   ok: false },
      { text: 'Priority processing',               ok: false },
    ],
  },
  {
    key: 'basic',
    name: 'Basic',
    price: '₹299',
    period: '/ month',
    highlight: false,
    badge: null,
    color: 'bg-white',
    cta: 'Get Basic',
    ctaVariant: 'black',
    razorpayPlan: 'basic',
    features: [
      { text: '5 JD matches per month',            ok: true  },
      { text: 'Unlimited resume scans',            ok: true  },
      { text: '5 AI quizzes',                      ok: true  },
      { text: 'ATS score & skill gap',             ok: true  },
      { text: 'Resume tailoring',                  ok: true  },
      { text: 'Cover letter generation',           ok: true  },
      { text: 'Priority processing',               ok: false },
      { text: 'Prep plan generation',              ok: false },
    ],
  },
  {
    key: 'pro',
    name: 'Pro',
    price: '₹599',
    period: '/ month',
    highlight: true,
    badge: 'MOST POPULAR',
    color: 'bg-nb-yellow',
    cta: 'Get Pro',
    ctaVariant: 'black',
    razorpayPlan: 'pro',
    features: [
      { text: '15 JD matches per month',           ok: true  },
      { text: 'Unlimited resume scans',            ok: true  },
      { text: 'Unlimited quizzes',                 ok: true  },
      { text: 'Resume tailoring',                  ok: true  },
      { text: 'Cover letter generation',           ok: true  },
      { text: 'Prep plan generation',              ok: true  },
      { text: 'Priority processing',               ok: true  },
      { text: 'Readiness score & roadmap',         ok: true  },
    ],
  },
  {
    key: 'annual_pro',
    name: 'Pro Annual',
    price: '₹4,999',
    period: '/ year',
    highlight: false,
    badge: 'SAVE 30%',
    color: 'bg-nb-black text-nb-white',
    cta: 'Get Annual Pro',
    ctaVariant: 'yellow',
    razorpayPlan: 'annual_pro',
    features: [
      { text: '15 JD matches per month',           ok: true  },
      { text: 'Unlimited everything',              ok: true  },
      { text: 'All Pro features',                  ok: true  },
      { text: 'Save ₹2,189 vs monthly',            ok: true  },
      { text: 'Priority support',                  ok: true  },
      { text: 'Early access to new features',      ok: true  },
    ],
  },
];
const FAQ = [
  {
    q: 'What counts as one JD match?',
    a: 'Each job application you create counts as one JD match. Within that workspace you can run ATS score, skill gap, tailoring, cover letter, and quiz as many times as you want.',
  },
  {
    q: 'Can I upgrade or downgrade my plan anytime?',
    a: 'Yes. You can upgrade immediately — your new plan starts right away. Downgrades take effect at the end of your current billing cycle. No lock-in.',
  },
  {
    q: 'What payment methods does Razorpay accept?',
    a: 'Razorpay accepts UPI (Google Pay, PhonePe, Paytm, etc.), all major debit/credit cards (Visa, Mastercard, RuPay), net banking for 50+ banks, and EMI.',
  },
  {
    q: 'Is my payment information stored on your servers?',
    a: 'No. All payment data is handled entirely by Razorpay, a PCI-DSS compliant payment gateway. We only store a payment ID for reference — never your card or UPI details.',
  },
  {
    q: 'What happens when I use up my monthly JD matches?',
    a: 'You can still access your existing workspaces and retake quizzes. Your counter resets on your billing cycle date. You can upgrade at any time to get more matches immediately.',
  },
  {
    q: 'Will the AI fabricate skills in my tailored resume?',
    a: 'Never. The AI only improves your existing content and highlights relevant experience. If a required skill is missing from your profile, it flags it as a warning — it never adds skills you don\'t have.',
  },
  {
    q: 'Can I retake the quiz multiple times?',
    a: 'Yes. You can retake your quiz as many times as you want from your job workspace. Each attempt overwrites the previous score, so you can track improvement.',
  },
  {
    q: 'Is there a free trial for paid plans?',
    a: 'The free plan is your trial — get a full JD match, ATS score, skill gap, cover letter, and quiz at no cost. Paid plans include a 7-day money-back guarantee.',
  },
  {
    q: 'Can my college get bulk access for students?',
    a: 'Yes — email us at pallavkanani27@mail.com with your institution name. We offer custom institutional pricing for colleges and universities.',
  },
];

/* ─── Components ──────────────────────────────────────────────────────────── */
const PlanCard = ({ plan, isLoggedIn }) => {
  const isDark = plan.color.includes('bg-nb-black');
  const featureText = isDark ? 'text-white/65' : 'text-nb-black/60';
  const crossColor  = isDark ? 'text-white/20' : 'text-nb-black/20';

  const ctaClass = {
    black:  'btn btn-black w-full justify-center',
    yellow: 'btn btn-primary w-full justify-center',
    ghost:  'btn btn-secondary w-full justify-center',
  }[plan.ctaVariant] || 'btn btn-secondary w-full justify-center';

  const href = isLoggedIn ? '/billing' : `/checkout?plan=${plan.key}`;

  return (
    <div
      className={`relative border-3 border-nb-black flex flex-col ${plan.color}`}
      style={{
        borderRadius: '8px',
        boxShadow: plan.highlight ? '8px 8px 0 #111111' : '4px 4px 0 #111111',
        transform: plan.highlight ? 'translateY(-4px)' : 'none',
      }}
    >
      {/* Badge */}
      {plan.badge && (
        <span
          className={`absolute -top-3.5 left-1/2 -translate-x-1/2 text-[10px] font-black uppercase tracking-widest px-3 py-1 border-2 border-nb-black whitespace-nowrap ${
            plan.highlight ? 'bg-nb-black text-nb-yellow' : 'bg-nb-yellow text-nb-black'
          }`}
          style={{ borderRadius: '3px' }}
        >
          {plan.badge}
        </span>
      )}

      {/* Yellow accent strip on featured card */}
      {plan.highlight && (
        <div
          className="h-1.5 w-full bg-nb-yellow border-b-2 border-nb-black"
          style={{ borderRadius: '6px 6px 0 0' }}
          aria-hidden="true"
        />
      )}

      {/* Header */}
      <div className={`border-b-3 border-nb-black p-6 ${isDark ? '' : ''}`}>
        <p className={`text-[11px] font-black uppercase tracking-[0.18em] mb-3 ${isDark ? 'text-nb-yellow/60' : 'text-nb-black/50'}`}>
          {plan.name}
        </p>
        <div className="flex items-end gap-2">
          <span
            className={`text-4xl font-black leading-none ${isDark ? 'text-nb-yellow' : ''}`}
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            {plan.price}
          </span>
          <span className={`text-sm font-bold mb-1 ${isDark ? 'text-white/45' : 'text-nb-black/45'}`}>
            {plan.period}
          </span>
        </div>
      </div>

      {/* Features */}
      <ul className="p-6 space-y-3 flex-1">
        {plan.features.map(f => (
          <li key={f.text} className="flex items-start gap-3">
            {f.ok
              ? <Check className="w-4 h-4 text-nb-green flex-shrink-0 mt-0.5" aria-hidden="true" />
              : <X className={`w-4 h-4 flex-shrink-0 mt-0.5 ${crossColor}`} aria-hidden="true" />
            }
            <span className={`text-sm font-medium ${f.ok ? (isDark ? 'text-white/85' : 'text-nb-black') : featureText}`}>
              {f.text}
              {!f.ok && <span className="sr-only"> (not included)</span>}
            </span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <div className={`p-5 border-t-2 ${isDark ? 'border-white/10' : 'border-nb-black/15'}`}>
        <Link to={href} className={ctaClass}>
          {plan.cta}
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
};

const FaqItem = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="border-2 border-nb-black bg-white"
      style={{ borderRadius: '6px', boxShadow: '3px 3px 0 #111111' }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 p-5 text-left hover:bg-nb-yellow/10 transition-colors"
        aria-expanded={open}
      >
        <span className="font-bold text-sm">{q}</span>
        <span
          className="flex-shrink-0 w-6 h-6 border-2 border-nb-black bg-[#F5F1E8] flex items-center justify-center font-black text-sm transition-transform"
          style={{ borderRadius: '3px', transform: open ? 'rotate(45deg)' : 'none' }}
          aria-hidden="true"
        >
          +
        </span>
      </button>
      {open && (
        <div className="px-5 pb-5 border-t-2 border-nb-black/10 pt-3">
          <p className="text-sm font-medium text-nb-black/65 leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  );
};

/* ─── Page ────────────────────────────────────────────────────────────────── */
export default function Pricing() {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="min-h-screen bg-[#F5F1E8]">
      <Navbar />

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="pt-28 pb-16 px-4 bg-nb-yellow border-b-3 border-nb-black">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <span
            className="inline-block text-[10px] font-black tracking-[0.2em] uppercase px-3 py-1.5 border-2 border-nb-black bg-nb-black text-nb-yellow"
            style={{ borderRadius: '3px', boxShadow: '2px 2px 0 rgba(0,0,0,0.3)' }}
          >
            Transparent pricing · No hidden fees
          </span>
          <h1
            className="font-bold uppercase text-nb-black leading-none"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(3rem, 9vw, 6rem)',
              letterSpacing: '-0.05em',
            }}
          >
            Simple,<br />honest pricing.
          </h1>
          <p className="text-lg font-medium text-nb-black/65 max-w-xl mx-auto">
            Start free. Upgrade only when you need more sessions.
            Every paid plan includes a 7-day money-back guarantee.
          </p>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {['All UPI accepted', 'Razorpay secured', '7-day refund', 'Cancel anytime'].map(t => (
              <span
                key={t}
                className="px-3 py-1.5 border-2 border-nb-black bg-white text-nb-black text-xs font-bold"
                style={{ borderRadius: '4px', boxShadow: '2px 2px 0 #111111' }}
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Plan grid ─────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 border-b-3 border-nb-black">
        <div className="max-w-5xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 items-start pt-6">
            {PLANS.map(plan => (
              <PlanCard key={plan.key} plan={plan} isLoggedIn={isAuthenticated} />
            ))}
          </div>

          <p className="text-xs font-medium text-nb-black/50 text-center mt-8">
            All prices in Indian Rupees (INR) · GST may apply ·{' '}
            <Link to="/refund-policy" className="underline font-bold hover:text-nb-black">7-day refund policy</Link>
          </p>
        </div>
      </section>

      {/* ── What you're paying for ─────────────────────────────────────────── */}
      <section className="py-20 px-4 border-b-3 border-nb-black bg-white">
        <div className="max-w-5xl mx-auto space-y-12">
          <h2
            className="font-bold uppercase tracking-tight"
            style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', letterSpacing: '-0.03em' }}
          >
            What you're paying for
          </h2>
          <div className="grid sm:grid-cols-3 gap-5">
            {[
              { icon: Briefcase, title: 'AI JD matching',       desc: 'One gpt-4o-mini call analyses your resume against the JD semantically — not just keyword counting. You get a score, skill gap, and recommendations in one shot.' },
              { icon: FileText,  title: 'Resume tailoring',     desc: 'AI rewrites your bullet points and summary for the specific JD. Honesty guaranteed — missing skills are flagged, never fabricated.' },
              { icon: HelpCircle, title: 'AI interview quiz',   desc: '30–40 MCQ questions generated from the JD — covering technical, HR, and role-specific topics. Stored per job workspace, retake anytime.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="bg-white border-2 border-nb-black p-6"
                style={{ borderRadius: '8px', boxShadow: '4px 4px 0 #111111' }}
              >
                <div
                  className="w-10 h-10 bg-nb-black border-2 border-nb-black flex items-center justify-center mb-5"
                  style={{ borderRadius: '5px', boxShadow: '2px 2px 0 #FFD93D' }}
                  aria-hidden="true"
                >
                  <Icon className="w-5 h-5 text-nb-yellow" />
                </div>
                <h3
                  className="font-bold text-sm uppercase tracking-tight mb-2"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {title}
                </h3>
                <p className="text-xs text-nb-black/60 leading-relaxed font-medium">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Payment security ──────────────────────────────────────────────── */}
      <section className="py-16 px-4 border-b-3 border-nb-black bg-nb-black">
        <div className="max-w-5xl mx-auto">
          <div className="grid sm:grid-cols-3 gap-5">
            {[
              { icon: Shield,    title: 'PCI-DSS Compliant',    desc: 'Payments processed by Razorpay — India\'s most trusted payment gateway. Your card/UPI details never touch our servers.' },
              { icon: RefreshCw, title: 'Cancel any time',      desc: 'No questions asked. Cancellation takes 30 seconds in your billing settings. Your plan stays active until the period ends.' },
              { icon: CreditCard,title: 'UPI, Cards & Net Banking', desc: 'GPay, PhonePe, Paytm, all debit/credit cards, 50+ banks via net banking, and EMI options — all through Razorpay.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="border-2 border-nb-yellow p-6"
                style={{ borderRadius: '6px' }}
              >
                <Icon className="w-7 h-7 text-nb-yellow mb-4" aria-hidden="true" />
                <h3
                  className="font-bold uppercase text-nb-yellow text-sm mb-2"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {title}
                </h3>
                <p className="text-xs text-white/55 leading-relaxed font-medium">{desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <p className="text-xs font-mono text-white/25 uppercase tracking-widest">
              Secured by Razorpay · PCI-DSS Level 1 · 256-bit SSL encryption
            </p>
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 border-b-3 border-nb-black">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="flex items-end justify-between">
            <h2
              className="font-bold uppercase tracking-tight"
              style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', letterSpacing: '-0.03em' }}
            >
              FAQ
            </h2>
            <Link to="/contact" className="btn btn-ghost btn-sm">Ask us →</Link>
          </div>
          <div className="space-y-3">
            {FAQ.map(item => <FaqItem key={item.q} {...item} />)}
          </div>
        </div>
      </section>

      {/* ── Institution CTA ───────────────────────────────────────────────── */}
      <section className="py-16 px-4 bg-nb-yellow border-b-3 border-nb-black">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <span
              className="inline-block text-[10px] font-black tracking-[0.2em] uppercase px-2.5 py-1 border-2 border-nb-black bg-nb-black text-nb-yellow mb-3"
              style={{ borderRadius: '3px' }}
            >
              INSTITUTIONS
            </span>
            <h2
              className="font-bold uppercase tracking-tight"
              style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', letterSpacing: '-0.03em' }}
            >
              Bulk access for colleges
            </h2>
            <p className="text-sm font-medium text-nb-black/65 mt-1">
              Custom pricing for 50+ students. Used by placement cells across India.
            </p>
          </div>
          <Link to="/contact" className="btn btn-black flex-shrink-0">
            Contact us <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-[#F5F1E8]">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h2
            className="font-bold uppercase tracking-tight"
            style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', letterSpacing: '-0.03em' }}
          >
            Start for free today.
          </h2>
          <p className="text-sm font-medium text-nb-black/55">
            Free plan — no card required. Get your first ATS match, quiz, and cover letter today.
          </p>
          <Link
            to={isAuthenticated ? '/jobs' : '/register'}
            className="btn btn-black btn-lg inline-flex"
          >
            <Zap className="w-5 h-5" aria-hidden="true" />
            {isAuthenticated ? 'Match a job' : 'Create free account'}
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
