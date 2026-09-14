import { useState } from 'react';
import { motion } from 'framer-motion';
import { Award, Clock, CheckCircle, XCircle, Code, FileText, AlertCircle } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

const WeeklyAssessment = ({ plan, onAssessmentComplete }) => {
  const { token } = useAuthStore();
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < selectedAssessment.questions.length) {
      toast.error('Please answer all questions');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`/api/ai-prep/plans/${plan._id}/assessments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          week: selectedAssessment.week,
          answers
        })
      });

      if (response.ok) {
        toast.success('Assessment submitted successfully!');
        setSelectedAssessment(null);
        setAnswers({});
        onAssessmentComplete();
      } else {
        toast.error('Failed to submit assessment');
      }
    } catch (error) {
      console.error('Error submitting assessment:', error);
      toast.error('Failed to submit assessment');
    } finally {
      setSubmitting(false);
    }
  };

  if (selectedAssessment) {
    return (
      <div className="space-y-6">
        {/* Assessment Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-nb-black">{selectedAssessment.title}</h3>
            <p className="text-nb-black/55">{selectedAssessment.description}</p>
          </div>
          <button
            onClick={() => {
              setSelectedAssessment(null);
              setAnswers({});
            }}
            className="px-4 py-2 text-nb-black/75 hover:bg-[#F5F1E8] rounded-lg transition-colors"
          >
            Back to List
          </button>
        </div>

        {/* Questions */}
        <div className="space-y-6">
          {selectedAssessment.questions.map((question, index) => (
            <motion.div
              key={question.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="nb-card-compat"
            >
              <div className="flex items-start gap-3 mb-4">
                <div className="w-8 h-8 bg-nb-blue text-nb-blue rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {question.type === 'mcq' && <CheckCircle className="w-4 h-4 text-nb-blue" />}
                    {question.type === 'coding' && <Code className="w-4 h-4 text-nb-green" />}
                    {question.type === 'essay' && <FileText className="w-4 h-4 text-nb-blue" />}
                    <span className="text-xs font-medium text-nb-black/45 uppercase">{question.type}</span>
                    <span className="text-xs text-nb-black/45">• {question.points} points</span>
                  </div>
                  <p className="text-nb-black font-medium">{question.question}</p>
                </div>
              </div>

              {/* Answer Input */}
              <div className="ml-11">
                {question.type === 'mcq' && (
                  <div className="space-y-2">
                    {question.options.map((option, optIdx) => (
                      <label
                        key={optIdx}
                        className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                          answers[question.id] === option
                            ? 'border-nb-blue/30 bg-nb-blue'
                            : 'border-nb-black/15 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name={question.id}
                          value={option}
                          checked={answers[question.id] === option}
                          onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                          className="w-4 h-4 text-nb-blue"
                        />
                        <span className="text-nb-black">{option}</span>
                      </label>
                    ))}
                  </div>
                )}

                {(question.type === 'coding' || question.type === 'essay') && (
                  <textarea
                    value={answers[question.id] || ''}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    placeholder={question.type === 'coding' ? 'Write your code here...' : 'Write your answer here...'}
                    rows={question.type === 'coding' ? 10 : 6}
                    className="w-full px-4 py-3 border-2 border-nb-black/15 rounded-lg focus:border-nb-blue/30 focus:ring-2 focus:ring-purple-200 transition-all font-mono text-sm"
                  />
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={submitting || Object.keys(answers).length < selectedAssessment.questions.length}
            className="px-6 py-3 bg-nb-black text-white text-white rounded-lg hover:from-nb-blue hover:to-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
          >
            {submitting ? 'Submitting...' : 'Submit Assessment'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-nb-black">Weekly Assessments</h3>
        <div className="text-sm text-nb-black/55">
          {plan.weeklyAssessments.filter(a => a.status === 'completed').length} / {plan.weeklyAssessments.length} completed
        </div>
      </div>

      {plan.weeklyAssessments.map((assessment, index) => (
        <motion.div
          key={assessment.week}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className={`card hover:shadow-lg transition-all cursor-pointer ${
            assessment.status === 'completed' ? 'bg-green-50 border-nb-green/30' : ''
          }`}
          onClick={() => assessment.status !== 'completed' && setSelectedAssessment(assessment)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                assessment.status === 'completed' ? 'bg-nb-green' : 'bg-nb-blue'
              } text-white`}>
                <Award className="w-6 h-6" />
              </div>
              
              <div>
                <h4 className="font-semibold text-nb-black">{assessment.title}</h4>
                <p className="text-sm text-nb-black/55">{assessment.description}</p>
                <div className="flex items-center gap-3 mt-2 text-sm">
                  <span className="text-nb-black/45">{assessment.questions.length} questions</span>
                  <span className="text-nb-black/45">• {assessment.totalPoints} points</span>
                </div>
              </div>
            </div>

            <div className="text-right">
              {assessment.status === 'completed' ? (
                <div>
                  <div className="text-2xl font-bold text-nb-green">
                    {assessment.score}/{assessment.totalPoints}
                  </div>
                  <div className="text-sm text-nb-black/55">
                    {Math.round((assessment.score / assessment.totalPoints) * 100)}%
                  </div>
                  {assessment.feedback && (
                    <div className="mt-2 text-xs text-nb-black/55 max-w-xs">
                      {assessment.feedback}
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setSelectedAssessment(assessment)}
                  className="px-4 py-2 bg-nb-blue text-white rounded-lg hover:bg-nb-blue transition-colors"
                >
                  Start Assessment
                </button>
              )}
            </div>
          </div>
        </motion.div>
      ))}

      {plan.weeklyAssessments.length === 0 && (
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-nb-black/45">No assessments available yet</p>
        </div>
      )}
    </div>
  );
};

export default WeeklyAssessment;
