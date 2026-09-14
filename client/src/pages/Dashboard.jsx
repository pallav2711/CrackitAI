import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Mic, FileText, Trophy,
  TrendingUp, Zap, ArrowRight,
  Star, Clock, Target,
} from 'lucide-react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import useAuthStore from '../store/useAuthStore';
import api from '../services/api';

/* ─── Quick action cards ──────────────────────────────────────────────────── */
const ACTIONS = [
  {
    icon: Mic,
    label: 'Voice Interview',
    desc: 'Live AI interviewer — speak your answers',
    to: '/interview/setup',
    accent: true,
    badge: 'START',
  },
  {
    icon: FileText,
    label: 'Resume Scanner',
    desc: 'ATS score, gaps, and specific fixes',
    to: '/resumes',
    accent: false,
    badge: null,
  },
  {
    icon: Trophy,
    label: 'Leaderboard',
    desc: 'See where you rank this week',
    to: '/leaderboard',
    accent: false,
    badge: null,
  },
];

/* ─── Stat card ───────────────────────────────────────────────────────────── */
const Stat = ({ label, value, unit, icon: Icon, accent }) => (
  <div
    className={`border-2 border-nb-black p-5 flex flex-col gap-3 ${accent ? 'bg-nb-yellow' : 'bg-white'}`}
    style={{ borderRadius: '8px', boxShadow: '4px 4px 0 #111111' }}
  >
    <div className="flex items-center justify-between">
      <span className="text-[10px] font-black uppercase tracking-widest text-nb-black/55">{label}</span>
      <div
        className="w-8 h-8 bg-nb-black flex items-center justify-center flex-shrink-0"
        style={{ borderRadius: '4px' }}
        aria-hidden="true"
      >
        <Icon className="w-4 h-4 text-nb-yellow" />
      </div>
    </div>
    <div className="flex items-end gap-1">
      <span
        className="text-4xl font-black leading-none"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        {value ?? '—'}
      </span>
      {unit && <span className="text-sm font-bold text-nb-black/45 mb-1">{unit}</span>}
    </div>
  </div>
);

