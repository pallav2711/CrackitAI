import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload, FileText, CheckCircle, Loader2,
  ChevronRight, Target, Zap,
} from 'lucide-react';
import api from '../services/api';

/* ── Step indicator ──────────────────────────────────────────────────────── */
const Steps = ({ current }) => {
  const steps = ['Upload Resume', 'Paste JD', 'Analyzing'];
  return (
    <div className="flex items-center gap-0 mb-10">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={`w-8 h-8 border-2 border-nb-black flex items-center justify-center font-black text-sm transition-colors ${
                i < current ? 'bg-green-500 text-white' :
                i === current ? 'bg-nb-yellow text-nb-black' :
                'bg-white text-nb-black/30'
              }`}
              style={{ borderRadius: '6px' }}
              aria-current={i === current ? 'step' : undefined}
            >
              {i < current ? <CheckCircle className="w-4 h-4" /> : i + 1}
            </div>
            <span className={`text-[10px] font-black mt-1 uppercase tracking-wide ${i === current ? 'text-nb-black' : 'text-nb-black/35'}`}>{s}</span>
          </div>
          {i < steps.length - 1 && (
            <div className={`w-16 h-0.5 mb-5 mx-1 ${i < current ? 'bg-green-400' : 'bg-nb-black/15'}`} />
          )}
        </div>
      ))}
    </div>
  );
};

