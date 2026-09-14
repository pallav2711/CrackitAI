/**
 * Voice Interview Results Page
 * Shows overall score, per-question feedback, and strengths/improvements.
 */
import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Trophy, Star, Target, TrendingUp, ArrowRight, Mic, ChevronDown, ChevronUp } from 'lucide-react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import api from '../services/api';

const ScoreBadge = ({ score }) => {
  const color = score >= 80 ? 'bg-nb-green' : score >= 60 ? 'bg-nb-yellow' : 'bg-nb-red';
  return (
    <span
      className={`inline-flex items-center justify-center text-sm font-black font-mono w-12 h-8 border-2 border-nb-black text-nb-black ${color}`}
      style={{ borderRadius: '3px', boxShadow: '1px 1px 0 #111' }}
    >
      {score}
    </span>
  );
};

const QuestionCard = ({ item, index }) => {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="bg-white border-2 border-nb-black"
      style={{ borderRadius: '6px', boxShadow: '3px 3px 0 #111' }}
    >
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-nb-yellow/10 transition-colors"
      >
        <span className="text-[10px] font-black font-mono text-nb-black/40 w-5 shrink-0">Q{index + 1}</span>
        <p className="flex-1 text-sm font-bold text-nb-black line-clamp-2">{item.question}</p>
        <ScoreBadge score={item.score || 0} />
        {open ? <ChevronUp className="w-4 h-4 shrink-0" /> : <ChevronDown className="w-4 h-4 shrink-0" />}
      </button>

      {open && (
        <div className="border-t-2 border-nb-black/10 p-4 space-y-3">
          {item.userAnswer && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-nb-black/40 mb-1">Your answer</p>
              <p className="text-sm text-nb-black/70 leading-relaxed">{item.userAnswer}</p>
            </div>
          )}
          {item.feedback && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-nb-black/40 mb-1">Feedback</p>
              <p className="text-sm text-nb-black/70 leading-relaxed">{item.feedback}</p>
            </div>
          )}
          {item.strengths?.length > 0 && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-nb-green mb-1">Strengths</p>
              <ul className="space-y-0.5">
                {item.strengths.map((s, i) => (
                  <li key={i} className="text-xs text-nb-black/60 flex gap-2"><span className="text-nb-green">✓</span>{s}</li>
                ))}
              </ul>
            </div>
          )}
          {item.improvements?.length > 0 && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-nb-red mb-1">Improve</p>
              <ul className="space-y-0.5">
                {item.improvements.map((s, i) => (
                  <li key={i} className="text-xs text-nb-black/60 flex gap-2"><span className="text-nb-red">→</span>{s}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default function InterviewResults() {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const location     = useLocation();
  const fromVoice    = location.state?.fromVoice;
  const pointsAwarded = location.state?.pointsAwarded;

  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/interview/${id}`);
        setData(res.data?.interview || res.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-64">
        <div className="text-sm font-mono text-nb-black/40 animate-pulse uppercase tracking-widest">Loading results…</div>
      </div>
    </DashboardLayout>
  );

  if (error || !data) return (
    <DashboardLayout>
      <div className="text-center py-16 space-y-4">
        <p className="text-sm font-mono text-nb-red">{error || 'Results not found'}</p>
        <button onClick={() => navigate('/dashboard')} className="btn btn-primary btn-sm">Back to dashboard</button>
      </div>
    </DashboardLayout>
  );

  const score = data.overallScore || 0;
  const scoreColor = score >= 80 ? 'bg-nb-green' : score >= 60 ? 'bg-nb-yellow' : 'bg-white';

  return (
    <DashboardLayout>
      <div className="max-w-3xl space-y-8">

        {/* Header */}
        <div className="border-b-3 border-nb-black pb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 bg-nb-yellow border-2 border-nb-black flex items-center justify-center" style={{ borderRadius: '5px', boxShadow: '2px 2px 0 #111' }}>
              <Mic className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-black tracking-widest uppercase px-2 py-1 border-2 border-nb-black bg-white" style={{ borderRadius: '3px' }}>
              Interview Results
            </span>
          </div>
          <h1 className="font-bold uppercase tracking-tight" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem,4vw,2.25rem)', letterSpacing: '-0.03em' }}>
            {data.role} · {data.type}
          </h1>
          <p className="text-sm text-nb-black/50 mt-1 font-mono">{data.difficulty} difficulty · {Math.round((data.actualDuration || 0) / 60)} min</p>
        </div>

        {/* Points toast */}
        {fromVoice && pointsAwarded > 0 && (
          <div className="bg-nb-yellow border-2 border-nb-black p-4 flex items-center gap-3" style={{ borderRadius: '6px', boxShadow: '3px 3px 0 #111' }}>
            <Trophy className="w-5 h-5 text-nb-black" />
            <p className="font-black text-nb-black text-sm">+{pointsAwarded} leaderboard points earned!</p>
          </div>
        )}

        {/* Score hero */}
        <div className={`${scoreColor} border-2 border-nb-black p-8 flex flex-col sm:flex-row items-center gap-6`} style={{ borderRadius: '8px', boxShadow: '4px 4px 0 #111' }}>
          <div className="flex flex-col items-center gap-1 shrink-0">
            <span className="text-[10px] font-black uppercase tracking-widest text-nb-black/50">Overall Score</span>
            <span className="text-7xl font-black leading-none font-mono" style={{ letterSpacing: '-0.04em' }}>{score}</span>
            <span className="text-sm font-bold text-nb-black/50">/100</span>
          </div>
          <div className="flex-1 space-y-2">
            {data.overallFeedback && (
              <p className="text-sm text-nb-black/80 leading-relaxed">{data.overallFeedback}</p>
            )}
            <div className="flex flex-wrap gap-2 mt-2">
              {[
                { label: 'Questions', value: data.questions?.length || 0, icon: Target },
                { label: 'Points', value: pointsAwarded || 0, icon: Star },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="flex items-center gap-1.5 bg-white/60 border-2 border-nb-black px-3 py-1.5" style={{ borderRadius: '4px' }}>
                  <Icon className="w-3.5 h-3.5" />
                  <span className="text-xs font-black font-mono">{value}</span>
                  <span className="text-[10px] uppercase tracking-wide text-nb-black/50">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Strengths + Improvements */}
        {(data.strengths?.length > 0 || data.areasForImprovement?.length > 0) && (
          <div className="grid sm:grid-cols-2 gap-4">
            {data.strengths?.length > 0 && (
              <div className="bg-white border-2 border-nb-black p-5 space-y-3" style={{ borderRadius: '6px', boxShadow: '3px 3px 0 #111' }}>
                <div className="flex items-center gap-2 border-b-2 border-nb-black pb-3">
                  <TrendingUp className="w-4 h-4 text-nb-green" />
                  <h3 className="text-xs font-black uppercase tracking-widest">Strengths</h3>
                </div>
                <ul className="space-y-1.5">
                  {data.strengths.map((s, i) => (
                    <li key={i} className="text-sm text-nb-black/70 flex gap-2"><span className="text-nb-green font-bold">✓</span>{s}</li>
                  ))}
                </ul>
              </div>
            )}
            {data.areasForImprovement?.length > 0 && (
              <div className="bg-white border-2 border-nb-black p-5 space-y-3" style={{ borderRadius: '6px', boxShadow: '3px 3px 0 #111' }}>
                <div className="flex items-center gap-2 border-b-2 border-nb-black pb-3">
                  <Target className="w-4 h-4 text-nb-red" />
                  <h3 className="text-xs font-black uppercase tracking-widest">Improve</h3>
                </div>
                <ul className="space-y-1.5">
                  {data.areasForImprovement.map((s, i) => (
                    <li key={i} className="text-sm text-nb-black/70 flex gap-2"><span className="text-nb-red font-bold">→</span>{s}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Per-question breakdown */}
        {data.questions?.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xs font-black uppercase tracking-widest text-nb-black/50">Question Breakdown</h2>
            {data.questions.map((q, i) => (
              <QuestionCard key={i} item={q} index={i} />
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-3 pt-2">
          <button onClick={() => navigate('/interview/setup')} className="btn btn-primary">
            <Mic className="w-4 h-4" />
            New Interview
          </button>
          <button onClick={() => navigate('/dashboard')} className="btn btn-ghost">
            Dashboard <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </DashboardLayout>
  );
}
