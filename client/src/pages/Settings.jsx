import { useState, useEffect } from 'react';
import { User, Trophy, Bell, LogOut, Save, Loader2, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import useAuthStore from '../store/useAuthStore';
import api from '../services/api';

const Section = ({ title, icon: Icon, children }) => (
  <div
    className="border-2 border-nb-black bg-white"
    style={{ borderRadius: '8px', boxShadow: '4px 4px 0 #111111' }}
  >
    <div
      className="flex items-center gap-3 border-b-3 border-nb-black px-6 py-4 bg-nb-black text-white"
      style={{ borderRadius: '6px 6px 0 0' }}
    >
      <Icon className="w-4 h-4 text-nb-yellow" aria-hidden="true" />
      <h2 className="text-[11px] font-black uppercase tracking-[0.18em]">{title}</h2>
    </div>
    <div className="p-6 space-y-5">{children}</div>
  </div>
);

const Field = ({ label, children }) => (
  <div className="space-y-1.5">
    <label className="nb-label">{label}</label>
    {children}
  </div>
);

export default function Settings() {
  const { user, updateUser, logout } = useAuthStore();
  const navigate = useNavigate();

  const [profile, setProfile]         = useState({ name: user?.name || '', college: user?.profile?.college || '', targetRole: user?.profile?.targetRole || '' });
  const [lb, setLb]                   = useState({ optIn: false, displayName: '', college: '' });
  const [savingProfile, setSavingP]   = useState(false);
  const [savingLb, setSavingLb]       = useState(false);
  const [loadingLb, setLoadingLb]     = useState(true);

  useEffect(() => {
    api.get('/leaderboard/my-rank').then(({ data }) => {
      setLb({ optIn: data.data?.optedIn ?? false, displayName: data.data?.displayName || user?.name || '', college: data.data?.college || user?.profile?.college || '' });
    }).catch(() => {}).finally(() => setLoadingLb(false));
  }, []); // eslint-disable-line

  const saveProfile = async () => {
    setSavingP(true);
    try {
      const { data } = await api.put('/users/profile', profile);
      updateUser(data.user || { name: profile.name });
      toast.success('Profile saved');
    } catch (e) { toast.error(e?.response?.data?.message || 'Failed'); }
    finally { setSavingP(false); }
  };

  const saveLb = async () => {
    setSavingLb(true);
    try {
      if (lb.optIn) { await api.post('/leaderboard/opt-in', { displayName: lb.displayName, college: lb.college }); toast.success('Leaderboard settings saved'); }
      else { await api.post('/leaderboard/opt-out'); toast.success('Removed from leaderboard'); }
    } catch (e) { toast.error(e?.response?.data?.message || 'Failed'); }
    finally { setSavingLb(false); }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl space-y-6">

        <div className="border-b-3 border-nb-black pb-6">
          <h1
            className="font-bold uppercase tracking-tight"
            style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', letterSpacing: '-0.03em' }}
          >
            Settings
          </h1>
          <p className="text-sm font-medium text-nb-black/55 mt-1">Profile, leaderboard, and account.</p>
        </div>

        {/* Profile */}
        <Section title="Profile" icon={User}>
          <Field label="Full name">
            <input value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} className="nb-input" />
          </Field>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="College / Institution">
              <input value={profile.college} onChange={e => setProfile(p => ({ ...p, college: e.target.value }))} placeholder="e.g. IIT Bombay" className="nb-input" />
            </Field>
            <Field label="Target role">
              <input value={profile.targetRole} onChange={e => setProfile(p => ({ ...p, targetRole: e.target.value }))} placeholder="e.g. Software Engineer" className="nb-input" />
            </Field>
          </div>
          <div className="flex justify-end pt-2">
            <button onClick={saveProfile} disabled={savingProfile} className="btn btn-black">
              {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save profile
            </button>
          </div>
        </Section>

        {/* Leaderboard */}
        <Section title="Leaderboard" icon={Trophy}>
          {loadingLb ? (
            <div className="flex items-center gap-2 text-sm font-bold text-nb-black/50">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading…
            </div>
          ) : (
            <>
              {/* Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-black uppercase tracking-tight">Show me on the leaderboard</p>
                  <p className="text-xs font-medium text-nb-black/60 mt-0.5">Display name &amp; college are public. Email is never shown.</p>
                </div>
                <button onClick={() => setLb(l => ({ ...l, optIn: !l.optIn }))}
                  className={`relative w-12 h-7 border-3 border-nb-black transition-colors ${lb.optIn ? 'bg-nb-yellow' : 'bg-[#F5F1E8]'}`}
                  aria-label="Toggle leaderboard">
                  <span className={`absolute top-0.5 w-5 h-5 border-2 border-nb-black bg-white transition-all ${lb.optIn ? 'left-[22px]' : 'left-0.5'}`} />
                </button>
              </div>

              {lb.optIn && (
                <div className="grid sm:grid-cols-2 gap-4 pt-2 border-t-2 border-nb-black">
                  <Field label="Display name (public)">
                    <input value={lb.displayName} onChange={e => setLb(l => ({ ...l, displayName: e.target.value }))} maxLength={40} className="nb-input" />
                  </Field>
                  <Field label="College (for college filter)">
                    <input value={lb.college} onChange={e => setLb(l => ({ ...l, college: e.target.value }))} maxLength={80} className="nb-input" />
                  </Field>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button onClick={saveLb} disabled={savingLb} className="btn btn-black">
                  {savingLb ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save
                </button>
              </div>
            </>
          )}
        </Section>

        {/* Notifications */}
        <Section title="Notifications" icon={Bell}>
          <p className="text-sm font-medium text-nb-black/50">Email notification preferences — coming soon.</p>
        </Section>

        {/* Account */}
        <div
          className="border-2 border-nb-black bg-white"
          style={{ borderRadius: '8px', boxShadow: '4px 4px 0 #111111' }}
        >
          <div
            className="flex items-center gap-3 border-b-3 border-nb-black px-6 py-4 bg-nb-black text-white"
            style={{ borderRadius: '6px 6px 0 0' }}
          >
            <span className="text-[11px] font-black uppercase tracking-[0.18em] text-nb-yellow">Account</span>
          </div>
          <div className="divide-y-2 divide-nb-black/10">
            <button onClick={() => navigate('/billing')}
              className="w-full flex items-center justify-between px-6 py-4 hover:bg-nb-yellow/20 transition-colors text-sm font-bold uppercase tracking-wide">
              Manage subscription <ChevronRight className="w-4 h-4" />
            </button>
            <button onClick={() => { logout(); navigate('/login'); }}
              className="w-full flex items-center gap-3 px-6 py-4 hover:bg-nb-red hover:text-white transition-colors text-sm font-bold uppercase tracking-wide text-nb-red">
              <LogOut className="w-4 h-4" /> Sign out
            </button>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
