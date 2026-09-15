/**
 * Job Workspace — /workspace/:id
 * 7-tab workspace: Overview, Resume, ATS Score, Skill Gap, Tailor Resume, Cover Letter, Quiz
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard, Upload, Target, TrendingUp, FileText,
  BookOpen, HelpCircle, Loader2, CheckCircle, AlertCircle,
  Copy, RefreshCw, ArrowRight, ChevronLeft, Zap, Download,
} from 'lucide-react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import api from '../services/api';
import toast from 'react-hot-toast';

/* ── Tab config ──────────────────────────────────────────────────────────── */
const TABS = [
  { id: 'overview',     label: 'Overview',       icon: LayoutDashboard },
  { id: 'resume',       label: 'Resume',          icon: Upload          },
  { id: 'ats',          label: 'ATS Score',       icon: Target          },
  { id: 'skills',       label: 'Skill Gap',       icon: TrendingUp      },
  { id: 'tailor',       label: 'Tailor Resume',   icon: FileText        },
  { id: 'coverletter',  label: 'Cover Letter',    icon: BookOpen        },
  { id: 'quiz',         label: 'Quiz',            icon: HelpCircle      },
];

/* ── Small helpers ───────────────────────────────────────────────────────── */
const scoreColor = (s) =>
  s == null ? '' : s >= 80 ? 'text-green-700' : s >= 60 ? 'text-amber-700' : 'text-red-700';

const ScoreRing = ({ score, label, size = 80 }) => {
  const r   = (size / 2) - 8;
  const circ = 2 * Math.PI * r;
  const pct  = score != null ? Math.min(score, 100) / 100 : 0;
  const dash = circ * pct;
  const color = score == null ? '#ddd' : score >= 80 ? '#1A7A4A' : score >= 60 ? '#D97706' : '#DC2626';
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e5e7eb" strokeWidth="6" />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
        <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle"
          style={{ transform: 'rotate(90deg)', transformOrigin: '50% 50%', fontSize: size < 70 ? 14 : 18, fontWeight: 900, fill: color, fontFamily: 'var(--font-mono)' }}>
          {score != null ? score : '—'}
        </text>
      </svg>
      <span className="text-[10px] font-black uppercase tracking-widest text-nb-black/45">{label}</span>
    </div>
  );
};

