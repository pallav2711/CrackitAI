/**
 * JD Matcher Dashboard — /jobs
 * Lists all job workspaces. Create new ones via modal.
 */
import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus, Briefcase, Target, TrendingUp, Trash2,
  ChevronRight, Search, Loader2, HelpCircle, FileText,
} from 'lucide-react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import api from '../services/api';
import toast from 'react-hot-toast';

/* ── Helpers ─────────────────────────────────────────────────────────────── */
const scoreColor = (s) =>
  s == null     ? 'bg-white text-nb-black/30 border-nb-black/20'
  : s >= 80     ? 'bg-green-100 text-green-800 border-green-300'
  : s >= 60     ? 'bg-nb-yellow text-nb-black border-nb-black'
  : s >= 40     ? 'bg-orange-100 text-orange-700 border-orange-300'
  :               'bg-red-100 text-red-700 border-red-300';

const statusLabel = { analyzing: 'Analyzing', ready: 'Ready', preparing: 'Preparing', applied: 'Applied' };
const statusColor  = { analyzing: 'bg-blue-100 text-blue-700', ready: 'bg-green-100 text-green-700', preparing: 'bg-nb-yellow text-nb-black', applied: 'bg-purple-100 text-purple-700' };

/* ── Job card ────────────────────────────────────────────────────────────── */
function JobCard({ job, onDelete }) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async (e) => {
    e.preventDefault();
    if (!window.confirm(`Delete "${job.title}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await api.delete(`/jobs/${job._id}`);
      onDelete(job._id);
      toast.success('Job deleted');
    } catch {
      toast.error('Delete failed');
      setDeleting(false);
    }
  };

  return (
    <Link
      to={`/workspace/${job._id}`}
      className="bg-white border-2 border-nb-black p-5 flex flex-col gap-4 group hover:-translate-x-0.5 hover:-translate-y-0.5 transition-transform duration-100 relative"
      style={{ borderRadius: '8px', boxShadow: '4px 4px 0 #111111' }}
    >
      {/* Delete */}
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="absolute top-3 right-3 w-7 h-7 border-2 border-nb-black/20 text-nb-black/30 hover:border-nb-red hover:text-nb-red flex items-center justify-center transition-colors z-10"
        style={{ borderRadius: '4px' }}
        aria-label="Delete job"
      >
        {deleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
      </button>

      <div className="pr-8">
        <p className="font-black text-sm uppercase tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>{job.title}</p>
        <p className="text-xs text-nb-black/45 font-mono mt-0.5">{job.company || 'No company'}</p>
      </div>

      {/* Scores */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`text-[10px] font-black px-2 py-0.5 border-2 font-mono ${scoreColor(job.atsScore)}`} style={{ borderRadius: '3px' }}>
          ATS {job.atsScore != null ? `${job.atsScore}%` : '—'}
        </span>
        <span className={`text-[10px] font-black px-2 py-0.5 border-2 font-mono ${scoreColor(job.readinessScore)}`} style={{ borderRadius: '3px' }}>
          Ready {job.readinessScore != null ? `${job.readinessScore}%` : '—'}
        </span>
        <span className={`text-[10px] font-black px-2 py-0.5 border-2 border-nb-black ${statusColor[job.status] || 'bg-white text-nb-black'}`} style={{ borderRadius: '3px' }}>
          {statusLabel[job.status] || job.status}
        </span>
      </div>

      {/* Progress pills */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {[
          { key: 'atsScore',       label: 'ATS',    icon: Target },
          { key: 'skillGap',       label: 'Skills', icon: TrendingUp },
          { key: 'tailoredResume', label: 'Tailor', icon: FileText },
          { key: 'coverLetter',    label: 'Letter', icon: FileText },
          { key: 'quiz',           label: 'Quiz',   icon: HelpCircle },
        ].map(({ key, label }) => {
          const done = key === 'atsScore'
            ? job.atsScore != null
            : key === 'skillGap'
            ? job.skillGap?.missing?.length >= 0
            : key === 'tailoredResume'
            ? !!job.tailoredResume?.text
            : key === 'coverLetter'
            ? !!job.coverLetter?.text
            : key === 'quiz'
            ? job.quiz?.questions?.length > 0
            : false;
          return (
            <span
              key={key}
              className={`text-[9px] font-black uppercase tracking-wide px-1.5 py-0.5 border border-nb-black/20 ${done ? 'bg-nb-yellow text-nb-black border-nb-black' : 'bg-white text-nb-black/30'}`}
              style={{ borderRadius: '2px' }}
            >
              {label}
            </span>
          );
        })}
      </div>

      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono text-nb-black/30">
          {new Date(job.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
        </span>
        <ChevronRight className="w-4 h-4 text-nb-black/20 group-hover:text-nb-black transition-colors" />
      </div>
    </Link>
  );
}

/* ── Add Job Modal ───────────────────────────────────────────────────────── */
function AddJobModal({ onClose, onCreated }) {
  const [form, setForm]       = useState({ title: '', company: '', jobDescription: '' });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.jobDescription.trim()) {
      toast.error('Job title and description are required.');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post('/jobs', {
        title:          form.title.trim(),
        company:        form.company.trim(),
        jobDescription: form.jobDescription.trim(),
      });
      toast.success('Job created!');
      onCreated(data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create job');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-nb-black/60" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white border-2 border-nb-black w-full max-w-lg" style={{ borderRadius: '8px', boxShadow: '6px 6px 0 #111111' }}>
        <div className="flex items-center justify-between p-5 border-b-2 border-nb-black">
          <h2 className="font-black text-sm uppercase tracking-widest" style={{ fontFamily: 'var(--font-display)' }}>
            Add New Job
          </h2>
          <button onClick={onClose} className="text-nb-black/40 hover:text-nb-black text-lg leading-none">×</button>
        </div>
        <form onSubmit={submit} className="p-5 space-y-4">
          <div>
            <label className="nb-label">Job Title *</label>
            <input
              className="nb-input"
              placeholder="e.g. Senior Backend Engineer"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="nb-label">Company</label>
            <input
              className="nb-input"
              placeholder="e.g. Google (optional)"
              value={form.company}
              onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
            />
          </div>
          <div>
            <label className="nb-label">Job Description *</label>
            <textarea
              className="nb-input min-h-[160px] resize-y"
              placeholder="Paste the full job description here…"
              value={form.jobDescription}
              onChange={e => setForm(f => ({ ...f, jobDescription: e.target.value }))}
              required
            />
            <p className="text-[10px] text-nb-black/35 mt-1">
              {form.jobDescription.length} chars — paste the complete JD for best results
            </p>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn btn-ghost flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn btn-primary flex-1">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4" /> Create</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────────────────────── */
export default function JobDashboard() {
  const navigate              = useNavigate();
  const [jobs, setJobs]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]     = useState(false);
  const [search, setSearch]   = useState('');

  useEffect(() => {
    api.get('/jobs')
      .then(r => setJobs(r.data?.data || []))
      .catch(() => toast.error('Failed to load jobs'))
      .finally(() => setLoading(false));
  }, []);

  const handleCreated = useCallback((job) => {
    setModal(false);
    setJobs(prev => [job, ...prev]);
    navigate(`/workspace/${job._id}`);
  }, [navigate]);

  const handleDelete = useCallback((id) => {
    setJobs(prev => prev.filter(j => j._id !== id));
  }, []);

  const filtered = search.trim()
    ? jobs.filter(j =>
        j.title.toLowerCase().includes(search.toLowerCase()) ||
        (j.company || '').toLowerCase().includes(search.toLowerCase())
      )
    : jobs;

  return (
    <DashboardLayout>
      <div className="max-w-6xl space-y-8">

        {/* Header */}
        <div className="border-b-3 border-nb-black pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-nb-black/45 mb-1">Job Readiness</p>
            <h1 className="font-bold text-nb-black" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.75rem,4vw,2.5rem)', letterSpacing: '-0.03em' }}>
              JD Matcher
            </h1>
            <p className="text-sm text-nb-black/50 mt-1">ATS score · Skill gap · Resume tailoring · Cover letter · Quiz</p>
          </div>
          <button onClick={() => setModal(true)} className="btn btn-primary btn-lg self-start sm:self-auto">
            <Plus className="w-5 h-5" /> Add New Job
          </button>
        </div>

        {/* Stats row */}
        {jobs.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Jobs tracked', value: jobs.length },
              { label: 'Avg ATS',      value: (() => { const s = jobs.filter(j => j.atsScore != null); return s.length ? `${Math.round(s.reduce((a, j) => a + j.atsScore, 0) / s.length)}%` : '—'; })() },
              { label: 'Quizzes done', value: jobs.filter(j => j.quiz?.completedAt).length },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white border-2 border-nb-black p-4 text-center" style={{ borderRadius: '6px', boxShadow: '3px 3px 0 #111' }}>
                <p className="text-2xl font-black font-mono">{value}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-nb-black/45 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Search */}
        {jobs.length > 3 && (
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-nb-black/35" />
            <input
              className="nb-input pl-9"
              placeholder="Search jobs…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1,2,3].map(i => (
              <div key={i} className="h-52 animate-pulse bg-nb-black/8 border-2 border-nb-black/15" style={{ borderRadius: '8px' }} />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(job => (
              <JobCard key={job._id} job={job} onDelete={handleDelete} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 space-y-4">
            <div className="w-16 h-16 bg-nb-yellow border-2 border-nb-black flex items-center justify-center mx-auto" style={{ borderRadius: '8px', boxShadow: '3px 3px 0 #111' }}>
              <Briefcase className="w-8 h-8" />
            </div>
            <p className="font-black text-lg uppercase" style={{ fontFamily: 'var(--font-display)' }}>
              {search ? 'No results found' : 'No jobs yet'}
            </p>
            <p className="text-sm text-nb-black/50 max-w-sm mx-auto leading-relaxed">
              {search
                ? `No jobs match "${search}"`
                : 'Add your first job to get your ATS score, skill gap, tailored resume, cover letter, and an interview quiz.'}
            </p>
            {!search && (
              <button onClick={() => setModal(true)} className="btn btn-primary">
                <Plus className="w-4 h-4" /> Add First Job
              </button>
            )}
          </div>
        )}
      </div>

      {modal && <AddJobModal onClose={() => setModal(false)} onCreated={handleCreated} />}
    </DashboardLayout>
  );
}
