import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus, Briefcase, Target, ChevronRight,
  Trash2, X, Loader2, Search, TrendingUp,
} from 'lucide-react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import api from '../services/api';

/* ── Helpers ──────────────────────────────────────────────────────────────── */
const scoreColor = (score) => {
  if (score == null) return 'bg-white text-nb-black/40 border-nb-black/20';
  if (score >= 80) return 'bg-green-100 text-green-800 border-green-400';
  if (score >= 60) return 'bg-nb-yellow text-nb-black border-nb-black';
  if (score >= 40) return 'bg-orange-100 text-orange-800 border-orange-400';
  return 'bg-red-100 text-red-700 border-red-400';
};

const statusLabel = {
  analyzing: { text: 'Analyzing', cls: 'bg-nb-yellow/30 text-nb-black' },
  ready: { text: 'Ready', cls: 'bg-blue-100 text-blue-800' },
  preparing: { text: 'Preparing', cls: 'bg-purple-100 text-purple-800' },
  applied: { text: 'Applied', cls: 'bg-green-100 text-green-800' },
};

/* ── Add Job Modal ────────────────────────────────────────────────────────── */
const AddJobModal = ({ onClose, onCreated }) => {
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [jd, setJd] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    if (!title.trim()) { setError('Job title is required'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/jobs', { title: title.trim(), company: company.trim(), jobDescription: jd.trim() });
      onCreated(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-nb-black/50">
      <div
        className="w-full max-w-lg bg-white border-2 border-nb-black"
        style={{ borderRadius: '8px', boxShadow: '6px 6px 0 #111111' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b-2 border-nb-black bg-nb-yellow">
          <h2 className="font-black text-base uppercase tracking-wide">Add New Job</h2>
          <button onClick={onClose} className="p-1 hover:opacity-60" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={submit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border-2 border-red-400 text-red-700 text-sm font-bold" style={{ borderRadius: '4px' }}>
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-black uppercase tracking-wider mb-1.5">Job Title *</label>
            <input
              className="w-full border-2 border-nb-black px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-nb-yellow"
              style={{ borderRadius: '4px' }}
              placeholder="e.g. Senior Frontend Engineer"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-wider mb-1.5">Company</label>
            <input
              className="w-full border-2 border-nb-black px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-nb-yellow"
              style={{ borderRadius: '4px' }}
              placeholder="e.g. Google"
              value={company}
              onChange={e => setCompany(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-wider mb-1.5">Job Description</label>
            <textarea
              className="w-full border-2 border-nb-black px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-nb-yellow resize-none"
              style={{ borderRadius: '4px' }}
              placeholder="Paste the full job description here..."
              rows={6}
              value={jd}
              onChange={e => setJd(e.target.value)}
            />
            <p className="text-[11px] text-nb-black/50 mt-1">Pasting the JD now speeds up analysis.</p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border-2 border-nb-black text-sm font-bold hover:bg-nb-black/5 transition-colors"
              style={{ borderRadius: '4px' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-nb-yellow border-2 border-nb-black text-sm font-black uppercase tracking-wide hover:bg-[#FFC300] transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
              style={{ borderRadius: '4px', boxShadow: loading ? 'none' : '3px 3px 0 #111' }}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              {loading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ── Score Badge ──────────────────────────────────────────────────────────── */
const ScoreBadge = ({ score, label }) => (
  <div className="text-center">
    <div
      className={`text-xs font-black px-2 py-1 border-2 inline-block ${scoreColor(score)}`}
      style={{ borderRadius: '4px', minWidth: '44px' }}
    >
      {score != null ? `${score}%` : '—'}
    </div>
    <p className="text-[10px] text-nb-black/40 mt-0.5 uppercase tracking-wide">{label}</p>
  </div>
);

/* ── Job Row ──────────────────────────────────────────────────────────────── */
const JobRow = ({ job, onDelete }) => {
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState(false);
  const status = statusLabel[job.status] || statusLabel.ready;

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!window.confirm(`Delete "${job.title}"?`)) return;
    setDeleting(true);
    try {
      await api.delete(`/jobs/${job._id}`);
      onDelete(job._id);
    } catch {
      setDeleting(false);
    }
  };

  return (
    <div
      className="bg-white border-2 border-nb-black p-4 flex items-center gap-4 hover:bg-[#FFFBF0] transition-colors cursor-pointer group"
      style={{ borderRadius: '6px', boxShadow: '3px 3px 0 #111111' }}
      onClick={() => navigate(`/workspace/${job._id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && navigate(`/workspace/${job._id}`)}
    >
      {/* Icon */}
      <div
        className="w-10 h-10 bg-nb-black flex items-center justify-center flex-shrink-0"
        style={{ borderRadius: '6px' }}
        aria-hidden="true"
      >
        <Briefcase className="w-5 h-5 text-nb-yellow" />
      </div>

      {/* Title + company */}
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm truncate">{job.title}</p>
        <p className="text-xs text-nb-black/50 truncate">{job.company || 'Company not specified'}</p>
        <p className="text-[10px] text-nb-black/35 mt-0.5 font-mono">
          {new Date(job.updatedAt || job.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
        </p>
      </div>

      {/* Status */}
      <span
        className={`hidden sm:block text-[10px] font-black px-2 py-0.5 uppercase tracking-wide ${status.cls}`}
        style={{ borderRadius: '3px', border: '1.5px solid transparent' }}
      >
        {status.text}
      </span>

      {/* Scores */}
      <div className="hidden md:flex items-center gap-5">
        <ScoreBadge score={job.atsScore} label="ATS" />
        <ScoreBadge score={job.readinessScore} label="Ready" />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 ml-2">
        <ChevronRight className="w-4 h-4 text-nb-black/30 group-hover:text-nb-black transition-colors" aria-hidden="true" />
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="p-1.5 text-nb-black/20 hover:text-nb-red hover:bg-red-50 transition-colors rounded"
          aria-label={`Delete ${job.title}`}
        >
          {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
};

/* ── Page ─────────────────────────────────────────────────────────────────── */
const JobDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    try {
      const res = await api.get('/jobs');
      setJobs(res.data.data || []);
    } catch { /* show empty state */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreated = (newJob) => {
    setJobs(prev => [newJob, ...prev]);
    setShowModal(false);
  };

  const filtered = search.trim()
    ? jobs.filter(j => j.title.toLowerCase().includes(search.toLowerCase()) || (j.company || '').toLowerCase().includes(search.toLowerCase()))
    : jobs;

  // Stats
  const avgATS = jobs.length ? Math.round(jobs.filter(j => j.atsScore != null).reduce((s, j) => s + j.atsScore, 0) / Math.max(jobs.filter(j => j.atsScore != null).length, 1)) : null;
  const avgReady = jobs.length ? Math.round(jobs.filter(j => j.readinessScore != null).reduce((s, j) => s + j.readinessScore, 0) / Math.max(jobs.filter(j => j.readinessScore != null).length, 1)) : null;

  return (
    <DashboardLayout>
      {showModal && <AddJobModal onClose={() => setShowModal(false)} onCreated={handleCreated} />}

      <div className="space-y-8 max-w-5xl">

        {/* Header */}
        <div className="border-b-3 border-nb-black pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-nb-black/45 mb-1">Job Readiness</p>
            <h1 className="font-bold text-nb-black leading-none" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', letterSpacing: '-0.03em' }}>
              My Jobs
            </h1>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-nb-yellow border-2 border-nb-black font-black text-sm uppercase tracking-wide hover:bg-[#FFC300] transition-all self-start sm:self-auto"
            style={{ borderRadius: '6px', boxShadow: '3px 3px 0 #111' }}
          >
            <Plus className="w-4 h-4" />
            Add New Job
          </button>
        </div>

        {/* Stats */}
        {jobs.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Jobs Tracked', value: jobs.length, icon: Briefcase },
              { label: 'Avg ATS Score', value: avgATS != null ? `${avgATS}%` : '—', icon: Target },
              { label: 'Avg Readiness', value: avgReady != null ? `${avgReady}%` : '—', icon: TrendingUp },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="bg-white border-2 border-nb-black p-4 flex flex-col gap-2" style={{ borderRadius: '6px', boxShadow: '3px 3px 0 #111' }}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-nb-black/50">{label}</span>
                  <Icon className="w-4 h-4 text-nb-black/30" aria-hidden="true" />
                </div>
                <span className="text-3xl font-black font-mono">{value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Search */}
        {jobs.length > 3 && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-nb-black/40" aria-hidden="true" />
            <input
              className="w-full pl-10 pr-4 py-2.5 border-2 border-nb-black text-sm focus:outline-none focus:ring-2 focus:ring-nb-yellow"
              style={{ borderRadius: '6px' }}
              placeholder="Search jobs..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        )}

        {/* Job list */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 animate-pulse bg-nb-black/8 border-2 border-nb-black/15" style={{ borderRadius: '6px' }} />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="space-y-3">
            {filtered.map(job => (
              <JobRow key={job._id} job={job} onDelete={id => setJobs(prev => prev.filter(j => j._id !== id))} />
            ))}
          </div>
        ) : jobs.length === 0 ? (
          /* Empty state */
          <div
            className="bg-white border-2 border-nb-black p-12 text-center"
            style={{ borderRadius: '8px', boxShadow: '4px 4px 0 #111111' }}
          >
            <div className="w-16 h-16 bg-nb-yellow border-2 border-nb-black flex items-center justify-center mx-auto mb-4" style={{ borderRadius: '10px' }}>
              <Briefcase className="w-8 h-8" aria-hidden="true" />
            </div>
            <h3 className="font-black text-lg uppercase tracking-wide mb-2">No Jobs Yet</h3>
            <p className="text-sm text-nb-black/50 mb-6 max-w-xs mx-auto">
              Add your first job to start tracking your readiness, ATS score, and preparation.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-nb-black text-nb-yellow border-2 border-nb-black font-black text-sm uppercase tracking-wide hover:bg-nb-black/80 transition-colors"
              style={{ borderRadius: '6px', boxShadow: '3px 3px 0 #FFD93D' }}
            >
              <Plus className="w-4 h-4" />
              Add First Job
            </button>
          </div>
        ) : (
          <p className="text-center text-nb-black/40 py-8 font-bold">No jobs match your search.</p>
        )}

      </div>
    </DashboardLayout>
  );
};

export default JobDashboard;
