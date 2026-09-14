import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, CheckCircle } from 'lucide-react';
import Logo from '../components/common/Logo';
import toast from 'react-hot-toast';
import api from '../services/api';

const BENEFITS = [
  '1 free voice interview — no card needed',
  'AI resume scanner (unlimited scans)',
  'Leaderboard participation',
  'Full score report after every session',
];

const Register = () => {
  const navigate              = useNavigate();
  const [show, setShow]       = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm]       = useState({ name: '', email: '', password: '', confirm: '' });
  const [agreed, setAgreed]   = useState(false);

  const set = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      toast.error('Passwords do not match');
      return;
    }
    if (!agreed) {
      toast.error('Please accept the terms to continue');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/register', {
        name:     form.name,
        email:    form.email,
        password: form.password,
      });
      toast.success('Account created! Please sign in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F1E8] flex items-stretch">

      {/* ── Left panel — desktop only ──────────────────────────────────── */}
      <div
        className="hidden lg:flex w-96 flex-shrink-0 flex-col bg-nb-black border-r-3 border-nb-black p-10 justify-between"
        aria-hidden="true"
      >
        <Link to="/" tabIndex={-1}>
          <Logo size="sm" variant="light" showText />
        </Link>

        <div className="space-y-8">
          <div>
            <h2
              className="font-bold uppercase text-nb-yellow leading-none"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(2rem, 3vw, 2.75rem)',
                letterSpacing: '-0.04em',
                lineHeight: '1.05',
              }}
            >
              Start your<br />interview<br />journey.
            </h2>
            <p className="text-sm text-white/50 mt-5 leading-relaxed">
              India's first voice-based AI interview platform.
              Speak. Get scored. Rank up.
            </p>
          </div>

          <ul className="space-y-3.5">
            {BENEFITS.map(b => (
              <li key={b} className="flex items-start gap-3">
                <div
                  className="w-5 h-5 bg-nb-yellow border-2 border-nb-black flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ borderRadius: '3px' }}
                >
                  <span className="text-nb-black text-[9px] font-black leading-none">✓</span>
                </div>
                <span className="text-sm font-medium text-white/75">{b}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-3">
          <div className="h-1 bg-nb-yellow/30" />
          <p className="text-[11px] font-mono text-white/30 uppercase tracking-widest">
            Free to start · No credit card
          </p>
        </div>
      </div>

      {/* ── Right panel — form ────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-4 py-14">
        <div className="w-full max-w-md">

          {/* Yellow header strip */}
          <div
            className="bg-nb-yellow border-3 border-nb-black border-b-0 px-6 py-5 flex items-center justify-between"
            style={{ borderRadius: '8px 8px 0 0', boxShadow: '4px 0 0 #111111, -4px 0 0 #111111' }}
          >
            <Link to="/" className="lg:hidden" aria-label="Go to homepage">
              <Logo size="sm" variant="default" showText />
            </Link>
            <div className="hidden lg:block">
              <span className="text-xs font-black uppercase tracking-widest text-nb-black/60">CrackIt AI</span>
            </div>
            <span
              className="text-[10px] font-black tracking-[0.2em] uppercase px-2.5 py-1.5 bg-nb-black text-nb-yellow border-2 border-nb-black"
              style={{ borderRadius: '4px' }}
            >
              CREATE ACCOUNT
            </span>
          </div>

          {/* Form body */}
          <div
            className="bg-white border-3 border-nb-black p-8 space-y-5"
            style={{ boxShadow: '4px 4px 0 #111111' }}
          >
            <div>
              <h1
                className="font-bold uppercase tracking-tight"
                style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', letterSpacing: '-0.03em' }}
              >
                Join CrackIt AI
              </h1>
              <p className="text-sm text-nb-black/55 mt-1 font-medium">
                Free plan · No card required
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* Name */}
              <div>
                <label className="nb-label" htmlFor="reg-name">Full name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-nb-black/40 pointer-events-none" aria-hidden="true" />
                  <input
                    id="reg-name"
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={set}
                    className="nb-nb-input pl-10"
                    placeholder="Jane Doe"
                    required
                    autoComplete="name"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="nb-label" htmlFor="reg-email">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-nb-black/40 pointer-events-none" aria-hidden="true" />
                  <input
                    id="reg-email"
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={set}
                    className="nb-nb-input pl-10"
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password row */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { name: 'password', id: 'reg-pw',  label: 'Password',         ph: '••••••••' },
                  { name: 'confirm',  id: 'reg-cpw', label: 'Confirm password',  ph: '••••••••' },
                ].map(({ name, id, label, ph }) => (
                  <div key={name}>
                    <label className="nb-label" htmlFor={id}>{label}</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-nb-black/40 pointer-events-none" aria-hidden="true" />
                      <input
                        id={id}
                        type={show ? 'text' : 'password'}
                        name={name}
                        value={form[name]}
                        onChange={set}
                        className="nb-nb-input pl-10 pr-8"
                        placeholder={ph}
                        required
                        minLength={6}
                        autoComplete={name === 'password' ? 'new-password' : 'new-password'}
                      />
                      {name === 'password' && (
                        <button
                          type="button"
                          onClick={() => setShow(!show)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-nb-black/40 hover:text-nb-black transition-colors"
                          aria-label={show ? 'Hide password' : 'Show password'}
                        >
                          {show ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Terms checkbox */}
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <div className="relative flex-shrink-0 mt-0.5">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={e => setAgreed(e.target.checked)}
                    className="nb-checkbox"
                    aria-label="Agree to terms and privacy policy"
                  />
                  {agreed && (
                    <CheckCircle
                      className="absolute inset-0 w-5 h-5 text-nb-black pointer-events-none"
                      aria-hidden="true"
                    />
                  )}
                </div>
                <span className="text-xs font-medium text-nb-black/65 leading-relaxed">
                  I agree to the{' '}
                  <Link to="/terms-of-service" className="font-black underline underline-offset-2 hover:text-nb-black">
                    Terms of Service
                  </Link>
                  {' & '}
                  <Link to="/privacy-policy" className="font-black underline underline-offset-2 hover:text-nb-black">
                    Privacy Policy
                  </Link>
                </span>
              </label>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="btn btn-black w-full justify-center mt-1"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span
                      className="w-4 h-4 border-2 border-nb-yellow/30 border-t-nb-yellow rounded-full animate-spin"
                      aria-hidden="true"
                    />
                    Creating account…
                  </span>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </>
                )}
              </button>
            </form>

            {/* Sign in link */}
            <div className="border-t-2 border-nb-black/10 pt-4 space-y-3">
              <p className="text-[11px] font-black uppercase tracking-widest text-nb-black/40 text-center">
                Already have an account?
              </p>
              <Link to="/login" className="btn btn-secondary w-full justify-center">
                Sign in
              </Link>
            </div>
          </div>

          {/* Bottom bar */}
          <div
            className="border-3 border-nb-black border-t-0 bg-nb-black px-6 py-3 flex items-center justify-between"
            style={{ borderRadius: '0 0 8px 8px', boxShadow: '4px 4px 0 #111111' }}
          >
            <span className="text-[11px] font-mono text-white/40 uppercase tracking-widest">
              Free · No card needed
            </span>
            <Link to="/" className="text-xs font-bold text-nb-yellow hover:text-nb-yellow/80 transition-colors">
              ← Home
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Register;
