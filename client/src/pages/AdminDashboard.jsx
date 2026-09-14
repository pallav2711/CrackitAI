/**
 * /admin/payments — Admin Payment Dashboard
 *
 * Accessible only to users with role === 'admin' (enforced both here and on
 * the backend via authorize('admin') middleware).
 *
 * Tabs:
 *  1. Overview   — revenue stats, subscription counts, recent transactions
 *  2. Payments   — searchable/filterable payment list with refund modal
 *  3. Users      — user list with plan info
 *  4. Webhooks   — webhook event log for monitoring
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BarChart3, Users, Webhook, CreditCard,
  Loader2, AlertCircle, ChevronLeft, ChevronRight,
  RefreshCw, Search, Filter, ArrowRight,
  IndianRupee, TrendingUp, BadgeCheck, Ban,
  Clock, X, AlertTriangle, Receipt, Eye,
} from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../components/dashboard/DashboardLayout.jsx';
import useAuthStore from '../store/useAuthStore.js';
import {
  listPayments,
  getPaymentStats,
  getOrderDetail,
  initiateRefund,
  listUsers,
  listWebhookEvents,
} from '../services/adminService.js';

/* ─── Helpers ─────────────────────────────────────────────────────────────── */
const fmt = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
const fmtTime = (d) =>
  d ? new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';

const StatusBadge = ({ status, size = 'sm' }) => {
  const map = {
    paid:       'bg-nb-green border-nb-black text-nb-black',
    captured:   'bg-nb-green border-nb-black text-nb-black',
    failed:     'bg-nb-red border-nb-black text-white',
    cancelled:  'bg-nb-black border-nb-black text-white',
    created:    'bg-nb-yellow border-nb-black text-nb-black',
    attempted:  'bg-nb-yellow border-nb-black text-nb-black',
    refunded:   'bg-nb-yellow border-nb-black text-nb-black',
    processed:  'bg-nb-green border-nb-black text-nb-black',
    skipped:    'bg-nb-black/20 border-nb-black text-nb-black',
    processing: 'bg-nb-yellow border-nb-black text-nb-black',
    pending:    'bg-nb-yellow border-nb-black text-nb-black',
    active:     'bg-nb-green border-nb-black text-nb-black',
    inactive:   'bg-nb-black/30 border-nb-black text-nb-black',
    free:       'bg-[#F5F1E8] border-nb-black text-nb-black',
    basic:      'bg-nb-yellow border-nb-black text-nb-black',
    pro:        'bg-nb-black border-nb-black text-nb-yellow',
    annual:     'bg-nb-black border-nb-black text-nb-yellow',
  };
  return (
    <span className={`inline-block text-[10px] font-black uppercase tracking-widest px-2 py-0.5 border-2 ${map[status] || 'bg-[#F5F1E8] border-nb-black'}`}>
      {status}
    </span>
  );
};

const Pagination = ({ page, pages, total, onPage }) =>
  pages > 1 ? (
    <div className="flex items-center justify-between border-t-2 border-nb-black px-4 py-3 bg-white">
      <button onClick={() => onPage(page - 1)} disabled={page <= 1} className="btn btn-sm disabled:opacity-30">
        <ChevronLeft className="w-4 h-4" /> Prev
      </button>
      <span className="text-xs font-bold text-nb-black/60 uppercase tracking-widest">
        {page}/{pages} · {total} records
      </span>
      <button onClick={() => onPage(page + 1)} disabled={page >= pages} className="btn btn-sm disabled:opacity-30">
        Next <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  ) : null;

