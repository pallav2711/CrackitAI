import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquare, Mic, Briefcase, Code, Users,
  TrendingUp, Award, Clock, ArrowRight, Play,
  BarChart3, CheckCircle, Loader2, X,
} from 'lucide-react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { interviewService } from '../services/interviewService';

/* ─── Data ────────────────────────────────────────────────────────────────── */
const INTERVIEW_TYPES = [
  {
    id:          'hr',
    title:       'HR Interview',
    description: 'Behavioral questions, culture fit, career story',
    icon:        Users,
    features:    ['Tell me about yourself', 'Strengths & weaknesses', 'Career goals'],
  },
  {
    id:          'technical',
    title:       'Technical Interview',
    description: 'DSA, system design, CS fundamentals',
    icon:        Code,
    features:    ['Coding concepts', 'System design', 'Problem solving'],
  },
  {
    id:          'behavioral',
    title:       'Behavioral Interview',
    description: 'STAR-method situational questions',
    icon:        MessageSquare,
    features:    ['Leadership', 'Teamwork', 'Conflict resolution'],
  },
];

const MODES = [
  { id: 'text',  name: 'Text',  icon: MessageSquare, description: 'Type your answers' },
  { id: 'voice', name: 'Voice', icon: Mic,           description: 'Speak your answers' },
];

const ROLES = [
  'Software Engineer', 'Frontend Developer', 'Backend Developer',
  'Full Stack Developer', 'Data Scientist / ML Engineer', 'Product Manager',
  'Business Analyst', 'DevOps Engineer', 'QA Engineer', 'Other (custom)',
];

/* ─── Score level helper ──────────────────────────────────────────────────── */
const scoreLevel = (s) => {
  if (s >= 90) return { label: 'Excellent', bg: 'bg-nb-green', text: 'text-white' };
  if (s >= 75) return { label: 'Good',      bg: 'bg-nb-blue',  text: 'text-white' };
  if (s >= 60) return { label: 'Average',   bg: 'bg-nb-yellow',text: 'text-nb-black' };
  return                { label: 'Needs work',bg: 'bg-nb-red', text: 'text-white' };
};

