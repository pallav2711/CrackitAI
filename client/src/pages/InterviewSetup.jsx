import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, Code, Users, Briefcase, ChevronRight, Clock, Shield, Info } from 'lucide-react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import useAuthStore from '../store/useAuthStore';
import { PLAN_LIMITS } from '../utils/planLimits';

const ROLES = ['Software Engineer','Frontend Developer','Backend Developer','Full Stack Developer','Data Scientist / ML Engineer','Product Manager','Business Analyst','DevOps / SRE','Android / iOS Developer','Other'];
const COMPANIES = [{ v: 'startup', l: 'Startup' },{ v: 'mid-size', l: 'Mid-size' },{ v: 'mnc', l: 'MNC / Large' },{ v: 'faang', l: 'Top-tier (FAANG)' },{ v: 'any', l: 'Any / Not sure' }];
const TYPES = [{ v: 'technical', l: 'Technical', icon: Code, desc: 'DSA, system design, CS' },{ v: 'hr', l: 'HR / Behavioral', icon: Users, desc: 'STAR, culture fit' },{ v: 'mixed', l: 'Mixed', icon: Briefcase, desc: 'Both combined' }];
const DIFFS = [{ v: 'easy', l: 'Easy', desc: 'Fresher / campus' },{ v: 'medium', l: 'Medium', desc: 'Standard industry' },{ v: 'hard', l: 'Hard', desc: 'Senior / FAANG' }];