/* ── Onboarding Flow ─────────────────────────────────────────────────────── */
const OnboardingFlow = () => {
  const navigate = useNavigate();
  const fileRef = useRef();

  const [step, setStep] = useState(0);
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [jd, setJd] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [progressMsg, setProgressMsg] = useState('');
  const [createdJobId, setCreatedJobId] = useState(null);
  const [atsScore, setAtsScore] = useState(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) setResumeFile(file);
  };

  const startAnalysis = async () => {
    if (!jobTitle.trim() || !jd.trim() || !resumeFile) {
      setError('Please complete all fields and upload your resume.');
      return;
    }
    setError('');
    setStep(2);
    setLoading(true);

    try {
      // Step 1: Create job
      setProgressMsg('Creating job workspace…');
      setProgress(10);
      const createRes = await api.post('/jobs', { title: jobTitle.trim(), company: company.trim(), jobDescription: jd.trim() });
      const jobId = createRes.data.data._id;
      setCreatedJobId(jobId);

      // Step 2: Upload resume
      setProgressMsg('Parsing your resume…');
      setProgress(30);
      const fd = new FormData();
      fd.append('resume', resumeFile);
      await api.post(`/jobs/${jobId}/upload-resume`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });

      // Step 3: Parse JD (might already be done in background, but force it)
      setProgressMsg('Analyzing job requirements…');
      setProgress(55);
      await api.post(`/jobs/${jobId}/parse-jd`, { jobDescription: jd.trim() });

      // Step 4: ATS score
      setProgressMsg('Calculating ATS match…');
      setProgress(75);
      const atsRes = await api.post(`/jobs/${jobId}/ats-score`);
      setAtsScore(atsRes.data.data?.atsScore ?? null);

      setProgress(100);
      setProgressMsg('Done!');

      // Small pause to show completion
      await new Promise(r => setTimeout(r, 800));
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Analysis failed. Please try again.');
      setLoading(false);
      setStep(1); // go back to JD step
    }
  };

  const scoreColor = atsScore != null
    ? atsScore >= 80 ? '#22c55e' : atsScore >= 60 ? '#FFD93D' : atsScore >= 40 ? '#f97316' : '#ef4444'
    : '#E0D8C8';

  return (
    <div className="min-h-screen bg-[#F5F1E8] flex items-center justify-center p-4">
      <div className="w-full max-w-xl">

        {/* Logo / branding */}
        <div className="text-center mb-8">
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-nb-black/45 mb-1">CrackIt AI</p>
          <h1 className="font-black text-3xl" style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.03em' }}>
            Get Job-Ready
          </h1>
          <p className="text-sm text-nb-black/50 mt-1">Upload your resume and a job description to get started.</p>
        </div>

        <Steps current={step} />

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border-2 border-red-400 text-red-700 text-sm font-bold" style={{ borderRadius: '5px' }}>
            {error}
          </div>
        )}

        {/* Step 0: Upload resume */}
        {step === 0 && (
          <div
            className="bg-white border-2 border-nb-black p-8 space-y-6"
            style={{ borderRadius: '10px', boxShadow: '5px 5px 0 #111111' }}
          >
            <div>
              <h2 className="font-black text-lg uppercase tracking-tight mb-1">Upload Your Resume</h2>
              <p className="text-sm text-nb-black/50">PDF or DOCX, max 5MB</p>
            </div>

            <div
              className={`border-2 border-dashed p-10 text-center cursor-pointer transition-all ${
                resumeFile ? 'border-green-500 bg-green-50' : 'border-nb-black/30 hover:border-nb-black hover:bg-nb-yellow/10'
              }`}
              style={{ borderRadius: '8px' }}
              onClick={() => fileRef.current?.click()}
              onKeyDown={e => e.key === 'Enter' && fileRef.current?.click()}
              role="button"
              tabIndex={0}
              aria-label="Upload resume"
            >
              <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleFileSelect} />
              {resumeFile ? (
                <div className="flex flex-col items-center gap-2 text-green-700">
                  <CheckCircle className="w-10 h-10" />
                  <p className="font-bold">{resumeFile.name}</p>
                  <p className="text-xs opacity-70">Click to replace</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-nb-black/50">
                  <Upload className="w-10 h-10" />
                  <p className="font-bold text-sm">Click to upload your resume</p>
                  <p className="text-xs">PDF or DOCX</p>
                </div>
              )}
            </div>

            <button
              onClick={() => resumeFile ? setStep(1) : fileRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-nb-yellow border-2 border-nb-black font-black text-sm uppercase tracking-wide hover:bg-[#FFC300] transition-colors"
              style={{ borderRadius: '6px', boxShadow: '3px 3px 0 #111' }}
            >
              {resumeFile ? (
                <>Continue <ChevronRight className="w-4 h-4" /></>
              ) : (
                <>Choose File <Upload className="w-4 h-4" /></>
              )}
            </button>
          </div>
        )}

        {/* Step 1: JD */}
        {step === 1 && (
          <div
            className="bg-white border-2 border-nb-black p-8 space-y-5"
            style={{ borderRadius: '10px', boxShadow: '5px 5px 0 #111111' }}
          >
            <div>
              <h2 className="font-black text-lg uppercase tracking-tight mb-1">Paste Job Description</h2>
              <p className="text-sm text-nb-black/50">Tell us what role you're applying for.</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider mb-1.5">Job Title *</label>
                <input
                  className="w-full border-2 border-nb-black px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-nb-yellow"
                  style={{ borderRadius: '5px' }}
                  placeholder="e.g. Senior Frontend Engineer"
                  value={jobTitle}
                  onChange={e => setJobTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-wider mb-1.5">Company</label>
                <input
                  className="w-full border-2 border-nb-black px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-nb-yellow"
                  style={{ borderRadius: '5px' }}
                  placeholder="e.g. Google (optional)"
                  value={company}
                  onChange={e => setCompany(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-wider mb-1.5">Job Description *</label>
                <textarea
                  className="w-full border-2 border-nb-black px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-nb-yellow resize-none"
                  style={{ borderRadius: '5px' }}
                  rows={7}
                  placeholder="Paste the full job description here…"
                  value={jd}
                  onChange={e => setJd(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(0)}
                className="px-4 py-3 border-2 border-nb-black font-bold text-sm hover:bg-nb-black/5"
                style={{ borderRadius: '6px' }}
              >
                ← Back
              </button>
              <button
                onClick={startAnalysis}
                disabled={!jobTitle.trim() || !jd.trim()}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-nb-yellow border-2 border-nb-black font-black text-sm uppercase tracking-wide hover:bg-[#FFC300] disabled:opacity-50 transition-colors"
                style={{ borderRadius: '6px', boxShadow: '3px 3px 0 #111' }}
              >
                <Zap className="w-4 h-4" />
                Analyze Now
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Analyzing */}
        {step === 2 && (
          <div
            className="bg-white border-2 border-nb-black p-10 text-center space-y-6"
            style={{ borderRadius: '10px', boxShadow: '5px 5px 0 #111111' }}
          >
            {loading ? (
              <>
                <Loader2 className="w-12 h-12 animate-spin mx-auto text-nb-black/40" />
                <div>
                  <p className="font-black text-lg">Analyzing…</p>
                  <p className="text-sm text-nb-black/50 mt-1">{progressMsg}</p>
                </div>
                {/* Progress bar */}
                <div className="h-3 bg-[#E0D8C8] border border-nb-black/10" style={{ borderRadius: '3px' }}>
                  <div
                    className="h-full bg-nb-yellow border-r border-nb-black/20 transition-all duration-700"
                    style={{ width: `${progress}%`, borderRadius: '3px' }}
                  />
                </div>
                <p className="text-xs font-mono text-nb-black/40">{progress}%</p>
              </>
            ) : (
              <>
                {/* ATS Score reveal */}
                <div className="relative">
                  <svg width="150" height="150" viewBox="0 0 80 80" className="mx-auto" aria-label={`ATS Score: ${atsScore}%`}>
                    <circle cx="40" cy="40" r="34" fill="none" stroke="#E0D8C8" strokeWidth="8" />
                    <circle
                      cx="40" cy="40" r="34" fill="none"
                      stroke={scoreColor} strokeWidth="8"
                      strokeDasharray={2 * Math.PI * 34}
                      strokeDashoffset={2 * Math.PI * 34 * (1 - (atsScore || 0) / 100)}
                      strokeLinecap="round"
                      transform="rotate(-90 40 40)"
                    />
                    <text x="40" y="44" textAnchor="middle" fontSize="14" fontWeight="900" fill="#111">{atsScore != null ? `${atsScore}%` : '—'}</text>
                  </svg>
                </div>
                <div>
                  <p className="font-black text-xl">ATS Match Score</p>
                  <p className="text-sm text-nb-black/60 mt-1 max-w-xs mx-auto">
                    {atsScore == null ? 'Analysis complete.' :
                      atsScore >= 80 ? 'Excellent fit! Your resume aligns well with this role.' :
                      atsScore >= 60 ? 'Good fit with room to improve. Tailor your resume for better results.' :
                      'Significant gaps detected. Use the workspace to improve your score.'}
                  </p>
                </div>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => navigate(`/workspace/${createdJobId}`)}
                    className="flex items-center justify-center gap-2 px-6 py-3.5 bg-nb-yellow border-2 border-nb-black font-black text-sm uppercase tracking-wide hover:bg-[#FFC300] transition-colors"
                    style={{ borderRadius: '6px', boxShadow: '3px 3px 0 #111' }}
                  >
                    <Target className="w-4 h-4" />
                    Open Full Workspace
                  </button>
                  <button
                    onClick={() => navigate('/jobs')}
                    className="text-sm font-bold text-nb-black/50 hover:text-nb-black transition-colors"
                  >
                    View all jobs →
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Already have account link */}
        {step < 2 && (
          <p className="text-center text-xs text-nb-black/40 mt-6">
            <button onClick={() => navigate('/jobs')} className="font-bold hover:text-nb-black transition-colors underline underline-offset-2">
              Skip to job dashboard →
            </button>
          </p>
        )}

      </div>
    </div>
  );
};

export default OnboardingFlow;
