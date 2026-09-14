import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock, ChevronLeft, ChevronRight, Flag, AlertCircle,
  CheckCircle, Circle, XCircle, Send
} from 'lucide-react';
import { testService } from '../services/testService';


const TestTaking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [test, setTest] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());

  // Load test and start attempt
  useEffect(() => {
    loadTest();
  }, [id]);

  // Timer
  useEffect(() => {
    if (!test || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [test, timeRemaining]);

  const loadTest = async () => {
    try {
      // Start test first to generate dynamic questions if needed
      const attemptData = await testService.startTest(id);
      
      // Then get test data (which will include dynamic questions if available)
      const testData = await testService.getTest(id);
      
      setTest(testData);
      setAttempt(attemptData);
      setTimeRemaining(testData.duration * 60);
      
      // Load existing answers if any
      const existingAnswers = {};
      attemptData.answers.forEach(ans => {
        if (ans.userAnswer) {
          existingAnswers[ans.questionId] = ans.userAnswer;
        }
      });
      setAnswers(existingAnswers);
    } catch (error) {
      console.error('Failed to load test:', error);
      alert('Failed to load test');
      navigate('/mock-tests');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = async (answer) => {
    const questions = (attempt?.dynamicQuestions && attempt.dynamicQuestions.length > 0) 
      ? attempt.dynamicQuestions 
      : test.questions;
    const questionId = questions[currentQuestion]._id || attempt.answers[currentQuestion].questionId;
    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
    
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
    
    // Auto-save answer
    try {
      await testService.submitAnswer({
        attemptId: attempt._id,
        questionId,
        answer,
        timeSpent
      });
    } catch (error) {
      console.error('Failed to save answer:', error);
    }
  };

  const handleNext = () => {
    const questions = (attempt?.dynamicQuestions && attempt.dynamicQuestions.length > 0) 
      ? attempt.dynamicQuestions 
      : test.questions;
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setQuestionStartTime(Date.now());
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
      setQuestionStartTime(Date.now());
    }
  };

  const handleQuestionJump = (index) => {
    setCurrentQuestion(index);
    setQuestionStartTime(Date.now());
  };

  const handleAutoSubmit = useCallback(async () => {
    await handleSubmit(true);
  }, [answers, attempt]);

  const handleSubmit = async (auto = false) => {
    if (!auto && !confirm('Are you sure you want to submit the test?')) {
      return;
    }

    setSubmitting(true);
    try {
      const questions = (attempt?.dynamicQuestions && attempt.dynamicQuestions.length > 0) 
        ? attempt.dynamicQuestions 
        : test.questions;
      const answersArray = questions.map((q, index) => ({
        questionId: q._id || attempt.answers[index].questionId,
        answer: answers[q._id || attempt.answers[index].questionId] || null,
        timeSpent: 0
      }));

      const results = await testService.submitTest({
        attemptId: attempt._id,
        answers: answersArray
      });

      navigate(`/test-results/${results._id}`);
    } catch (error) {
      console.error('Failed to submit test:', error);
      alert('Failed to submit test');
    } finally {
      setSubmitting(false);
      setShowSubmitModal(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getQuestionStatus = (index) => {
    const questions = (attempt?.dynamicQuestions && attempt.dynamicQuestions.length > 0) 
      ? attempt.dynamicQuestions 
      : test.questions;
    const questionId = questions[index]._id || attempt.answers[index].questionId;
    if (answers[questionId]) return 'answered';
    if (index === currentQuestion) return 'current';
    return 'unanswered';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F1E8] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-nb-black mx-auto mb-4"></div>
          <p className="text-nb-black/55">Loading test...</p>
        </div>
      </div>
    );
  }

  // For dynamic tests, use questions from attempt; for regular tests, use test.questions
  const questions = (attempt?.dynamicQuestions && attempt.dynamicQuestions.length > 0) 
    ? attempt.dynamicQuestions 
    : test?.questions || [];
  
  // Safety check - if no questions available, show error
  if (!questions || questions.length === 0) {
    return (
      <div className="min-h-screen bg-[#F5F1E8] flex items-center justify-center">
        <div className="text-center">
          <div className="text-nb-red mb-4">
            <AlertCircle className="w-16 h-16 mx-auto mb-2" />
          </div>
          <p className="text-nb-black font-bold text-xl mb-2">No questions available</p>
          <p className="text-nb-black/55 mb-4">This test doesn't have any questions yet.</p>
          <button onClick={() => navigate('/mock-tests')} className="btn btn-primary">
            Back to Tests
          </button>
        </div>
      </div>
    );
  }
  
  const question = questions[currentQuestion];
  
  // Safety check for current question
  if (!question) {
    return (
      <div className="min-h-screen bg-[#F5F1E8] flex items-center justify-center">
        <div className="text-center">
          <div className="text-nb-black mb-4">
            <AlertCircle className="w-16 h-16 mx-auto mb-2" />
          </div>
          <p className="text-nb-black font-bold text-xl mb-2">Question not found</p>
          <p className="text-nb-black/55 mb-4">Unable to load question {currentQuestion + 1}.</p>
          <button onClick={() => navigate('/mock-tests')} className="btn btn-primary">
            Back to Tests
          </button>
        </div>
      </div>
    );
  }
  
  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="min-h-screen bg-[#F5F1E8]">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-nb-black">{test.title}</h1>
              <p className="text-sm text-nb-black/55">
                Question {currentQuestion + 1} of {questions.length}
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Timer */}
              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold ${
                timeRemaining < 300 ? 'bg-nb-red/10 text-nb-red animate-pulse' : 'bg-nb-blue/10 text-nb-blue'
              }`}>
                <Clock className="w-5 h-5" />
                <span className="text-lg">{formatTime(timeRemaining)}</span>
              </div>

              {/* Submit Button */}
              <button
                onClick={() => setShowSubmitModal(true)}
                disabled={submitting}
                className="btn btn-primary flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                Submit Test
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-nb-black/55 mb-2">
              <span>Progress: {answeredCount}/{questions.length} answered</span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-nb-black text-white"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Question Panel */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestion}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="nb-card-compat"
              >
                {/* Question */}
                <div className="mb-6">
                  <div className="flex items-start justify-between mb-4">
                    <h2 className="text-xl font-bold text-nb-black">
                      Question {currentQuestion + 1}
                    </h2>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      question.difficulty === 'easy' ? 'bg-nb-green/10 text-nb-green' :
                      question.difficulty === 'medium' ? 'bg-nb-yellow/20 text-nb-black' :
                      'bg-nb-red/10 text-nb-red'
                    }`}>
                      {question.difficulty}
                    </span>
                  </div>
                  <p className="text-lg text-nb-black/60 leading-relaxed">{question.question}</p>
                </div>

                {/* Options */}
                <div className="space-y-3">
                  {question.options.map((option, index) => {
                    const isSelected = answers[question._id] === option;
                    return (
                      <motion.button
                        key={index}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleAnswerSelect(option)}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                          isSelected
                            ? 'border-nb-black bg-[#F5F1E8]'
                            : 'border-nb-black/15 hover:border-nb-black bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            isSelected ? 'border-nb-black bg-[#F5F1E8]0' : 'border-gray-300'
                          }`}>
                            {isSelected && <CheckCircle className="w-4 h-4 text-white" />}
                          </div>
                          <span className={`font-medium ${isSelected ? 'text-nb-black' : 'text-nb-black/75'}`}>
                            {option}
                          </span>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t">
                  <button
                    onClick={handlePrevious}
                    disabled={currentQuestion === 0}
                    className="btn btn-secondary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </button>

                  <button
                    onClick={handleNext}
                    disabled={currentQuestion === questions.length - 1}
                    className="btn btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Question Navigator */}
          <div className="lg:col-span-1 space-y-6">
            
            <div className="nb-card-compat sticky top-80">
              <h3 className="font-bold text-nb-black mb-4">Questions</h3>
              <div className="grid grid-cols-5 gap-2">
                {questions.map((_, index) => {
                  const status = getQuestionStatus(index);
                  return (
                    <button
                      key={index}
                      onClick={() => handleQuestionJump(index)}
                      className={`aspect-square rounded-lg font-semibold text-sm transition-all ${
                        status === 'current'
                          ? 'bg-[#F5F1E8]0 text-white ring-2 ring-primary-300'
                          : status === 'answered'
                          ? 'bg-nb-green/10 text-nb-green hover:bg-green-200'
                          : 'bg-[#F5F1E8] text-nb-black/55 hover:bg-gray-200'
                      }`}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-nb-green/10"></div>
                  <span className="text-nb-black/55">Answered ({answeredCount})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-[#F5F1E8]"></div>
                  <span className="text-nb-black/55">Not Answered ({questions.length - answeredCount})</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Modal */}
      <AnimatePresence>
        {showSubmitModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowSubmitModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-8 max-w-md w-full"
            >
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-nb-yellow/20 flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-nb-black" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Submit Test?</h3>
                <p className="text-nb-black/55 mb-6">
                  You have answered {answeredCount} out of {questions.length} questions.
                  {answeredCount < questions.length && (
                    <span className="block mt-2 text-nb-black font-semibold">
                      {questions.length - answeredCount} questions are unanswered!
                    </span>
                  )}
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowSubmitModal(false)}
                    className="btn btn-secondary flex-1"
                  >
                    Continue Test
                  </button>
                  <button
                    onClick={() => handleSubmit(false)}
                    disabled={submitting}
                    className="btn btn-primary flex-1"
                  >
                    {submitting ? 'Submitting...' : 'Submit Now'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TestTaking;
