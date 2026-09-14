import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, TrendingUp, Target, BookOpen, Calendar, Star,
  Mic, Video, MessageSquare, BarChart3, Award, Lightbulb,
  CheckCircle, AlertCircle, ArrowRight, Clock, Users,
  Zap, Eye, Volume2, Camera, Settings, RefreshCw,
  Download, Share2, ChevronDown, ChevronUp, Play
} from 'lucide-react';
import { interviewService } from '../../services/interviewService';

const EnhancedAnalysisReport = ({ interviewId, onClose }) => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedSections, setExpandedSections] = useState({});
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    loadEnhancedAnalysis();
  }, [interviewId]);

  const loadEnhancedAnalysis = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/interview/${interviewId}/enhanced-analysis`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to load enhanced analysis');
      }
      
      const data = await response.json();
      setAnalysis(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const regenerateAnalysis = async () => {
    try {
      setRegenerating(true);
      const response = await fetch(`/api/interview/${interviewId}/regenerate-analysis`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to regenerate analysis');
      }
      
      await loadEnhancedAnalysis();
    } catch (err) {
      setError(err.message);
    } finally {
      setRegenerating(false);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-nb-green bg-nb-green/10 border border-nb-green/30';
    if (score >= 75) return 'text-nb-blue bg-nb-blue/10 border border-nb-blue/30';
    if (score >= 60) return 'text-nb-black bg-nb-yellow border border-nb-black/20';
    return 'text-nb-red bg-nb-red/10 border border-nb-red/30';
  };

  const getReadinessColor = (readiness) => {
    switch (readiness) {
      case 'ready-to-interview': return 'text-nb-green bg-nb-green/10 border border-nb-green/30';
      case 'needs-practice': return 'text-nb-black bg-nb-yellow border border-nb-black/20';
      case 'requires-significant-work': return 'text-nb-red bg-nb-red/10 border border-nb-red/30';
      default: return 'text-nb-black/55 bg-[#F5F1E8]';
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-nb-black mx-auto mb-4"></div>
            <h3 className="text-xl font-bold mb-2">Generating Enhanced Analysis</h3>
            <p className="text-nb-black/55">Our AI is analyzing your interview performance in detail...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Analysis Error</h3>
            <p className="text-nb-black/55 mb-4">{error}</p>
            <div className="flex gap-3">
              <button onClick={loadEnhancedAnalysis} className="btn btn-primary flex-1">
                Try Again
              </button>
              <button onClick={onClose} className="btn btn-secondary flex-1">
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!analysis) return null;

  const { basicInfo, comprehensiveAnalysis, questionAnalyses } = analysis;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="bg-nb-black text-white text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">🧠 Enhanced AI Analysis</h2>
              <p className="text-nb-black">
                {basicInfo.role} • {basicInfo.type} Interview • Score: {basicInfo.overallScore}/100
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={regenerateAnalysis}
                disabled={regenerating}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${regenerating ? 'animate-spin' : ''}`} />
                {regenerating ? 'Regenerating...' : 'Regenerate'}
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b bg-[#F5F1E8] px-6">
          <div className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'detailed', label: 'Question Analysis', icon: MessageSquare },
              { id: 'roadmap', label: 'Improvement Plan', icon: Target },
              { id: 'benchmarks', label: 'Market Analysis', icon: TrendingUp }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'border-nb-black text-nb-black'
                      : 'border-transparent text-nb-black/45 hover:text-nb-black/75'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <OverviewTab 
                basicInfo={basicInfo} 
                analysis={comprehensiveAnalysis} 
                questionAnalyses={questionAnalyses}
              />
            )}
            {activeTab === 'detailed' && (
              <DetailedAnalysisTab 
                questionAnalyses={questionAnalyses}
                interviewMode={basicInfo.mode}
              />
            )}
            {activeTab === 'roadmap' && (
              <RoadmapTab 
                roadmap={comprehensiveAnalysis?.improvementRoadmap}
                basicInfo={basicInfo}
              />
            )}
            {activeTab === 'benchmarks' && (
              <BenchmarksTab 
                benchmarks={comprehensiveAnalysis?.benchmarkAnalysis}
                basicInfo={basicInfo}
              />
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

// Overview Tab Component
const OverviewTab = ({ basicInfo, analysis, questionAnalyses }) => {
  const roadmap = analysis?.improvementRoadmap;
  const benchmarks = analysis?.benchmarkAnalysis;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Performance Summary */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="nb-card-compat">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-nb-blue/10 rounded-xl flex items-center justify-center">
              <Award className="w-6 h-6 text-nb-blue" />
            </div>
            <div>
              <h3 className="font-bold text-nb-black">Overall Score</h3>
              <p className="text-sm text-nb-black/55">Interview Performance</p>
            </div>
          </div>
          <div className="text-3xl font-bold text-nb-blue mb-2">
            {basicInfo.overallScore}/100
          </div>
          <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
            basicInfo.overallScore >= 80 ? 'bg-nb-green/10 text-nb-green' :
            basicInfo.overallScore >= 60 ? 'bg-nb-yellow/20 text-nb-black' :
            'bg-nb-red/10 text-nb-red'
          }`}>
            {basicInfo.overallScore >= 80 ? 'Excellent' :
             basicInfo.overallScore >= 60 ? 'Good' : 'Needs Work'}
          </div>
        </div>

        <div className="nb-card-compat">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-nb-green/10 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-nb-green" />
            </div>
            <div>
              <h3 className="font-bold text-nb-black">Market Readiness</h3>
              <p className="text-sm text-nb-black/55">Industry Benchmark</p>
            </div>
          </div>
          <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium mb-2 ${
            getReadinessColor(benchmarks?.marketReadiness)
          }`}>
            {benchmarks?.marketReadiness?.replace('-', ' ').toUpperCase() || 'Analyzing...'}
          </div>
          <p className="text-sm text-nb-black/55">
            {benchmarks?.industryPercentile || 'Calculating percentile...'}
          </p>
        </div>

        <div className="nb-card-compat">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-nb-blue rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-nb-blue" />
            </div>
            <div>
              <h3 className="font-bold text-nb-black">Improvement Timeline</h3>
              <p className="text-sm text-nb-black/55">Estimated Progress</p>
            </div>
          </div>
          <div className="text-2xl font-bold text-nb-blue mb-2">
            {roadmap?.estimatedTimeToImprovement || '4-6 weeks'}
          </div>
          <p className="text-sm text-nb-black/55">
            With consistent practice
          </p>
        </div>
      </div>

      {/* Key Insights */}
      {roadmap?.focusAreas && (
        <div className="nb-card-compat">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            Key Focus Areas
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {roadmap.focusAreas.slice(0, 4).map((area, index) => (
              <div key={index} className="p-4 bg-[#F5F1E8] rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-nb-black">{area.area}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    area.priority === 'high' ? 'bg-nb-red/10 text-nb-red' :
                    area.priority === 'medium' ? 'bg-nb-yellow/20 text-nb-black' :
                    'bg-nb-green/10 text-nb-green'
                  }`}>
                    {area.priority} priority
                  </span>
                </div>
                <p className="text-sm text-nb-black/55 mb-2">
                  Current: {area.currentLevel} → Target: {area.targetLevel}
                </p>
                <p className="text-xs text-nb-black/45">
                  Timeline: {area.timeframe}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="nb-card-compat">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-blue-500" />
          Immediate Next Steps
        </h3>
        <div className="space-y-3">
          {roadmap?.weeklyPlan?.week1?.dailyTasks?.slice(0, 3).map((task, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-nb-blue" />
              <span className="text-nb-black">{task}</span>
            </div>
          )) || (
            <div className="text-nb-black/45 text-center py-4">
              Generating personalized action plan...
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Detailed Analysis Tab Component
const DetailedAnalysisTab = ({ questionAnalyses, interviewMode }) => {
  const [expandedQuestions, setExpandedQuestions] = useState({});

  const toggleQuestion = (index) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold mb-2">Question-by-Question Analysis</h3>
        <p className="text-nb-black/55">Detailed breakdown of your performance on each question</p>
      </div>

      {questionAnalyses.map((q, index) => (
        <div key={index} className="nb-card-compat">
          <div 
            className="flex items-center justify-between cursor-pointer"
            onClick={() => toggleQuestion(index)}
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white ${
                q.score >= 80 ? 'bg-nb-green' :
                q.score >= 60 ? 'bg-nb-yellow' : 'bg-nb-red'
              }`}>
                {q.score}
              </div>
              <div>
                <h4 className="font-semibold text-nb-black">Question {index + 1}</h4>
                <p className="text-sm text-nb-black/55 line-clamp-1">{q.question}</p>
              </div>
            </div>
            {expandedQuestions[index] ? 
              <ChevronUp className="w-5 h-5 text-nb-black/35" /> : 
              <ChevronDown className="w-5 h-5 text-nb-black/35" />
            }
          </div>

          <AnimatePresence>
            {expandedQuestions[index] && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6 space-y-4"
              >
                {/* Question Text */}
                <div className="p-4 bg-[#F5F1E8] rounded-lg">
                  <h5 className="font-medium text-nb-black mb-2">Question:</h5>
                  <p className="text-nb-black/75">{q.question}</p>
                </div>

                {/* Score Breakdown */}
                {q.scoreBreakdown && (
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {Object.entries(q.scoreBreakdown).map(([category, score]) => (
                      <div key={category} className="text-center">
                        <div className={`w-16 h-16 rounded-full mx-auto mb-2 flex items-center justify-center font-bold text-white ${
                          score >= 20 ? 'bg-nb-green' :
                          score >= 15 ? 'bg-nb-yellow' : 'bg-nb-red'
                        }`}>
                          {score}
                        </div>
                        <p className="text-xs font-medium text-nb-black/55 capitalize">
                          {category.replace(/([A-Z])/g, ' $1').trim()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Strengths and Improvements */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="font-medium text-nb-green mb-3 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Strengths
                    </h5>
                    <ul className="space-y-2">
                      {q.strengths?.map((strength, i) => (
                        <li key={i} className="text-sm text-nb-black/75 flex items-start gap-2">
                          <span className="text-green-500 mt-1">•</span>
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium text-nb-red mb-3 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Areas for Improvement
                    </h5>
                    <ul className="space-y-2">
                      {q.improvements?.map((improvement, i) => (
                        <li key={i} className="text-sm text-nb-black/75 flex items-start gap-2">
                          <span className="text-red-500 mt-1">•</span>
                          {improvement}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Speech Analysis (for voice/video interviews) */}
                {(interviewMode === 'voice' || interviewMode === 'video') && q.speechAnalysis && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h5 className="font-medium text-nb-blue mb-3 flex items-center gap-2">
                      <Mic className="w-4 h-4" />
                      Speech Analysis
                    </h5>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-nb-black/55">Clarity:</span>
                        <span className="ml-2 font-medium">{q.speechAnalysis.clarityScore}/10</span>
                      </div>
                      <div>
                        <span className="text-nb-black/55">Pace:</span>
                        <span className="ml-2 font-medium capitalize">{q.speechAnalysis.paceAnalysis}</span>
                      </div>
                      <div>
                        <span className="text-nb-black/55">Confidence:</span>
                        <span className="ml-2 font-medium">{q.speechAnalysis.confidenceLevel}/10</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Video Analysis (for video interviews) */}
                {interviewMode === 'video' && q.videoPresenceAnalysis && (
                  <div className="p-4 bg-nb-blue rounded-lg">
                    <h5 className="font-medium text-nb-blue mb-3 flex items-center gap-2">
                      <Video className="w-4 h-4" />
                      Video Presence Analysis
                    </h5>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-nb-black/55">Eye Contact:</span>
                        <span className="ml-2 font-medium">{q.videoPresenceAnalysis.eyeContactScore}/10</span>
                      </div>
                      <div>
                        <span className="text-nb-black/55">Posture:</span>
                        <span className="ml-2 font-medium">{q.videoPresenceAnalysis.postureScore}/10</span>
                      </div>
                      <div>
                        <span className="text-nb-black/55">Overall Presence:</span>
                        <span className="ml-2 font-medium">{q.videoPresenceAnalysis.overallPresence}/10</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Next Level Tips */}
                {q.nextLevelTips && q.nextLevelTips.length > 0 && (
                  <div className="p-4 bg-nb-yellow rounded-lg">
                    <h5 className="font-medium text-nb-black mb-3 flex items-center gap-2">
                      <Star className="w-4 h-4" />
                      Next Level Tips
                    </h5>
                    <ul className="space-y-2">
                      {q.nextLevelTips.map((tip, i) => (
                        <li key={i} className="text-sm text-nb-black/75 flex items-start gap-2">
                          <ArrowRight className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Sample Improved Answer */}
                {q.sampleImprovedAnswer && (
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h5 className="font-medium text-nb-green mb-3 flex items-center gap-2">
                      <Lightbulb className="w-4 h-4" />
                      Sample Improved Answer
                    </h5>
                    <p className="text-sm text-nb-black/75 italic">"{q.sampleImprovedAnswer}"</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </motion.div>
  );
};

// Roadmap Tab Component
const RoadmapTab = ({ roadmap, basicInfo }) => {
  if (!roadmap) {
    return (
      <div className="text-center py-12">
        <Brain className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-nb-black/55 mb-2">Generating Improvement Roadmap</h3>
        <p className="text-nb-black/45">Our AI is creating a personalized improvement plan for you...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Roadmap Header */}
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold mb-2">Your Personalized Improvement Roadmap</h3>
        <p className="text-nb-black/55">
          Estimated time to significant improvement: <span className="font-semibold text-nb-black">
            {roadmap.estimatedTimeToImprovement}
          </span>
        </p>
      </div>

      {/* Weekly Plan */}
      {roadmap.weeklyPlan && (
        <div className="nb-card-compat">
          <h4 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            4-Week Action Plan
          </h4>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(roadmap.weeklyPlan).map(([week, plan]) => (
              <div key={week} className="p-4 bg-nb-black text-white rounded-lg border border-nb-blue/30">
                <h5 className="font-bold text-nb-blue mb-2 capitalize">
                  {week.replace('week', 'Week ')}
                </h5>
                <p className="text-sm font-medium text-nb-blue mb-3">
                  Focus: {plan.focus}
                </p>
                <div className="space-y-2">
                  <h6 className="text-xs font-semibold text-nb-black/75 uppercase tracking-wide">
                    Daily Tasks:
                  </h6>
                  {plan.dailyTasks?.map((task, i) => (
                    <div key={i} className="text-xs text-nb-black/55 flex items-start gap-1">
                      <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                      {task}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Focus Areas */}
      {roadmap.focusAreas && (
        <div className="nb-card-compat">
          <h4 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-red-500" />
            Priority Focus Areas
          </h4>
          <div className="space-y-4">
            {roadmap.focusAreas.map((area, index) => (
              <div key={index} className="p-4 border border-nb-black/15 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="font-bold text-nb-black">{area.area}</h5>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      area.priority === 'high' ? 'bg-nb-red/10 text-nb-red' :
                      area.priority === 'medium' ? 'bg-nb-yellow/20 text-nb-black' :
                      'bg-nb-green/10 text-nb-green'
                    }`}>
                      {area.priority} priority
                    </span>
                    <span className="text-sm text-nb-black/45">{area.timeframe}</span>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <h6 className="text-sm font-semibold text-nb-black/75 mb-2">Current Level</h6>
                    <p className="text-sm text-nb-black/55">{area.currentLevel}</p>
                  </div>
                  <div>
                    <h6 className="text-sm font-semibold text-nb-black/75 mb-2">Target Level</h6>
                    <p className="text-sm text-nb-black/55">{area.targetLevel}</p>
                  </div>
                  <div>
                    <h6 className="text-sm font-semibold text-nb-black/75 mb-2">Timeline</h6>
                    <p className="text-sm text-nb-black/55">{area.timeframe}</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h6 className="text-sm font-semibold text-nb-black/75 mb-2">Action Steps</h6>
                    <ul className="space-y-1">
                      {area.specificActions?.map((action, i) => (
                        <li key={i} className="text-sm text-nb-black/55 flex items-start gap-2">
                          <ArrowRight className="w-3 h-3 text-blue-500 mt-1 flex-shrink-0" />
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h6 className="text-sm font-semibold text-nb-black/75 mb-2">Resources</h6>
                    <ul className="space-y-1">
                      {area.resources?.map((resource, i) => (
                        <li key={i} className="text-sm text-nb-black/55 flex items-start gap-2">
                          <BookOpen className="w-3 h-3 text-green-500 mt-1 flex-shrink-0" />
                          {resource}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resource Library */}
      {roadmap.resourceLibrary && (
        <div className="nb-card-compat">
          <h4 className="text-xl font-bold mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-green-500" />
            Recommended Resources
          </h4>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(roadmap.resourceLibrary).map(([category, resources]) => (
              <div key={category} className="p-4 bg-[#F5F1E8] rounded-lg">
                <h5 className="font-semibold text-nb-black mb-3 capitalize">
                  {category.replace(/([A-Z])/g, ' $1').trim()}
                </h5>
                <ul className="space-y-2">
                  {resources?.slice(0, 3).map((resource, i) => (
                    <li key={i} className="text-sm text-nb-black/55">
                      • {resource}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Success Metrics */}
      {roadmap.successMetrics && (
        <div className="nb-card-compat">
          <h4 className="text-xl font-bold mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-nb-blue" />
            Success Metrics
          </h4>
          <div className="grid md:grid-cols-3 gap-4">
            {roadmap.successMetrics.map((metric, index) => (
              <div key={index} className="p-4 bg-nb-blue rounded-lg border border-nb-blue/30">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-nb-blue" />
                  <span className="text-sm font-semibold text-nb-blue">Goal {index + 1}</span>
                </div>
                <p className="text-sm text-nb-black/75">{metric}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Motivational Message */}
      {roadmap.motivationalMessage && (
        <div className="nb-card-compat bg-nb-black text-white border border-nb-black">
          <div className="text-center">
            <Star className="w-12 h-12 text-nb-black mx-auto mb-4" />
            <h4 className="text-xl font-bold text-nb-black mb-3">You've Got This! 🌟</h4>
            <p className="text-nb-black text-lg leading-relaxed">
              {roadmap.motivationalMessage}
            </p>
            <div className="mt-4 text-sm text-nb-black">
              <strong>Next Interview Readiness:</strong> {roadmap.nextInterviewReadiness}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

// Benchmarks Tab Component
const BenchmarksTab = ({ benchmarks, basicInfo }) => {
  if (!benchmarks) {
    return (
      <div className="text-center py-12">
        <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-nb-black/55 mb-2">Analyzing Market Position</h3>
        <p className="text-nb-black/45">Comparing your performance against industry standards...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Market Position Overview */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="nb-card-compat text-center">
          <div className="w-16 h-16 bg-nb-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-nb-blue" />
          </div>
          <h3 className="font-bold text-nb-black mb-2">Industry Ranking</h3>
          <div className="text-2xl font-bold text-nb-blue mb-2">
            {benchmarks.industryPercentile}
          </div>
          <p className="text-sm text-nb-black/55">vs other candidates</p>
        </div>

        <div className="nb-card-compat text-center">
          <div className="w-16 h-16 bg-nb-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-8 h-8 text-nb-green" />
          </div>
          <h3 className="font-bold text-nb-black mb-2">Hiring Probability</h3>
          <div className={`text-2xl font-bold mb-2 ${
            benchmarks.hiringProbability === 'high' ? 'text-nb-green' :
            benchmarks.hiringProbability === 'medium' ? 'text-nb-black' : 'text-nb-red'
          }`}>
            {benchmarks.hiringProbability?.toUpperCase()}
          </div>
          <p className="text-sm text-nb-black/55">current market</p>
        </div>

        <div className="nb-card-compat text-center">
          <div className="w-16 h-16 bg-nb-blue rounded-full flex items-center justify-center mx-auto mb-4">
            <Award className="w-8 h-8 text-nb-blue" />
          </div>
          <h3 className="font-bold text-nb-black mb-2">Salary Position</h3>
          <div className={`text-2xl font-bold mb-2 ${
            benchmarks.salaryNegotiationPosition === 'strong' ? 'text-nb-green' :
            benchmarks.salaryNegotiationPosition === 'moderate' ? 'text-nb-black' : 'text-nb-red'
          }`}>
            {benchmarks.salaryNegotiationPosition?.toUpperCase()}
          </div>
          <p className="text-sm text-nb-black/55">negotiation power</p>
        </div>
      </div>

      {/* Company Readiness */}
      {benchmarks.topCompaniesReadiness && (
        <div className="nb-card-compat">
          <h4 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-500" />
            Company Type Readiness
          </h4>
          <div className="grid md:grid-cols-4 gap-4">
            {Object.entries(benchmarks.topCompaniesReadiness).map(([companyType, readiness]) => (
              <div key={companyType} className="p-4 bg-[#F5F1E8] rounded-lg text-center">
                <h5 className="font-semibold text-nb-black mb-2 uppercase">
                  {companyType}
                </h5>
                <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                  readiness === 'ready' ? 'bg-nb-green/10 text-nb-green' : 'bg-nb-red/10 text-nb-red'
                }`}>
                  {readiness === 'ready' ? '✓ Ready' : '✗ Not Ready'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Competitive Analysis */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="nb-card-compat">
          <h4 className="text-xl font-bold mb-4 flex items-center gap-2 text-nb-green">
            <CheckCircle className="w-5 h-5" />
            Competitive Advantages
          </h4>
          <ul className="space-y-3">
            {benchmarks.competitiveAdvantages?.map((advantage, index) => (
              <li key={index} className="flex items-start gap-3">
                <div className="w-6 h-6 bg-nb-green/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle className="w-4 h-4 text-nb-green" />
                </div>
                <span className="text-nb-black/75">{advantage}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="nb-card-compat">
          <h4 className="text-xl font-bold mb-4 flex items-center gap-2 text-nb-red">
            <AlertCircle className="w-5 h-5" />
            Areas to Strengthen
          </h4>
          <ul className="space-y-3">
            {benchmarks.competitiveWeaknesses?.map((weakness, index) => (
              <li key={index} className="flex items-start gap-3">
                <div className="w-6 h-6 bg-nb-red/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <AlertCircle className="w-4 h-4 text-nb-red" />
                </div>
                <span className="text-nb-black/75">{weakness}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Market Insights */}
      {benchmarks.marketInsights && (
        <div className="nb-card-compat">
          <h4 className="text-xl font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            Market Insights
          </h4>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h5 className="font-semibold text-nb-blue mb-2">Current Demand</h5>
              <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                benchmarks.marketInsights.currentDemand === 'high' ? 'bg-nb-green/10 text-nb-green' :
                benchmarks.marketInsights.currentDemand === 'medium' ? 'bg-nb-yellow/20 text-nb-black' :
                'bg-nb-red/10 text-nb-red'
              }`}>
                {benchmarks.marketInsights.currentDemand?.toUpperCase()}
              </div>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <h5 className="font-semibold text-nb-green mb-2">Hot Skills</h5>
              <ul className="text-sm text-nb-black/75 space-y-1">
                {benchmarks.marketInsights.keySkillsInDemand?.slice(0, 2).map((skill, i) => (
                  <li key={i}>• {skill}</li>
                ))}
              </ul>
            </div>

            <div className="p-4 bg-nb-blue rounded-lg">
              <h5 className="font-semibold text-nb-blue mb-2">Emerging Trends</h5>
              <ul className="text-sm text-nb-black/75 space-y-1">
                {benchmarks.marketInsights.emergingTrends?.slice(0, 2).map((trend, i) => (
                  <li key={i}>• {trend}</li>
                ))}
              </ul>
            </div>

            <div className="p-4 bg-nb-yellow rounded-lg">
              <h5 className="font-semibold text-nb-black mb-2">Top Locations</h5>
              <ul className="text-sm text-nb-black/75 space-y-1">
                {benchmarks.marketInsights.geographicOpportunities?.slice(0, 2).map((location, i) => (
                  <li key={i}>• {location}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Career Guidance */}
      {benchmarks.careerGuidance && (
        <div className="nb-card-compat">
          <h4 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-nb-blue" />
            Strategic Career Guidance
          </h4>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h5 className="font-semibold text-nb-black mb-3">Immediate Opportunities</h5>
              <ul className="space-y-2">
                {benchmarks.careerGuidance.immediateOpportunities?.map((opportunity, i) => (
                  <li key={i} className="text-sm text-nb-black/75 flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    {opportunity}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h5 className="font-semibold text-nb-black mb-3">Skill Gap Priorities</h5>
              <ul className="space-y-2">
                {benchmarks.careerGuidance.skillGapPriorities?.map((skill, i) => (
                  <li key={i} className="text-sm text-nb-black/75 flex items-start gap-2">
                    <Target className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    {skill}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h5 className="font-semibold text-nb-black mb-3">Career Path Options</h5>
              <ul className="space-y-2">
                {benchmarks.careerGuidance.careerPathOptions?.map((path, i) => (
                  <li key={i} className="text-sm text-nb-black/75 flex items-start gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    {path}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h5 className="font-semibold text-nb-black mb-3">Networking Strategy</h5>
              <ul className="space-y-2">
                {benchmarks.careerGuidance.networkingStrategy?.map((strategy, i) => (
                  <li key={i} className="text-sm text-nb-black/75 flex items-start gap-2">
                    <Users className="w-4 h-4 text-nb-blue mt-0.5 flex-shrink-0" />
                    {strategy}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default EnhancedAnalysisReport;