/* ─── Stat Card ───────────────────────────────────────────────────────────── */
const StatCard = ({ label, value, sub, accent, icon: Icon }) => (
  <div className={`border-3 border-nb-black p-5 flex flex-col gap-3 ${accent || 'bg-white'}`}>
    <div className="flex items-center justify-between">
      <span className="text-[10px] font-black uppercase tracking-widest text-nb-black/60">{label}</span>
      {Icon && (
        <div className="w-8 h-8 bg-nb-black flex items-center justify-center">
          <Icon className="w-4 h-4 text-nb-yellow" />
        </div>
      )}
    </div>
    <p className="text-3xl font-black font-mono">{value ?? '—'}</p>
    {sub && <p className="text-xs font-medium text-nb-black/50">{sub}</p>}
  </div>
);

/* ─── Refund Modal (Step 14) ──────────────────────────────────────────────── */
const RefundModal = ({ order, onClose, onSuccess }) => {
  const [loading, setLoading]   = useState(false);
  const [reason, setReason]     = useState('');
  const [refundType, setRefundType] = useState('full');
  const [customPaise, setCustomPaise] = useState('');

  const maxINR = order ? (order.amount / 100).toFixed(0) : 0;

  const handleSubmit = async () => {
    if (!reason.trim()) { toast.error('Please enter a reason for the refund.'); return; }

    const amountPaise = refundType === 'partial'
      ? parseInt(customPaise, 10) * 100
      : undefined;

    if (refundType === 'partial') {
      if (!customPaise || isNaN(amountPaise) || amountPaise < 100 || amountPaise > order.amount) {
        toast.error(`Enter a valid INR amount between ₹1 and ₹${maxINR}.`);
        return;
      }
    }

    setLoading(true);
    try {
      const res = await initiateRefund(order._id, { amountPaise, reason });
      toast.success(res.message || 'Refund initiated successfully.');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Refund failed. Check Razorpay dashboard.');
    } finally {
      setLoading(false);
    }
  };

  if (!order) return null;

  return (
    <div className="fixed inset-0 bg-nb-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white border-4 border-nb-black  w-full max-w-md">

        {/* Header */}
        <div className="bg-nb-black border-b-3 border-nb-black px-6 py-4 flex items-center justify-between">
          <h3 className="font-black uppercase tracking-tight text-nb-yellow flex items-center gap-2">
            <Receipt className="w-5 h-5" /> Initiate Refund
          </h3>
          <button onClick={onClose} className="text-nb-yellow/60 hover:text-nb-yellow transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Order summary */}
          <div className="border-3 border-nb-black bg-[#F5F1E8] p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-bold text-nb-black/60">Plan</span>
              <span className="font-black uppercase">{order.planName || order.planKey}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="font-bold text-nb-black/60">Amount paid</span>
              <span className="font-black font-mono">{order.amountDisplay || `₹${maxINR}`}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="font-bold text-nb-black/60">User</span>
              <span className="font-bold truncate max-w-[180px]">{order.user?.email}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="font-bold text-nb-black/60">Payment ID</span>
              <span className="font-mono text-xs truncate max-w-[180px]">{order.razorpayPaymentId}</span>
            </div>
          </div>

          {/* Already refunded warning */}
          {order.refundStatus === 'full' && (
            <div className="border-3 border-nb-red bg-nb-red/10 p-3 flex items-center gap-2 text-sm font-bold text-nb-red">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              This order has already been fully refunded.
            </div>
          )}

          {order.refundStatus !== 'full' && (
            <>
              {/* Refund type */}
              <div className="space-y-2">
                <p className="text-xs font-black uppercase tracking-widest text-nb-black/60">Refund type</p>
                <div className="flex gap-3">
                  {['full', 'partial'].map((type) => (
                    <label key={type} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="refundType"
                        value={type}
                        checked={refundType === type}
                        onChange={() => setRefundType(type)}
                        className="w-4 h-4 accent-nb-black"
                      />
                      <span className="text-sm font-bold capitalize">
                        {type === 'full' ? `Full (₹${maxINR})` : 'Partial'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Partial amount */}
              {refundType === 'partial' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-widest text-nb-black/60">
                    Refund amount (₹)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={maxINR}
                    value={customPaise}
                    onChange={(e) => setCustomPaise(e.target.value)}
                    placeholder={`Max ₹${maxINR}`}
                    className="nb-nb-input w-full"
                  />
                  <p className="text-xs text-nb-black/40">Enter amount in INR (not paise)</p>
                </div>
              )}

              {/* Reason */}
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-widest text-nb-black/60">
                  Reason <span className="text-nb-red">*</span>
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  maxLength={256}
                  placeholder="e.g. Customer requested refund — 7-day policy"
                  className="nb-nb-input w-full resize-none"
                />
              </div>

              {/* Warning */}
              <div className="border-3 border-nb-yellow bg-nb-yellow/20 p-3 text-xs font-medium text-nb-black/70 space-y-1">
                <p className="font-black">⚠ This action cannot be undone.</p>
                <p>A full refund will downgrade the user to the Free plan immediately.</p>
                <p>Refunds typically appear in 5–7 business days.</p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <button onClick={onClose} className="btn flex-1 justify-center">Cancel</button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="btn btn-red flex-1 justify-center"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                    <><Receipt className="w-4 h-4" /> Refund {refundType === 'full' ? `₹${maxINR}` : `₹${customPaise || '?'}`}</>
                  )}
                </button>
              </div>
            </>
          )}

          {order.refundStatus === 'full' && (
            <button onClick={onClose} className="btn w-full justify-center">Close</button>
          )}
        </div>
      </div>
    </div>
  );
};

