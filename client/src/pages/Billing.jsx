/**
 * /billing  — User Billing Dashboard
 *
 * Tabs:
 *  1. Overview  — current plan, usage bars, upgrade plan cards
 *  2. History   — paginated payment/order history
 *
 * All payment actions go through billingService which enforces:
 *  - Server-side pricing (no amount from frontend)
 *  - HMAC signature verification
 *  - Duplicate checkout guard
 */

import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  CreditCard, CheckCircle, AlertCircle, Zap, Shield,
  RefreshCw, Calendar, Mic, ArrowRight, X, Loader2,
  Clock, History, ReceiptText, ChevronLeft, ChevronRight,
  BadgeCheck, Ban, AlertTriangle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../components/dashboard/DashboardLayout.jsx';
import useAuthStore from '../store/useAuthStore.js';
import {
  getBillingStatus,
  getPaymentHistory,
  cancelSubscription,
  startCheckout,
} from '../services/billingService.js';

/* ─── Plan upgrade card data ──────────────────────────────────────────────── */
const PLANS = [
  {
    key: 'basic', name: 'Basic', price: '₹299', period: '/mo',
    interviews: 5, mins: 10,
    perks: ['Full leaderboard', 'Scan history'],
    highlight: false,
  },
  {
    key: 'pro', name: 'Pro', price: '₹599', period: '/mo',
    interviews: 15, mins: 15,
    perks: ['Role-specific modes', 'Priority processing', 'Full leaderboard'],
    highlight: true,
  },
  {
    key: 'annual_basic', name: 'Basic Annual', price: '₹2,499', period: '/yr',
    interviews: 5, mins: 10,
    perks: ['Save 30%', 'Full leaderboard'],
    highlight: false, badge: 'SAVE 30%',
  },
  {
    key: 'annual_pro', name: 'Pro Annual', price: '₹4,999', period: '/yr',
    interviews: 15, mins: 15,
    perks: ['Save 30%', 'All Pro features'],
    highlight: false, badge: 'BEST VALUE',
  },
];

/* ─── Helpers ─────────────────────────────────────────────────────────────── */
const fmt = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

const planMatchesKey = (currentPlan, planKey) => {
  if (planKey.startsWith('annual')) return currentPlan === 'annual';
  return currentPlan === planKey;
};

/* ─── Sub-components ──────────────────────────────────────────────────────── */

const UsageBar = ({ label, used, max }) => {
  const pct    = max > 0 ? Math.min((used / max) * 100, 100) : 0;
  const danger = pct >= 80;
  return (
    <div>
      <div className="flex justify-between text-xs font-bold mb-1.5">
        <span className="uppercase tracking-wide">{label}</span>
        <span className={`font-mono ${danger ? 'text-nb-red' : ''}`}>{used}/{max}</span>
      </div>
      <div className="h-4 border-2 border-nb-black bg-[#F5F1E8]">
        <div
          className={`h-full border-r-2 border-nb-black transition-all duration-500 ${danger ? 'bg-nb-red' : 'bg-nb-yellow'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const map = {
    paid:      { bg: 'bg-nb-green', icon: BadgeCheck,   label: 'Paid'       },
    failed:    { bg: 'bg-nb-red text-white', icon: Ban,  label: 'Failed'     },
    cancelled: { bg: 'bg-nb-black text-white', icon: X,  label: 'Cancelled'  },
    created:   { bg: 'bg-nb-yellow', icon: Clock,        label: 'Pending'    },
    refunded:  { bg: 'bg-nb-yellow', icon: RefreshCw,    label: 'Refunded'   },
  };
  const cfg = map[status] || { bg: 'bg-[#F5F1E8]', icon: AlertTriangle, label: status };
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-2 py-1 border-2 border-nb-black ${cfg.bg}`}>
      <Icon className="w-3 h-3" />{cfg.label}
    </span>
  );
};

