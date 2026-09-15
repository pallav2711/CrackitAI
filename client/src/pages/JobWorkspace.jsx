import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Upload, FileText, Target, Zap, BookOpen,
  PenLine, Mail, Brain, Calendar, Loader2, Check,
  Copy, RefreshCw, ChevronDown, AlertTriangle, CheckCircle,
  BarChart2, TrendingUp, Info,
} from 'lucide-react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import api from '../services/api';

// ── Helpers ───────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'overview',      label: 'Overview',       icon: Target },
  { id: 'resume',        label: 'Resume',          icon: FileText },
  { id: 'jd',            label: 'JD Analysis',     icon: BookOpen },
  { id: 'ats',           label: 'ATS Score',       icon: BarChart2 },
  { id: 'skills',        label: 'Skill Gap',       icon: TrendingUp },
  { id: 'tailor',        label: 'Tailor Resume',   icon: PenLine },
  { id: 'cover',         label: 'Cover Letter',    icon: Mail },
  { id: 'quiz',          label: 'Quiz',            icon: Brain },
  { id: 'prep',          label: 'Prep Plan',       icon: Calendar },
];

const scoreRing = (score) => {
  if (score == null) return { color: '#E0D8C8', bg: 'bg-white', text: '—' };
  if (score >= 80) return { color: '#22c55e', bg: 'bg-green-50', text: `${score}%` };
  if (score >= 60) return { color: '#FFD93D', bg: 'bg-nb-yellow/20', text: `${score}%` };
  if (score >= 40) return { color: '#f97316', bg: 'bg-orange-50', text: `${score}%` };
  return { color: '#ef4444', bg: 'bg-red-50', text: `${score}%` };
};

const importanceBadge = {
  critical: 'bg-red-100 text-red-800 border-red-400',
  high:     'bg-orange-100 text-orange-800 border-orange-400',
  medium:   'bg-nb-yellow/40 text-nb-black border-nb-yellow',
  low:      'bg-gray-100 text-gray-600 border-gray-300',
};

const ActionBtn = ({ onClick, loading, children, variant = 'primary', disabled }) => (
  <button
    onClick={onClick}
    disabled={loading || disabled}
    className={`flex items-center gap-2 px-4 py-2 border-2 border-nb-black text-sm font-black uppercase tracking-wide transition-all disabled:opacity-60 ${
      variant === 'primary'
        ? 'bg-nb-yellow hover:bg-[#FFC300]'
        : 'bg-white hover:bg-nb-black/5'
    }`}
    style={{ borderRadius: '5px', boxShadow: loading ? 'none' : '2px 2px 0 #111' }}
  >
    {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
    {children}
  </button>
);

const Card = ({ children, className = '' }) => (
  <div
    className={`bg-white border-2 border-nb-black p-6 ${className}`}
    style={{ borderRadius: '8px', boxShadow: '4px 4px 0 #111111' }}
  >
    {children}
  </div>
);

const SectionTitle = ({ children }) => (
  <h3 className="font-black text-xs uppercase tracking-widest text-nb-black/60 mb-3">{children}</h3>
);

// ── Score Donut ────────────────────────────────────────────────────────────
const ScoreDonut = ({ score, label, size = 96 }) => {
  const { color, text } = scoreRing(score);
  const r = 34;
  const circ = 2 * Math.PI * r;
  const pct = score != null ? Math.min(score, 100) / 100 : 0;
  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} viewBox="0 0 80 80" aria-label={`${label}: ${text}`}>
        <circle cx="40" cy="40" r={r} fill="none" stroke="#E0D8C8" strokeWidth="8" />
        <circle
          cx="40" cy="40" r={r} fill="none"
          stroke={color} strokeWidth="8"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - pct)}
          strokeLinecap="round"
          transform="rotate(-90 40 40)"
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
        <text x="40" y="44" textAnchor="middle" fontSize="14" fontWeight="900" fill="#111">{text}</text>
      </svg>
      <span className="text-[11px] font-black uppercase tracking-wider text-nb-black/50">{label}</span>
    </div>
  );
};