/* ─── Chip selector ───────────────────────────────────────────────────────── */
const Chip = ({ selected, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    className={`border-2 border-nb-black px-4 py-2 text-sm font-bold tracking-wide transition-all duration-75 ${
      selected
        ? 'bg-nb-yellow text-nb-black'
        : 'bg-white text-nb-black/70 hover:bg-nb-yellow/25'
    }`}
    style={{
      borderRadius: '4px',
      boxShadow: selected ? '2px 2px 0 #111111' : '1px 1px 0 #111111',
    }}
  >
    {children}
  </button>
);

/* ─── Setup modal ─────────────────────────────────────────────────────────── */
const SetupModal = ({ type, onClose, onSubmit, loading }) => {
  const [form, setForm] = useState({
    role: 'Software Engineer',
    customRole: '',
    experience: 'fresher',
    difficulty: 'medium',
    questionCount: 5,
    mode: 'text',
    type,
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = () => {
    if (!form.role.trim()) return;
    const role = form.role === 'Other (custom)' ? form.customRole.trim() || 'Software Engineer' : form.role;
    onSubmit({ ...form, role });
  };

  return (
    <div
      className="fixed inset-0 bg-nb-black/70 flex items-end sm:items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Setup interview"
    >
      <div
        className="bg-white border-3 border-nb-black w-full max-w-lg max-h-[90vh] overflow-y-auto"
        style={{ borderRadius: '8px', boxShadow: '8px 8px 0 #111111' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b-3 border-nb-black px-6 py-4 bg-nb-black sticky top-0">
          <h2
            className="font-bold uppercase text-white"
            style={{ fontFamily: 'var(--font-display)', fontSize: '1.125rem', letterSpacing: '-0.02em' }}
          >
            Setup {type} interview
          </h2>
          <button
            onClick={onClose}
            className="text-white/50 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Role */}
          <div>
            <label className="nb-label" htmlFor="setup-role">Target role *</label>
            <select
              id="setup-role"
              value={form.role}
              onChange={e => set('role', e.target.value)}
              className="nb-input"
            >
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            {form.role === 'Other (custom)' && (
              <input
                type="text"
                value={form.customRole}
                onChange={e => set('customRole', e.target.value)}
                placeholder="Type your role…"
                className="nb-input mt-2"
              />
            )}
          </div>

          {/* Experience */}
          <div>
            <label className="nb-label">Experience level</label>
            <div className="flex flex-wrap gap-2">
              {['fresher', 'junior', 'mid', 'senior'].map(l => (
                <Chip key={l} selected={form.experience === l} onClick={() => set('experience', l)}>
                  {l}
                </Chip>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div>
            <label className="nb-label">Difficulty</label>
            <div className="flex gap-2">
              {['easy', 'medium', 'hard'].map(d => (
                <Chip key={d} selected={form.difficulty === d} onClick={() => set('difficulty', d)}>
                  {d}
                </Chip>
              ))}
            </div>
          </div>

          {/* Questions */}
          <div>
            <label className="nb-label" htmlFor="q-count">
              Questions: <span className="font-mono">{form.questionCount}</span>
            </label>
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-nb-black/50">3</span>
              <input
                id="q-count"
                type="range" min="3" max="10"
                value={form.questionCount}
                onChange={e => set('questionCount', +e.target.value)}
                className="flex-1 accent-nb-black"
              />
              <span className="text-xs font-mono text-nb-black/50">10</span>
            </div>
          </div>

          {/* Mode */}
          <div>
            <label className="nb-label">Mode</label>
            <div className="grid grid-cols-2 gap-3">
              {MODES.map(({ id, name, icon: Icon, description }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => set('mode', id)}
                  className={`border-2 border-nb-black p-4 flex flex-col items-center gap-2 text-center transition-all ${
                    form.mode === id ? 'bg-nb-yellow' : 'bg-white hover:bg-nb-yellow/20'
                  }`}
                  style={{ borderRadius: '6px', boxShadow: form.mode === id ? '3px 3px 0 #111111' : '2px 2px 0 #111111' }}
                >
                  <Icon className="w-5 h-5" aria-hidden="true" />
                  <span className="font-bold text-sm">{name}</span>
                  <span className="text-xs text-nb-black/55">{description}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t-2 border-nb-black bg-[#F5F1E8]">
          <button onClick={onClose} className="btn btn-secondary flex-1 justify-center">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || (form.role === 'Other (custom)' && !form.customRole.trim())}
            className="btn btn-black flex-1 justify-center"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            ) : (
              <>
                <Play className="w-4 h-4" aria-hidden="true" />
                Start interview
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── Page ────────────────────────────────────────────────────────────────── */
const MockInterview = () => {
  const navigate              = useNavigate();
  const [stats, setStats]     = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [setupType, setSetupType] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [s, h] = await Promise.all([
          interviewService.getStats().catch(() => null),
          interviewService.getHistory().catch(() => []),
        ]);
        setStats(s);
        setHistory(Array.isArray(h) ? h : []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleStart = (type) => setSetupType(type);

  const handleCreate = async (formData) => {
    setStarting(true);
    try {
      const interview = await interviewService.createInterview(formData);
      navigate(`/interview/${interview._id}`);
    } catch (err) {
      console.error('Failed to create interview:', err);
    } finally {
      setStarting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl space-y-8">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="border-b-3 border-nb-black pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-nb-black/45 mb-1">Text-based</p>
            <h1
              className="font-bold tracking-tight leading-none"
              style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', letterSpacing: '-0.03em' }}
            >
              Mock Interview
            </h1>
            <p className="text-sm font-medium text-nb-black/55 mt-2">
              Type your answers. AI evaluates each response immediately.
            </p>
          </div>
        </div>

        {/* ── Stats (if any) ───────────────────────────────────────────────── */}
        {stats && stats.totalInterviews > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Total',     value: stats.totalInterviews, icon: Briefcase },
              { label: 'Avg score', value: `${stats.averageScore}%`, icon: TrendingUp },
              { label: 'Best',      value: `${stats.highestScore}%`, icon: Award },
              { label: 'Improve',   value: `${stats.recentImprovement >= 0 ? '+' : ''}${stats.recentImprovement}%`, icon: BarChart3 },
            ].map(({ label, value, icon: Icon }) => (
              <div
                key={label}
                className="border-2 border-nb-black bg-white p-4 flex flex-col gap-2"
                style={{ borderRadius: '6px', boxShadow: '3px 3px 0 #111111' }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-nb-black/45">{label}</span>
                  <Icon className="w-4 h-4 text-nb-black/40" aria-hidden="true" />
                </div>
                <span
                  className="font-black leading-none"
                  style={{ fontFamily: 'var(--font-mono)', fontSize: '1.5rem' }}
                >
                  {value}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* ── Interview type cards ─────────────────────────────────────────── */}
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-nb-black/45 mb-4">
            Choose interview type
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            {INTERVIEW_TYPES.map(({ id, title, description, icon: Icon, features }) => (
              <button
                key={id}
                onClick={() => handleStart(id)}
                className="border-2 border-nb-black bg-white p-6 text-left flex flex-col gap-4 group hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-100"
                style={{ borderRadius: '8px', boxShadow: '4px 4px 0 #111111' }}
              >
                <div className="flex items-start justify-between">
                  <div
                    className="w-11 h-11 bg-nb-black border-2 border-nb-black flex items-center justify-center"
                    style={{ borderRadius: '6px' }}
                    aria-hidden="true"
                  >
                    <Icon className="w-5 h-5 text-nb-yellow" />
                  </div>
                  <span
                    className="text-[9px] font-black tracking-widest uppercase px-2 py-0.5 bg-[#F5F1E8] border-2 border-nb-black"
                    style={{ borderRadius: '2px' }}
                    aria-label="AI powered"
                  >
                    AI
                  </span>
                </div>

                <div>
                  <h3
                    className="font-bold text-base mb-1.5"
                    style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}
                  >
                    {title}
                  </h3>
                  <p className="text-sm text-nb-black/55 leading-relaxed">{description}</p>
                </div>

                <ul className="space-y-1.5 mt-auto">
                  {features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-xs font-medium text-nb-black/60">
                      <CheckCircle className="w-3.5 h-3.5 text-nb-green flex-shrink-0" aria-hidden="true" />
                      {f}
                    </li>
                  ))}
                </ul>

                <div className="flex items-center justify-between border-t-2 border-nb-black/10 pt-3 mt-1">
                  <span className="text-xs font-bold uppercase tracking-wide text-nb-black/40">Select type</span>
                  <ArrowRight
                    className="w-4 h-4 text-nb-black/30 group-hover:text-nb-black group-hover:translate-x-0.5 transition-all"
                    aria-hidden="true"
                  />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ── Recent history ───────────────────────────────────────────────── */}
        {history.length > 0 && (
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-nb-black/45 mb-4">
              Recent interviews
            </p>
            <div
              className="border-2 border-nb-black bg-white overflow-hidden"
              style={{ borderRadius: '8px', boxShadow: '4px 4px 0 #111111' }}
            >
              {history.slice(0, 5).map((interview, i) => {
                const lvl = scoreLevel(interview.overallScore);
                return (
                  <button
                    key={interview._id}
                    onClick={() => navigate(`/interview-results/${interview._id}`)}
                    className={`w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-nb-yellow/10 transition-colors ${
                      i < history.slice(0, 5).length - 1 ? 'border-b-2 border-nb-black/10' : ''
                    }`}
                  >
                    <div
                      className="w-9 h-9 bg-[#F5F1E8] border-2 border-nb-black flex items-center justify-center flex-shrink-0"
                      style={{ borderRadius: '5px' }}
                      aria-hidden="true"
                    >
                      {interview.type === 'hr' && <Users className="w-4 h-4" />}
                      {interview.type === 'technical' && <Code className="w-4 h-4" />}
                      {interview.type === 'behavioral' && <MessageSquare className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate">{interview.role}</p>
                      <p className="text-xs text-nb-black/45 capitalize">
                        {interview.type} · {new Date(interview.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p
                        className="font-black leading-none"
                        style={{ fontFamily: 'var(--font-mono)', fontSize: '1.25rem' }}
                      >
                        {interview.overallScore}%
                      </p>
                      <span
                        className={`text-[10px] font-black px-1.5 py-0.5 border-2 border-nb-black ${lvl.bg} ${lvl.text} uppercase`}
                        style={{ borderRadius: '2px' }}
                      >
                        {lvl.label}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Voice interview CTA */}
        <div
          className="bg-nb-yellow border-2 border-nb-black p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          style={{ borderRadius: '8px', boxShadow: '4px 4px 0 #111111' }}
        >
          <div>
            <p className="text-[11px] font-black uppercase tracking-widest text-nb-black/55 mb-1">Want to speak?</p>
            <h3
              className="font-bold"
              style={{ fontFamily: 'var(--font-display)', fontSize: '1.125rem' }}
            >
              Try voice interview for better practice
            </h3>
            <p className="text-sm text-nb-black/60 mt-0.5">Answering out loud matches how a real interview feels.</p>
          </div>
          <button
            onClick={() => navigate('/interview/setup')}
            className="btn btn-black flex-shrink-0"
          >
            <Mic className="w-4 h-4" aria-hidden="true" />
            Voice setup →
          </button>
        </div>

      </div>

      {/* Setup modal */}
      {setupType && (
        <SetupModal
          type={setupType}
          onClose={() => setSetupType(null)}
          onSubmit={handleCreate}
          loading={starting}
        />
      )}
    </DashboardLayout>
  );
};

export default MockInterview;