const CancelModal = ({ periodEnd, onConfirm, onClose, loading }) => (
  <div className="fixed inset-0 bg-nb-black/70 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="cancel-modal-title">
    <div
      className="bg-white border-3 border-nb-black w-full max-w-sm"
      style={{ borderRadius: '8px', boxShadow: '8px 8px 0 #111111' }}
    >
      <div className="bg-nb-red border-b-3 border-nb-black px-6 py-4 flex items-center justify-between" style={{ borderRadius: '6px 6px 0 0' }}>
        <h3 id="cancel-modal-title" className="font-black uppercase tracking-tight text-white flex items-center gap-2">
          <AlertCircle className="w-5 h-5" aria-hidden="true" /> Cancel auto-renew?
        </h3>
        <button onClick={onClose} className="text-white/70 hover:text-white transition-colors" aria-label="Close dialog">
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="p-6 space-y-5">
        <p className="text-sm font-medium text-nb-black/75 leading-relaxed">
          Your plan stays active until <strong>{fmt(periodEnd)}</strong>. After that you'll revert to the free plan.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="btn btn-secondary flex-1 justify-center">Keep plan</button>
          <button onClick={onConfirm} disabled={loading} className="btn btn-red flex-1 justify-center">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : 'Yes, cancel'}
          </button>
        </div>
      </div>
    </div>
  </div>
);

