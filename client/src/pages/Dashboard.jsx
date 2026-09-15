import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase, FileText, Trophy,
  TrendingUp, Plus, ArrowRight,
  Target, Mic, Star, ChevronRight,
} from 'lucide-react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import useAuthStore from '../store/useAuthStore';
import api from '../services/api';

/* ─── Quick actions ──────────────────────────────────────────────────────── */
const ACTIONS = [
  {
    icon: Briefcase,
    label: 'Track a Job',
    desc: 'ATS score, skill gap, quiz, and prep plan',
    to: '/jobs',
    accent: true,
    badge: 'MAIN',
  },
  {
    icon: FileText,
    label: 'Resume Center',
    desc: 'Build or scan your resume',
    to: '/resumes',
    accent: false,
    badge: null,
  },
  {
    icon: Mic,
    label: 'Voice Interview',
    desc: 'Live AI mock interview',
    to: '/interview/setup',
    accent: false,
    badge: null,
  },
  {
    icon: Trophy,
    label: 'Leaderboard',
    desc: 'See how you rank this week',
    to: '/leaderboard',
    accent: false,
    badge: null,
  },
];

/* ─── Stat card ──────────────────────────────────────────────────────────── */
const Stat = ({ label, value, unit, icon: Icon, accent }) => (
  <div
    className={`border-2 border-nb-black p-5 flex flex-col gap-3 ${accent ? 'bg-nb-yellow' : 'bg-white'}`}
    style={{ borderRadius: '8px', boxShadow: '4px 4px 0 #111111' }}
  >
    <div className="flex items-center justify-between">
      <span className="text-[10px] font-black uppercase tracking-widest text-nb-black/55">{label}</span>
      <div className="w-8 h-8 bg-nb-black flex items-center justify-center flex-shrink-0" style={{ borderRadius: '4px' }} aria-hidden="true">
        <Icon className="w-4 h-4 text-nb-yellow" />
      </div>
    </div>
    <div className="flex items-end gap-1">
      <span className="text-4xl font-black leading-none" style={{ fontFamily: 'var(--font-mono)' }}>
        {value ?? '—'}
      </span>
      {unit && <span className="text-sm font-bold text-nb-black/45 mb-1">{unit}</span>}
    </div>
  </div>
);

/* ─── Score badge ────────────────────────────────────────────────────────── */
const ScoreBadge = ({ score }) => {
  if (score == null) return <span className="text-xs font-mono text-nb-black/30">—</span>;
  const cls = score >= 80 ? 'bg-green-100 text-green-800 border-green-400'
    : score >= 60 ? 'bg-nb-yellow text-nb-black border-nb-black'
    : score >= 40 ? 'bg-orange-100 text-orange-700 border-orange-400'
    : 'bg-red-100 text-red-700 border-red-400';
  return (
    <span className={`text-[11px] font-black px-2 py-0.5 border-2 font-mono ${cls}`} style={{ borderRadius: '3px' }}>
      {score}%
    </span>
  );
};

/* ─── Job row ────────────────────────────────────────────────────────────── */
const JobRow = ({ job }) => (
  <Link
    to={`/workspace/${job._id}`}
    className="flex items-center gap-4 py-3 border-b-2 border-nb-black/10 last:border-b-0 hover:bg-nb-yellow/10 -mx-2 px-2 rounded transition-colors group"
  >
    <div className="w-1.5 h-9 flex-shrink-0 border-2 border-nb-black bg-nb-yellow" aria-hidden="true" />
    <div className="flex-1 min-w-0">
      <p className="text-sm font-bold truncate">{job.title}</p>
      <p className="text-[11px] text-nb-black/40 font-mono mt-0.5">{job.company || 'Company'}</p>
    </div>
    <div className="flex items-center gap-3">
      <ScoreBadge score={job.atsScore} />
      <ChevronRight className="w-3.5 h-3.5 text-nb-black/20 group-hover:text-nb-black transition-colors" aria-hidden="true" />
    </div>
  </Link>
);

