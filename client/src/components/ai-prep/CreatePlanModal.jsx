import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  X, Calendar, Target, Clock, Brain, Zap, 
  CheckCircle, ArrowRight, User, Briefcase
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

const CreatePlanModal = ({ company, onClose, onPlanCreated }) => {
  const { token } = useAuthStore();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    duration: 60,
    targetRole: '',
    experienceLevel: 'Mid Level',
    focusAreas: [],
    studyIntensity: 'Moderate',
    availableHours: 2,
    preferredTime: 'Morning',
    interviewDate: ''
  });

  const durations = [
    { value: 30, label: '30 Days', description: 'Quick preparation for immediate interviews' },
    { value: 60, label: '60 Days', description: 'Balanced preparation with comprehensive coverage' },
    { value: 90, label: '90 Days', description: 'Thorough preparation for maximum confidence' }
  ];

  const experienceLevels = [
    { value: 'Entry Level', label: 'Entry Level', description: '0-2 years experience' },
    { value: 'Mid Level', label: 'Mid Level', description: '2-5 years experience' },
    { value: 'Senior Level', label: 'Senior Level', description: '5+ years experience' }
  ];

  const focusAreaOptions = [
    { value: 'Technical Skills', label: 'Technical Skills', icon: '💻' },
    { value: 'System Design', label: 'System Design', icon: '🏗️' },
    { value: 'Behavioral', label: 'Behavioral Questions', icon: '🗣️' },
    { value: 'Company Culture', label: 'Company Culture', icon: '🏢' },
    { value: 'Industry Knowledge', label: 'Industry Knowledge', icon: '📚' },
    { value: 'Coding Practice', label: 'Coding Practice', icon: '⌨️' }
  ];

  const studyIntensities = [
    { value: 'Light', label: 'Light', description: '1-2 hours/day, flexible schedule' },
    { value: 'Moderate', label: 'Moderate', description: '2-3 hours/day, structured plan' },
    { value: 'Intensive', label: 'Intensive', description: '3-4 hours/day, focused preparation' }
  ];

  const handleFocusAreaToggle = (area) => {
    setFormData(prev => ({
      ...prev,
      focusAreas: prev.focusAreas.includes(area)
        ? prev.focusAreas.filter(a => a !== area)
        : [...prev.focusAreas, area]
    }));
  };

  const handleSubmit = async () => {
    if (!formData.targetRole) {
      toast.error('Please enter a target role');
      return;
    }
    if (formData.focusAreas.length === 0) {
      toast.error('Please select at least one focus area');
      return;
    }

    setLoading(true);
    try {
      const requestData = {
        companyName: company.name,
        companyIndustry: company.industry,
        companyLogo: company.logo,
        ...formData
      };
      
      console.log('Creating plan with data:', requestData);
      
      const response = await fetch('/api/ai-prep/plans', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Server error:', errorData);
        throw new Error(errorData.message || 'Failed to create plan');
      }
      
      const data = await response.json();
      toast.success('AI Prep Plan created successfully!');
      onPlanCreated(data.data.plan);
      onClose();
    } catch (error) {
      toast.error(error.message || 'Failed to create plan. Please try again.');
      console.error('Create plan error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-nb-black/15 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-nb-black text-white rounded-lg flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-nb-black">Create AI Prep Plan</h2>
              <p className="text-sm text-nb-black/45">for {company.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#F5F1E8] rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-nb-black/45" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 bg-[#F5F1E8] border-b border-nb-black/15">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                  step >= s ? 'bg-nb-blue text-white' : 'bg-gray-200 text-nb-black/45'
                }`}>
                  {s}
                </div>
                {s < 3 && (
                  <div className={`w-24 h-1 mx-2 ${
                    step > s ? 'bg-nb-blue' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-nb-black mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-nb-blue" />
                  Basic Information
                </h3>

                {/* Target Role */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-nb-black/75 mb-2">
                    <Briefcase className="w-4 h-4 inline mr-1" />
                    Target Role
                  </label>
                  <input
                    type="text"
                    value={formData.targetRole}
                    onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
                    placeholder="e.g., Senior Software Engineer"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                {/* Experience Level */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-nb-black/75 mb-2">
                    <User className="w-4 h-4 inline mr-1" />
                    Experience Level
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {experienceLevels.map((level) => (
                      <button
                        key={level.value}
                        onClick={() => setFormData({ ...formData, experienceLevel: level.value })}
                        className={`p-4 border-2 rounded-lg text-left transition-all ${
                          formData.experienceLevel === level.value
                            ? 'border-nb-blue/30 bg-nb-blue'
                            : 'border-nb-black/15 hover:border-gray-300'
                        }`}
                      >
                        <div className="font-semibold text-nb-black">{level.label}</div>
                        <div className="text-xs text-nb-black/45 mt-1">{level.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-sm font-medium text-nb-black/75 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Preparation Duration
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {durations.map((dur) => (
                      <button
                        key={dur.value}
                        onClick={() => setFormData({ ...formData, duration: dur.value })}
                        className={`p-4 border-2 rounded-lg text-left transition-all ${
                          formData.duration === dur.value
                            ? 'border-nb-blue/30 bg-nb-blue'
                            : 'border-nb-black/15 hover:border-gray-300'
                        }`}
                      >
                        <div className="font-semibold text-nb-black">{dur.label}</div>
                        <div className="text-xs text-nb-black/45 mt-1">{dur.description}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-nb-black mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-nb-blue" />
                  Focus Areas & Intensity
                </h3>

                {/* Focus Areas */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-nb-black/75 mb-3">
                    Select Focus Areas (choose at least one)
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {focusAreaOptions.map((area) => (
                      <button
                        key={area.value}
                        onClick={() => handleFocusAreaToggle(area.value)}
                        className={`p-4 border-2 rounded-lg text-left transition-all ${
                          formData.focusAreas.includes(area.value)
                            ? 'border-nb-blue/30 bg-nb-blue'
                            : 'border-nb-black/15 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{area.icon}</span>
                          <span className="font-medium text-nb-black">{area.label}</span>
                          {formData.focusAreas.includes(area.value) && (
                            <CheckCircle className="w-5 h-5 text-nb-blue ml-auto" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Study Intensity */}
                <div>
                  <label className="block text-sm font-medium text-nb-black/75 mb-2">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Study Intensity
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {studyIntensities.map((intensity) => (
                      <button
                        key={intensity.value}
                        onClick={() => setFormData({ ...formData, studyIntensity: intensity.value })}
                        className={`p-4 border-2 rounded-lg text-left transition-all ${
                          formData.studyIntensity === intensity.value
                            ? 'border-nb-blue/30 bg-nb-blue'
                            : 'border-nb-black/15 hover:border-gray-300'
                        }`}
                      >
                        <div className="font-semibold text-nb-black">{intensity.label}</div>
                        <div className="text-xs text-nb-black/45 mt-1">{intensity.description}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-nb-black mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-nb-blue" />
                  Schedule & Timeline
                </h3>

                {/* Interview Date */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-nb-black/75 mb-2">
                    Interview Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={formData.interviewDate}
                    onChange={(e) => setFormData({ ...formData, interviewDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                {/* Available Hours */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-nb-black/75 mb-2">
                    Available Hours per Day
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    value={formData.availableHours}
                    onChange={(e) => setFormData({ ...formData, availableHours: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                {/* Preferred Time */}
                <div>
                  <label className="block text-sm font-medium text-nb-black/75 mb-2">
                    Preferred Study Time
                  </label>
                  <select
                    value={formData.preferredTime}
                    onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="Morning">Morning</option>
                    <option value="Afternoon">Afternoon</option>
                    <option value="Evening">Evening</option>
                    <option value="Flexible">Flexible</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-nb-black/15 px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => step > 1 ? setStep(step - 1) : onClose()}
            className="px-4 py-2 text-nb-black/75 hover:bg-[#F5F1E8] rounded-lg transition-colors"
          >
            {step > 1 ? 'Back' : 'Cancel'}
          </button>
          
          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="px-6 py-2 bg-nb-blue text-white rounded-lg hover:bg-nb-blue transition-colors flex items-center gap-2"
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2 bg-nb-black text-white text-white rounded-lg hover:from-nb-blue hover:to-pink-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? 'Creating...' : 'Create Plan'}
              <Zap className="w-4 h-4" />
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default CreatePlanModal;