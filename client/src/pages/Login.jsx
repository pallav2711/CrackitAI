import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import Logo from '../components/common/Logo';
import toast from 'react-hot-toast';
import api from '../services/api';
import useAuthStore from '../store/useAuthStore';

const Login = () => {
  const navigate      = useNavigate();
  const { login }     = useAuthStore();
  const [show, setShow]       = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm]       = useState({ email: '', password: '' });

  const set = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/login', form);
      login(res.data.user, res.data.token);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F1E8] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">

        {/* ── Top strip — yellow ─────────────────────────────────────────── */}
        <div
          className="bg-nb-yellow border-3 border-nb-black border-b-0 px-6 py-5 flex items-center justify-between"
          style={{ borderRadius: '8px 8px 0 0', boxShadow: '4px 0 0 #111111, -4px 0 0 #111111' }}
        >
          <Link to="/" aria-label="Go to homepage">
            <Logo size="sm" variant="default" showText />
          </Link>
          <span
            className="text-[10px] font-black tracking-[0.2em] uppercase px-2.5 py-1.5 bg-nb-black text-nb-yellow border-2 border-nb-black"
            style={{ borderRadius: '4px' }}
          >
            SIGN IN
          </span>
        </div>

        {/* ── Form body ─────────────────────────────────────────────────── */}
        <div
          className="bg-white border-3 border-nb-black p-8 space-y-6"
          style={{ boxShadow: '4px 4px 0 #111111' }}
        >
          <div>
            <h1
              className="font-bold uppercase tracking-tight"
              style={{ fontFamily: 'var(--font-display)', fontSize: '1.875rem', letterSpacing: '-0.03em' }}
            >
              Welcome back
            </h1>
            <p className="text-sm text-nb-black/55 font-medium mt-1">
              Continue your interview prep journey.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Email */}
            <div>
              <label className="nb-label" htmlFor="login-email">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-nb-black/40 pointer-events-none" aria-hidden="true" />
                <input
                  id="login-email"
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

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="nb-label mb-0" htmlFor="login-password">Password</label>
                <Link
                  to="/contact"
                  className="text-[11px] font-bold text-nb-black/50 hover:text-nb-black underline underline-offset-2"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-nb-black/40 pointer-events-none" aria-hidden="true" />
                <input
                  id="login-password"
                  type={show ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={set}
                  className="nb-nb-input pl-10 pr-10"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-nb-black/40 hover:text-nb-black transition-colors"
                  aria-label={show ? 'Hide password' : 'Show password'}
                >
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-black w-full justify-center mt-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span
                    className="w-4 h-4 border-2 border-nb-yellow/30 border-t-nb-yellow rounded-full animate-spin"
                    aria-hidden="true"
                  />
                  Signing in…
                </span>
              ) : (
                <>
                  <span>Login to Dashboard</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </>
              )}
            </button>
          </form>

          {/* Register link */}
          <div className="border-t-2 border-nb-black/10 pt-5 space-y-3">
            <p className="text-[11px] font-black uppercase tracking-widest text-nb-black/40 text-center">
              New here?
            </p>
            <Link to="/register" className="btn btn-secondary w-full justify-center">
              Create free account
            </Link>
          </div>
        </div>

        {/* ── Bottom tag — dark ──────────────────────────────────────────── */}
        <div
          className="border-3 border-nb-black border-t-0 bg-nb-black px-6 py-3 flex items-center justify-between"
          style={{ borderRadius: '0 0 8px 8px', boxShadow: '4px 4px 0 #111111' }}
        >
          <span className="text-[11px] font-mono text-white/40 uppercase tracking-widest">
            Secure · Encrypted
          </span>
          <Link to="/" className="text-xs font-bold text-nb-yellow hover:text-nb-yellow/80 transition-colors">
            ← Home
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Login;
