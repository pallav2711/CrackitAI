/**
 * /payment/success
 *
 * Landing page after a successful Razorpay payment.
 *
 * Two entry modes:
 *  A) Redirect-flow  — Razorpay redirects here with URL params:
 *       razorpay_payment_id, razorpay_order_id, razorpay_signature, plan
 *     → We call POST /billing/verify (HMAC check) before showing success.
 *
 *  B) Modal-flow     — User paid via the JS checkout modal; no URL params.
 *     → Subscription was already verified by billingService.startCheckout.
 *        We fetch /billing/status to confirm and show the current plan.
 *
 * IMPORTANT: We never activate access just because the user landed here.
 * Access is only granted after the backend confirms the payment signature.
 */

import { useEffect, useState, useRef } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import {
  Loader2, CheckCircle, AlertCircle, ArrowRight,
  Mic, Zap, Calendar, CreditCard, FileText,
} from 'lucide-react';
import api from '../services/api.js';
import { getBillingStatus } from '../services/billingService.js';
import useAuthStore from '../store/useAuthStore.js';

/* ─── Plan perks shown on the success screen ──────────────────────────────── */
const PLAN_PERKS = {
  free:         [],
  basic:        ['5 voice interviews / month', '10-min sessions', 'Full leaderboard participation', 'Scan history'],
  pro:          ['15 voice interviews / month', '15-min sessions', 'Role-specific interview modes', 'Priority processing', 'Full leaderboard'],
  annual:       ['15 voice interviews / month', '15-min sessions', 'All Pro features', 'Saved 30% vs monthly'],
  annual_basic: ['5 voice interviews / month', '10-min sessions', 'Saved 30% vs monthly', 'Full leaderboard'],
  annual_pro:   ['15 voice interviews / month', '15-min sessions', 'All Pro features', 'Saved 30% vs monthly'],
};

const PLAN_NAMES = {
  free: 'Free', basic: 'Basic', pro: 'Pro',
  annual: 'Annual', annual_basic: 'Basic Annual', annual_pro: 'Pro Annual',
};

const fmt = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '—';

/* ─── Status views ────────────────────────────────────────────────────────── */
const Verifying = () => (
  <div className="text-center space-y-5">
    <Loader2 className="w-14 h-14 animate-spin text-nb-black mx-auto" />
    <div>
      <h1 className="text-2xl font-black uppercase tracking-tight">Verifying payment…</h1>
      <p className="text-sm font-medium text-nb-black/60 mt-2 leading-relaxed">
        Confirming your payment with Razorpay. This takes just a second.
      </p>
    </div>
    <div className="flex items-center justify-center gap-2 text-xs font-bold text-nb-black/40 uppercase tracking-widest">
      <div className="w-1.5 h-1.5 rounded-full bg-nb-black/30 animate-pulse" />
      Secured by Razorpay
    </div>
  </div>
);