const ActionBtn = ({ onClick, loading, disabled, children, variant = 'primary' }) => (
  <button
    onClick={onClick}
    disabled={loading || disabled}
    className={`btn ${variant === 'primary' ? 'btn-primary' : 'btn-ghost'} ${loading || disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
  >
    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : children}
  </button>
);

const CopyBtn = ({ text }) => {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="btn btn-ghost btn-sm"
    >
      {copied ? <><CheckCircle className="w-3.5 h-3.5" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
    </button>
  );
};

/* ── Tab: Overview ───────────────────────────────────────────────────────── */
function OverviewTab({ job, onTabChange }) {
  const steps = [
    { id: 'resume',      label: 'Resume uploaded',   done: !!job.resumeText },
    { id: 'ats',         label: 'ATS score run',      done: job.atsScore != null },
    { id: 'skills',      label: 'Skill gap done',     done: !!job.skillGap?.missing },
    { id: 'tailor',      label: 'Resume tailored',    done: !!job.tailoredResume?.text },
    { id: 'coverletter', label: 'Cover letter done',  done: !!job.coverLetter?.text },
    { id: 'quiz',        label: 'Quiz generated',     done: job.quiz?.questions?.length > 0 },
  ];
  const completed = steps.filter(s => s.done).length;

  return (
    <div className="space-y-6">
      <div className="bg-white border-2 border-nb-black p-6" style={{ borderRadius: '8px', boxShadow: '4px 4px 0 #111' }}>
        <p className="text-[11px] font-black uppercase tracking-widest text-nb-black/45 mb-4">Scores</p>
        <div className="flex flex-wrap gap-8">
          <ScoreRing score={job.atsScore}       label="ATS Match"    />
          <ScoreRing score={job.readinessScore} label="Job Readiness"/>
          {job.quiz?.score != null && <ScoreRing score={Math.round((job.quiz.score / job.quiz.totalQuestions) * 100)} label="Quiz Score" />}
        </div>
      </div>

      <div className="bg-white border-2 border-nb-black p-6" style={{ borderRadius: '8px', boxShadow: '4px 4px 0 #111' }}>
        <p className="text-[11px] font-black uppercase tracking-widest text-nb-black/45 mb-4">
          Progress — {completed}/{steps.length} complete
        </p>
        <div className="space-y-2">
          {steps.map(({ id, label, done }) => (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className="w-full flex items-center gap-3 py-2.5 px-3 border-2 border-nb-black/10 hover:border-nb-black hover:bg-nb-yellow/10 transition-colors text-left"
              style={{ borderRadius: '6px' }}
            >
              {done
                ? <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                : <div className="w-4 h-4 border-2 border-nb-black/30 rounded-full flex-shrink-0" />}
              <span className={`text-sm font-bold ${done ? 'line-through text-nb-black/40' : 'text-nb-black'}`}>{label}</span>
              <ArrowRight className="w-3.5 h-3.5 text-nb-black/20 ml-auto" />
            </button>
          ))}
        </div>
      </div>

      {job.atsRecommendations?.length > 0 && (
        <div className="bg-nb-yellow border-2 border-nb-black p-5" style={{ borderRadius: '8px', boxShadow: '3px 3px 0 #111' }}>
          <p className="text-[11px] font-black uppercase tracking-widest mb-3">Top Recommendations</p>
          <ul className="space-y-1.5">
            {job.atsRecommendations.slice(0, 4).map((r, i) => (
              <li key={i} className="flex gap-2 text-sm"><span className="font-black">→</span>{r}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/* ── Tab: Resume Upload ──────────────────────────────────────────────────── */
function ResumeTab({ job, onJobUpdate }) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['pdf', 'doc', 'docx'].includes(ext)) {
      toast.error('Only PDF, DOC, DOCX supported'); return;
    }
    setUploading(true);
    const fd = new FormData();
    fd.append('resume', file);
    try {
      const { data } = await api.post(`/jobs/${job._id}/upload-resume`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000,
      });
      onJobUpdate(data.data);
      toast.success('Resume uploaded and parsed!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally { setUploading(false); }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div
        className="border-2 border-dashed border-nb-black p-12 text-center cursor-pointer hover:bg-nb-yellow/10 transition-colors"
        style={{ borderRadius: '8px' }}
        onClick={() => fileRef.current?.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
      >
        <input ref={fileRef} type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={e => handleFile(e.target.files[0])} />
        {uploading
          ? <><Loader2 className="w-10 h-10 animate-spin mx-auto mb-3 text-nb-black/40" /><p className="font-bold text-sm">Parsing resume…</p></>
          : <>
              <Upload className="w-10 h-10 mx-auto mb-3 text-nb-black/30" />
              <p className="font-black text-sm uppercase tracking-wide">Drop resume here or click to upload</p>
              <p className="text-xs text-nb-black/40 mt-1">PDF, DOC, DOCX — max 5 MB</p>
            </>}
      </div>

      {job.parsedResume?.name && (
        <div className="bg-white border-2 border-nb-black p-5 space-y-4" style={{ borderRadius: '8px', boxShadow: '3px 3px 0 #111' }}>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <p className="font-black text-sm uppercase tracking-wide">Resume Parsed</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            <div><span className="font-black text-nb-black/40 text-xs uppercase tracking-wide">Name</span><p className="font-bold mt-0.5">{job.parsedResume.name}</p></div>
            <div><span className="font-black text-nb-black/40 text-xs uppercase tracking-wide">Email</span><p className="font-bold mt-0.5">{job.parsedResume.email || '—'}</p></div>
            <div><span className="font-black text-nb-black/40 text-xs uppercase tracking-wide">Skills found</span><p className="font-bold mt-0.5">{job.parsedResume.skills?.length || 0}</p></div>
            <div><span className="font-black text-nb-black/40 text-xs uppercase tracking-wide">Experience entries</span><p className="font-bold mt-0.5">{job.parsedResume.experience?.length || 0}</p></div>
          </div>
          {job.parsedResume.skills?.length > 0 && (
            <div>
              <span className="font-black text-nb-black/40 text-xs uppercase tracking-wide">Skills</span>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {job.parsedResume.skills.slice(0, 20).map(s => (
                  <span key={s} className="text-[11px] font-bold px-2 py-0.5 bg-[#F5F1E8] border-2 border-nb-black/20" style={{ borderRadius: '3px' }}>{s}</span>
                ))}
                {job.parsedResume.skills.length > 20 && <span className="text-[11px] text-nb-black/40">+{job.parsedResume.skills.length - 20} more</span>}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Tab: ATS Score ──────────────────────────────────────────────────────── */
function ATSTab({ job, onJobUpdate }) {
  const [loading, setLoading] = useState(false);

  const run = async () => {
    if (!job.resumeText) { toast.error('Upload your resume first.'); return; }
    if (!job.jobDescription) { toast.error('No job description found.'); return; }
    setLoading(true);
    try {
      const { data } = await api.post(`/jobs/${job._id}/ats-score`);
      onJobUpdate(data.data);
      toast.success('ATS score calculated!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  if (!job.atsScore && job.atsScore !== 0) return (
    <div className="max-w-md space-y-4">
      <p className="text-sm text-nb-black/60">Upload your resume first, then calculate your ATS match score against the job description.</p>
      <ActionBtn onClick={run} loading={loading} disabled={!job.resumeText}>
        <Target className="w-4 h-4" /> Calculate ATS Score
      </ActionBtn>
    </div>
  );

  const breakdown = job.atsBreakdown || {};
  return (
    <div className="space-y-6 max-w-2xl">
      {/* Score hero */}
      <div className="bg-white border-2 border-nb-black p-6 flex items-center gap-6" style={{ borderRadius: '8px', boxShadow: '4px 4px 0 #111' }}>
        <ScoreRing score={job.atsScore} label="ATS Match" size={100} />
        <div className="flex-1 space-y-1">
          <p className={`text-3xl font-black font-mono ${scoreColor(job.atsScore)}`}>{job.atsScore}/100</p>
          <p className="text-sm text-nb-black/55">
            {job.atsScore >= 80 ? 'Strong match — great chances of passing ATS.'
             : job.atsScore >= 60 ? 'Moderate match — some gaps to address.'
             : 'Weak match — significant gaps identified.'}
          </p>
          <ActionBtn onClick={run} loading={loading} variant="ghost">
            <RefreshCw className="w-3.5 h-3.5" /> Re-run
          </ActionBtn>
        </div>
      </div>

      {/* Breakdown */}
      {Object.keys(breakdown).length > 0 && (
        <div className="bg-white border-2 border-nb-black p-5" style={{ borderRadius: '8px', boxShadow: '3px 3px 0 #111' }}>
          <p className="text-[11px] font-black uppercase tracking-widest mb-4">Score Breakdown</p>
          <div className="space-y-3">
            {Object.entries(breakdown).map(([k, v]) => (
              <div key={k}>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="uppercase tracking-wide text-nb-black/60">{k.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <span className="font-mono">{v}%</span>
                </div>
                <div className="h-2.5 border-2 border-nb-black bg-[#F5F1E8]">
                  <div className="h-full bg-nb-yellow border-r-2 border-nb-black transition-all" style={{ width: `${v}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Matches / Gaps */}
      <div className="grid sm:grid-cols-2 gap-4">
        {job.atsStrongMatches?.length > 0 && (
          <div className="bg-green-50 border-2 border-green-300 p-4" style={{ borderRadius: '6px', boxShadow: '3px 3px 0 #166534' }}>
            <p className="text-[10px] font-black uppercase tracking-widest text-green-800 mb-2">Strong Matches</p>
            <ul className="space-y-1">{job.atsStrongMatches.map(m => <li key={m} className="text-xs text-green-800 flex gap-1.5"><CheckCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />{m}</li>)}</ul>
          </div>
        )}
        {job.atsMissingSkills?.length > 0 && (
          <div className="bg-red-50 border-2 border-red-300 p-4" style={{ borderRadius: '6px', boxShadow: '3px 3px 0 #991b1b' }}>
            <p className="text-[10px] font-black uppercase tracking-widest text-red-800 mb-2">Missing Skills</p>
            <ul className="space-y-1">{job.atsMissingSkills.map(m => <li key={m} className="text-xs text-red-800 flex gap-1.5"><AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />{m}</li>)}</ul>
          </div>
        )}
      </div>

      {job.atsRecommendations?.length > 0 && (
        <div className="bg-nb-yellow border-2 border-nb-black p-5" style={{ borderRadius: '6px', boxShadow: '3px 3px 0 #111' }}>
          <p className="text-[10px] font-black uppercase tracking-widest mb-3">Recommendations</p>
          <ul className="space-y-1.5">{job.atsRecommendations.map((r, i) => <li key={i} className="text-sm flex gap-2"><span className="font-black">→</span>{r}</li>)}</ul>
        </div>
      )}
    </div>
  );
}