// ── Breakdown Bar ─────────────────────────────────────────────────────────
const BreakdownBar = ({ label, value }) => {
  const pct = value ?? 0;
  const col = pct >= 80 ? 'bg-green-500' : pct >= 60 ? 'bg-nb-yellow' : pct >= 40 ? 'bg-orange-400' : 'bg-red-400';
  return (
    <div>
      <div className="flex justify-between text-xs font-bold mb-1">
        <span className="text-nb-black/70 capitalize">{label.replace(/([A-Z])/g, ' $1').trim()}</span>
        <span className="font-mono">{pct}%</span>
      </div>
      <div className="h-2.5 bg-[#F5F1E8] border border-nb-black/10" style={{ borderRadius: '2px' }}>
        <div className={`h-full ${col} transition-all duration-700`} style={{ width: `${pct}%`, borderRadius: '2px' }} />
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// TAB CONTENT COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

// ── Overview Tab ──────────────────────────────────────────────────────────
const OverviewTab = ({ job, onAction, loading }) => (
  <div className="space-y-6">
    {/* Scores row */}
    <Card className="flex flex-wrap justify-around gap-6 py-8">
      <ScoreDonut score={job.atsScore} label="ATS Match" />
      <ScoreDonut score={job.readinessScore} label="Readiness" />
      <ScoreDonut score={job.quiz?.score != null ? Math.round((job.quiz.score / job.quiz.totalQuestions) * 100) : null} label="Quiz" />
    </Card>

    {/* Quick actions */}
    <Card>
      <SectionTitle>Quick Actions</SectionTitle>
      <div className="grid sm:grid-cols-2 gap-3">
        {[
          { key: 'ats-score',    label: 'Run ATS Analysis',    icon: Target,    disabled: !job.parsedResume?.skills?.length || !job.parsedJD?.requiredSkills?.length },
          { key: 'skill-gap',    label: 'Analyze Skill Gap',   icon: TrendingUp, disabled: !job.parsedResume?.skills?.length || !job.parsedJD?.requiredSkills?.length },
          { key: 'tailor-resume',label: 'Tailor Resume',       icon: PenLine,   disabled: !job.resumeText || !job.parsedJD?.title },
          { key: 'cover-letter', label: 'Generate Cover Letter',icon: Mail,      disabled: !job.parsedResume?.name || !job.parsedJD?.title },
          { key: 'generate-quiz',label: 'Generate Quiz',       icon: Brain,     disabled: !job.parsedJD?.title },
          { key: 'preparation-plan', label: 'Make Prep Plan',  icon: Calendar,  disabled: !job.parsedJD?.title },
        ].map(({ key, label, icon: Icon, disabled }) => (
          <button
            key={key}
            onClick={() => onAction(key)}
            disabled={loading === key || disabled}
            className="flex items-center gap-3 p-3 border-2 border-nb-black text-left hover:bg-nb-yellow/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ borderRadius: '5px' }}
          >
            <div className="w-8 h-8 bg-nb-black flex items-center justify-center flex-shrink-0" style={{ borderRadius: '4px' }}>
              {loading === key ? <Loader2 className="w-4 h-4 text-nb-yellow animate-spin" /> : <Icon className="w-4 h-4 text-nb-yellow" />}
            </div>
            <span className="text-sm font-bold">{label}</span>
          </button>
        ))}
      </div>
    </Card>

    {/* Readiness breakdown */}
    {job.readinessBreakdown && (
      <Card>
        <SectionTitle>Readiness Breakdown</SectionTitle>
        <div className="space-y-3">
          {['atsMatch', 'skillCoverage', 'quizPerformance'].map(k => (
            <BreakdownBar key={k} label={k} value={job.readinessBreakdown[k]} />
          ))}
          <div className="flex gap-4 pt-2">
            {[['resumeTailored', 'Resume Tailored'], ['coverLetterDone', 'Cover Letter'], ['prepPlanStarted', 'Prep Plan']].map(([k, l]) => (
              <div key={k} className="flex items-center gap-1.5 text-xs font-bold">
                {job.readinessBreakdown[k]
                  ? <CheckCircle className="w-4 h-4 text-green-500" />
                  : <div className="w-4 h-4 border-2 border-nb-black/20 rounded-sm" />}
                {l}
              </div>
            ))}
          </div>
        </div>
      </Card>
    )}
  </div>
);

// ── Resume Tab ────────────────────────────────────────────────────────────
const ResumeTab = ({ job, onUpload, loading }) => {
  const fileRef = useRef();

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('resume', file);
    onUpload(fd);
  };

  return (
    <div className="space-y-6">
      <Card>
        <SectionTitle>Upload Resume</SectionTitle>
        <div
          className="border-2 border-dashed border-nb-black/30 p-8 text-center hover:border-nb-black/60 transition-colors cursor-pointer"
          style={{ borderRadius: '6px' }}
          onClick={() => fileRef.current?.click()}
          onKeyDown={e => e.key === 'Enter' && fileRef.current?.click()}
          role="button"
          tabIndex={0}
          aria-label="Upload resume file"
        >
          <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleFile} />
          {loading ? (
            <div className="flex flex-col items-center gap-2 text-nb-black/60">
              <Loader2 className="w-8 h-8 animate-spin" />
              <p className="font-bold text-sm">Parsing resume…</p>
            </div>
          ) : (
            <>
              <Upload className="w-8 h-8 mx-auto mb-2 text-nb-black/40" />
              <p className="font-bold text-sm">
                {job.resumeFileName ? `Current: ${job.resumeFileName} · Click to replace` : 'Click to upload PDF or DOCX'}
              </p>
              <p className="text-xs text-nb-black/40 mt-1">Max 5MB</p>
            </>
          )}
        </div>
      </Card>

      {job.parsedResume?.name && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <SectionTitle>Parsed Profile</SectionTitle>
            <span className="text-[10px] font-black bg-green-100 text-green-700 px-2 py-0.5 border border-green-300" style={{ borderRadius: '3px' }}>PARSED</span>
          </div>

          <div className="space-y-5">
            {/* Personal */}
            <div>
              <p className="font-black text-base">{job.parsedResume.name}</p>
              <p className="text-sm text-nb-black/50">{job.parsedResume.email} {job.parsedResume.phone ? `· ${job.parsedResume.phone}` : ''}</p>
            </div>

            {job.parsedResume.summary && (
              <div>
                <SectionTitle>Summary</SectionTitle>
                <p className="text-sm text-nb-black/70 leading-relaxed">{job.parsedResume.summary}</p>
              </div>
            )}

            {job.parsedResume.skills?.length > 0 && (
              <div>
                <SectionTitle>Skills ({job.parsedResume.skills.length})</SectionTitle>
                <div className="flex flex-wrap gap-1.5">
                  {job.parsedResume.skills.map(s => (
                    <span key={s} className="text-xs font-bold px-2 py-0.5 bg-[#F5F1E8] border-2 border-nb-black/20" style={{ borderRadius: '3px' }}>{s}</span>
                  ))}
                </div>
              </div>
            )}

            {job.parsedResume.experience?.length > 0 && (
              <div>
                <SectionTitle>Experience</SectionTitle>
                <div className="space-y-3">
                  {job.parsedResume.experience.map((e, i) => (
                    <div key={i} className="pl-3 border-l-2 border-nb-yellow">
                      <p className="font-bold text-sm">{e.title} <span className="text-nb-black/50">@ {e.company}</span></p>
                      <p className="text-xs text-nb-black/40 font-mono">{e.duration}</p>
                      {e.description && <p className="text-xs text-nb-black/60 mt-1">{e.description}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {job.parsedResume.education?.length > 0 && (
              <div>
                <SectionTitle>Education</SectionTitle>
                {job.parsedResume.education.map((e, i) => (
                  <div key={i} className="text-sm">
                    <p className="font-bold">{e.degree}</p>
                    <p className="text-nb-black/50 text-xs">{e.institution} {e.year ? `· ${e.year}` : ''}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

// ── JD Tab ────────────────────────────────────────────────────────────────
const JDTab = ({ job, onParseJD, loading }) => {
  const [jdText, setJdText] = useState(job.jobDescription || '');

  return (
    <div className="space-y-6">
      <Card>
        <SectionTitle>Job Description</SectionTitle>
        <textarea
          className="w-full border-2 border-nb-black p-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-nb-yellow resize-none"
          style={{ borderRadius: '5px' }}
          rows={8}
          placeholder="Paste the full job description here..."
          value={jdText}
          onChange={e => setJdText(e.target.value)}
        />
        <div className="mt-3">
          <ActionBtn onClick={() => onParseJD(jdText)} loading={loading} disabled={!jdText.trim()}>
            <BookOpen className="w-3.5 h-3.5" />
            Parse JD
          </ActionBtn>
        </div>
      </Card>

      {job.parsedJD?.title && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <SectionTitle>Parsed Requirements</SectionTitle>
            <span className="text-[10px] font-black bg-blue-100 text-blue-700 px-2 py-0.5 border border-blue-300" style={{ borderRadius: '3px' }}>PARSED</span>
          </div>
          <div className="space-y-4">
            <div>
              <p className="font-black text-base">{job.parsedJD.title}</p>
              <p className="text-sm text-nb-black/50">{job.parsedJD.company} {job.parsedJD.seniority ? `· ${job.parsedJD.seniority}` : ''}</p>
              {job.parsedJD.experienceRequired && <p className="text-xs text-nb-black/40 mt-0.5">Experience: {job.parsedJD.experienceRequired}</p>}
            </div>

            {job.parsedJD.requiredSkills?.length > 0 && (
              <div>
                <SectionTitle>Required Skills</SectionTitle>
                <div className="flex flex-wrap gap-1.5">
                  {job.parsedJD.requiredSkills.map(s => (
                    <span key={s} className="text-xs font-bold px-2 py-0.5 bg-red-50 border-2 border-red-300 text-red-800" style={{ borderRadius: '3px' }}>{s}</span>
                  ))}
                </div>
              </div>
            )}

            {job.parsedJD.preferredSkills?.length > 0 && (
              <div>
                <SectionTitle>Preferred Skills</SectionTitle>
                <div className="flex flex-wrap gap-1.5">
                  {job.parsedJD.preferredSkills.map(s => (
                    <span key={s} className="text-xs font-bold px-2 py-0.5 bg-blue-50 border-2 border-blue-300 text-blue-800" style={{ borderRadius: '3px' }}>{s}</span>
                  ))}
                </div>
              </div>
            )}

            {job.parsedJD.technologies?.length > 0 && (
              <div>
                <SectionTitle>Technologies</SectionTitle>
                <div className="flex flex-wrap gap-1.5">
                  {job.parsedJD.technologies.map(s => (
                    <span key={s} className="text-xs font-bold px-2 py-0.5 bg-[#F5F1E8] border-2 border-nb-black/20" style={{ borderRadius: '3px' }}>{s}</span>
                  ))}
                </div>
              </div>
            )}

            {job.parsedJD.responsibilities?.length > 0 && (
              <div>
                <SectionTitle>Key Responsibilities</SectionTitle>
                <ul className="space-y-1">
                  {job.parsedJD.responsibilities.map((r, i) => (
                    <li key={i} className="text-sm text-nb-black/70 flex gap-2">
                      <span className="text-nb-yellow font-black flex-shrink-0">→</span>
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

// ── ATS Tab ───────────────────────────────────────────────────────────────
const ATSTab = ({ job, onRun, loading }) => (
  <div className="space-y-6">
    {!job.atsScore && (
      <Card>
        <div className="flex items-start gap-3 mb-4">
          <Info className="w-5 h-5 text-nb-black/40 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-nb-black/60">Upload your resume and parse the JD first, then run ATS analysis.</p>
        </div>
        <ActionBtn onClick={onRun} loading={loading} disabled={!job.parsedResume?.skills?.length || !job.parsedJD?.requiredSkills?.length}>
          <Target className="w-3.5 h-3.5" />
          Run ATS Analysis
        </ActionBtn>
      </Card>
    )}

    {job.atsScore != null && (
      <>
        <Card className="flex items-center gap-6">
          <ScoreDonut score={job.atsScore} label="ATS Score" size={110} />
          <div className="flex-1">
            <p className="font-black text-2xl">{job.atsScore >= 80 ? 'Strong Match' : job.atsScore >= 60 ? 'Good Fit' : job.atsScore >= 40 ? 'Moderate Fit' : 'Needs Work'}</p>
            <p className="text-sm text-nb-black/50 mt-1">
              {job.atsScore >= 70 ? 'Your resume is likely to pass ATS filters.' : 'Your resume may be filtered out. See recommendations below.'}
            </p>
            <div className="mt-3">
              <ActionBtn onClick={onRun} loading={loading} variant="ghost">
                <RefreshCw className="w-3.5 h-3.5" />
                Re-analyze
              </ActionBtn>
            </div>
          </div>
        </Card>

        {job.atsBreakdown && (
          <Card>
            <SectionTitle>Score Breakdown</SectionTitle>
            <div className="space-y-3">
              {Object.entries(job.atsBreakdown).map(([k, v]) => (
                <BreakdownBar key={k} label={k} value={v} />
              ))}
            </div>
          </Card>
        )}

        <div className="grid md:grid-cols-2 gap-4">
          {job.atsStrongMatches?.length > 0 && (
            <Card>
              <SectionTitle>Strong Matches ✓</SectionTitle>
              <ul className="space-y-1">
                {job.atsStrongMatches.map((m, i) => (
                  <li key={i} className="text-sm flex gap-2">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    {m}
                  </li>
                ))}
              </ul>
            </Card>
          )}
          {job.atsMissingSkills?.length > 0 && (
            <Card>
              <SectionTitle>Missing Skills ✗</SectionTitle>
              <ul className="space-y-1">
                {job.atsMissingSkills.map((m, i) => (
                  <li key={i} className="text-sm flex gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                    {m}
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>

        {job.atsRecommendations?.length > 0 && (
          <Card>
            <SectionTitle>Recommendations</SectionTitle>
            <ul className="space-y-2">
              {job.atsRecommendations.map((r, i) => (
                <li key={i} className="text-sm text-nb-black/70 flex gap-2">
                  <span className="text-nb-yellow font-black flex-shrink-0">→</span>
                  {r}
                </li>
              ))}
            </ul>
          </Card>
        )}
      </>
    )}
  </div>
);

// ── Skills Tab ────────────────────────────────────────────────────────────
const SkillsTab = ({ job, onRun, loading }) => {
  const sg = job.skillGap;

  const SkillGroup = ({ title, skills, variant }) => {
    const variantStyle = {
      have:       'border-green-400 bg-green-50',
      missing:    'border-red-400 bg-red-50',
      improve:    'border-orange-400 bg-orange-50',
      niceToHave: 'border-blue-300 bg-blue-50',
    };
    if (!skills?.length) return null;
    return (
      <Card>
        <SectionTitle>{title} ({skills.length})</SectionTitle>
        <div className="flex flex-wrap gap-2">
          {skills.map((s, i) => (
            <div key={i} className={`border-2 px-2.5 py-1.5 ${variantStyle[variant]}`} style={{ borderRadius: '4px' }}>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold">{s.skill}</span>
                <span className={`text-[9px] font-black px-1 py-0.5 border ${importanceBadge[s.importance] || importanceBadge.low}`} style={{ borderRadius: '2px' }}>
                  {s.importance?.toUpperCase() || 'LOW'}
                </span>
              </div>
              {s.why && <p className="text-[11px] text-nb-black/60 mt-0.5">{s.why}</p>}
            </div>
          ))}
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {!sg?.have?.length && (
        <Card>
          <div className="flex items-start gap-3 mb-4">
            <Info className="w-5 h-5 text-nb-black/40 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-nb-black/60">Upload your resume and parse the JD first, then run skill gap analysis.</p>
          </div>
          <ActionBtn onClick={onRun} loading={loading} disabled={!job.parsedResume?.skills?.length || !job.parsedJD?.requiredSkills?.length}>
            <TrendingUp className="w-3.5 h-3.5" />
            Analyze Skill Gap
          </ActionBtn>
        </Card>
      )}
      {sg?.have?.length > 0 && (
        <>
          <div className="flex justify-end">
            <ActionBtn onClick={onRun} loading={loading} variant="ghost">
              <RefreshCw className="w-3.5 h-3.5" />
              Re-analyze
            </ActionBtn>
          </div>
          <SkillGroup title="Skills You Have" skills={sg.have} variant="have" />
          <SkillGroup title="Missing Skills" skills={sg.missing} variant="missing" />
          <SkillGroup title="Needs Improvement" skills={sg.improve} variant="improve" />
          <SkillGroup title="Nice to Have" skills={sg.niceToHave} variant="niceToHave" />
        </>
      )}
    </div>
  );
};

// ── Tailor Tab ────────────────────────────────────────────────────────────
const TailorTab = ({ job, onRun, loading }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(job.tailoredResume?.text || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <SectionTitle>AI Resume Tailoring</SectionTitle>
            <p className="text-sm text-nb-black/60">Rewords and reorganizes your existing resume. Never fabricates content.</p>
          </div>
          <ActionBtn onClick={onRun} loading={loading} disabled={!job.resumeText || !job.parsedJD?.title}>
            <PenLine className="w-3.5 h-3.5" />
            {job.tailoredResume?.text ? 'Regenerate' : 'Tailor Resume'}
          </ActionBtn>
        </div>
        {!job.resumeText && <p className="text-sm text-orange-600 font-bold">↑ Upload your resume first</p>}
        {!job.parsedJD?.title && <p className="text-sm text-orange-600 font-bold">↑ Parse the job description first</p>}
      </Card>

      {job.tailoredResume?.text && (
        <>
          {job.tailoredResume.warnings?.length > 0 && (
            <Card className="border-orange-400">
              <SectionTitle>⚠ Honesty Warnings</SectionTitle>
              {job.tailoredResume.warnings.map((w, i) => (
                <p key={i} className="text-sm text-orange-700 flex gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />{w}
                </p>
              ))}
            </Card>
          )}

          {job.tailoredResume.changes?.length > 0 && (
            <Card>
              <SectionTitle>Changes Made</SectionTitle>
              <ul className="space-y-1">
                {job.tailoredResume.changes.map((c, i) => (
                  <li key={i} className="text-sm flex gap-2">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />{c}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <Card>
            <div className="flex items-center justify-between mb-3">
              <SectionTitle>Tailored Resume</SectionTitle>
              <button
                onClick={copy}
                className="flex items-center gap-1.5 text-xs font-bold border-2 border-nb-black px-2.5 py-1 hover:bg-nb-yellow/20 transition-colors"
                style={{ borderRadius: '4px' }}
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <pre className="text-sm text-nb-black/80 whitespace-pre-wrap font-mono leading-relaxed bg-[#F5F1E8] p-4 max-h-[500px] overflow-y-auto" style={{ borderRadius: '4px' }}>
              {job.tailoredResume.text}
            </pre>
          </Card>
        </>
      )}
    </div>
  );
};

// ── Cover Letter Tab ──────────────────────────────────────────────────────
const CoverTab = ({ job, onRun, loading }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(job.coverLetter?.text || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-start justify-between gap-4 mb-2">
          <div>
            <SectionTitle>Cover Letter Generator</SectionTitle>
            <p className="text-sm text-nb-black/60">Professional, specific cover letter based on your resume and the JD.</p>
          </div>
          <ActionBtn onClick={onRun} loading={loading} disabled={!job.parsedResume?.name || !job.parsedJD?.title}>
            <Mail className="w-3.5 h-3.5" />
            {job.coverLetter?.text ? 'Regenerate' : 'Generate'}
          </ActionBtn>
        </div>
      </Card>

      {job.coverLetter?.text && (
        <Card>
          <div className="flex items-center justify-between mb-3">
            <SectionTitle>Generated Cover Letter</SectionTitle>
            <button
              onClick={copy}
              className="flex items-center gap-1.5 text-xs font-bold border-2 border-nb-black px-2.5 py-1 hover:bg-nb-yellow/20 transition-colors"
              style={{ borderRadius: '4px' }}
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <div className="text-sm text-nb-black/80 leading-relaxed whitespace-pre-wrap bg-[#F5F1E8] p-4" style={{ borderRadius: '4px' }}>
            {job.coverLetter.text}
          </div>
        </Card>
      )}
    </div>
  );
};

// ── Quiz Tab ──────────────────────────────────────────────────────────────
const QuizTab = ({ job, onGenerate, loading }) => {
  const navigate = useNavigate();
  const qs = job.quiz?.questions;
  const completed = job.quiz?.completedAt;
  const score = job.quiz?.score;
  const total = job.quiz?.totalQuestions;
  const pct = total ? Math.round((score / total) * 100) : 0;

  return (
    <div className="space-y-6">
      <Card>
        <SectionTitle>Job Readiness Quiz</SectionTitle>
        <p className="text-sm text-nb-black/60 mb-4">
          {qs?.length ? `${qs.length} questions · Technical, HR, and role-specific` : 'Generate a personalized quiz based on the JD requirements.'}
        </p>
        <div className="flex flex-wrap gap-3">
          <ActionBtn onClick={onGenerate} loading={loading} disabled={!job.parsedJD?.title}>
            <Brain className="w-3.5 h-3.5" />
            {qs?.length ? 'Regenerate Quiz' : 'Generate Quiz'}
          </ActionBtn>
          {qs?.length > 0 && (
            <ActionBtn onClick={() => navigate(`/quiz/${job._id}`)} variant="primary">
              <Zap className="w-3.5 h-3.5" />
              {completed ? 'Retake Quiz' : 'Start Quiz'}
            </ActionBtn>
          )}
        </div>
      </Card>

      {completed && score != null && (
        <Card>
          <SectionTitle>Last Result</SectionTitle>
          <div className="flex items-center gap-6 mb-4">
            <ScoreDonut score={pct} label="Score" />
            <div>
              <p className="font-black text-2xl">{score}/{total}</p>
              <p className="text-sm text-nb-black/50">{pct >= 80 ? 'Excellent!' : pct >= 60 ? 'Good job' : 'Needs practice'}</p>
            </div>
          </div>
          {job.quiz.categoryScores && (
            <div className="space-y-2">
              {Object.entries(job.quiz.categoryScores).map(([cat, val]) => (
                <BreakdownBar key={cat} label={cat} value={val} />
              ))}
            </div>
          )}
          {job.quiz.weakAreas?.length > 0 && (
            <div className="mt-4">
              <SectionTitle>Weak Areas</SectionTitle>
              <div className="flex flex-wrap gap-2">
                {job.quiz.weakAreas.map(w => (
                  <span key={w} className="text-xs font-bold px-2 py-0.5 bg-red-50 border-2 border-red-300 text-red-700" style={{ borderRadius: '3px' }}>{w}</span>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

// ── Prep Tab ──────────────────────────────────────────────────────────────
const PrepTab = ({ job, onGenerate, loading }) => {
  const plan = job.preparationPlan;
  const [open, setOpen] = useState(0);

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-start justify-between gap-4 mb-2">
          <div>
            <SectionTitle>Preparation Plan</SectionTitle>
            <p className="text-sm text-nb-black/60">Day-by-day plan personalized to your skill gaps.</p>
          </div>
          <ActionBtn onClick={onGenerate} loading={loading} disabled={!job.parsedJD?.title}>
            <Calendar className="w-3.5 h-3.5" />
            {plan?.days?.length ? 'Regenerate' : 'Generate Plan'}
          </ActionBtn>
        </div>
      </Card>

      {plan?.days?.length > 0 && (
        <Card>
          <SectionTitle>14-Day Plan ({plan.totalDays} days)</SectionTitle>
          <div className="space-y-2">
            {plan.days.map((d, i) => (
              <div key={i} className="border-2 border-nb-black/20" style={{ borderRadius: '5px' }}>
                <button
                  className="w-full flex items-center gap-3 p-3 text-left hover:bg-[#F5F1E8] transition-colors"
                  onClick={() => setOpen(open === i ? -1 : i)}
                >
                  <span className="w-8 h-8 bg-nb-black text-nb-yellow text-xs font-black flex items-center justify-center flex-shrink-0" style={{ borderRadius: '4px' }}>
                    D{d.day}
                  </span>
                  <span className="font-bold text-sm flex-1 text-left">{d.topic}</span>
                  <ChevronDown className={`w-4 h-4 text-nb-black/40 transition-transform ${open === i ? 'rotate-180' : ''}`} />
                </button>
                {open === i && (
                  <div className="px-4 pb-4 border-t border-nb-black/10">
                    {d.tasks?.length > 0 && (
                      <div className="mt-3">
                        <p className="text-[11px] font-black uppercase tracking-wider text-nb-black/50 mb-2">Tasks</p>
                        <ul className="space-y-1">
                          {d.tasks.map((t, j) => (
                            <li key={j} className="text-sm flex gap-2">
                              <span className="text-nb-yellow font-black">•</span>{t}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {d.resources?.length > 0 && (
                      <div className="mt-3">
                        <p className="text-[11px] font-black uppercase tracking-wider text-nb-black/50 mb-2">Resources</p>
                        <ul className="space-y-1">
                          {d.resources.map((r, j) => (
                            <li key={j} className="text-xs text-nb-black/60 flex gap-2">
                              <span className="text-blue-500">→</span>{r}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────

const JobWorkspace = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState('');

  const loadJob = useCallback(async () => {
    try {
      const res = await api.get(`/jobs/${id}`);
      setJob(res.data.data);
    } catch {
      navigate('/jobs');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => { loadJob(); }, [loadJob]);

  const doAction = async (endpoint, method = 'post', body = null) => {
    setActionLoading(endpoint);
    setError('');
    try {
      const res = method === 'get'
        ? await api.get(`/jobs/${id}/${endpoint}`)
        : await api.post(`/jobs/${id}/${endpoint}`, body || {});
      // Reload full job
      const updated = await api.get(`/jobs/${id}`);
      setJob(updated.data.data);
    } catch (err) {
      setError(err.response?.data?.message || `Failed to run ${endpoint}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpload = async (formData) => {
    setActionLoading('upload-resume');
    setError('');
    try {
      await api.post(`/jobs/${id}/upload-resume`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const updated = await api.get(`/jobs/${id}`);
      setJob(updated.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleParseJD = async (text) => {
    setActionLoading('parse-jd');
    setError('');
    try {
      await api.post(`/jobs/${id}/parse-jd`, { jobDescription: text });
      const updated = await api.get(`/jobs/${id}`);
      setJob(updated.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to parse JD');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-nb-black/40" />
      </div>
    </DashboardLayout>
  );

  if (!job) return null;

  const currentLoading = actionLoading;

  return (
    <DashboardLayout>
      <div className="max-w-5xl space-y-6">

        {/* Back + Header */}
        <div>
          <Link to="/jobs" className="inline-flex items-center gap-1.5 text-xs font-bold text-nb-black/50 hover:text-nb-black mb-4 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            My Jobs
          </Link>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="font-black text-2xl leading-tight" style={{ fontFamily: 'var(--font-display)' }}>{job.title}</h1>
              {job.company && <p className="text-sm text-nb-black/50 mt-0.5">{job.company}</p>}
            </div>
            <span className={`text-[10px] font-black px-2.5 py-1 border-2 border-nb-black uppercase tracking-wide flex-shrink-0 mt-1 ${
              { analyzing: 'bg-nb-yellow', ready: 'bg-blue-100', preparing: 'bg-purple-100', applied: 'bg-green-100' }[job.status] || 'bg-white'
            }`} style={{ borderRadius: '4px' }}>
              {job.status}
            </span>
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div className="p-3 bg-red-50 border-2 border-red-400 text-red-700 text-sm font-bold flex items-center justify-between" style={{ borderRadius: '5px' }}>
            <span>{error}</span>
            <button onClick={() => setError('')} aria-label="Dismiss">✕</button>
          </div>
        )}

        {/* Tab bar */}
        <div className="flex overflow-x-auto gap-1 border-b-2 border-nb-black pb-0 -mb-px" role="tablist">
          {TABS.map(({ id: tid, label, icon: Icon }) => (
            <button
              key={tid}
              role="tab"
              aria-selected={activeTab === tid}
              onClick={() => setActiveTab(tid)}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-black uppercase tracking-wide whitespace-nowrap border-2 border-b-0 transition-colors flex-shrink-0 ${
                activeTab === tid
                  ? 'bg-white border-nb-black text-nb-black -mb-px pb-[13px]'
                  : 'bg-transparent border-transparent text-nb-black/50 hover:text-nb-black'
              }`}
              style={{ borderRadius: activeTab === tid ? '5px 5px 0 0' : '4px 4px 0 0' }}
            >
              <Icon className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div>
          {activeTab === 'overview' && <OverviewTab job={job} onAction={(key) => doAction(key)} loading={currentLoading} />}
          {activeTab === 'resume'   && <ResumeTab job={job} onUpload={handleUpload} loading={currentLoading === 'upload-resume'} />}
          {activeTab === 'jd'       && <JDTab job={job} onParseJD={handleParseJD} loading={currentLoading === 'parse-jd'} />}
          {activeTab === 'ats'      && <ATSTab job={job} onRun={() => doAction('ats-score')} loading={currentLoading === 'ats-score'} />}
          {activeTab === 'skills'   && <SkillsTab job={job} onRun={() => doAction('skill-gap')} loading={currentLoading === 'skill-gap'} />}
          {activeTab === 'tailor'   && <TailorTab job={job} onRun={() => doAction('tailor-resume')} loading={currentLoading === 'tailor-resume'} />}
          {activeTab === 'cover'    && <CoverTab job={job} onRun={() => doAction('cover-letter')} loading={currentLoading === 'cover-letter'} />}
          {activeTab === 'quiz'     && <QuizTab job={job} onGenerate={() => doAction('generate-quiz')} loading={currentLoading === 'generate-quiz'} />}
          {activeTab === 'prep'     && <PrepTab job={job} onGenerate={() => doAction('preparation-plan')} loading={currentLoading === 'preparation-plan'} />}
        </div>

      </div>
    </DashboardLayout>
  );
};

export default JobWorkspace;
