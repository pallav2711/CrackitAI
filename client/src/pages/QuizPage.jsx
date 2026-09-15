/**
 * QuizPage — /quiz/:jobId
 * Interactive 30-40 question quiz. One question at a time.
 * Results stored per job. Retake anytime.
 */
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  CheckCircle, XCircle, ArrowRight, RotateCcw,
  Trophy, Target, Loader2, ChevronLeft, HelpCircle,
  AlertCircle,
} from 'lucide-react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import api from '../services/api';
import toast from 'react-hot-toast';

/* ── Progress bar ────────────────────────────────────────────────────────── */
function ProgressBar({ current, total }) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-nb-black/40">
        <span>Question {current + 1} of {total}</span>
        <span>{pct}%</span>
      </div>
      <div className="h-2.5 border-2 border-nb-black bg-[#F5F1E8]">
        <div className="h-full bg-nb-yellow border-r-2 border-nb-black transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

/* ── Category badge ──────────────────────────────────────────────────────── */
const catColor = {
  technical:    'bg-blue-100 text-blue-800 border-blue-300',
  hr:           'bg-purple-100 text-purple-800 border-purple-300',
  'role-specific': 'bg-nb-yellow text-nb-black border-nb-black',
  behavioral:   'bg-purple-100 text-purple-800 border-purple-300',
  advanced:     'bg-red-100 text-red-800 border-red-300',
};

