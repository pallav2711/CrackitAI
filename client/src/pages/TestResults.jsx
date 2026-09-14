import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Award, TrendingUp, Clock, CheckCircle, XCircle,
  Target, BarChart3, Home, RotateCcw, Share2
} from 'lucide-react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { testService } from '../services/testService';

const TestResults = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAnswers, setShowAnswers] = useState(false);

  useEffect(() => {
    loadResults();
  }, [attemptId]);

  const loadResults = async () => {
    try {
      const data = await testService.getResults(attemptId);
      setResults(data);
    } catch (error) {
      console.error('Failed to load results:', error);
      navigate('/mock-tests');
    } finally {
      setLoading(false);
    }
  };

  const getRankColor = (rank) => {
    switch (rank) {
      case 'excellent': return 'bg-nb-black';
      case 'good': return 'bg-nb-black';
      case 'average': return 'bg-nb-black';
      default: return 'bg-nb-black';
    }
  };

  const getRankEmoji = (rank) => {
    switch (rank) {
      case 'excellent': return '🏆';
      case 'good': return '🎯';
      case 'average': return '📈';
      default: return '💪';
    }
  };

  const getRankMessage = (rank) => {
    switch (rank) {
      case 'excellent': return 'Outstanding Performance!';
      case 'good': return 'Great Job!';
      case 'average': return 'Good Effort!';
      default: return 'Keep Practicing!';
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-10 h-10 border-3 border-nb-black border-t-nb-yellow rounded-full animate-spin border-nb-black"></div>
        </div>
      </DashboardLayout>
    );
  }

  const test = results.testId;
  const timeTaken = Math.floor(results.duration / 60);

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`relative card bg-nb-black text-white overflow-hidden mb-8`}
        >
          {/* Animated Background */}
          <div className="absolute inset-0 opacity-10">
            
            
          </div>

          <div className="relative z-10 text-center py-12">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="text-6xl mb-4"
            >
              {getRankEmoji(results.rank)}
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl font-bold mb-2"
            >
              {getRankMessage(results.rank)}
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-white/90 text-lg mb-6"
            >
              {test.title}
            </motion.p>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: 'spring' }}
              className="inline-flex items-center justify-center w-32 h-32 border-3 border-nb-black bg-white" style={{ borderRadius: "6px", boxShadow: "4px 4px 0 #111111" }}
            >
              <div className="text-center">
                <div className="text-5xl font-bold text-nb-black">{results.percentage}%</div>
                <div className="text-sm text-nb-black/55 font-semibold">Your Score</div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-6 flex items-center justify-center gap-4"
            >
              {results.passed ? (
                <div className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-semibold">Passed</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full">
                  <XCircle className="w-5 h-5" />
                  <span className="font-semibold">Not Passed (Required: {test.passingScore}%)</span>
                </div>
              )}
            </motion.div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="nb-card-compat"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-nb-black/55 text-sm mb-1">Correct</p>
                <p className="text-3xl font-bold text-nb-green">{results.correctAnswers}</p>
              </div>
              <div className="w-10 h-10 bg-nb-black border-2 border-nb-black flex items-center justify-center flex-shrink-0" style={{ borderRadius: "5px" }}>
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="nb-card-compat"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-nb-black/55 text-sm mb-1">Incorrect</p>
                <p className="text-3xl font-bold text-nb-red">{results.incorrectAnswers}</p>
              </div>
              <div className="w-10 h-10 bg-nb-black border-2 border-nb-black flex items-center justify-center flex-shrink-0" style={{ borderRadius: "5px" }}>
                <XCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="nb-card-compat"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-nb-black/55 text-sm mb-1">Skipped</p>
                <p className="text-3xl font-bold text-nb-black/55">{results.skippedAnswers}</p>
              </div>
              <div className="w-10 h-10 bg-nb-black border-2 border-nb-black flex items-center justify-center flex-shrink-0" style={{ borderRadius: "5px" }}>
                <Target className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="nb-card-compat"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-nb-black/55 text-sm mb-1">Time Taken</p>
                <p className="text-3xl font-bold text-nb-blue">{timeTaken}m</p>
              </div>
              <div className="w-10 h-10 bg-nb-black border-2 border-nb-black flex items-center justify-center flex-shrink-0" style={{ borderRadius: "5px" }}>
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Performance Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="nb-card-compat mb-8"
        >
          <h3 className="text-xl font-bold mb-6 text-nb-black">Performance Breakdown</h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-nb-black/75">Accuracy</span>
                <span className="text-sm font-bold text-nb-green">
                  {Math.round((results.correctAnswers / test.questions.length) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(results.correctAnswers / test.questions.length) * 100}%` }}
                  transition={{ delay: 0.8, duration: 1 }}
                  className="h-full bg-nb-black text-white"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-nb-black/75">Completion Rate</span>
                <span className="text-sm font-bold text-nb-blue">
                  {Math.round(((test.questions.length - results.skippedAnswers) / test.questions.length) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${((test.questions.length - results.skippedAnswers) / test.questions.length) * 100}%` }}
                  transition={{ delay: 0.9, duration: 1 }}
                  className="h-full bg-nb-black text-white"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Review Answers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="nb-card-compat mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-nb-black">Review Answers</h3>
            <button
              onClick={() => setShowAnswers(!showAnswers)}
              className="btn btn-secondary"
            >
              {showAnswers ? 'Hide' : 'Show'} Answers
            </button>
          </div>

          {showAnswers && (
            <div className="space-y-6">
              {test.questions.map((question, index) => {
                const userAnswer = results.answers.find(a => a.questionId.toString() === question._id.toString());
                const isCorrect = userAnswer?.isCorrect;

                return (
                  <motion.div
                    key={question._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-6 rounded-xl border-2 ${
                      isCorrect ? 'border-nb-green/30 bg-green-50' : 'border-nb-red/30 bg-red-50'
                    }`}
                  >
                    <div className="flex items-start gap-3 mb-4">
                      {isCorrect ? (
                        <CheckCircle className="w-6 h-6 text-nb-green flex-shrink-0 mt-1" />
                      ) : (
                        <XCircle className="w-6 h-6 text-nb-red flex-shrink-0 mt-1" />
                      )}
                      <div className="flex-1">
                        <h4 className="font-semibold text-nb-black mb-2">
                          Question {index + 1}
                        </h4>
                        <p className="text-nb-black/75 mb-4">{question.question}</p>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-nb-black/55">Your Answer:</span>
                            <span className={`font-semibold ${isCorrect ? 'text-nb-green' : 'text-nb-red'}`}>
                              {userAnswer?.userAnswer || 'Not answered'}
                            </span>
                          </div>
                          {!isCorrect && (
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-nb-black/55">Correct Answer:</span>
                              <span className="font-semibold text-nb-green">{question.correctAnswer}</span>
                            </div>
                          )}
                          {question.explanation && (
                            <div className="mt-3 p-3 bg-white rounded-lg">
                              <p className="text-sm text-nb-black/55">
                                <span className="font-semibold">Explanation:</span> {question.explanation}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <button
            onClick={() => navigate('/mock-tests')}
            className="btn btn-secondary flex-1 flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            Back to Tests
          </button>
          <button
            onClick={() => navigate(`/test/${test._id}`)}
            className="btn btn-secondary flex-1 flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            Retake Test
          </button>
          <button
            onClick={() => navigate('/test-history')}
            className="btn btn-primary flex-1 flex items-center justify-center gap-2"
          >
            <BarChart3 className="w-5 h-5" />
            View History
          </button>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default TestResults;