/* ─── Overview Tab ────────────────────────────────────────────────────────── */
const OverviewTab = () => {
  const [stats, setStats]     = useState(null);
  const [recent, setRecent]   = useState([]);
  const [loading, setLoading] = useState(true);

  // Date range — last 30 days by default
  const [from, setFrom] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - 30); return d.toISOString().slice(0, 10);
  });
  const [to, setTo] = useState(() => new Date().toISOString().slice(0, 10));

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, paymentsRes] = await Promise.all([
        getPaymentStats({ from, to }),
        listPayments({ limit: 8, status: 'paid' }),
      ]);
      setStats(statsRes.stats);
      setRecent(paymentsRes.payments || []);
    } catch { toast.error('Failed to load stats.'); }
    finally { setLoading(false); }
  }, [from, to]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-nb-black/30" /></div>;

  const s = stats || {};

  return (
    <div className="space-y-8">
      {/* Date range filter */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-nb-black/60">From</label>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="nb-input" />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-nb-black/60">To</label>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="nb-input" />
        </div>
        <button onClick={load} className="btn btn-black">
          <Filter className="w-4 h-4" /> Apply
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Revenue" value={s.revenue?.totalDisplay} accent="bg-nb-yellow" icon={IndianRupee} />
        <StatCard label="Paid orders" value={s.orders?.paid} icon={BadgeCheck} />
        <StatCard label="Active subs" value={s.subscriptions?.active} icon={TrendingUp} />
        <StatCard label="Failed" value={s.orders?.failed} icon={Ban} />
      </div>

      {/* By plan */}
      {s.byPlan?.length > 0 && (
        <div className="nb-card-compat space-y-4">
          <h3 className="font-black uppercase tracking-widest text-xs border-b-2 border-nb-black pb-3">Revenue by plan</h3>
          <div className="space-y-3">
            {s.byPlan.map((p) => (
              <div key={p.planKey} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <StatusBadge status={p.planKey} />
                  <span className="text-sm font-bold">{p.planName}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs font-mono text-nb-black/50">{p.count} orders</span>
                  <span className="font-black font-mono">{p.revenueDisplay}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent transactions */}
      {recent.length > 0 && (
        <div className="nb-card-compat space-y-4">
          <div className="flex items-center justify-between border-b-2 border-nb-black pb-3">
            <h3 className="font-black uppercase tracking-widest text-xs">Recent payments</h3>
          </div>
          <div className="space-y-3">
            {recent.map((r) => (
              <div key={r._id} className="flex items-center justify-between py-2 border-b-2 border-nb-black/10 last:border-b-0">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold truncate">{r.user?.name || r.user?.email}</p>
                  <p className="text-xs text-nb-black/50 font-mono">{fmtTime(r.createdAt)}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <StatusBadge status={r.planKey} />
                  <span className="font-black font-mono text-sm">{r.amountDisplay}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/* ─── Payments Tab ────────────────────────────────────────────────────────── */
const PaymentsTab = () => {
  const [records, setRecords]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [page, setPage]         = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [refundOrder, setRefundOrder] = useState(null); // order being refunded

  // Filters
  const [status, setStatus]   = useState('');
  const [planKey, setPlanKey] = useState('');

  const load = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const data = await listPayments({ page: p, limit: 20, status: status || undefined, planKey: planKey || undefined });
      setRecords(data.payments || []);
      setPagination(data.pagination || { total: 0, pages: 1 });
      setPage(p);
    } catch { toast.error('Failed to load payments.'); }
    finally { setLoading(false); }
  }, [status, planKey]);

  useEffect(() => { load(1); }, [load]);

  const handleRefundSuccess = () => load(page);

  return (
    <>
      {refundOrder && (
        <RefundModal
          order={refundOrder}
          onClose={() => setRefundOrder(null)}
          onSuccess={handleRefundSuccess}
        />
      )}

      <div className="space-y-4">
        {/* Filter bar */}
        <div className="flex flex-wrap gap-3 items-end">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-nb-black/60">Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="nb-input">
              <option value="">All statuses</option>
              {['paid', 'failed', 'cancelled', 'created'].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-nb-black/60">Plan</label>
            <select value={planKey} onChange={(e) => setPlanKey(e.target.value)} className="nb-input">
              <option value="">All plans</option>
              {['basic', 'pro', 'annual_basic', 'annual_pro'].map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <button onClick={() => load(1)} className="btn btn-black self-end">
            <Filter className="w-4 h-4" /> Filter
          </button>
          <button onClick={() => { setStatus(''); setPlanKey(''); }} className="btn self-end">
            <X className="w-4 h-4" /> Clear
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-nb-black/30" /></div>
        ) : records.length === 0 ? (
          <div className="border-3 border-nb-black bg-white p-10 text-center">
            <p className="font-black text-sm uppercase tracking-widest text-nb-black/40">No payments found</p>
          </div>
        ) : (
          <div className="border-3 border-nb-black bg-white overflow-hidden">
            {/* Desktop table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-3 border-nb-black bg-nb-black text-nb-yellow">
                    {['Date', 'User', 'Plan', 'Amount', 'Status', 'Payment ID', 'Actions'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {records.map((r, i) => (
                    <tr key={r._id} className={`border-b-2 border-nb-black last:border-b-0 ${i % 2 === 0 ? 'bg-white' : 'bg-[#F5F1E8]'}`}>
                      <td className="px-4 py-3 font-mono text-xs whitespace-nowrap">{fmt(r.createdAt)}</td>
                      <td className="px-4 py-3 max-w-[160px]">
                        <p className="font-bold truncate">{r.user?.name}</p>
                        <p className="text-xs text-nb-black/50 truncate">{r.user?.email}</p>
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={r.planKey} /></td>
                      <td className="px-4 py-3 font-black font-mono whitespace-nowrap">{r.amountDisplay}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={r.refundStatus !== 'none' ? 'refunded' : r.status} />
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-nb-black/50 max-w-[160px]">
                        <span className="truncate block">{r.razorpayPaymentId || r.razorpayOrderId || '—'}</span>
                      </td>
                      <td className="px-4 py-3">
                        {r.status === 'paid' && r.refundStatus === 'none' && (
                          <button
                            onClick={() => setRefundOrder(r)}
                            className="btn btn-sm btn-red text-[10px] py-1 px-2 whitespace-nowrap"
                          >
                            <Receipt className="w-3 h-3" /> Refund
                          </button>
                        )}
                        {r.refundStatus !== 'none' && (
                          <span className="text-[10px] font-bold text-nb-red uppercase">Refunded</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="lg:hidden divide-y-2 divide-nb-black">
              {records.map((r) => (
                <div key={r._id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-bold truncate">{r.user?.name}</p>
                      <p className="text-xs text-nb-black/50 truncate">{r.user?.email}</p>
                      <p className="font-mono text-xs text-nb-black/40 mt-0.5">{fmt(r.createdAt)}</p>
                    </div>
                    <StatusBadge status={r.refundStatus !== 'none' ? 'refunded' : r.status} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={r.planKey} />
                      <span className="font-black font-mono">{r.amountDisplay}</span>
                    </div>
                    {r.status === 'paid' && r.refundStatus === 'none' && (
                      <button onClick={() => setRefundOrder(r)} className="btn btn-sm btn-red text-[10px] py-1 px-2">
                        <Receipt className="w-3 h-3" /> Refund
                      </button>
                    )}
                  </div>
                  {r.razorpayPaymentId && (
                    <p className="font-mono text-[10px] text-nb-black/40 truncate">{r.razorpayPaymentId}</p>
                  )}
                </div>
              ))}
            </div>

            <Pagination page={page} pages={pagination.pages} total={pagination.total} onPage={load} />
          </div>
        )}
      </div>
    </>
  );
};

/* ─── Users Tab ───────────────────────────────────────────────────────────── */
const UsersTab = () => {
  const [users, setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage]     = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [search, setSearch] = useState('');
  const [plan, setPlan]     = useState('');
  const searchRef = useRef(null);

  const load = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const data = await listUsers({ page: p, limit: 20, search: search || undefined, plan: plan || undefined });
      setUsers(data.users || []);
      setPagination(data.pagination || { total: 0, pages: 1 });
      setPage(p);
    } catch { toast.error('Failed to load users.'); }
    finally { setLoading(false); }
  }, [search, plan]);

  useEffect(() => { load(1); }, [load]);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-end">
        <div className="space-y-1 flex-1 min-w-[200px]">
          <label className="text-[10px] font-black uppercase tracking-widest text-nb-black/60">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-nb-black/30" />
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && load(1)}
              placeholder="Name or email…"
              className="nb-input pl-9 w-full"
            />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-nb-black/60">Plan</label>
          <select value={plan} onChange={(e) => setPlan(e.target.value)} className="nb-input">
            <option value="">All plans</option>
            {['free', 'basic', 'pro', 'annual'].map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <button onClick={() => load(1)} className="btn btn-black self-end"><Filter className="w-4 h-4" /> Filter</button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-nb-black/30" /></div>
      ) : (
        <div className="border-3 border-nb-black bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-3 border-nb-black bg-nb-black text-nb-yellow">
                  {['User', 'Plan', 'Status', 'Period ends', 'Interviews', 'Joined'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr key={u.id} className={`border-b-2 border-nb-black last:border-b-0 ${i % 2 === 0 ? 'bg-white' : 'bg-[#F5F1E8]'}`}>
                    <td className="px-4 py-3 max-w-[200px]">
                      <p className="font-bold truncate">{u.name}</p>
                      <p className="text-xs text-nb-black/50 truncate">{u.email}</p>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={u.plan} /></td>
                    <td className="px-4 py-3"><StatusBadge status={u.planStatus || 'active'} /></td>
                    <td className="px-4 py-3 font-mono text-xs whitespace-nowrap">{fmt(u.periodEnd)}</td>
                    <td className="px-4 py-3 font-mono text-sm font-bold">{u.interviewsTaken}</td>
                    <td className="px-4 py-3 font-mono text-xs whitespace-nowrap text-nb-black/50">{fmt(u.joinedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} pages={pagination.pages} total={pagination.total} onPage={load} />
        </div>
      )}
    </div>
  );
};

/* ─── Webhooks Tab ────────────────────────────────────────────────────────── */
const WebhooksTab = () => {
  const [events, setEvents]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage]       = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [statusFilter, setStatusFilter] = useState('');

  const load = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const data = await listWebhookEvents({ page: p, limit: 20, status: statusFilter || undefined });
      setEvents(data.events || []);
      setPagination(data.pagination || { total: 0, pages: 1 });
      setPage(p);
    } catch { toast.error('Failed to load webhook events.'); }
    finally { setLoading(false); }
  }, [statusFilter]);

  useEffect(() => { load(1); }, [load]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-end">
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-nb-black/60">Status</label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="nb-input">
            <option value="">All</option>
            {['processed', 'failed', 'pending', 'skipped', 'processing'].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <button onClick={() => load(1)} className="btn btn-black self-end"><RefreshCw className="w-4 h-4" /> Refresh</button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-nb-black/30" /></div>
      ) : (
        <div className="border-3 border-nb-black bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-3 border-nb-black bg-nb-black text-nb-yellow">
                  {['Received', 'Event', 'Entity ID', 'Status', 'Attempts', 'Error'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {events.map((e, i) => (
                  <tr key={e._id} className={`border-b-2 border-nb-black last:border-b-0 ${i % 2 === 0 ? 'bg-white' : 'bg-[#F5F1E8]'}`}>
                    <td className="px-4 py-3 font-mono text-xs whitespace-nowrap">{fmtTime(e.createdAt)}</td>
                    <td className="px-4 py-3 font-mono text-xs font-bold whitespace-nowrap">{e.eventType}</td>
                    <td className="px-4 py-3 font-mono text-xs text-nb-black/50 max-w-[160px]">
                      <span className="truncate block">{e.entityId || '—'}</span>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={e.status} /></td>
                    <td className="px-4 py-3 font-mono text-sm font-bold">{e.attempts}</td>
                    <td className="px-4 py-3 text-xs text-nb-red font-medium max-w-[200px]">
                      <span className="truncate block">{e.lastError || '—'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} pages={pagination.pages} total={pagination.total} onPage={load} />
        </div>
      )}
    </div>
  );
};

/* ─── Page ────────────────────────────────────────────────────────────────── */
export default function AdminDashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  // Guard: non-admin users shouldn't see this page at all
  // (backend also enforces this — this is just UX)
  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  if (!user || user.role !== 'admin') return null;

  const TABS = [
    { id: 'overview',  label: 'Overview',  icon: BarChart3  },
    { id: 'payments',  label: 'Payments',  icon: CreditCard },
    { id: 'users',     label: 'Users',     icon: Users      },
    { id: 'webhooks',  label: 'Webhooks',  icon: Webhook    },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-6xl space-y-6">

        {/* Header */}
        <div className="border-b-3 border-nb-black pb-5 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-4xl font-black uppercase tracking-tight">Admin</h1>
              <span className="nb-badge-black text-[10px]">PAYMENTS</span>
            </div>
            <p className="text-sm font-medium text-nb-black/60">
              Payment management, user subscriptions, and webhook monitoring.
            </p>
          </div>
          <Link to="/dashboard" className="btn btn-sm">
            <ArrowRight className="w-4 h-4 rotate-180" /> Dashboard
          </Link>
        </div>

        {/* Tab switcher */}
        <div className="flex border-3 border-nb-black bg-white overflow-hidden w-fit flex-wrap">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-black uppercase tracking-widest transition-colors border-r-2 last:border-r-0 border-nb-black
                  ${active ? 'bg-nb-yellow text-nb-black' : 'bg-white text-nb-black/60 hover:bg-nb-yellow/30'}`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'payments' && <PaymentsTab />}
        {activeTab === 'users'    && <UsersTab />}
        {activeTab === 'webhooks' && <WebhooksTab />}

      </div>
    </DashboardLayout>
  );
}