/* ─── Overview Tab ────────────────────────────────────────────────────────── */
const OverviewTab = ({ billing, onRefresh }) => {
  const { user, updateUser } = useAuthStore();
  const [checkout, setCheckout]         = useState(null);   // key of plan being purchased
  const [cancelLoading, setCancelLoading] = useState(false);
  const [showCancel, setShowCancel]       = useState(false);

  const plan   = billing?.plan || 'free';
  const isPaid = plan !== 'free';

  const handleUpgrade = async (key) => {
    if (checkout) return;
    setCheckout(key);
    await startCheckout(
      key,
      user,
      (res) => {
        toast.success(`${res.subscription?.plan ? `Upgraded to ${res.subscription.plan}!` : 'Payment confirmed!'}`);
        if (res.subscription) updateUser({ subscription: res.subscription });
        onRefresh();
        setCheckout(null);
      },
      (err) => {
        toast.error(err);
        setCheckout(null);
      },
      () => {
        // User dismissed modal — not an error
        setCheckout(null);
      }
    );
  };

  const handleCancel = async () => {
    setCancelLoading(true);
    try {
      const r = await cancelSubscription();
      toast.success(r.message);
      onRefresh();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to cancel auto-renew.');
    } finally {
      setCancelLoading(false);
      setShowCancel(false);
    }
  };

  return (
    <>
      {showCancel && (
        <CancelModal
          periodEnd={billing?.currentPeriodEnd}
          onConfirm={handleCancel}
          onClose={() => setShowCancel(false)}
          loading={cancelLoading}
        />
      )}

      <div className="space-y-8">
        {/* Current plan card */}
        <div
          className={`border-3 border-nb-black p-6 ${isPaid ? 'bg-nb-yellow' : 'bg-white'}`}
          style={{ borderRadius: '8px', boxShadow: '4px 4px 0 #111111' }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-nb-black/60 mb-1">Current plan</p>
              <div className="flex items-center gap-3">
                <span className="text-3xl font-black uppercase">{plan}</span>
                <span className={`nb-badge border-2 border-nb-black ${billing?.status === 'active' ? 'bg-nb-green text-nb-black' : 'bg-nb-red text-white'}`}>
                  {billing?.status || 'active'}
                </span>
              </div>
              {isPaid && (
                <p className="text-xs font-bold text-nb-black/70 mt-2 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {billing?.autoRenew
                    ? `Auto-renews ${fmt(billing.currentPeriodEnd)}`
                    : `Expires ${fmt(billing.currentPeriodEnd)} · Auto-renew off`}
                </p>
              )}
            </div>
            {isPaid && billing?.autoRenew && (
              <button
                onClick={() => setShowCancel(true)}
                className="text-sm font-black underline underline-offset-2 text-nb-red self-start sm:self-auto hover:opacity-70 transition-opacity"
              >
                Cancel auto-renew
              </button>
            )}
          </div>
        </div>

        {/* Usage */}
        <div
          className="border-2 border-nb-black bg-white space-y-5 p-6"
          style={{ borderRadius: '8px', boxShadow: '4px 4px 0 #111111' }}
        >
          <h2 className="font-black uppercase tracking-widest text-sm border-b-2 border-nb-black pb-4 flex items-center gap-2">
            <Zap className="w-4 h-4" /> Usage this cycle
          </h2>
          <UsageBar
            label="Voice interviews"
            used={billing?.usage?.interviewsUsedThisCycle ?? 0}
            max={billing?.limits?.monthlyInterviews ?? 1}
          />
          <div className="grid grid-cols-2 gap-4 pt-2 border-t-2 border-nb-black">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-nb-black/50">Session limit</p>
              <p className="text-2xl font-black font-mono mt-1">
                {billing?.limits?.maxSessionMinutes ?? 7}
                <span className="text-sm font-bold ml-1">min</span>
              </p>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-nb-black/50">Cycle ends</p>
              <p className="text-sm font-bold mt-1">{fmt(billing?.usage?.interviewCycleEnd)}</p>
            </div>
          </div>
          {(billing?.usage?.interviewsUsedThisCycle ?? 0) >= (billing?.limits?.monthlyInterviews ?? 1) && (
            <div className="flex items-center gap-2 bg-nb-red border-2 border-nb-black p-3 text-nb-white text-sm font-bold">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              All interviews used this month. Upgrade to get more.
            </div>
          )}
        </div>

        {/* Upgrade plan cards */}
        <div>
          <h2 className="font-black uppercase tracking-widest text-sm mb-5 flex items-center gap-2">
            <ArrowRight className="w-4 h-4" /> {isPaid ? 'Change plan' : 'Upgrade'}
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {PLANS.map((p) => {
              const isCurrent = planMatchesKey(plan, p.key) && billing?.status === 'active';
              return (
                <div
                  key={p.key}
                  className={`relative border-3 border-nb-black p-6 flex flex-col gap-4 ${
                    p.highlight ? 'bg-nb-yellow' : 'bg-white'
                  }`}
                  style={{ borderRadius: '8px', boxShadow: p.highlight ? '6px 6px 0 #111111' : '4px 4px 0 #111111' }}
                >
                  {p.badge && (
                    <span className="absolute -top-3 left-4 nb-badge-black text-[10px]">{p.badge}</span>
                  )}
                  {p.highlight && !p.badge && (
                    <span className="absolute -top-3 left-4 nb-badge text-[10px]">MOST POPULAR</span>
                  )}
                  <div>
                    <p className="font-black uppercase tracking-tight text-lg">{p.name}</p>
                    <div className="flex items-end gap-1 mt-1">
                      <span className="text-3xl font-black font-mono">{p.price}</span>
                      <span className="text-sm font-bold text-nb-black/60 mb-1">{p.period}</span>
                    </div>
                  </div>
                  <ul className="space-y-2 flex-1">
                    <li className="flex items-center gap-2 text-sm font-bold">
                      <Mic className="w-4 h-4 flex-shrink-0" /> {p.interviews} interviews/mo
                    </li>
                    <li className="flex items-center gap-2 text-sm font-bold">
                      <Zap className="w-4 h-4 flex-shrink-0" /> {p.mins}-min sessions
                    </li>
                    {p.perks.map((pk) => (
                      <li key={pk} className="flex items-center gap-2 text-sm font-medium text-nb-black/80">
                        <CheckCircle className="w-4 h-4 flex-shrink-0" /> {pk}
                      </li>
                    ))}
                  </ul>
                  <button
                    disabled={isCurrent || checkout !== null}
                    onClick={() => handleUpgrade(p.key)}
                    className={`btn w-full justify-center
                      ${isCurrent
                        ? 'opacity-40 cursor-not-allowed'
                        : p.highlight ? 'btn-black' : 'btn'
                      }`}
                  >
                    {checkout === p.key
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : isCurrent
                        ? 'Current plan'
                        : <><span>Upgrade</span><ArrowRight className="w-4 h-4" /></>
                    }
                  </button>
                </div>
              );
            })}
          </div>
          <p className="text-xs font-medium text-nb-black/50 mt-4">
            All prices in INR · Secured by Razorpay · PCI-DSS Level 1 ·{' '}
            <Link to="/refund-policy" className="underline font-bold">7-day refund policy</Link>
          </p>
        </div>

        {/* Security strip */}
        <div
          className="border-3 border-nb-black bg-nb-black p-5 grid sm:grid-cols-3 gap-4"
          style={{ borderRadius: '8px' }}
        >
          {[
            { icon: Shield,     label: 'PCI-DSS Compliant',      desc: 'Payments by Razorpay. We never store card/UPI data.' },
            { icon: RefreshCw,  label: 'Cancel any time',        desc: 'Auto-renew off in 30 seconds. Plan stays active till period end.' },
            { icon: CreditCard, label: 'UPI · Cards · NetBanking', desc: 'GPay, PhonePe, all major cards, 50+ banks, EMI.' },
          ].map(({ icon: Icon, label, desc }) => (
            <div key={label} className="flex items-start gap-3">
              <Icon className="w-5 h-5 text-nb-yellow flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-black text-nb-yellow uppercase tracking-tight">{label}</p>
                <p className="text-xs text-white/50 font-medium mt-0.5 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

/* ─── History Tab ─────────────────────────────────────────────────────────── */
const HistoryTab = () => {
  const [records, setRecords]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [page, setPage]         = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });

  const load = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const data = await getPaymentHistory(p, 10);
      setRecords(data.history || []);
      setPagination(data.pagination || { total: 0, pages: 1 });
      setPage(p);
    } catch {
      toast.error('Failed to load payment history.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(1); }, [load]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-nb-black/40" />
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div
        className="border-2 border-nb-black bg-white p-10 text-center space-y-3"
        style={{ borderRadius: '8px', boxShadow: '4px 4px 0 #111111' }}
      >
        <ReceiptText className="w-12 h-12 text-nb-black/20 mx-auto" />
        <p className="font-black text-sm uppercase tracking-widest text-nb-black/40">No payments yet</p>
        <p className="text-xs font-medium text-nb-black/40">
          Your payment history will appear here after your first purchase.
        </p>
        <Link to="/billing" className="btn btn-black inline-flex mt-2">View plans →</Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Desktop table */}
      <div
        className="hidden md:block border-3 border-nb-black bg-white overflow-hidden"
        style={{ borderRadius: '8px', boxShadow: '4px 4px 0 #111111' }}
      >
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-3 border-nb-black bg-nb-black text-nb-yellow">
              {['Date', 'Plan', 'Amount', 'Status', 'Payment ID'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {records.map((r, i) => (
              <tr
                key={r.orderId}
                className={`border-b-2 border-nb-black last:border-b-0 ${i % 2 === 0 ? 'bg-white' : 'bg-[#F5F1E8]'}`}
              >
                <td className="px-4 py-3 font-mono text-xs">{fmt(r.date)}</td>
                <td className="px-4 py-3 font-bold uppercase text-sm">{r.planName || r.planKey}</td>
                <td className="px-4 py-3 font-black font-mono">{r.amountDisplay || `₹${((r.amountPaise || 0) / 100).toFixed(0)}`}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={r.refundStatus !== 'none' ? 'refunded' : r.status} />
                </td>
                <td className="px-4 py-3 font-mono text-xs text-nb-black/50 truncate max-w-[160px]">
                  {r.razorpayPaymentId || r.razorpayOrderId || '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {records.map((r) => (
          <div
            key={r.orderId}
            className="border-2 border-nb-black bg-white p-4 space-y-3"
            style={{ borderRadius: '6px', boxShadow: '3px 3px 0 #111111' }}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-black uppercase text-sm">{r.planName || r.planKey}</p>
                <p className="font-mono text-xs text-nb-black/50 mt-0.5">{fmt(r.date)}</p>
              </div>
              <StatusBadge status={r.refundStatus !== 'none' ? 'refunded' : r.status} />
            </div>
            <div className="flex items-center justify-between border-t-2 border-nb-black pt-3">
              <span className="text-2xl font-black font-mono">
                {r.amountDisplay || `₹${((r.amountPaise || 0) / 100).toFixed(0)}`}
              </span>
              {(r.razorpayPaymentId || r.razorpayOrderId) && (
                <span className="font-mono text-[10px] text-nb-black/40 truncate max-w-[140px]">
                  {r.razorpayPaymentId || r.razorpayOrderId}
                </span>
              )}
            </div>
            {r.refundStatus && r.refundStatus !== 'none' && (
              <p className="text-xs font-bold text-nb-red">
                Refund: {r.refundStatus} · ₹{((r.refundAmount || 0) / 100).toFixed(0)}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between border-3 border-nb-black bg-white px-4 py-3">
          <button
            onClick={() => load(page - 1)}
            disabled={page <= 1}
            className="btn btn-sm disabled:opacity-30"
          >
            <ChevronLeft className="w-4 h-4" /> Prev
          </button>
          <span className="text-xs font-bold uppercase tracking-widest text-nb-black/60">
            Page {page} of {pagination.pages} · {pagination.total} total
          </span>
          <button
            onClick={() => load(page + 1)}
            disabled={page >= pagination.pages}
            className="btn btn-sm disabled:opacity-30"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      <p className="text-xs font-medium text-nb-black/40 text-center">
        Payments processed and receipted by Razorpay ·{' '}
        <a href="mailto:pallavkanani27@mail.com" className="underline font-bold">Contact support</a> for disputes
      </p>
    </div>
  );
};

/* ─── Page ────────────────────────────────────────────────────────────────── */
export default function Billing() {
  const [searchParams]          = useSearchParams();
  const [billing, setBilling]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [activeTab, setActiveTab] = useState(
    searchParams.get('tab') === 'history' ? 'history' : 'overview'
  );

  const fetchBilling = useCallback(async () => {
    try {
      setLoading(true);
      const d = await getBillingStatus();
      setBilling(d.billing);
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to load billing info.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBilling(); }, [fetchBilling]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-10 h-10 animate-spin text-nb-black/30" />
        </div>
      </DashboardLayout>
    );
  }

  const TABS = [
    { id: 'overview', label: 'Overview',        icon: CreditCard },
    { id: 'history',  label: 'Payment history', icon: History    },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-4xl space-y-6">

        {/* Header */}
        <div className="border-b-3 border-nb-black pb-5">
          <h1 className="text-4xl font-black uppercase tracking-tight">Billing</h1>
          <p className="text-sm font-medium text-nb-black/60 mt-1">
            Manage your plan, usage, and payment history.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex border-3 border-nb-black bg-white overflow-hidden w-fit">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 text-xs font-black uppercase tracking-widest transition-colors border-r-2 last:border-r-0 border-nb-black
                  ${active ? 'bg-nb-yellow text-nb-black' : 'bg-white text-nb-black/60 hover:bg-nb-yellow/30'}`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        {activeTab === 'overview' && (
          <OverviewTab billing={billing} onRefresh={fetchBilling} />
        )}
        {activeTab === 'history' && (
          <HistoryTab />
        )}

      </div>
    </DashboardLayout>
  );
}
