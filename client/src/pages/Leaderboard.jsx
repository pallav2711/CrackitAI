import { useState, useEffect, useRef } from 'react';
import { Trophy, Globe, GraduationCap, Code, Loader2, Lock, Zap, Info, ArrowRight, Crown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import useAuthStore from '../store/useAuthStore';
import api from '../services/api';
import toast from 'react-hot-toast';

const SCOPES  = [{ v: 'global', l: 'Global', icon: Globe }, { v: 'college', l: 'College', icon: GraduationCap }, { v: 'role', l: 'Role', icon: Code }];
const PERIODS = [{ v: 'weekly', l: 'This Week' }, { v: 'alltime', l: 'All Time' }];

/* ─── Avatar ─────────────────────────────────────────────────────────────── */
const Av = ({ name, size = 'md' }) => {
  const sz = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-14 h-14 text-xl' }[size];
  const initials = name?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || '?';
  const colors = ['bg-nb-yellow text-nb-black', 'bg-nb-blue text-white', 'bg-nb-red text-white', 'bg-nb-green text-nb-black'];
  const c = colors[(name?.charCodeAt(0) || 0) % colors.length];
  return <div className={`${sz} ${c} border-2 border-nb-black flex items-center justify-center font-black flex-shrink-0`}>{initials}</div>;
};

/* ─── Top-3 Podium ────────────────────────────────────────────────────────── */
const PODIUM = [
  { bg: 'bg-nb-yellow', border: 'border-nb-yellow', label: '1ST', emoji: '👑', lift: '-mt-8' },
  { bg: 'bg-white',  border: 'border-nb-black',  label: '2ND', emoji: '🥈', lift: '' },
  { bg: 'bg-white',  border: 'border-nb-black',  label: '3RD', emoji: '🥉', lift: '' },
];
const Podium = ({ entries }) => {
  const order = [entries[1], entries[0], entries[2]].filter(Boolean);
  const styles = [PODIUM[1], PODIUM[0], PODIUM[2]];
  return (
    <div className="border-3 border-nb-black bg-nb-black  p-8">
      <div className="flex items-end justify-center gap-4 sm:gap-8">
        {order.map((entry, i) => {
          const s = styles[i];
          const isFirst = i === 1;
          return (
            <div key={entry.userId} className={`flex flex-col items-center gap-2 ${isFirst ? s.lift : ''}`}>
              {isFirst && <Crown className="w-6 h-6 text-nb-yellow animate-bounce" />}
              <div className={`${isFirst ? 'w-16 h-16' : 'w-12 h-12'} ${s.bg} border-3 ${s.border} flex items-center justify-center text-2xl`}>
                {s.emoji}
              </div>
              <p className={`font-black uppercase tracking-tight text-center ${isFirst ? 'text-nb-yellow text-sm' : 'text-white/80 text-xs'}`}>
                {entry.displayName}
                {entry.isCurrentUser && <span className="block text-[9px] text-nb-yellow/70">you</span>}
              </p>
              <div className={`border-2 ${s.border} px-3 py-1 ${s.bg}`}>
                <p className={`font-black font-mono text-sm ${isFirst ? 'text-nb-black' : 'text-white'}`}>
                  {entry.points.toLocaleString()} pts
                </p>
              </div>
              <span className={`text-[10px] font-black uppercase tracking-widest ${isFirst ? 'text-nb-yellow' : 'text-white/40'}`}>
                {s.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ─── Opt-in modal ────────────────────────────────────────────────────────── */
const OptInModal = ({ onClose, onSuccess }) => {
  const { user } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [college, setCollege] = useState(user?.profile?.college || '');
  const [loading, setLoading] = useState(false);
  const submit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/leaderboard/opt-in', { displayName: name, college });
      toast.success('You\'re on the board!');
      onSuccess();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="fixed inset-0 bg-nb-black/70 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true">
      <div
        className="bg-white border-3 border-nb-black w-full max-w-sm"
        style={{ borderRadius: '8px', boxShadow: '8px 8px 0 #111111' }}
      >
        <div className="bg-nb-yellow border-b-3 border-nb-black px-6 py-4 flex items-center gap-3" style={{ borderRadius: '6px 6px 0 0' }}>
          <Trophy className="w-5 h-5" aria-hidden="true" />
          <h3 className="font-black uppercase tracking-tight">Join Leaderboard</h3>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4">
          <p className="text-xs font-bold text-nb-black/55 uppercase tracking-wider">
            Your name &amp; college are public. Email is never shown.
          </p>
          <div>
            <label className="nb-label" htmlFor="lb-name">Display name</label>
            <input
              id="lb-name"
              value={name}
              onChange={e => setName(e.target.value)}
              maxLength={40}
              required
              className="nb-input"
              placeholder="How you appear on the board"
            />
          </div>
          <div>
            <label className="nb-label" htmlFor="lb-college">
              College <span className="normal-case font-normal tracking-normal">(optional)</span>
            </label>
            <input
              id="lb-college"
              value={college}
              onChange={e => setCollege(e.target.value)}
              maxLength={80}
              className="nb-input"
              placeholder="Enables college filter"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn btn-secondary flex-1 justify-center">Cancel</button>
            <button type="submit" disabled={loading} className="btn btn-black flex-1 justify-center">
              {loading
                ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                : <>Join <ArrowRight className="w-4 h-4" aria-hidden="true" /></>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ─── Page ────────────────────────────────────────────────────────────────── */
export default function Leaderboard() {
  const { user } = useAuthStore();
  const [scope, setScope]       = useState('global');
  const [period, setPeriod]     = useState('weekly');
  const [data, setData]         = useState(null);
  const [myRank, setMyRank]     = useState(null);
  const [loading, setLoading]   = useState(true);
  const [optInModal, setOptInModal] = useState(false);
  const youRef = useRef(null);

  const load = async () => {
    try {
      setLoading(true);
      const [lb, rk] = await Promise.all([
        api.get(`/leaderboard?scope=${scope}&period=${period}`),
        api.get('/leaderboard/my-rank'),
      ]);
      setData(lb.data.data);
      setMyRank(rk.data.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [scope, period]); // eslint-disable-line
  useEffect(() => { if (youRef.current) youRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, [data]);

  const optOut = async () => {
    try { await api.post('/leaderboard/opt-out'); toast.success('Removed from leaderboard'); load(); }
    catch { toast.error('Failed'); }
  };

  const top3 = data?.leaderboard?.slice(0, 3) ?? [];
  const rest = data?.leaderboard?.slice(3) ?? [];
  const isOptedIn = myRank?.optedIn;

  return (
    <DashboardLayout>
      <div className="max-w-3xl space-y-6">

        {/* Header */}
        <div className="border-b-3 border-nb-black pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tight flex items-center gap-3">
              <Trophy className="w-8 h-8" /> Leaderboard
            </h1>
            <p className="text-sm font-medium text-nb-black/60 mt-1">
              {period === 'weekly'
                ? `Resets Monday · ${data?.weekResetsOn ? `${Math.ceil((new Date(data.weekResetsOn) - new Date()) / 86400000)}d left` : ''}`
                : 'All-time rankings'}
            </p>
          </div>
          {!isOptedIn
            ? <button onClick={() => setOptInModal(true)} className="btn btn-primary self-start"><Zap className="w-4 h-4" />Join leaderboard</button>
            : <button onClick={optOut} className="text-xs font-black underline underline-offset-2 text-nb-red">Leave</button>
          }
        </div>

        {/* Your rank strip */}
        {myRank && (
          <div
            className={`border-2 border-nb-black p-4 flex items-center gap-4 ${isOptedIn ? 'bg-nb-yellow' : 'bg-white'}`}
            style={{ borderRadius: '6px', boxShadow: '3px 3px 0 #111111' }}
          >
            <Av name={myRank.displayName || user?.name} size="md" />
            <div className="flex-1 min-w-0">
              <p className="font-black text-sm">{myRank.displayName || user?.name} <span className="text-nb-black/40 font-bold">(you)</span></p>
              {myRank.college && <p className="text-xs text-nb-black/60">{myRank.college}</p>}
            </div>
            <div className="text-center border-l-2 border-nb-black pl-4">
              <p className="text-2xl font-black font-mono">{period === 'weekly' ? myRank.weeklyPoints : myRank.totalPoints}</p>
              <p className="text-[10px] font-black uppercase tracking-widest">pts</p>
            </div>
            <div className="text-center border-l-2 border-nb-black pl-4">
              <p className="text-xl font-black font-mono">#{period === 'weekly' ? myRank.weeklyRank : myRank.alltimeRank}</p>
              <p className="text-[10px] font-black uppercase tracking-widest">rank</p>
            </div>
            {!isOptedIn && <div className="flex items-center gap-1 text-xs font-bold text-nb-black/50 border-l-2 border-nb-black pl-4"><Lock className="w-3 h-3" />Private</div>}
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex border-3 border-nb-black overflow-hidden">
            {SCOPES.map(({ v, l, icon: Icon }) => (
              <button key={v} onClick={() => setScope(v)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-black uppercase tracking-wider border-r-2 border-nb-black last:border-r-0 transition-colors ${scope === v ? 'bg-nb-black text-nb-yellow' : 'bg-white hover:bg-nb-yellow/40'}`}>
                <Icon className="w-3.5 h-3.5" />{l}
              </button>
            ))}
          </div>
          <div className="flex border-3 border-nb-black overflow-hidden">
            {PERIODS.map(({ v, l }) => (
              <button key={v} onClick={() => setPeriod(v)}
                className={`px-4 py-2.5 text-xs font-black uppercase tracking-wider border-r-2 border-nb-black last:border-r-0 transition-colors ${period === v ? 'bg-nb-black text-nb-yellow' : 'bg-white hover:bg-nb-yellow/40'}`}>
                {l}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-nb-black border-t-nb-yellow rounded-full animate-spin" />
          </div>
        ) : !data?.leaderboard?.length ? (
          <div
            className="border-2 border-nb-black bg-white p-12 text-center space-y-4"
            style={{ borderRadius: '8px', boxShadow: '4px 4px 0 #111111' }}
          >
            <Trophy className="w-12 h-12 mx-auto text-nb-black/20" />
            <p className="font-black uppercase text-nb-black/40">No rankings yet</p>
            {!isOptedIn && <button onClick={() => setOptInModal(true)} className="btn btn-primary inline-flex">Be first →</button>}
          </div>
        ) : (
          <>
            {top3.length > 0 && <Podium entries={top3} />}

            {rest.length > 0 && (
              <div
                className="border-2 border-nb-black bg-white overflow-hidden"
                style={{ borderRadius: '8px', boxShadow: '4px 4px 0 #111111' }}
              >
                <AnimatePresence>
                  {rest.map((entry, idx) => (
                    <motion.div key={entry.userId}
                      ref={entry.isCurrentUser ? youRef : null}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.03 }}
                      className={`flex items-center gap-4 px-5 py-4 border-b-2 border-nb-black last:border-b-0 ${entry.isCurrentUser ? 'bg-nb-yellow' : 'hover:bg-[#F5F1E8]'}`}>
                      <span className="w-10 text-center font-black font-mono text-nb-black/50">#{entry.rank}</span>
                      <Av name={entry.displayName} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-sm truncate">
                          {entry.displayName}
                          {entry.isCurrentUser && <span className="ml-2 nb-badge text-[9px]">YOU</span>}
                        </p>
                        {entry.college && <p className="text-xs text-nb-black/50 truncate">{entry.college}</p>}
                      </div>
                      <div className="text-right">
                        <p className="font-black font-mono">{entry.points.toLocaleString()}</p>
                        <p className="text-[10px] font-bold text-nb-black/50 uppercase">pts</p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </>
        )}

        {/* Privacy note */}
        <div className="flex items-start gap-2 text-xs font-medium text-nb-black/50 pb-4">
          <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
          Only opted-in users appear here. Points are earned from completed voice interviews only.
        </div>
      </div>

      {optInModal && <OptInModal onClose={() => setOptInModal(false)} onSuccess={() => { setOptInModal(false); load(); }} />}
    </DashboardLayout>
  );
}