/* ─── Skeleton ───────────────────────────────────────────────────────────── */
const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-nb-black/8 border-2 border-nb-black/15 ${className}`} style={{ borderRadius: '4px' }} />
);

/* ─── Page ───────────────────────────────────────────────────────────────── */
const Dashboard = () => {
  const { user } = useAuthStore();
  const [jobs, setJobs] = useState([]);
  const [interviewStats, setInterviewStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  useEffect(() => {
    const load = async () => {
      try {
        const [jobsRes, statsRes] = await Promise.allSettled([
          api.get('/jobs'),
          api.get('/interview/user/stats'),
        ]);
        if (jobsRes.status === 'fulfilled') {
          setJobs((jobsRes.value.data?.data || []).slice(0, 5));
        }
        if (statsRes.status === 'fulfilled') {
          setInterviewStats(statsRes.value.data);
        }
      } catch { /* empty state */ }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const plan = user?.subscription?.plan || 'free';
  const firstName = user?.name?.split(' ')[0] || 'User';

  // Derived stats
  const jobsWithATS = jobs.filter(j => j.atsScore != null);
  const avgATS = jobsWithATS.length
    ? Math.round(jobsWithATS.reduce((s, j) => s + j.atsScore, 0) / jobsWithATS.length)
    : null;
  const jobsWithReady = jobs.filter(j => j.readinessScore != null);
  const avgReady = jobsWithReady.length
    ? Math.round(jobsWithReady.reduce((s, j) => s + j.readinessScore, 0) / jobsWithReady.length)
    : null;

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-6xl">

        {/* ── Page header ───────────────────────────────────────────────── */}
        <div className="border-b-3 border-nb-black pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-nb-black/45 mb-1">{greeting()}</p>
            <h1
              className="font-bold text-nb-black leading-none"
              style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', letterSpacing: '-0.03em' }}
            >
              {firstName}
            </h1>
            <div className="flex items-center gap-3 mt-2.5">
              <span
                className="text-[10px] font-black tracking-widest uppercase px-2.5 py-1 border-2 border-nb-black"
                style={{ borderRadius: '3px', background: plan === 'free' ? 'white' : '#FFD93D' }}
              >
                {plan}
              </span>
              {plan === 'free' && (
                <Link to="/billing" className="text-[11px] font-black text-nb-black/55 hover:text-nb-black underline underline-offset-2 transition-colors">
                  Upgrade plan →
                </Link>
              )}
            </div>
          </div>
          <Link to="/jobs" className="btn btn-primary btn-lg self-start sm:self-auto">
            <Plus className="w-5 h-5" aria-hidden="true" />
            Track New Job
          </Link>
        </div>

        {/* ── Stats grid ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <Stat label="Jobs Tracked"   value={jobs.length || user?.stats?.interviewsTaken || 0} icon={Briefcase} accent />
          <Stat label="Avg ATS Score"  value={avgATS ?? '—'}    unit={avgATS != null ? '%' : undefined} icon={Target} />
          <Stat label="Avg Readiness"  value={avgReady ?? '—'}  unit={avgReady != null ? '%' : undefined} icon={TrendingUp} />
          <Stat label="Total Points"   value={interviewStats?.totalPoints ?? user?.stats?.totalPoints ?? 0} icon={Star} />
        </div>

        {/* ── Quick actions ─────────────────────────────────────────────── */}
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-nb-black/45 mb-4">Quick actions</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {ACTIONS.map(({ icon: Icon, label, desc, to, accent, badge }) => (
              <Link
                key={to}
                to={to}
                className={`border-2 border-nb-black p-5 flex flex-col gap-4 group transition-all duration-100 hover:-translate-x-0.5 hover:-translate-y-0.5 ${accent ? 'bg-nb-yellow' : 'bg-white'}`}
                style={{ borderRadius: '8px', boxShadow: '4px 4px 0 #111111' }}
              >
                <div className="flex items-start justify-between">
                  <div
                    className={`w-10 h-10 border-2 border-nb-black flex items-center justify-center ${accent ? 'bg-nb-black' : 'bg-[#F5F1E8]'}`}
                    style={{ borderRadius: '5px' }}
                    aria-hidden="true"
                  >
                    <Icon className={`w-5 h-5 ${accent ? 'text-nb-yellow' : 'text-nb-black'}`} />
                  </div>
                  {badge && (
                    <span className="text-[9px] font-black tracking-widest uppercase px-1.5 py-0.5 bg-nb-black text-nb-yellow border-2 border-nb-black" style={{ borderRadius: '2px' }}>
                      {badge}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm uppercase tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>{label}</p>
                  <p className="text-xs text-nb-black/55 mt-0.5 font-medium leading-relaxed">{desc}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-nb-black/40 group-hover:text-nb-black group-hover:translate-x-0.5 transition-all" aria-hidden="true" />
              </Link>
            ))}
          </div>
        </div>

        {/* ── Recent jobs ───────────────────────────────────────────────── */}
        <div className="bg-white border-2 border-nb-black p-6" style={{ borderRadius: '8px', boxShadow: '4px 4px 0 #111111' }}>
          <div className="flex items-center justify-between border-b-2 border-nb-black pb-4 mb-4">
            <h2 className="font-bold text-sm uppercase tracking-widest flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
              <Briefcase className="w-4 h-4" aria-hidden="true" />
              Recent Jobs
            </h2>
            <Link to="/jobs" className="text-[11px] font-black text-nb-black/50 hover:text-nb-black transition-colors">
              View all →
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : jobs.length > 0 ? (
            jobs.map(job => <JobRow key={job._id} job={job} />)
          ) : (
            <div className="text-center py-10 space-y-3">
              <div className="w-12 h-12 border-2 border-nb-black bg-nb-yellow flex items-center justify-center mx-auto" style={{ borderRadius: '6px' }} aria-hidden="true">
                <Briefcase className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-nb-black/40 uppercase tracking-wide">No jobs tracked yet</p>
              <p className="text-xs text-nb-black/30 max-w-xs mx-auto">Add a job to start getting ATS scores, skill gap analysis, and readiness scores.</p>
              <Link to="/jobs" className="btn btn-primary btn-sm inline-flex">
                <Plus className="w-4 h-4" />
                Add First Job →
              </Link>
            </div>
          )}
        </div>

        {/* ── Leaderboard CTA ───────────────────────────────────────────── */}
        <div
          className="bg-nb-black border-2 border-nb-black p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
          style={{ borderRadius: '8px', boxShadow: '4px 4px 0 #FFD93D' }}
        >
          <div className="space-y-2">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-nb-yellow/60">Weekly leaderboard</p>
            <h3
              className="font-bold text-nb-yellow"
              style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.25rem, 3vw, 1.75rem)', letterSpacing: '-0.03em' }}
            >
              {interviewStats?.totalPoints > 0 ? `You have ${interviewStats.totalPoints} points` : 'Earn points. Rank up.'}
            </h3>
            <p className="text-sm text-white/50 font-medium">Complete interviews and job analyses to earn leaderboard points.</p>
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
