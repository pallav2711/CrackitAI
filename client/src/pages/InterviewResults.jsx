import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Award, TrendingUp, Clock, CheckCircle, Target,
  BarChart3, Home, RotateCcw, Lightbulb,
  ThumbsUp, AlertTriangle, BookOpen, ChevronDown, ChevronUp,
  Brain, Zap, ArrowRight,
} from 'lucide-react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import EnhancedAnalysisReport from '../components/interview/EnhancedAnalysisReport';
import { interviewService } from '../services/interviewService';

/* ─── Helpers ─────────────────────────────────────────────────────────────── */
const scoreStyle = (score) => {
  if (score >= 90) return { bg: 'bg-nb-green', text: 'text-white', label: 'Excellent', accent: '#1A7A4A' };
  if (score >= 75) return { bg: 'bg-nb-blue',  text: 'text-white', label: 'Good',      accent: '#2563EB' };
  if (score >= 60) return { bg: 'bg-nb-yellow',text: 'text-nb-black', label: 'Average',  accent: '#FFD93D' };
  return               { bg: 'bg-nb-red',   text: 'text-white', label: 'Needs work', accent: '#DC2626' };
};

const StatBox = ({ label, value, icon: Icon }) => (
  <div
    className="border-2 border-nb-black bg-white p-5 flex flex-col gap-3"
    style={{ borderRadius: '8px', boxShadow: '4px 4px 0 #111111' }}
  >
    <div className="flex items-center justify-between">
      <span className="text-[10px] font-black uppercase tracking-widest text-nb-black/45">{label}</span>
      <div
        className="w-8 h-8 bg-nb-black flex items-center justify-center"
        style={{ borderRadius: '4px' }}
        aria-hidden="true"
      >
        <Icon className="w-4 h-4 text-nb-yellow" />
      </div>
    </div>
    <span
      className="font-black leading-none"
      style={{ fontFamily: 'var(--font-mono)', fontSize: '2rem' }}
    >
      {value}
    </span>
  </div>
);

const InfoBlock = ({ title, children, accent }) => (
  <div
    className={`border-2 border-nb-black p-5 ${accent || 'bg-white'}`}
    style={{ borderRadius: '8px', boxShadow: '3px 3px 0 #111111' }}
  >
    {title && (
      <h4
        className="font-bold text-sm uppercase tracking-tight mb-3"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        {title}
      </h4>
    )}
    {children}
  </div>
);

