/**
 * /checkout?plan=pro
 *
 * Public checkout gate page.
 * - Unauthenticated users land here after clicking a plan CTA on /pricing.
 * - If already logged in → redirect straight to /billing with the plan pre-selected.
 * - If not logged in → show the plan summary + prompt to register/login.
 *   After auth, they are returned here and the checkout completes automatically.
 *
 * Razorpay checkout is triggered from the authenticated /billing page, not here.
 * This page is purely a UX bridge: "you picked a plan → here's what you get → sign up".
 */
import { useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Check, Zap, Shield, ArrowRight, CreditCard, RefreshCw } from 'lucide-react';
import Navbar from '../components/landing/Navbar';
import Footer from '../components/landing/Footer';
import useAuthStore from '../store/useAuthStore';

const PLAN_DETAILS = {
  free: {
    name: 'Free',
    price: '₹0',
    period: '',
    features: ['1 voice interview / month', '7-min sessions', 'Unlimited resume scans', 'View leaderboard'],
    highlight: 'bg-white',
  },
  basic: {
    name: 'Basic',
    price: '₹299',
    period: '/ month',
    features: ['5 voice interviews / month', '10-min sessions', 'Unlimited resume scans', 'Full leaderboard participation', 'Scan history'],
    highlight: 'bg-white',
  },
  pro: {
    name: 'Pro',
    price: '₹599',
    period: '/ month',
    features: ['15 voice interviews / month', '15-min sessions', 'Unlimited resume scans', 'Role-specific interview modes', 'Priority processing', 'Full leaderboard participation'],
    highlight: 'bg-nb-yellow',
  },
  annual_basic: {
    name: 'Basic Annual',
    price: '₹2,499',
    period: '/ year',
    features: ['5 voice interviews / month', '10-min sessions', 'Save 30% vs monthly', 'Full leaderboard participation', 'Scan history'],
    highlight: 'bg-white',
  },
  annual_pro: {
    name: 'Pro Annual',
    price: '₹4,999',
    period: '/ year',
    features: ['15 voice interviews / month', '15-min sessions', 'Save 30% vs monthly', 'All Pro features', 'Priority processing', 'Full leaderboard'],
    highlight: 'bg-nb-yellow',
  },
};

export default function Checkout() {
  const [searchParams] = useSearchParams();
  const navigate       = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const planKey = searchParams.get('plan') || 'pro';
  const plan    = PLAN_DETAILS[planKey] || PLAN_DETAILS.pro;

  // Save chosen plan so billing page can pre-select it after login
  useEffect(() => {
    sessionStorage.setItem('pendingPlan', planKey);
  }, [planKey]);

  // If already logged in, go straight to billing with the plan pre-selected
  useEffect(() => {
    if (isAuthenticated) {
      navigate(`/billing?plan=${planKey}`, { replace: true });
    }
  }, [isAuthenticated, planKey, navigate]);

  return (
    <div className="min-h-screen bg-[#F5F1E8]">
      <Navbar />

      <main className="pt-28 pb-20 px-4">
        <div className="max-w-4xl mx-auto grid lg:grid-cols-2 gap-8 items-start">

          {/* ── Plan summary ──────────────────────────────────────────────── */}
          <div className="space-y-0">
            <div className="bg-nb-black border-3 border-nb-black border-b-0 px-6 py-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-nb-yellow/60">You selected</p>
              <h2 className="text-xl font-black uppercase text-nb-yellow">{plan.name} plan</h2>
            </div>

            <div className={`border-3 border-nb-black  ${plan.highlight} p-8 space-y-6`} style={{ boxShadow: '4px 4px 0 #111111' }}>
              {/* Price */}
              <div>
                <div className="flex items-end gap-2">
                  <span className="text-5xl font-black font-mono">{plan.price}</span>
                  {plan.period && <span className="text-base font-bold text-nb-black/60 mb-2">{plan.period}</span>}
                </div>
                <p className="text-xs font-medium text-nb-black/60 mt-1">
                  Billed via Razorpay · Secure checkout
                </p>
              </div>

              {/* Features */}
              <ul className="space-y-3">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-nb-black border-2 border-nb-black flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-nb-yellow" />
                    </div>
                    <span className="text-sm font-bold">{f}</span>
                  </li>
                ))}
              </ul>

              {/* Trust signals */}
              <div className="border-t-2 border-nb-black pt-5 space-y-2">
                {[
                  { icon: Shield,     text: '7-day money-back guarantee' },
                  { icon: RefreshCw,  text: 'Cancel auto-renew any time' },
                  { icon: CreditCard, text: 'UPI, cards, net banking via Razorpay' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-2 text-xs font-bold text-nb-black/70">
                    <Icon className="w-3.5 h-3.5 flex-shrink-0" /> {text}
                  </div>
                ))}
              </div>
            </div>

            {/* Plan change link */}
            <div className="border-3 border-nb-black border-t-0 bg-[#F5F1E8] px-6 py-3">
              <Link to="/pricing" className="text-xs font-black text-nb-black/50 hover:text-nb-black underline underline-offset-2">
                ← Choose a different plan
              </Link>
            </div>
          </div>

          {/* ── Auth prompt ───────────────────────────────────────────────── */}
          <div className="space-y-0">
            <div className="bg-nb-yellow border-3 border-nb-black border-b-0 px-6 py-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-nb-black/60">Almost there</p>
              <h2 className="text-xl font-black uppercase">Create your account to continue</h2>
            </div>

            <div className="border-3 border-nb-black bg-white  p-8 space-y-5" style={{ boxShadow: '4px 4px 0 #111111' }}>
              <p className="text-sm font-medium text-nb-black/70 leading-relaxed">
                Sign up (or log in) first — your selected plan will be waiting for you
                on the billing page immediately after.
              </p>

              <div className="space-y-3">
                <Link
                  to={`/register?redirect=/billing%3Fplan%3D${planKey}`}
                  className="btn btn-black w-full justify-center btn-lg"
                >
                  <Zap className="w-5 h-5" />
                  Create account — continue to checkout
                </Link>
                <Link
                  to={`/login?redirect=/billing%3Fplan%3D${planKey}`}
                  className="btn w-full justify-center"
                >
                  Already have an account? Log in →
                </Link>
              </div>

              {/* What happens next */}
              <div className="border-t-2 border-nb-black pt-5 space-y-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-nb-black/50">What happens next</p>
                {[
                  '1 · Create your account (30 seconds)',
                  '2 · You\'re taken to the billing page',
                  '3 · Click "Upgrade" → Razorpay checkout opens',
                  '4 · Pay via UPI, card, or net banking',
                  '5 · Plan activates instantly',
                ].map(s => (
                  <p key={s} className="text-xs font-medium text-nb-black/60 flex items-start gap-2">
                    <span className="flex-shrink-0">{s}</span>
                  </p>
                ))}
              </div>
            </div>

            <div className="border-3 border-nb-black border-t-0 bg-nb-black px-6 py-3 flex items-center justify-between">
              <span className="text-xs font-mono text-white/30 uppercase">Secured by Razorpay</span>
              <span className="text-xs font-mono text-white/30 uppercase">PCI-DSS Level 1</span>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