/* ── Tab: Skill Gap ──────────────────────────────────────────────────────── */
function SkillsTab({ job, onJobUpdate }) {
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const { data } = await api.post(`/jobs/${job._id}/skill-gap`);
      onJobUpdate(data.data);
      toast.success('Skill gap analysed!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  const importanceColor = (imp) => ({
    critical: 'bg-red-100 text-red-800 border-red-300',
    high:     'bg-orange-100 text-orange-800 border-orange-300',
    medium:   'bg-nb-yellow text-nb-black border-nb-black',
    low:      'bg-gray-100 text-gray-600 border-gray-300',
  }[imp?.toLowerCase()] || 'bg-gray-100 text-gray-600 border-gray-300');

  const gap = job.skillGap;
  if (!gap?.missing && !gap?.have) return (
    <div className="max-w-md space-y-4">
      <p className="text-sm text-nb-black/60">Analyse the gap between your profile and the job requirements.</p>
      <ActionBtn onClick={run} loading={loading}><TrendingUp className="w-4 h-4" /> Analyse Skill Gap</ActionBtn>
    </div>
  );

  const Section = ({ title, color, items, showWhy }) => items?.length > 0 && (
    <div className={`border-2 border-nb-black p-5 ${color}`} style={{ borderRadius: '6px', boxShadow: '3px 3px 0 #111' }}>
      <p className="text-[10px] font-black uppercase tracking-widest mb-3">{title} ({items.length})</p>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-start gap-2">
            <span className={`text-[9px] font-black px-1.5 py-0.5 border flex-shrink-0 mt-0.5 ${importanceColor(item.importance)}`} style={{ borderRadius: '2px' }}>
              {item.importance || 'medium'}
            </span>
            <div>
              <span className="text-sm font-bold">{item.skill || item}</span>
              {showWhy && item.why && <p className="text-xs text-nb-black/50 mt-0.5">{item.why}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="flex justify-end">
        <ActionBtn onClick={run} loading={loading} variant="ghost"><RefreshCw className="w-3.5 h-3.5" /> Re-analyse</ActionBtn>
      </div>
      <Section title="✓ Already Have"    color="bg-green-50"  items={gap.have}       showWhy={false} />
      <Section title="⚠ Need to Improve" color="bg-amber-50"  items={gap.improve}    showWhy={true} />
      <Section title="✕ Missing"          color="bg-red-50"    items={gap.missing}    showWhy={true} />
      <Section title="★ Nice to Have"     color="bg-[#F5F1E8]" items={gap.niceToHave} showWhy={false} />
    </div>
  );
}