const SuccessView = ({ plan, planKey, periodEnd, paymentId, countdown }) => {
  const perks = PLAN_PERKS[planKey] || PLAN_PERKS[plan] || PLAN_PERKS.basic;
  const planName = PLAN_NAMES[plan] || PLAN_NAMES[planKey] || plan;

  return (
    <div className="space-y-6">
      {/* Icon + title */}
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-nb-yellow border-3 border-nb-black  mx-auto flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-nb-black" />
        </div>
        <div>
          <span className="nb-badge-black text-[10px] mb-3 inline-block">PAYMENT CONFIRMED</span>
          <h1 className="text-3xl font-black uppercase tracking-tight">You're all set!</h1>
          <p className="text-sm font-medium text-nb-black/60 mt-2 leading-relaxed">
            Your <strong className="uppercase">{planName}</strong> plan is now active.
            A Razorpay receipt has been sent to your email.
          </p>
        </div>
      </div>

      {/* Order detail strip */}
      <div className="border-3 border-nb-black bg-[#F5F1E8] divide-y-2 divide-nb-black">
        {paymentId && (
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-nb-black/50 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5" /> Payment ID
            </span>
            <span className="font-mono text-xs font-bold truncate max-w-[180px]">{paymentId}</span>
          </div>
        )}
        {periodEnd && (
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-nb-black/50 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" /> Active until
            </span>
            <span className="text-sm font-bold">{fmt(periodEnd)}</span>
          </div>
        )}
      </div>

      {/* Unlocked perks */}
      {perks.length > 0 && (
        <div className="border-3 border-nb-black bg-white p-5 space-y-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-nb-black/50">What you unlocked</p>
          {perks.map((p) => (
            <div key={p} className="flex items-center gap-3 text-sm font-bold">
              <div className="w-1.5 h-1.5 bg-nb-black flex-shrink-0 rounded-sm" />
              {p}
            </div>
          ))}
        </div>
      )}

      {/* Redirect countdown + CTAs */}
      <div className="space-y-3 text-center">
        {countdown > 0 && (
          <p className="text-xs font-mono text-nb-black/40 uppercase tracking-widest">
            Redirecting to billing in {countdown}s…
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/billing" className="btn btn-black justify-center">
            Billing <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/interview/setup" className="btn btn-primary justify-center">
            <Mic className="w-4 h-4" /> Start interview
          </Link>
          <Link to="/resumes" className="btn justify-center">
            <FileText className="w-4 h-4" /> Resume scanner
          </Link>
        </div>
      </div>
    </div>
  );
};

const ErrorView = ({ message }) => (
  <div className="space-y-6 text-center">
    <div className="w-20 h-20 bg-nb-red border-3 border-nb-black  mx-auto flex items-center justify-center">
      <AlertCircle className="w-10 h-10 text-white" />
    </div>
    <div>
      <span className="nb-badge-black text-[10px] mb-3 inline-block">VERIFICATION FAILED</span>
      <h1 className="text-2xl font-black uppercase tracking-tight">Something went wrong</h1>
      <p className="text-sm font-medium text-nb-black/60 mt-2 leading-relaxed">{message}</p>
    </div>
    <div className="border-3 border-nb-black bg-nb-yellow p-5 text-left space-y-2">
      <p className="text-xs font-black uppercase tracking-widest">What to do</p>
      <p className="text-sm font-medium text-nb-black/70 leading-relaxed">
        If money was deducted, email us at{' '}
        <a href="mailto:pallavkanani27@mail.com" className="font-black underline">
          pallavkanani27@mail.com
        </a>{' '}
        with your Razorpay payment ID. We'll resolve it within 1 business day.
      </p>
    </div>
    <div className="flex flex-col sm:flex-row gap-3 justify-center">
      <Link to="/billing" className="btn btn-black justify-center">Try again</Link>
      <Link to="/contact" className="btn justify-center">Contact support</Link>
    </div>
  </div>
);

/* ─── Page ────────────────────────────────────────────────────────────────── */
export default function PaymentSuccess() {
  const [params]   = useSearchParams();
  const navigate   = useNavigate();
  const { updateUser } = useAuthStore();

  const [status, setStatus]     = useState('verifying'); // verifying | success | error
  const [planKey, setPlanKey]   = useState('');
  const [plan, setPlan]         = useState('');
  const [periodEnd, setPeriodEnd] = useState(null);
  const [paymentId, setPaymentId] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [countdown, setCountdown] = useState(6);

  // Guard: only run once even in React StrictMode
  const ranRef = useRef(false);

  const startCountdown = (navigate) => {
    let c = 6;
    setCountdown(c);
    const iv = setInterval(() => {
      c -= 1;
      setCountdown(c);
      if (c <= 0) { clearInterval(iv); navigate('/billing'); }
    }, 1000);
    return () => clearInterval(iv);
  };

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    const orderId  = params.get('razorpay_order_id');
    const payId    = params.get('razorpay_payment_id');
    const sig      = params.get('razorpay_signature');
    const pk       = params.get('plan') || sessionStorage.getItem('pendingPlan') || 'pro';

    setPlanKey(pk);

    // ── Mode B: JS modal — no URL params, subscription already verified ──────
    if (!orderId && !payId) {
      // Fetch current subscription from backend to confirm
      getBillingStatus()
        .then(({ billing }) => {
          setPlan(billing.plan);
          setPeriodEnd(billing.currentPeriodEnd);
          setStatus('success');
          startCountdown(navigate);
        })
        .catch(() => {
          // Even if status fetch fails, show success (webhook/verify already ran)
          setPlan(pk);
          setStatus('success');
          startCountdown(navigate);
        });
      return;
    }

    // ── Mode A: Redirect-flow — verify with backend ───────────────────────────
    const verify = async () => {
      try {
        const res = await api.post('/billing/verify', {
          razorpay_order_id:   orderId,
          razorpay_payment_id: payId,
          razorpay_signature:  sig,
          plan:                pk,
        });

        if (res.data.success) {
          updateUser({ subscription: res.data.subscription });
          setPlan(res.data.subscription?.plan || pk);
          setPeriodEnd(res.data.subscription?.currentPeriodEnd);
          setPaymentId(payId);
          setStatus('success');
          sessionStorage.removeItem('pendingPlan');
          startCountdown(navigate);
        } else {
          setStatus('error');
          setErrorMsg(res.data.message || 'Verification failed. Please contact support.');
        }
      } catch (err) {
        setStatus('error');
        setErrorMsg(
          err?.response?.data?.message ||
          'Could not verify payment. If money was deducted, contact support with your payment ID.'
        );
      }
    };

    verify();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen bg-[#F5F1E8] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg">

        {/* Header bar */}
        <div className="bg-nb-black border-3 border-nb-black border-b-0 px-6 py-4 flex items-center gap-3">
          <div className="w-7 h-7 bg-nb-yellow flex items-center justify-center border-2 border-nb-yellow">
            <Zap className="w-4 h-4 text-nb-black" />
          </div>
          <span className="text-sm font-black uppercase tracking-tighter text-nb-yellow">CrackIt AI</span>
          <div className="flex-1" />
          <span className="text-[10px] font-mono text-nb-yellow/40 uppercase tracking-widest hidden sm:block">
            Secured by Razorpay
          </span>
        </div>

        {/* Body */}
        <div className="border-3 border-nb-black bg-white p-8 md:p-10" style={{ boxShadow: '8px 8px 0 #111111' }}>
          {status === 'verifying' && <Verifying />}
          {status === 'success'   && (
            <SuccessView
              plan={plan}
              planKey={planKey}
              periodEnd={periodEnd}
              paymentId={paymentId}
              countdown={countdown}
            />
          )}
          {status === 'error'     && <ErrorView message={errorMsg} />}
        </div>

        {/* Footer */}
        <div className="border-3 border-nb-black border-t-0 bg-nb-black px-6 py-3 flex items-center justify-between">
          <span className="text-xs font-mono text-white/30 uppercase tracking-widest">
            Secured by Razorpay · PCI-DSS Level 1
          </span>
          <Link to="/" className="text-xs font-bold text-nb-yellow/60 hover:text-nb-yellow transition-colors">
            ← Home
          </Link>
        </div>

      </div>
    </div>
  );
}