/* ─── Progress bar ────────────────────────────────────────────────────────── */
const Bar = ({ label, value, max = 100, color = 'bg-nb-yellow' }) => {
  const pct    = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const danger = color === 'bg-nb-yellow' && pct >= 90;
  return (
    <div>
      <div className="flex justify-between text-xs font-bold mb-1.5">
        <span className="uppercase tracking-wide text-nb-black/70">{label}</span>
        <span className={`font-mono ${danger ? 'text-nb-red' : 'text-nb-black/60'}`}>{value}/{max}</span>
      </div>
      <div className="h-3.5 border-2 border-nb-black bg-[#F5F1E8]">
        <div
          className={`h-full ${danger ? 'bg-nb-red' : color} border-r-2 border-nb-black transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

/* ─── Activity row ────────────────────────────────────────────────────────── */
const ActivityRow = ({ label, score, date, type }) => {
  const colors = {
    voice:  'bg-nb-yellow',
    text:   'bg-nb-blue',
    test:   'bg-nb-green',
    resume: 'bg-nb-red',
  };
  return (
    <div className="flex items-center gap-4 py-3 border-b-2 border-nb-black/10 last:border-b-0">
      <div
        className={`w-1.5 h-9 flex-shrink-0 border-2 border-nb-black ${colors[type] || 'bg-nb-black'}`}
        aria-hidden="true"
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold truncate">{label}</p>
        <p className="text-[11px] text-nb-black/45 font-mono mt-0.5">{date}</p>
      </div>
      {score != null && (
        <span
          className="text-[11px] font-black px-2 py-0.5 border-2 border-nb-black bg-white font-mono"
          style={{ borderRadius: '3px', boxShadow: '1px 1px 0 #111' }}
        >
          {score}%
        </span>
      )}
    </div>
  );
};

/* ─── Skeleton ────────────────────────────────────────────────────────────── */
const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-nb-black/8 border-2 border-nb-black/15 ${className}`} style={{ borderRadius: '4px' }} />
);

/* ─── Page ────────────────────────────────────────────────────────────────── */
const Dashboard = () => {
  const { user }                  = useAuthStore();
  const [stats, setStats]         = useState(null);
  const [history, setHistory]     = useState([]);
  const [loading, setLoading]     = useState(true);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, histRes] = await Promise.allSettled([
          api.get('/interview/user/stats'),
          api.get('/interview/user/history'),
        ]);
        if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);
        if (histRes.status === 'fulfilled') {
          const items = Array.isArray(histRes.value.data)
            ? histRes.value.data
            : histRes.value.data?.interviews ?? [];
          setHistory(items.slice(0, 6));
        }
      } catch { /* show empty state */ }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const s    = stats || user?.stats || {};
  const plan = user?.subscription?.plan || 'free';
  const firstName = user?.name?.split(' ')[0] || 'User';

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-6xl">

        {/* ── Page header ───────────────────────────────────────────────── */}
        <div className="border-b-3 border-nb-black pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-nb-black/45 mb-1">
              {greeting()}
            </p>
            <h1
              className="font-bold text-nb-black leading-none"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
                letterSpacing: '-0.03em',
              }}
            >
              {firstName}
            </h1>
            <div className="flex items-center gap-3 mt-2.5">
              <span
                className="text-[10px] font-black tracking-widest uppercase px-2.5 py-1 border-2 border-nb-black"
                style={{
                  borderRadius: '3px',
                  background: plan === 'free' ? 'white' : '#FFD93D',
                }}
              >
                {plan}
              </span>
              {plan === 'free' && (
                <Link
                  to="/billing"
                  className="text-[11px] font-black text-nb-black/55 hover:text-nb-black underline underline-offset-2 transition-colors"
                >
                  Upgrade plan →
                </Link>
              )}
            </div>
          </div>
          <Link to="/interview/setup" className="btn btn-primary btn-lg self-start sm:self-auto">
            <Mic className="w-5 h-5" aria-hidden="true" />
            New Interview
          </Link>
        </div>

        {/* ── Stats grid — 4 col, varied treatment ──────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <Stat label="Interviews"   value={s.interviewsTaken ?? 0}  icon={Mic}       accent />
          <Stat label="Resume score" value={s.resumeScore ?? 0}      unit="/100" icon={FileText} />
          <Stat label="Total points" value={s.totalPoints ?? 0}      icon={Star} />
          <Stat label="Avg score"    value={s.averageScore ?? 0}     unit="%" icon={Target} />
        </div>

        {/* ── Quick actions ─────────────────────────────────────────────── */}
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-nb-black/45 mb-4">
            Quick actions
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {ACTIONS.map(({ icon: Icon, label, desc, to, accent, badge }) => (
              <Link
                key={to}
                to={to}
                className={`border-2 border-nb-black p-5 flex flex-col gap-4 group transition-all duration-100 hover:-translate-x-0.5 hover:-translate-y-0.5 ${
                  accent ? 'bg-nb-yellow' : 'bg-white'
                }`}
                style={{ borderRadius: '8px', boxShadow: '4px 4px 0 #111111' }}
              >
                <div className="flex items-start justify-between">
                  <div
                    className={`w-10 h-10 border-2 border-nb-black flex items-center justify-center ${
                      accent ? 'bg-nb-black' : 'bg-[#F5F1E8]'
                    }`}
                    style={{ borderRadius: '5px' }}
                    aria-hidden="true"
                  >
                    <Icon className={`w-5 h-5 ${accent ? 'text-nb-yellow' : 'text-nb-black'}`} />
                  </div>
                  {badge && (
                    <span
                      className="text-[9px] font-black tracking-widest uppercase px-1.5 py-0.5 bg-nb-black text-nb-yellow border-2 border-nb-black"
                      style={{ borderRadius: '2px' }}
                    >
                      {badge}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <p
                    className="font-bold text-sm uppercase tracking-tight"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {label}
                  </p>
                  <p className="text-xs text-nb-black/55 mt-0.5 font-medium leading-relaxed">{desc}</p>
                </div>
                <ArrowRight
                  className="w-4 h-4 text-nb-black/40 group-hover:text-nb-black group-hover:translate-x-0.5 transition-all"
                  aria-hidden="true"
                />
              </Link>
            ))}
          </div>
        </div>

        {/* ── Two-column: progress + activity ───────────────────────────── */}
        <div className="grid lg:grid-cols-2 gap-4 md:gap-6">

          {/* Progress / usage */}
          <div
            className="bg-white border-2 border-nb-black p-6 space-y-5"
            style={{ borderRadius: '8px', boxShadow: '4px 4px 0 #111111' }}
          >
            <div className="flex items-center justify-between border-b-2 border-nb-black pb-4">
              <h2
                className="font-bold text-sm uppercase tracking-widest flex items-center gap-2"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                <TrendingUp className="w-4 h-4" aria-hidden="true" />
                This month
              </h2>
              <span
                className="text-[10px] font-black tracking-widest uppercase px-2 py-0.5 border-2 border-nb-black bg-[#F5F1E8]"
                style={{ borderRadius: '3px' }}
              >
                {plan}
              </span>
            </div>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-8 w-full" />)}
              </div>
            ) : (
              <div className="space-y-4">
                <Bar
                  label="Interviews used"
                  value={user?.usage?.interviewsUsedThisCycle ?? 0}
                  max={plan === 'free' ? 1 : plan === 'basic' ? 5 : 15}
                  color="bg-nb-yellow"
                />
                <Bar
                  label="Sessions completed"
                  value={s.interviewsCompleted ?? 0}
                  max={Math.max(s.interviewsTaken || 1, 1)}
                  color="bg-nb-green"
                />
                <Bar
                  label="Tests completed"
                  value={s.testsCompleted ?? 0}
                  max={10}
                  color="bg-nb-blue"
                />
              </div>
            )}
            <Link to="/billing" className="btn btn-ghost btn-sm w-full justify-center">
              Manage plan →
            </Link>
          </div>

          {/* Recent activity */}
          <div
            className="bg-white border-2 border-nb-black p-6"
            style={{ borderRadius: '8px', boxShadow: '4px 4px 0 #111111' }}
          >
            <div className="flex items-center justify-between border-b-2 border-nb-black pb-4 mb-4">
              <h2
                className="font-bold text-sm uppercase tracking-widest flex items-center gap-2"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                <Clock className="w-4 h-4" aria-hidden="true" />
                Recent activity
              </h2>
            </div>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : history.length > 0 ? (
              <>
                {history.map(item => (
                  <ActivityRow
                    key={item._id}
                    label={`${item.type || 'Interview'} — ${item.role || 'General'}`}
                    score={item.overallScore}
                    date={new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    type={item.mode === 'voice' ? 'voice' : 'text'}
                  />
                ))}
                <Link to="/mock-interview" className="btn btn-ghost btn-sm w-full justify-center mt-4">
                  View all history →
                </Link>
              </>
            ) : (
              <div className="text-center py-10 space-y-3">
                <div
                  className="w-12 h-12 border-2 border-nb-black bg-[#F5F1E8] flex items-center justify-center mx-auto"
                  style={{ borderRadius: '6px' }}
                  aria-hidden="true"
                >
                  <Zap className="w-6 h-6 text-nb-black/30" />
                </div>
                <p className="text-sm font-bold text-nb-black/40 uppercase tracking-wide">No interviews yet</p>
                <Link to="/interview/setup" className="btn btn-primary btn-sm inline-flex">
                  Start your first →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* ── Leaderboard CTA ───────────────────────────────────────────── */}
        <div
          className="bg-nb-black border-2 border-nb-black p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
          style={{ borderRadius: '8px', boxShadow: '4px 4px 0 #FFD93D' }}
        >
          <div className="space-y-2">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-nb-yellow/60">
              Weekly leaderboard
            </p>
            <h3
              className="font-bold text-nb-yellow"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.25rem, 3vw, 1.75rem)',
                letterSpacing: '-0.03em',
              }}
            >
              {s.totalPoints > 0
                ? `You have ${s.totalPoints} points`
                : 'Earn points. Rank up.'}
            </h3>
            <p className="text-sm text-white/50 font-medium">
              Complete voice interviews to earn leaderboard points.
            </p>
          </div>
          <Link to="/leaderboard" className="btn btn-primary flex-shrink-0">
            <Trophy className="w-4 h-4" aria-hidden="true" />
            View Leaderboard
          </Link>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