/* ── Tab: Tailor Resume ──────────────────────────────────────────────────── */
function TailorTab({ job, onJobUpdate }) {
  const [loading, setLoading] = useState(false);

  const run = async () => {
    if (!job.resumeText) { toast.error('Upload your resume first.'); return; }
    setLoading(true);
    try {
      const { data } = await api.post(`/jobs/${job._id}/tailor-resume`);
      onJobUpdate(data.data);
      toast.success('Resume tailored!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  const tailored = job.tailoredResume;
  if (!tailored?.text) return (
    <div className="max-w-md space-y-4">
      <div className="bg-nb-yellow border-2 border-nb-black p-4" style={{ borderRadius: '6px' }}>
        <p className="text-xs font-black mb-1">Honesty guarantee</p>
        <p className="text-xs text-nb-black/70">The AI improves your existing content for this JD. It will never fabricate skills, experience, companies, or certifications you don't have.</p>
      </div>
      <ActionBtn onClick={run} loading={loading} disabled={!job.resumeText}><FileText className="w-4 h-4" /> Tailor Resume</ActionBtn>
    </div>
  );

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="flex items-center gap-3">
        <ActionBtn onClick={run} loading={loading} variant="ghost"><RefreshCw className="w-3.5 h-3.5" /> Regenerate</ActionBtn>
        <CopyBtn text={tailored.text} />
      </div>

      {tailored.warnings?.length > 0 && (
        <div className="bg-amber-50 border-2 border-amber-400 p-4" style={{ borderRadius: '6px' }}>
          <p className="text-xs font-black text-amber-800 mb-1.5">Missing Skills (not added — add them yourself if accurate)</p>
          <ul className="space-y-1">
            {tailored.warnings.map((w, i) => <li key={i} className="text-xs text-amber-700 flex gap-1.5"><AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />{w}</li>)}
          </ul>
        </div>
      )}

      {tailored.changes?.length > 0 && (
        <div className="bg-white border-2 border-nb-black p-4" style={{ borderRadius: '6px', boxShadow: '3px 3px 0 #111' }}>
          <p className="text-[10px] font-black uppercase tracking-widest mb-2">Changes Made</p>
          <ul className="space-y-1">{tailored.changes.map((c, i) => <li key={i} className="text-xs text-nb-black/65 flex gap-1.5"><span className="text-green-600 font-bold">+</span>{c}</li>)}</ul>
        </div>
      )}

      <div className="bg-white border-2 border-nb-black p-5" style={{ borderRadius: '6px', boxShadow: '3px 3px 0 #111' }}>
        <p className="text-[10px] font-black uppercase tracking-widest mb-3">Tailored Resume</p>
        <pre className="text-xs leading-relaxed text-nb-black/80 whitespace-pre-wrap font-mono overflow-auto max-h-96">{tailored.text}</pre>
      </div>
    </div>
  );
}

/* ── Tab: Cover Letter ───────────────────────────────────────────────────── */
function CoverLetterTab({ job, onJobUpdate }) {
  const [loading, setLoading] = useState(false);

  const run = async () => {
    if (!job.resumeText) { toast.error('Upload your resume first.'); return; }
    setLoading(true);
    try {
      const { data } = await api.post(`/jobs/${job._id}/cover-letter`);
      onJobUpdate(data.data);
      toast.success('Cover letter generated!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  const cl = job.coverLetter;
  if (!cl?.text) return (
    <div className="max-w-md space-y-4">
      <p className="text-sm text-nb-black/60">Generate a professional, job-specific cover letter from your resume and the JD.</p>
      <ActionBtn onClick={run} loading={loading} disabled={!job.resumeText}><BookOpen className="w-4 h-4" /> Generate Cover Letter</ActionBtn>
    </div>
  );

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="flex items-center gap-3">
        <ActionBtn onClick={run} loading={loading} variant="ghost"><RefreshCw className="w-3.5 h-3.5" /> Regenerate</ActionBtn>
        <CopyBtn text={cl.text} />
      </div>
      <div className="bg-white border-2 border-nb-black p-6" style={{ borderRadius: '6px', boxShadow: '3px 3px 0 #111' }}>
        <pre className="text-sm leading-relaxed text-nb-black/80 whitespace-pre-wrap font-sans">{cl.text}</pre>
      </div>
    </div>
  );
}

/* ── Tab: Quiz ───────────────────────────────────────────────────────────── */
function QuizTab({ job, onJobUpdate, navigate }) {
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const { data } = await api.post(`/jobs/${job._id}/generate-quiz`);
      onJobUpdate(data.data);
      toast.success(`${data.data.quiz?.questions?.length || 0} questions generated!`);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  const quiz = job.quiz;
  const hasQuiz     = quiz?.questions?.length > 0;
  const hasAttempt  = quiz?.completedAt;
  const scorePercent = hasAttempt ? Math.round((quiz.score / quiz.totalQuestions) * 100) : null;

  return (
    <div className="space-y-5 max-w-xl">
      {hasQuiz ? (
        <>
          <div className="bg-white border-2 border-nb-black p-5" style={{ borderRadius: '8px', boxShadow: '4px 4px 0 #111' }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-black text-sm uppercase tracking-wide">Quiz Ready</p>
                <p className="text-xs text-nb-black/50 mt-0.5">{quiz.questions.length} questions · Technical, HR & Role-specific</p>
              </div>
              {scorePercent != null && <ScoreRing score={scorePercent} label="Last Score" size={70} />}
            </div>

            {hasAttempt && (
              <div className="border-2 border-nb-black/15 p-3 mb-4" style={{ borderRadius: '6px' }}>
                <p className="text-[10px] font-black uppercase tracking-widest text-nb-black/40 mb-2">Last Attempt</p>
                <div className="flex gap-4 flex-wrap text-sm">
                  <span><span className="font-black">{quiz.score}</span>/{quiz.totalQuestions} correct</span>
                  {quiz.categoryScores && Object.entries(quiz.categoryScores).map(([k, v]) => (
                    <span key={k} className="text-nb-black/50">{k}: {v}%</span>
                  ))}
                </div>
                {quiz.weakAreas?.length > 0 && (
                  <div className="mt-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-nb-black/40">Weak Areas: </span>
                    {quiz.weakAreas.map(a => <span key={a} className="text-xs mr-1.5 text-red-600 font-bold">{a}</span>)}
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-3 flex-wrap">
              <button onClick={() => navigate(`/quiz/${job._id}`)} className="btn btn-primary">
                <HelpCircle className="w-4 h-4" />
                {hasAttempt ? 'Retake Quiz' : 'Start Quiz'}
              </button>
              <ActionBtn onClick={generate} loading={loading} variant="ghost">
                <RefreshCw className="w-3.5 h-3.5" /> Regenerate
              </ActionBtn>
            </div>
          </div>
        </>
      ) : (
        <>
          <p className="text-sm text-nb-black/60">Generate a 30–40 question AI quiz tailored to this job description. Covers technical, HR, and role-specific topics.</p>
          <ActionBtn onClick={generate} loading={loading}><Zap className="w-4 h-4" /> Generate Quiz</ActionBtn>
        </>
      )}
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────────────────────── */
export default function JobWorkspace() {
  const { id }           = useParams();
  const navigate         = useNavigate();
  const [job, setJob]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab]    = useState('overview');

  useEffect(() => {
    api.get(`/jobs/${id}`)
      .then(r => setJob(r.data?.data || r.data?.job))
      .catch(() => { toast.error('Job not found'); navigate('/jobs'); })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleJobUpdate = useCallback((updated) => {
    setJob(prev => ({ ...prev, ...updated }));
  }, []);

  if (loading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-nb-black/30" />
      </div>
    </DashboardLayout>
  );

  if (!job) return null;

  const tabContent = {
    overview:    <OverviewTab      job={job} onTabChange={setTab} />,
    resume:      <ResumeTab        job={job} onJobUpdate={handleJobUpdate} />,
    ats:         <ATSTab           job={job} onJobUpdate={handleJobUpdate} />,
    skills:      <SkillsTab        job={job} onJobUpdate={handleJobUpdate} />,
    tailor:      <TailorTab        job={job} onJobUpdate={handleJobUpdate} />,
    coverletter: <CoverLetterTab   job={job} onJobUpdate={handleJobUpdate} />,
    quiz:        <QuizTab          job={job} onJobUpdate={handleJobUpdate} navigate={navigate} />,
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl space-y-6">

        {/* Header */}
        <div className="border-b-3 border-nb-black pb-5">
          <Link to="/jobs" className="inline-flex items-center gap-1 text-xs font-bold text-nb-black/40 hover:text-nb-black mb-3 transition-colors">
            <ChevronLeft className="w-3.5 h-3.5" /> All Jobs
          </Link>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="font-black text-nb-black" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.25rem,3vw,2rem)', letterSpacing: '-0.03em' }}>
                {job.title}
              </h1>
              {job.company && <p className="text-sm text-nb-black/45 font-mono mt-0.5">{job.company}</p>}
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              {job.atsScore != null && (
                <div className="text-center">
                  <p className={`text-2xl font-black font-mono ${scoreColor(job.atsScore)}`}>{job.atsScore}%</p>
                  <p className="text-[9px] font-black uppercase tracking-widest text-nb-black/40">ATS</p>
                </div>
              )}
              {job.readinessScore != null && (
                <div className="text-center">
                  <p className={`text-2xl font-black font-mono ${scoreColor(job.readinessScore)}`}>{job.readinessScore}%</p>
                  <p className="text-[9px] font-black uppercase tracking-widest text-nb-black/40">Ready</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto gap-0 border-2 border-nb-black bg-white" style={{ borderRadius: '6px', boxShadow: '3px 3px 0 #111' }}>
          {TABS.map(({ id: tid, label, icon: Icon }) => (
            <button
              key={tid}
              onClick={() => setTab(tid)}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-black uppercase tracking-wide whitespace-nowrap border-r-2 border-nb-black last:border-r-0 transition-colors flex-shrink-0 ${
                tab === tid ? 'bg-nb-yellow text-nb-black' : 'text-nb-black/50 hover:bg-nb-yellow/20 hover:text-nb-black'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div>{tabContent[tab]}</div>

      </div>
    </DashboardLayout>
  );
}
