import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard, FileText, Briefcase, HelpCircle,
  Plus, ArrowRight, Target, TrendingUp, Star, ChevronRight,
  Zap,
} from 'lucide-react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import useAuthStore from '../store/useAuthStore';
import api from '../services/api';

/* ─── 4 Core feature cards ───────────────────────────────────────────────── */
const FEATURES = [
  {
    icon:    LayoutDashboard,
    label:   'Dashboard',
    desc:    'View your job-readiness scores and recent activity',
    to:      '/dashboard',
    accent:  false,
    badge:   null,
  },
  {
    icon:    FileText,
    label:   'Resume Builder',
    desc:    'Build an ATS-optimised resume from scratch',
    to:      '/resumes',
    accent:  false,
    badge:   null,
  },
  {
    icon:    Briefcase,
    label:   'JD Matcher',
    desc:    'ATS score, skill gap, resume tailoring & cover letter',
    to:      '/jobs',
    accent:  true,
    badge:   'CORE',
  },
  {
    icon:    HelpCircle,
    label:   'Interview Quiz',
    desc:    'AI quiz generated from your job description',
    to:      '/jobs',
    accent:  false,
    badge:   null,
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
      <div className="w-8 h-8 bg-nb-black flex items-center justify-center flex-shrink-0" style={{ borderRadius: '4px' }}>
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

/* ─── ATS score badge ────────────────────────────────────────────────────── */
const ScoreBadge = ({ score }) => {
  if (score == null) return <span className="text-xs font-mono text-nb-black/30">—</span>;
  const cls = score >= 80 ? 'bg-green-100 text-green-800 border-green-300'
    : score >= 60        ? 'bg-nb-yellow text-nb-black border-nb-black'
    : score >= 40        ? 'bg-orange-100 text-orange-700 border-orange-300'
    :                      'bg-red-100 text-red-700 border-red-300';
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
    className="flex items-center gap-4 py-3 border-b-2 border-nb-black/10 last:border-b-0 hover:bg-nb-yellow/10 -mx-2 px-2 transition-colors group"
    style={{ borderRadius: '4px' }}
  >
    <div className="w-1.5 h-9 flex-shrink-0 border-2 border-nb-black bg-nb-yellow" />
    <div className="flex-1 min-w-0">
      <p className="text-sm font-bold truncate">{job.title}</p>
      <p className="text-[11px] text-nb-black/40 font-mono mt-0.5">{job.company || 'No company'}</p>
    </div>
    <div className="flex items-center gap-3">
      <ScoreBadge score={job.atsScore} />
      <ChevronRight className="w-3.5 h-3.5 text-nb-black/20 group-hover:text-nb-black transition-colors" />
    </div>
  </Link>
);

const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-nb-black/8 border-2 border-nb-black/15 ${className}`} style={{ borderRadius: '4px' }} />
);

/* ─── Page ───────────────────────────────────────────────────────────────── */
export default function Dashboard() {
  const { user }              = useAuthStore();
  const [jobs, setJobs]       = useState([]);
  const [loading, setLoading] = useState(true);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  useEffect(() => {
    api.get('/jobs')
      .then(r => setJobs((r.data?.data || []).slice(0, 5)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const plan      = user?.subscription?.plan || 'free';
  const firstName = user?.name?.split(' ')[0] || 'User';

  const jobsWithATS  = jobs.filter(j => j.atsScore != null);
  const avgATS       = jobsWithATS.length
    ? Math.round(jobsWithATS.reduce((s, j) => s + j.atsScore, 0) / jobsWithATS.length)
    : null;
  const jobsWithReady = jobs.filter(j => j.readinessScore != null);
  const avgReady      = jobsWithReady.length
    ? Math.round(jobsWithReady.reduce((s, j) => s + j.readinessScore, 0) / jobsWithReady.length)
    : null;

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-6xl">

        {/* ── Header ────────────────────────────────────────────────────── */}
        <div className="border-b-3 border-nb-black pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-nb-black/45 mb-1">
              {greeting()}
            </p>
            <h1
              className="font-bold text-nb-black leading-none"
              style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.75rem,4vw,2.75rem)', letterSpacing: '-0.03em' }}
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
                  Upgrade →
                </Link>
              )}
            </div>
          </div>
          <Link to="/jobs" className="btn btn-primary btn-lg self-start sm:self-auto">
            <Plus className="w-5 h-5" />
            New JD Match
          </Link>
        </div>

        {/* ── Stats ─────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <Stat label="Jobs Tracked"  value={jobs.length}       icon={Briefcase}   accent />
          <Stat label="Avg ATS Score" value={avgATS  ?? '—'} unit={avgATS  != null ? '%' : undefined} icon={Target} />
          <Stat label="Avg Readiness" value={avgReady ?? '—'} unit={avgReady != null ? '%' : undefined} icon={TrendingUp} />
          <Stat label="Total Points"  value={user?.stats?.totalPoints ?? 0}         icon={Star} />
        </div>

        {/* ── 4 Feature cards ───────────────────────────────────────────── */}
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-nb-black/45 mb-4">
            Features
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {FEATURES.map(({ icon: Icon, label, desc, to, accent, badge }) => (
              <Link
                key={label}
                to={to}
                className={`border-2 border-nb-black p-5 flex flex-col gap-4 group transition-all duration-100 hover:-translate-x-0.5 hover:-translate-y-0.5 ${accent ? 'bg-nb-yellow' : 'bg-white'}`}
                style={{ borderRadius: '8px', boxShadow: '4px 4px 0 #111111' }}
              >
                <div className="flex items-start justify-between">
                  <div
                    className={`w-10 h-10 border-2 border-nb-black flex items-center justify-center ${accent ? 'bg-nb-black' : 'bg-[#F5F1E8]'}`}
                    style={{ borderRadius: '5px' }}
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
                <ArrowRight className="w-4 h-4 text-nb-black/40 group-hover:text-nb-black group-hover:translate-x-0.5 transition-all" />
              </Link>
            ))}
          </div>
        </div>

        {/* ── Recent jobs ───────────────────────────────────────────────── */}
        <div className="bg-white border-2 border-nb-black p-6" style={{ borderRadius: '8px', boxShadow: '4px 4px 0 #111111' }}>
          <div className="flex items-center justify-between border-b-2 border-nb-black pb-4 mb-4">
            <h2 className="font-bold text-sm uppercase tracking-widest flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
              <Briefcase className="w-4 h-4" />
              Recent Jobs
            </h2>
            <Link to="/jobs" className="text-[11px] font-black text-nb-black/50 hover:text-nb-black transition-colors">
              View all →
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : jobs.length > 0 ? (
            jobs.map(job => <JobRow key={job._id} job={job} />)
          ) : (
            <div className="text-center py-10 space-y-3">
              <div className="w-12 h-12 border-2 border-nb-black bg-nb-yellow flex items-center justify-center mx-auto" style={{ borderRadius: '6px' }}>
                <Zap className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-nb-black/40 uppercase tracking-wide">No jobs yet</p>
              <p className="text-xs text-nb-black/30 max-w-xs mx-auto leading-relaxed">
                Paste a job description and your resume to get your ATS score, skill gap, tailored resume, and a quiz.
              </p>
              <Link to="/jobs" className="btn btn-primary btn-sm inline-flex">
                <Plus className="w-4 h-4" /> Start with a Job →
              </Link>
            </div>
          )}
        </div>

        {/* ── CTA banner ────────────────────────────────────────────────── */}
        <div
          className="bg-nb-black border-2 border-nb-black p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
          style={{ borderRadius: '8px', boxShadow: '4px 4px 0 #FFD93D' }}
        >
          <div className="space-y-2">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-nb-yellow/60">
              Job Readiness Platform
            </p>
            <h3
              className="font-bold text-nb-yellow"
              style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.25rem,3vw,1.75rem)', letterSpacing: '-0.03em' }}
            >
              Resume + JD → Full Preparation
            </h3>
            <p className="text-sm text-white/50 font-medium">
              ATS score · Skill gap · Tailored resume · Cover letter · Interview quiz
            </p>
          </div>
          <Link to="/jobs" className="btn btn-primary flex-shrink-0">
            <Briefcase className="w-4 h-4" />
            Match a Job
          </Link>
        </div>

      </div>
    </DashboardLayout>
  );
}