const Chip = ({ selected, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    className={`border-2 border-nb-black px-4 py-2.5 text-sm font-bold uppercase tracking-wide transition-all duration-75 ${
      selected ? 'bg-nb-yellow text-nb-black' : 'bg-white hover:bg-nb-yellow/40'
    }`}
    style={{ borderRadius: '4px', boxShadow: selected ? '2px 2px 0 #111111' : '1px 1px 0 rgba(0,0,0,0.2)' }}
  >
    {children}
  </button>
);

export default function InterviewSetup() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const plan   = user?.subscription?.plan || 'free';
  const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.free;

  const [form, setForm] = useState({
    role: 'Software Engineer', customRole: '',
    companyType: 'any', interviewType: 'technical',
    difficulty: 'medium',
    durationMinutes: Math.min(limits.maxSessionMinutes, 10),
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const durationOpts = [];
  for (let m = 5; m <= limits.maxSessionMinutes; m += 5) durationOpts.push(m);
  if (durationOpts[durationOpts.length - 1] !== limits.maxSessionMinutes) durationOpts.push(limits.maxSessionMinutes);

  const start = () => {
    const role = form.role === 'Other' ? form.customRole.trim() || 'Software Engineer' : form.role;
    navigate('/interview/voice-session', { state: { role, companyType: form.companyType, interviewType: form.interviewType, difficulty: form.difficulty, durationMinutes: form.durationMinutes } });
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl space-y-8">

        {/* Header */}
        <div className="border-b-3 border-nb-black pb-6">
          <div className="flex items-center gap-3 mb-1">
            <div
              className="w-10 h-10 bg-nb-yellow border-2 border-nb-black flex items-center justify-center"
              style={{ borderRadius: '5px', boxShadow: '2px 2px 0 #111111' }}
            >
              <Mic className="w-5 h-5" aria-hidden="true" />
            </div>
            <span
              className="text-[10px] font-black tracking-[0.2em] uppercase px-2 py-1 border-2 border-nb-black bg-white"
              style={{ borderRadius: '3px' }}
            >
              Voice interview setup
            </span>
          </div>
          <h1
            className="font-bold uppercase tracking-tight mt-3"
            style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', letterSpacing: '-0.03em' }}
          >
            Set up your session
          </h1>
          <p className="text-sm font-medium text-nb-black/55 mt-1">The AI adapts to every selection you make.</p>
        </div>

        {/* Role */}
        <div>
          <label className="nb-label">Target role</label>
          <select value={form.role} onChange={e => set('role', e.target.value)} className="nb-input">
            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          {form.role === 'Other' && (
            <input type="text" value={form.customRole} onChange={e => set('customRole', e.target.value)}
              placeholder="Type your role…" className="nb-input mt-2" />
          )}
        </div>

        {/* Company type */}
        <div>
          <label className="nb-label">Company type</label>
          <div className="flex flex-wrap gap-2">
            {COMPANIES.map(({ v, l }) => (
              <Chip key={v} selected={form.companyType === v} onClick={() => set('companyType', v)}>{l}</Chip>
            ))}
          </div>
        </div>

        {/* Interview type */}
        <div>
          <label className="nb-label">Interview type</label>
          <div className="grid grid-cols-3 gap-3">
            {TYPES.map(({ v, l, icon: Icon, desc }) => (
              <button
                key={v}
                type="button"
                onClick={() => set('interviewType', v)}
                className={`border-2 border-nb-black p-4 text-left flex flex-col gap-2 transition-all duration-75 ${
                  form.interviewType === v ? 'bg-nb-yellow' : 'bg-white hover:bg-nb-yellow/30'
                }`}
                style={{ borderRadius: '6px', boxShadow: form.interviewType === v ? '3px 3px 0 #111111' : '2px 2px 0 #111111' }}
              >
                <Icon className="w-5 h-5" aria-hidden="true" />
                <p className="text-sm font-black uppercase tracking-tight">{l}</p>
                <p className="text-xs text-nb-black/60 font-medium">{desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty */}
        <div>
          <label className="nb-label">Difficulty</label>
          <div className="grid grid-cols-3 gap-3">
            {DIFFS.map(({ v, l, desc }) => (
              <button
                key={v}
                type="button"
                onClick={() => set('difficulty', v)}
                className={`border-2 border-nb-black p-4 text-left transition-all duration-75 ${
                  form.difficulty === v ? 'bg-nb-yellow' : 'bg-white hover:bg-nb-yellow/30'
                }`}
                style={{ borderRadius: '6px', boxShadow: form.difficulty === v ? '3px 3px 0 #111111' : '2px 2px 0 #111111' }}
              >
                <p className="font-black uppercase text-sm">{l}</p>
                <p className="text-xs text-nb-black/60 font-medium mt-1">{desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Duration */}
        <div>
          <label className="nb-label flex items-center gap-2"><Clock className="w-3.5 h-3.5" />Duration</label>
          <div className="flex flex-wrap gap-2">
            {durationOpts.map(m => (
              <Chip key={m} selected={form.durationMinutes === m} onClick={() => set('durationMinutes', m)}>{m} min</Chip>
            ))}
          </div>
          {plan === 'free' && (
            <p className="text-xs font-bold text-nb-red flex items-center gap-1 mt-2">
              <Info className="w-3.5 h-3.5" />
              Free plan: max {limits.maxSessionMinutes} min · <a href="/billing" className="underline">Upgrade</a>
            </p>
          )}
        </div>

        {/* Summary + start */}
        <div
          className="border-2 border-nb-black bg-nb-yellow p-6 space-y-4"
          style={{ borderRadius: '8px', boxShadow: '4px 4px 0 #111111' }}
        >
          <p className="text-[10px] font-black uppercase tracking-widest text-nb-black/60">Session summary</p>
          <div className="grid grid-cols-2 gap-y-2 gap-x-6 text-sm">
            {[['Role', form.role === 'Other' ? form.customRole || '—' : form.role],['Type', form.interviewType],['Difficulty', form.difficulty],['Duration', `${form.durationMinutes} min`]].map(([k, v]) => (
              <div key={k}><span className="text-nb-black/50 font-bold">{k}: </span><span className="font-black uppercase">{v}</span></div>
            ))}
          </div>
          <div className="flex items-center justify-between pt-2 border-t-2 border-nb-black">
            <span className="flex items-center gap-1.5 text-xs font-bold text-nb-black/60">
              <Shield className="w-3.5 h-3.5" /> Mic only during session
            </span>
            <button onClick={start} disabled={form.role === 'Other' && !form.customRole.trim()}
              className="btn btn-black disabled:opacity-40">
              Start interview <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