/* ─── Page ────────────────────────────────────────────────────────────────── */
const InterviewResults = () => {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const [results, setResults]               = useState(null);
  const [loading, setLoading]               = useState(true);
  const [expandedQ, setExpandedQ]           = useState(null);
  const [showEnhanced, setShowEnhanced]     = useState(false);

  useEffect(() => {
    interviewService.getInterview(id)
      .then(data => setResults(data))
      .catch(() => navigate('/mock-interview'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-10 h-10 border-3 border-nb-black border-t-nb-yellow rounded-full animate-spin" aria-label="Loading" />
        </div>
      </DashboardLayout>
    );
  }

  const perf             = scoreStyle(results.overallScore);
  const timeTaken        = Math.floor((results.actualDuration || 0) / 60);
  const answeredQs       = results.questions?.filter(q => q.userAnswer).length ?? 0;

  return (
    <DashboardLayout>
      <div className="max-w-4xl space-y-6">

        {/* ── Score hero ────────────────────────────────────────────────── */}
        <div
          className={`border-3 border-nb-black p-8 ${perf.bg}`}
          style={{ borderRadius: '8px', boxShadow: '6px 6px 0 #111111' }}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Big score number */}
            <div className="flex-shrink-0">
              <div
                className="w-28 h-28 border-3 border-nb-black bg-white flex flex-col items-center justify-center"
                style={{ borderRadius: '8px', boxShadow: '4px 4px 0 rgba(0,0,0,0.3)' }}
              >
                <span
                  className="font-black text-nb-black leading-none"
                  style={{ fontFamily: 'var(--font-mono)', fontSize: '2.5rem' }}
                >
                  {results.overallScore}%
                </span>
                <span className="text-[10px] font-black uppercase tracking-widest text-nb-black/55 mt-1">
                  Score
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <span
                className={`inline-block text-[10px] font-black tracking-[0.2em] uppercase px-2.5 py-1 border-2 border-nb-black ${perf.text === 'text-white' ? 'bg-white text-nb-black' : 'bg-nb-black text-nb-yellow'}`}
                style={{ borderRadius: '3px' }}
              >
                {perf.label}
              </span>
              <h1
                className={`font-bold uppercase leading-tight ${perf.text}`}
                style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem, 4vw, 2.25rem)', letterSpacing: '-0.03em' }}
              >
                {results.role}
              </h1>
              <p className={`text-sm font-medium capitalize ${perf.text === 'text-white' ? 'text-white/65' : 'text-nb-black/60'}`}>
                {results.type} interview
              </p>
            </div>

            <div className="sm:ml-auto flex-shrink-0">
              <button
                onClick={() => setShowEnhanced(true)}
                className="btn btn-black"
              >
                <Brain className="w-4 h-4" aria-hidden="true" />
                AI Analysis
              </button>
            </div>
          </div>
        </div>

        {/* ── Stats row ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatBox label="Questions"   value={`${answeredQs}/${results.questions?.length ?? 0}`} icon={Target}    />
          <StatBox label="Time taken"  value={`${timeTaken}m`}                                    icon={Clock}     />
          <StatBox label="Avg response"value={`${results.averageResponseTime ?? 0}s`}             icon={TrendingUp}/>
          <StatBox label="Filler words"value={results.fillerWordsCount ?? 0}                      icon={BarChart3} />
        </div>

        {/* ── Overall feedback ──────────────────────────────────────────── */}
        <div
          className="border-2 border-nb-black bg-white p-6 space-y-5"
          style={{ borderRadius: '8px', boxShadow: '4px 4px 0 #111111' }}
        >
          <h2
            className="font-bold uppercase tracking-tight border-b-2 border-nb-black pb-3"
            style={{ fontFamily: 'var(--font-display)', fontSize: '1.125rem' }}
          >
            Assessment
          </h2>

          {results.overallAssessment?.summary && (
            <div
              className="border-l-3 border-nb-black pl-4 py-1"
            >
              <p className="text-sm font-bold text-nb-black/45 uppercase tracking-widest mb-1">Summary</p>
              <p className="text-sm font-medium text-nb-black/70 leading-relaxed">{results.overallAssessment.summary}</p>
              {results.overallAssessment.readinessLevel && (
                <span
                  className="inline-block mt-2 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 border-2 border-nb-black bg-[#F5F1E8]"
                  style={{ borderRadius: '3px' }}
                >
                  {results.overallAssessment.readinessLevel.replace(/-/g, ' ')}
                </span>
              )}
            </div>
          )}

          {results.overallFeedback && (
            <p className="text-sm text-nb-black/70 leading-relaxed">{results.overallFeedback}</p>
          )}

          {/* Performance analysis grid */}
          {results.performanceAnalysis && (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2 border-t-2 border-nb-black/10">
              {Object.entries(results.performanceAnalysis).map(([key, value]) => (
                <div key={key} className="text-center">
                  <p
                    className="font-black leading-none"
                    style={{ fontFamily: 'var(--font-mono)', fontSize: '1.25rem' }}
                  >
                    {value}/10
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-nb-black/45 mt-0.5 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </p>
                  <div className="h-1.5 border border-nb-black/20 bg-[#F5F1E8] mt-1.5">
                    <div
                      className={value >= 8 ? 'h-full bg-nb-green' : value >= 6 ? 'h-full bg-nb-yellow' : 'h-full bg-nb-red'}
                      style={{ width: `${value * 10}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Strengths & improvements */}
          <div className="grid md:grid-cols-2 gap-4 pt-2 border-t-2 border-nb-black/10">
            {results.strengths?.length > 0 && (
              <InfoBlock title="Strengths" accent="bg-[#F5F1E8]">
                <ul className="space-y-2">
                  {results.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-nb-black/70">
                      <CheckCircle className="w-4 h-4 text-nb-green flex-shrink-0 mt-0.5" aria-hidden="true" />
                      {s}
                    </li>
                  ))}
                </ul>
              </InfoBlock>
            )}
            {(results.criticalImprovements || results.areasForImprovement)?.length > 0 && (
              <InfoBlock title="Improvements" accent="bg-[#F5F1E8]">
                <ul className="space-y-2">
                  {(results.criticalImprovements || results.areasForImprovement).map((a, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-nb-black/70">
                      <AlertTriangle className="w-4 h-4 text-nb-red flex-shrink-0 mt-0.5" aria-hidden="true" />
                      {a}
                    </li>
                  ))}
                </ul>
              </InfoBlock>
            )}
          </div>
        </div>

        {/* ── Role advice + strategy ─────────────────────────────────────── */}
        {((results.roleSpecificAdvice || results.recommendations) || results.interviewStrategy) && (
          <div className="grid md:grid-cols-2 gap-4">
            {(results.roleSpecificAdvice || results.recommendations)?.length > 0 && (
              <div
                className="border-2 border-nb-black bg-white p-5 space-y-3"
                style={{ borderRadius: '8px', boxShadow: '3px 3px 0 #111111' }}
              >
                <h3 className="font-bold text-sm uppercase flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
                  <Lightbulb className="w-4 h-4" aria-hidden="true" />
                  Role-specific advice
                </h3>
                <ul className="space-y-2">
                  {(results.roleSpecificAdvice || results.recommendations).map((adv, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-nb-black/65">
                      <span className="text-nb-black/30 font-mono">→</span>
                      {adv}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {results.interviewStrategy?.preparationFocus?.length > 0 && (
              <div
                className="border-2 border-nb-black bg-nb-yellow p-5 space-y-3"
                style={{ borderRadius: '8px', boxShadow: '3px 3px 0 #111111' }}
              >
                <h3 className="font-bold text-sm uppercase flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
                  <Target className="w-4 h-4" aria-hidden="true" />
                  Focus areas
                </h3>
                <div className="flex flex-wrap gap-2">
                  {results.interviewStrategy.preparationFocus.map((f, i) => (
                    <span
                      key={i}
                      className="text-xs font-bold px-2.5 py-1 border-2 border-nb-black bg-white"
                      style={{ borderRadius: '3px' }}
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Next steps ────────────────────────────────────────────────── */}
        {results.nextSteps && (
          <div
            className="border-2 border-nb-black bg-white p-6"
            style={{ borderRadius: '8px', boxShadow: '4px 4px 0 #111111' }}
          >
            <h3
              className="font-bold uppercase flex items-center gap-2 border-b-2 border-nb-black pb-4 mb-5"
              style={{ fontFamily: 'var(--font-display)', fontSize: '1rem' }}
            >
              <BookOpen className="w-4 h-4" aria-hidden="true" />
              Action plan
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { key: 'immediate', label: 'This week',    bg: 'bg-nb-red text-white' },
                { key: 'shortTerm', label: 'This month',   bg: 'bg-nb-yellow text-nb-black' },
                { key: 'longTerm',  label: 'Next 3 months',bg: 'bg-nb-green text-white' },
              ].map(({ key, label, bg }) => results.nextSteps[key]?.length > 0 && (
                <div key={key} className={`border-2 border-nb-black p-4 ${bg}`} style={{ borderRadius: '6px' }}>
                  <h4 className="font-bold text-sm uppercase mb-3">{label}</h4>
                  <ul className="space-y-2">
                    {results.nextSteps[key].map((s, i) => (
                      <li key={i} className="text-xs font-medium leading-relaxed flex items-start gap-1.5">
                        <span className="font-mono opacity-60">{i + 1}.</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Motivational message ──────────────────────────────────────── */}
        {results.motivationalMessage && (
          <div
            className="border-2 border-nb-black bg-nb-black p-6 text-center space-y-3"
            style={{ borderRadius: '8px', boxShadow: '4px 4px 0 #FFD93D' }}
          >
            <p className="text-2xl" aria-hidden="true">🚀</p>
            <h3
              className="font-bold text-nb-yellow"
              style={{ fontFamily: 'var(--font-display)', fontSize: '1.125rem' }}
            >
              Keep growing
            </h3>
            <p className="text-sm text-white/55 leading-relaxed max-w-lg mx-auto">
              {results.motivationalMessage}
            </p>
            {results.recommendedNextInterview && (
              <p className="text-xs font-bold text-nb-yellow/70">
                Next: {results.recommendedNextInterview}
              </p>
            )}
          </div>
        )}

        {/* ── Q-by-Q review ─────────────────────────────────────────────── */}
        <div
          className="border-2 border-nb-black bg-white"
          style={{ borderRadius: '8px', boxShadow: '4px 4px 0 #111111' }}
        >
          <div className="border-b-2 border-nb-black px-6 py-4">
            <h3
              className="font-bold uppercase"
              style={{ fontFamily: 'var(--font-display)', fontSize: '1rem' }}
            >
              Question-by-question review
            </h3>
          </div>

          <div className="divide-y-2 divide-nb-black/10">
            {results.questions?.map((q, idx) => {
              const qs = scoreStyle(q.score ?? 0);
              return (
                <div key={idx}>
                  <button
                    onClick={() => setExpandedQ(expandedQ === idx ? null : idx)}
                    className="w-full flex items-center gap-4 px-6 py-4 text-left hover:bg-[#F5F1E8] transition-colors"
                    aria-expanded={expandedQ === idx}
                  >
                    <div
                      className={`w-10 h-10 border-2 border-nb-black flex items-center justify-center font-black text-sm flex-shrink-0 ${qs.bg} ${qs.text}`}
                      style={{ borderRadius: '4px', fontFamily: 'var(--font-mono)' }}
                    >
                      {q.score ?? 0}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm">Question {idx + 1}</p>
                      <p className="text-xs text-nb-black/45 truncate mt-0.5">{q.question}</p>
                    </div>
                    {expandedQ === idx
                      ? <ChevronUp className="w-5 h-5 text-nb-black/40 flex-shrink-0" aria-hidden="true" />
                      : <ChevronDown className="w-5 h-5 text-nb-black/40 flex-shrink-0" aria-hidden="true" />}
                  </button>

                  {expandedQ === idx && (
                    <div className="px-6 pb-6 space-y-4 border-t-2 border-nb-black/10 pt-4">
                      {/* Question */}
                      <div className="border-2 border-nb-black bg-[#F5F1E8] p-4" style={{ borderRadius: '6px' }}>
                        <p className="text-[10px] font-black uppercase tracking-widest text-nb-black/45 mb-1">Question</p>
                        <p className="text-sm font-medium leading-relaxed">{q.question}</p>
                      </div>

                      {/* Answer */}
                      <div className="border-2 border-nb-black bg-white p-4" style={{ borderRadius: '6px' }}>
                        <p className="text-[10px] font-black uppercase tracking-widest text-nb-black/45 mb-1">Your answer</p>
                        <p className="text-sm text-nb-black/65 leading-relaxed">{q.userAnswer || 'No answer provided'}</p>
                      </div>

                      {/* Feedback */}
                      {q.feedback && (
                        <div className="border-2 border-nb-black bg-white p-4" style={{ borderRadius: '6px' }}>
                          <p className="text-[10px] font-black uppercase tracking-widest text-nb-black/45 mb-1">Feedback</p>
                          <p className="text-sm text-nb-black/65 leading-relaxed">{q.feedback}</p>
                        </div>
                      )}

                      {/* Strengths & improvements */}
                      {(q.strengths?.length > 0 || q.improvements?.length > 0) && (
                        <div className="grid sm:grid-cols-2 gap-3">
                          {q.strengths?.length > 0 && (
                            <div className="border-2 border-nb-green bg-white p-3" style={{ borderRadius: '6px' }}>
                              <p className="text-[10px] font-black uppercase tracking-widest text-nb-green mb-2">What went well</p>
                              <ul className="space-y-1">
                                {q.strengths.map((s, i) => (
                                  <li key={i} className="text-xs text-nb-black/65 flex items-start gap-1.5">
                                    <CheckCircle className="w-3.5 h-3.5 text-nb-green flex-shrink-0 mt-0.5" aria-hidden="true" />
                                    {s}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {q.improvements?.length > 0 && (
                            <div className="border-2 border-nb-red bg-white p-3" style={{ borderRadius: '6px' }}>
                              <p className="text-[10px] font-black uppercase tracking-widest text-nb-red mb-2">Areas to improve</p>
                              <ul className="space-y-1">
                                {q.improvements.map((imp, i) => (
                                  <li key={i} className="text-xs text-nb-black/65 flex items-start gap-1.5">
                                    <Target className="w-3.5 h-3.5 text-nb-red flex-shrink-0 mt-0.5" aria-hidden="true" />
                                    {imp}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Sample improved answer */}
                      {q.sampleImprovedAnswer && (
                        <div
                          className="border-l-3 border-nb-yellow bg-nb-yellow/10 p-4"
                          style={{ borderRadius: '0 6px 6px 0' }}
                        >
                          <p className="text-[10px] font-black uppercase tracking-widest text-nb-black/45 mb-1">Sample improved answer</p>
                          <p className="text-sm italic text-nb-black/65 leading-relaxed">"{q.sampleImprovedAnswer}"</p>
                        </div>
                      )}

                      {/* Score breakdown + meta */}
                      <div className="flex items-center gap-4 text-xs font-bold text-nb-black/45 pt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                          {q.duration ?? 0}s
                        </span>
                        <span className="flex items-center gap-1">
                          <Award className="w-3.5 h-3.5" aria-hidden="true" />
                          {q.score ?? 0}/100
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Actions ───────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => navigate('/mock-interview')}
            className="btn btn-secondary flex-1 justify-center"
          >
            <Home className="w-4 h-4" aria-hidden="true" />
            All interviews
          </button>
          <button
            onClick={() => navigate('/mock-interview')}
            className="btn btn-black flex-1 justify-center"
          >
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
            New interview
          </button>
          <button
            onClick={() => navigate('/interview/setup')}
            className="btn btn-primary flex-1 justify-center"
          >
            <Zap className="w-4 h-4" aria-hidden="true" />
            Voice interview
          </button>
        </div>

      </div>

      {/* Enhanced analysis modal */}
      {showEnhanced && (
        <EnhancedAnalysisReport
          interviewId={id}
          onClose={() => setShowEnhanced(false)}
        />
      )}
    </DashboardLayout>
  );
};

export default InterviewResults;