/* ── Result screen ───────────────────────────────────────────────────────── */
function ResultsScreen({ results, questions, job, onRetake, navigate }) {
  const scorePercent = Math.round((results.correct / results.total) * 100);
  const grade =
    scorePercent >= 85 ? { label: 'Excellent', color: 'text-green-700', bg: 'bg-green-100' }
    : scorePercent >= 70 ? { label: 'Good',    color: 'text-blue-700',  bg: 'bg-blue-100' }
    : scorePercent >= 55 ? { label: 'Average', color: 'text-amber-700', bg: 'bg-amber-100' }
    :                      { label: 'Needs Work', color: 'text-red-700', bg: 'bg-red-100' };

  // Category breakdown
  const catStats = {};
  questions.forEach((q, i) => {
    const cat = q.category || 'general';
    if (!catStats[cat]) catStats[cat] = { correct: 0, total: 0 };
    catStats[cat].total++;
    if (results.answers[i]?.correct) catStats[cat].correct++;
  });

  // Weak areas
  const weakAreas = Object.entries(catStats)
    .filter(([, s]) => s.total > 0 && s.correct / s.total < 0.6)
    .map(([cat]) => cat);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Score hero */}
      <div className="bg-nb-yellow border-2 border-nb-black p-8 text-center" style={{ borderRadius: '8px', boxShadow: '6px 6px 0 #111111' }}>
        <Trophy className="w-12 h-12 mx-auto mb-3" />
        <p className="text-6xl font-black font-mono">{results.correct}/{results.total}</p>
        <p className="text-lg font-black mt-1">{scorePercent}%</p>
        <span className={`inline-block mt-2 text-xs font-black uppercase tracking-widest px-3 py-1 border-2 border-nb-black ${grade.bg} ${grade.color}`} style={{ borderRadius: '3px' }}>
          {grade.label}
        </span>
      </div>

      {/* Category breakdown */}
      <div className="bg-white border-2 border-nb-black p-5" style={{ borderRadius: '8px', boxShadow: '3px 3px 0 #111' }}>
        <p className="text-[10px] font-black uppercase tracking-widest mb-4">Category Breakdown</p>
        <div className="space-y-3">
          {Object.entries(catStats).map(([cat, s]) => {
            const pct = s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0;
            return (
              <div key={cat}>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="uppercase tracking-wide text-nb-black/60 capitalize">{cat}</span>
                  <span className="font-mono">{s.correct}/{s.total} ({pct}%)</span>
                </div>
                <div className="h-2.5 border-2 border-nb-black bg-[#F5F1E8]">
                  <div className={`h-full border-r-2 border-nb-black transition-all ${pct >= 70 ? 'bg-nb-yellow' : pct >= 50 ? 'bg-orange-300' : 'bg-red-300'}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Weak areas */}
      {weakAreas.length > 0 && (
        <div className="bg-red-50 border-2 border-red-300 p-4" style={{ borderRadius: '6px' }}>
          <p className="text-[10px] font-black uppercase tracking-widest text-red-800 mb-2">Weak Areas — Focus here</p>
          <div className="flex flex-wrap gap-2">
            {weakAreas.map(a => (
              <span key={a} className="text-xs font-black px-2 py-1 bg-red-100 text-red-700 border border-red-300 capitalize" style={{ borderRadius: '3px' }}>{a}</span>
            ))}
          </div>
        </div>
      )}

      {/* Review wrong answers */}
      <div className="bg-white border-2 border-nb-black p-5 space-y-4" style={{ borderRadius: '8px', boxShadow: '3px 3px 0 #111' }}>
        <p className="text-[10px] font-black uppercase tracking-widest">Review Wrong Answers ({results.total - results.correct})</p>
        {questions.map((q, i) => {
          if (results.answers[i]?.correct) return null;
          return (
            <div key={i} className="border-2 border-nb-black/15 p-4 space-y-2" style={{ borderRadius: '6px' }}>
              <p className="text-sm font-bold">{q.question}</p>
              <p className="text-xs text-nb-black/50">Your answer: <span className="text-red-600 font-bold">{q.options?.[results.answers[i]?.selected] || '—'}</span></p>
              <p className="text-xs text-nb-black/50">Correct: <span className="text-green-600 font-bold">{q.options?.[q.correctAnswer]}</span></p>
              {q.explanation && <p className="text-xs text-nb-black/60 bg-[#F5F1E8] p-2" style={{ borderRadius: '4px' }}>{q.explanation}</p>}
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <button onClick={onRetake} className="btn btn-primary">
          <RotateCcw className="w-4 h-4" /> Retake Quiz
        </button>
        <Link to={`/workspace/${job._id}`} className="btn btn-ghost">
          ← Back to Workspace
        </Link>
      </div>
    </div>
  );
}

/* ── Question screen ─────────────────────────────────────────────────────── */
function QuestionScreen({ question, index, total, onAnswer, answered }) {
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);

  const handleSelect = (optionIndex) => {
    if (revealed) return;
    setSelected(optionIndex);
  };

  const handleConfirm = () => {
    if (selected == null) return;
    setRevealed(true);
  };

  const handleNext = () => {
    const isCorrect = selected === question.correctAnswer;
    onAnswer(selected, isCorrect);
    setSelected(null);
    setRevealed(false);
  };

  const optionClass = (i) => {
    if (!revealed) {
      return i === selected
        ? 'border-nb-black bg-nb-yellow text-nb-black'
        : 'border-nb-black/20 bg-white hover:border-nb-black hover:bg-nb-yellow/20';
    }
    if (i === question.correctAnswer) return 'border-green-500 bg-green-50 text-green-800';
    if (i === selected && i !== question.correctAnswer) return 'border-red-400 bg-red-50 text-red-700';
    return 'border-nb-black/10 bg-white text-nb-black/40';
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <ProgressBar current={index} total={total} />

      <div className="bg-white border-2 border-nb-black p-6 space-y-5" style={{ borderRadius: '8px', boxShadow: '4px 4px 0 #111111' }}>
        {/* Category + difficulty */}
        <div className="flex items-center gap-2">
          {question.category && (
            <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 border ${catColor[question.category] || 'bg-gray-100 text-gray-600 border-gray-300'}`} style={{ borderRadius: '2px' }}>
              {question.category}
            </span>
          )}
          {question.difficulty && (
            <span className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 border border-nb-black/20 bg-[#F5F1E8] text-nb-black/50" style={{ borderRadius: '2px' }}>
              {question.difficulty}
            </span>
          )}
        </div>

        {/* Question */}
        <p className="font-bold text-base leading-relaxed">{question.question}</p>

        {/* Options */}
        <div className="space-y-2.5">
          {question.options?.map((opt, i) => (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              disabled={revealed}
              className={`w-full text-left px-4 py-3 border-2 font-medium text-sm transition-colors ${optionClass(i)}`}
              style={{ borderRadius: '6px' }}
            >
              <span className="font-black mr-2 text-nb-black/40">{['A', 'B', 'C', 'D'][i]}.</span>
              {opt}
              {revealed && i === question.correctAnswer && <CheckCircle className="inline w-4 h-4 ml-2 text-green-600" />}
              {revealed && i === selected && i !== question.correctAnswer && <XCircle className="inline w-4 h-4 ml-2 text-red-500" />}
            </button>
          ))}
        </div>

        {/* Explanation */}
        {revealed && question.explanation && (
          <div className="bg-[#F5F1E8] border-2 border-nb-black/20 p-4" style={{ borderRadius: '6px' }}>
            <p className="text-[10px] font-black uppercase tracking-widest text-nb-black/40 mb-1.5">Explanation</p>
            <p className="text-sm text-nb-black/70 leading-relaxed">{question.explanation}</p>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3 pt-1">
          {!revealed ? (
            <button
              onClick={handleConfirm}
              disabled={selected == null}
              className={`btn btn-primary ${selected == null ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Confirm Answer
            </button>
          ) : (
            <button onClick={handleNext} className="btn btn-primary">
              {index + 1 < total ? <>Next Question <ArrowRight className="w-4 h-4" /></> : <>See Results <Trophy className="w-4 h-4" /></>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────────────────────── */
export default function QuizPage() {
  const { jobId }              = useParams();
  const navigate               = useNavigate();
  const [job, setJob]          = useState(null);
  const [loading, setLoading]  = useState(true);
  const [phase, setPhase]      = useState('idle'); // idle | quiz | submitting | results
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers]  = useState([]);
  const [results, setResults]  = useState(null);

  useEffect(() => {
    api.get(`/jobs/${jobId}`)
      .then(r => {
        const j = r.data?.data || r.data?.job;
        setJob(j);
        // If quiz was previously completed, show results
        if (j?.quiz?.completedAt && j?.quiz?.score != null) {
          const prevAnswers = j.quiz.userAnswers?.map(a => ({ selected: a.selectedOption, correct: a.isCorrect })) || [];
          setAnswers(prevAnswers);
          setResults({ correct: j.quiz.score, total: j.quiz.totalQuestions, answers: prevAnswers });
          setPhase('results');
        }
      })
      .catch(() => { toast.error('Job not found'); navigate('/jobs'); })
      .finally(() => setLoading(false));
  }, [jobId, navigate]);

  const handleAnswer = useCallback((selected, isCorrect) => {
    const newAnswers = [...answers, { selected, correct: isCorrect }];
    setAnswers(newAnswers);

    if (currentQ + 1 >= job.quiz.questions.length) {
      // All questions answered — submit
      submitQuiz(newAnswers);
    } else {
      setCurrentQ(q => q + 1);
    }
  }, [answers, currentQ, job]);

  const submitQuiz = async (finalAnswers) => {
    setPhase('submitting');
    try {
      const payload = {
        answers: finalAnswers.map((a, i) => ({
          questionIndex:  i,
          selectedOption: a.selected,
          isCorrect:      a.correct,
          answeredAt:     new Date(),
        })),
      };
      const { data } = await api.post(`/jobs/${jobId}/submit-quiz`, payload);
      const updatedJob = data.data;
      setJob(updatedJob);
      const correct = finalAnswers.filter(a => a.correct).length;
      setResults({ correct, total: finalAnswers.length, answers: finalAnswers });
      setPhase('results');
      toast.success('Quiz completed!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save results');
      // Show results anyway
      const correct = finalAnswers.filter(a => a.correct).length;
      setResults({ correct, total: finalAnswers.length, answers: finalAnswers });
      setPhase('results');
    }
  };

  const startQuiz = () => {
    setCurrentQ(0);
    setAnswers([]);
    setResults(null);
    setPhase('quiz');
  };

  if (loading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-nb-black/30" />
      </div>
    </DashboardLayout>
  );

  const hasQuiz     = job?.quiz?.questions?.length > 0;
  const questions   = job?.quiz?.questions || [];

  return (
    <DashboardLayout>
      <div className="max-w-3xl space-y-6">

        {/* Header */}
        <div className="border-b-3 border-nb-black pb-5">
          <Link to={`/workspace/${jobId}`} className="inline-flex items-center gap-1 text-xs font-bold text-nb-black/40 hover:text-nb-black mb-3 transition-colors">
            <ChevronLeft className="w-3.5 h-3.5" /> Back to Workspace
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="font-bold text-nb-black" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem,3vw,2rem)', letterSpacing: '-0.03em' }}>
                Interview Quiz
              </h1>
              {job?.title && <p className="text-sm text-nb-black/45 font-mono mt-0.5">{job.title}</p>}
            </div>
            {hasQuiz && phase !== 'quiz' && (
              <div className="text-center">
                <p className="text-2xl font-black font-mono">{questions.length}</p>
                <p className="text-[9px] font-black uppercase tracking-widest text-nb-black/40">Questions</p>
              </div>
            )}
          </div>
        </div>

        {/* Idle — no quiz yet */}
        {!hasQuiz && (
          <div className="text-center py-16 space-y-4">
            <div className="w-16 h-16 bg-nb-yellow border-2 border-nb-black flex items-center justify-center mx-auto" style={{ borderRadius: '8px', boxShadow: '3px 3px 0 #111' }}>
              <HelpCircle className="w-8 h-8" />
            </div>
            <p className="font-black text-lg uppercase" style={{ fontFamily: 'var(--font-display)' }}>No Quiz Yet</p>
            <p className="text-sm text-nb-black/50 max-w-sm mx-auto leading-relaxed">
              Generate a quiz from the job workspace. The AI will create 30–40 tailored questions covering technical, HR, and role-specific topics.
            </p>
            <Link to={`/workspace/${jobId}`} className="btn btn-primary inline-flex">
              Go to Workspace → Generate Quiz
            </Link>
          </div>
        )}

        {/* Idle — quiz ready, not started */}
        {hasQuiz && phase === 'idle' && (
          <div className="space-y-5">
            <div className="bg-white border-2 border-nb-black p-6" style={{ borderRadius: '8px', boxShadow: '4px 4px 0 #111' }}>
              <p className="font-black text-sm uppercase tracking-widest mb-4">Quiz Details</p>
              <div className="grid grid-cols-3 gap-4 text-center mb-5">
                <div>
                  <p className="text-3xl font-black font-mono">{questions.length}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-nb-black/40">Questions</p>
                </div>
                <div>
                  <p className="text-3xl font-black font-mono">~{Math.ceil(questions.length * 1.5)}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-nb-black/40">Minutes</p>
                </div>
                <div>
                  <p className="text-3xl font-black font-mono">MCQ</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-nb-black/40">Format</p>
                </div>
              </div>

              {/* Category breakdown */}
              {(() => {
                const cats = {};
                questions.forEach(q => { const c = q.category || 'general'; cats[c] = (cats[c] || 0) + 1; });
                return (
                  <div className="flex flex-wrap gap-2 mb-5">
                    {Object.entries(cats).map(([cat, count]) => (
                      <span key={cat} className={`text-[10px] font-black px-2 py-1 border capitalize ${catColor[cat] || 'bg-gray-100 text-gray-600 border-gray-300'}`} style={{ borderRadius: '3px' }}>
                        {cat}: {count}
                      </span>
                    ))}
                  </div>
                );
              })()}

              {job.quiz?.completedAt && (
                <div className="bg-[#F5F1E8] border-2 border-nb-black/15 p-3 mb-4" style={{ borderRadius: '6px' }}>
                  <p className="text-xs font-black uppercase tracking-widest text-nb-black/40 mb-1">Previous Attempt</p>
                  <p className="text-sm font-bold">
                    Score: {job.quiz.score}/{job.quiz.totalQuestions} ({Math.round((job.quiz.score / job.quiz.totalQuestions) * 100)}%)
                  </p>
                  <p className="text-[10px] text-nb-black/40 mt-0.5">
                    {new Date(job.quiz.completedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              )}

              <button onClick={startQuiz} className="btn btn-primary w-full">
                <HelpCircle className="w-4 h-4" />
                {job.quiz?.completedAt ? 'Retake Quiz' : 'Start Quiz'}
              </button>
            </div>
          </div>
        )}

        {/* Quiz in progress */}
        {phase === 'quiz' && questions[currentQ] && (
          <QuestionScreen
            question={questions[currentQ]}
            index={currentQ}
            total={questions.length}
            onAnswer={handleAnswer}
            answered={answers}
          />
        )}

        {/* Submitting */}
        {phase === 'submitting' && (
          <div className="text-center py-16 space-y-4">
            <Loader2 className="w-10 h-10 animate-spin mx-auto text-nb-black/40" />
            <p className="font-bold text-sm uppercase tracking-wide">Saving your results…</p>
          </div>
        )}

        {/* Results */}
        {phase === 'results' && results && (
          <ResultsScreen
            results={results}
            questions={questions}
            job={job}
            onRetake={startQuiz}
            navigate={navigate}
          />
        )}

      </div>
    </DashboardLayout>
  );
}
