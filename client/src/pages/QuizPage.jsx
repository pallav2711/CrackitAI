import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Check, X, ChevronRight,
  Loader2, Trophy, BarChart2,
} from 'lucide-react';
import api from '../services/api';
import DashboardLayout from '../components/dashboard/DashboardLayout';

/* ── Score color ─────────────────────────────────────────────────────────── */
const scoreColor = (pct) => {
  if (pct >= 80) return 'text-green-600';
  if (pct >= 60) return 'text-nb-black';
  if (pct >= 40) return 'text-orange-600';
  return 'text-red-600';
};

const scoreBg = (pct) => {
  if (pct >= 80) return 'bg-green-100 border-green-400';
  if (pct >= 60) return 'bg-nb-yellow border-nb-black';
  if (pct >= 40) return 'bg-orange-100 border-orange-400';
  return 'bg-red-100 border-red-400';
};

/* ── Results Screen ──────────────────────────────────────────────────────── */
const ResultsScreen = ({ score, total, categoryScores, weakAreas, jobId }) => {
  const pct = Math.round((score / total) * 100);
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto py-8 space-y-6">

        {/* Score hero */}
        <div
          className={`border-2 border-nb-black p-10 text-center ${scoreBg(pct)}`}
          style={{ borderRadius: '10px', boxShadow: '5px 5px 0 #111' }}
        >
          <Trophy className="w-12 h-12 mx-auto mb-3 text-nb-black/60" />
          <p className="text-[11px] font-black uppercase tracking-widest mb-2 text-nb-black/60">Quiz Complete</p>
          <p className={`text-7xl font-black font-mono ${scoreColor(pct)}`}>{pct}%</p>
          <p className="text-xl font-bold mt-2">{score} / {total} correct</p>
          <p className="text-sm text-nb-black/60 mt-2">
            {pct >= 80 ? 'Excellent! You\'re well-prepared.' : pct >= 60 ? 'Good job! Review weak areas.' : 'Keep practicing — you\'ll get there!'}
          </p>
        </div>

        {/* Category breakdown */}
        {categoryScores && (
          <div className="bg-white border-2 border-nb-black p-6" style={{ borderRadius: '8px', boxShadow: '4px 4px 0 #111' }}>
            <h3 className="font-black text-xs uppercase tracking-widest text-nb-black/60 mb-4 flex items-center gap-2">
              <BarChart2 className="w-4 h-4" />
              Category Breakdown
            </h3>
            <div className="space-y-3">
              {Object.entries(categoryScores).map(([cat, val]) => (
                <div key={cat}>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="capitalize text-nb-black/70">{cat.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <span className={`font-mono ${scoreColor(val)}`}>{val}%</span>
                  </div>
                  <div className="h-3 bg-[#F5F1E8] border border-nb-black/10" style={{ borderRadius: '2px' }}>
                    <div
                      className={`h-full transition-all duration-700 ${val >= 80 ? 'bg-green-400' : val >= 60 ? 'bg-nb-yellow' : val >= 40 ? 'bg-orange-400' : 'bg-red-400'}`}
                      style={{ width: `${val}%`, borderRadius: '2px' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Weak areas */}
        {weakAreas?.length > 0 && (
          <div className="bg-white border-2 border-nb-black p-6" style={{ borderRadius: '8px', boxShadow: '4px 4px 0 #111' }}>
            <h3 className="font-black text-xs uppercase tracking-widest text-nb-black/60 mb-3">Focus Areas</h3>
            <div className="flex flex-wrap gap-2">
              {weakAreas.map(w => (
                <span key={w} className="text-xs font-bold px-3 py-1.5 bg-red-50 border-2 border-red-300 text-red-700" style={{ borderRadius: '4px' }}>
                  {w.replace(/([A-Z])/g, ' $1').trim()}
                </span>
              ))}
            </div>
            <p className="text-xs text-nb-black/50 mt-3">Review these areas in your prep plan to improve your readiness score.</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Link
            to={`/workspace/${jobId}`}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-nb-yellow border-2 border-nb-black font-black text-sm uppercase tracking-wide hover:bg-[#FFC300] transition-colors"
            style={{ borderRadius: '6px', boxShadow: '3px 3px 0 #111' }}
          >
            Back to Workspace
          </Link>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-3 border-2 border-nb-black font-bold text-sm hover:bg-nb-black/5 transition-colors"
            style={{ borderRadius: '6px' }}
          >
            Retake
          </button>
        </div>

      </div>
    </DashboardLayout>
  );
};

/* ── Quiz Page ────────────────────────────────────────────────────────────── */
const QuizPage = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState([]); // [{ questionIndex, selectedOption }]
  const [selected, setSelected] = useState(null); // current question selected option
  const [revealed, setRevealed] = useState(false); // show correct/wrong after selection
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const res = await api.get(`/jobs/${jobId}`);
      const job = res.data.data;
      if (!job.quiz?.questions?.length) {
        navigate(`/workspace/${jobId}`, { replace: true });
        return;
      }
      setQuestions(job.quiz.questions);
    } catch {
      navigate('/jobs', { replace: true });
    } finally {
      setLoading(false);
    }
  }, [jobId, navigate]);

  useEffect(() => { load(); }, [load]);

  const handleSelect = (optionIdx) => {
    if (revealed) return;
    setSelected(optionIdx);
    setRevealed(true);
  };

  const handleNext = async () => {
    const updatedAnswers = [...answers, { questionIndex: current, selectedOption: selected }];
    setAnswers(updatedAnswers);
    setSelected(null);
    setRevealed(false);

    if (current + 1 >= questions.length) {
      // Submit
      setSubmitting(true);
      try {
        const res = await api.post(`/jobs/${jobId}/submit-quiz`, { answers: updatedAnswers });
        setResults(res.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to submit quiz');
        setSubmitting(false);
      }
    } else {
      setCurrent(current + 1);
    }
  };

  const q = questions[current];
  const progress = questions.length > 0 ? ((current) / questions.length) * 100 : 0;

  if (loading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-nb-black/40" />
      </div>
    </DashboardLayout>
  );

  if (results) return (
    <ResultsScreen
      score={results.score}
      total={results.totalQuestions}
      categoryScores={results.categoryScores}
      weakAreas={results.weakAreas}
      jobId={jobId}
    />
  );

  if (submitting) return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-nb-black/50" />
        <p className="font-bold text-nb-black/60 uppercase tracking-wide text-sm">Calculating results…</p>
      </div>
    </DashboardLayout>
  );

  if (!q) return null;

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto py-4 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <Link to={`/workspace/${jobId}`} className="flex items-center gap-1.5 text-xs font-bold text-nb-black/50 hover:text-nb-black transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            Exit Quiz
          </Link>
          <span className="text-xs font-black text-nb-black/50 font-mono">{current + 1} / {questions.length}</span>
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-[#E0D8C8] border border-nb-black/10" style={{ borderRadius: '2px' }}>
          <div
            className="h-full bg-nb-yellow border-r border-nb-black/20 transition-all duration-500"
            style={{ width: `${progress}%`, borderRadius: '2px' }}
          />
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 bg-red-50 border-2 border-red-400 text-red-700 text-sm font-bold" style={{ borderRadius: '5px' }}>
            {error}
          </div>
        )}

        {/* Question card */}
        <div
          className="bg-white border-2 border-nb-black p-6 space-y-6"
          style={{ borderRadius: '10px', boxShadow: '5px 5px 0 #111111' }}
        >
          {/* Category + difficulty */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black px-2 py-0.5 bg-nb-black/5 border border-nb-black/20 uppercase tracking-wide" style={{ borderRadius: '3px' }}>
              {q.category?.replace(/([A-Z])/g, ' $1').trim() || 'General'}
            </span>
            <span className={`text-[10px] font-black px-2 py-0.5 border uppercase tracking-wide ${
              q.difficulty === 'hard' ? 'bg-red-50 border-red-300 text-red-700' :
              q.difficulty === 'medium' ? 'bg-orange-50 border-orange-300 text-orange-700' :
              'bg-green-50 border-green-300 text-green-700'
            }`} style={{ borderRadius: '3px' }}>
              {q.difficulty || 'medium'}
            </span>
          </div>

          {/* Question */}
          <p className="font-bold text-base leading-relaxed">{q.question}</p>

          {/* Options */}
          <div className="space-y-3" role="radiogroup" aria-label="Answer options">
            {(q.options || []).map((opt, idx) => {
              const isCorrect = idx === q.correctAnswer;
              const isSelected = idx === selected;
              let cls = 'border-2 border-nb-black/20 hover:border-nb-black hover:bg-[#FFFBF0]';
              if (revealed) {
                if (isCorrect) cls = 'border-2 border-green-500 bg-green-50';
                else if (isSelected && !isCorrect) cls = 'border-2 border-red-500 bg-red-50';
              } else if (isSelected) {
                cls = 'border-2 border-nb-black bg-nb-yellow/30';
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(idx)}
                  disabled={revealed}
                  className={`w-full flex items-center gap-3 p-3.5 text-left transition-colors ${cls}`}
                  style={{ borderRadius: '6px' }}
                  role="radio"
                  aria-checked={isSelected}
                >
                  <span
                    className={`w-6 h-6 flex items-center justify-center flex-shrink-0 border-2 text-xs font-black ${
                      revealed && isCorrect ? 'border-green-500 bg-green-500 text-white' :
                      revealed && isSelected && !isCorrect ? 'border-red-500 bg-red-500 text-white' :
                      isSelected ? 'border-nb-black bg-nb-black text-nb-yellow' :
                      'border-nb-black/30 bg-transparent'
                    }`}
                    style={{ borderRadius: '4px' }}
                    aria-hidden="true"
                  >
                    {revealed && isCorrect ? <Check className="w-3.5 h-3.5" /> :
                     revealed && isSelected && !isCorrect ? <X className="w-3.5 h-3.5" /> :
                     ['A', 'B', 'C', 'D'][idx]}
                  </span>
                  <span className="text-sm font-medium">{opt}</span>
                </button>
              );
            })}
          </div>

          {/* Explanation (shown after answering) */}
          {revealed && q.explanation && (
            <div
              className="p-4 bg-[#F5F1E8] border-2 border-nb-black/20 text-sm text-nb-black/70"
              style={{ borderRadius: '6px' }}
            >
              <p className="font-black text-xs uppercase tracking-wide text-nb-black/50 mb-1">Explanation</p>
              <p className="leading-relaxed">{q.explanation}</p>
            </div>
          )}

          {/* Next button */}
          {revealed && (
            <button
              onClick={handleNext}
              className="w-full flex items-center justify-center gap-2 py-3 bg-nb-yellow border-2 border-nb-black font-black text-sm uppercase tracking-wide hover:bg-[#FFC300] transition-colors"
              style={{ borderRadius: '6px', boxShadow: '3px 3px 0 #111' }}
            >
              {current + 1 >= questions.length ? 'Submit Quiz' : 'Next Question'}
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
};

export default QuizPage;
