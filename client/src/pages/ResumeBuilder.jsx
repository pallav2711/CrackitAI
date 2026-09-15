import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, User, Briefcase, GraduationCap, Code,
  FolderGit2, Award, Save, Eye, Download, ArrowLeft,
  ArrowRight, CheckCircle, Loader2,
} from 'lucide-react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { resumeService } from '../services/resumeService';
import { downloadResumePDF } from '../components/resume/ResumePDF';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

// Import step components
import PersonalInfoStep from '../components/resume/PersonalInfoStep';
import ExperienceStep from '../components/resume/ExperienceStep';
import EducationStep from '../components/resume/EducationStep';
import SkillsStep from '../components/resume/SkillsStep';
import ProjectsStep from '../components/resume/ProjectsStep';
import CertificationsStep from '../components/resume/CertificationsStep';
import ResumePreview from '../components/resume/ResumePreview';

const ResumeBuilder = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const resumeId = searchParams.get('id');
  const { user } = useAuthStore();

  const [currentStep, setCurrentStep] = useState(0);
  const [resumeData, setResumeData] = useState({
    title: 'My Resume',
    template: 'modern',
    personalInfo: {
      fullName: user?.name || '',
      email: user?.email || '',
      phone: '',
      location: '',
      linkedin: '',
      github: '',
      portfolio: '',
      summary: ''
    },
    experience: [],
    education: [],
    skills: {
      technical: [],
      soft: [],
      languages: [],
      tools: []
    },
    projects: [],
    certifications: []
  });

  const [saving,      setSaving]      = useState(false);
  const [loadingData, setLoadingData] = useState(!!resumeId);
  const [showPreview, setShowPreview] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [atsScore,    setAtsScore]    = useState(null);
  const [currentResumeId, setCurrentResumeId] = useState(resumeId);

  const steps = [
    { id: 'personal', label: 'Personal Info', icon: User, component: PersonalInfoStep },
    { id: 'experience', label: 'Experience', icon: Briefcase, component: ExperienceStep },
    { id: 'education', label: 'Education', icon: GraduationCap, component: EducationStep },
    { id: 'skills', label: 'Skills', icon: Code, component: SkillsStep },
    { id: 'projects', label: 'Projects', icon: FolderGit2, component: ProjectsStep },
    { id: 'certifications', label: 'Certifications', icon: Award, component: CertificationsStep }
  ];

  // Load existing resume if editing
  useEffect(() => {
    if (resumeId) {
      loadResume();
    }
  }, [resumeId]);

  const loadResume = async () => {
    setLoadingData(true);
    try {
      const data = await resumeService.getResume(resumeId);
      setResumeData(data);
      if (data.atsScore) setAtsScore(data.atsScore);
    } catch (err) {
      toast.error(`Failed to load resume: ${err.message}`);
    } finally {
      setLoadingData(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let savedId = currentResumeId;
      if (currentResumeId) {
        await resumeService.updateResume(currentResumeId, resumeData);
      } else {
        const newResume = await resumeService.createResume(resumeData);
        savedId = newResume._id;
        setCurrentResumeId(savedId);
        navigate(`/resume-builder?id=${savedId}`, { replace: true });
      }
      // Fetch ATS analysis for both new and existing resumes
      if (savedId) {
        try {
          const analysis = await resumeService.getATSAnalysis(savedId);
          setAtsScore(analysis.score);
        } catch { /* ATS is non-critical */ }
      }
      toast.success('Resume saved!');
    } catch (err) {
      toast.error(`Save failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      await downloadResumePDF(resumeData);
      toast.success('PDF downloaded!');
    } catch (err) {
      toast.error(`PDF generation failed: ${err.message}`);
    } finally {
      setDownloading(false);
    }
  };

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      await handleSave(); // await so failures are visible
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateResumeData = (section, data) => {
    setResumeData(prev => ({
      ...prev,
      [section]: data
    }));
  };

  const CurrentStepComponent = steps[currentStep].component;

  if (loadingData) return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-nb-black/30" />
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                Resume Builder
              </h1>
              <p className="text-nb-black/55 text-lg">Create your ATS-optimized professional resume</p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {atsScore !== null && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 ${
                    atsScore >= 80 ? 'bg-green-50 border-green-500' :
                    atsScore >= 60 ? 'bg-nb-yellow border-yellow-500' : 
                    'bg-red-50 border-red-500'
                  }`}
                >
                  <div className={`w-3 h-3 rounded-full animate-pulse ${
                    atsScore >= 80 ? 'bg-nb-green' :
                    atsScore >= 60 ? 'bg-nb-yellow' : 'bg-nb-red'
                  }`} />
                  <span className={`text-sm font-bold ${
                    atsScore >= 80 ? 'text-nb-green' :
                    atsScore >= 60 ? 'text-nb-black' : 'text-nb-red'
                  }`}>
                    ATS Score: {atsScore}%
                  </span>
                </motion.div>
              )}
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="btn btn-secondary flex items-center gap-2 group"
              >
                <Eye className="w-4 h-4 group-hover:scale-110 transition-transform" />
                {showPreview ? 'Hide' : 'Preview'}
              </button>
              <button
                onClick={handleDownloadPDF}
                disabled={downloading}
                className="btn btn-secondary flex items-center gap-2"
              >
                {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                PDF
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn btn-primary flex items-center gap-2 group disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 group-hover:scale-110 transition-transform" />}
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="nb-card-compat mb-8 overflow-hidden"
        >
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;

              return (
                <div key={step.id} className="flex items-center flex-1">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentStep(index)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all relative ${
                      isActive
                        ? 'bg-nb-black text-white text-white shadow-lg'
                        : isCompleted
                        ? 'bg-green-50 text-nb-green hover:bg-nb-green/10'
                        : 'text-nb-black/35 hover:bg-[#F5F1E8]'
                    }`}
                  >
                    {isCompleted ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200 }}
                      >
                        <CheckCircle className="w-5 h-5" />
                      </motion.div>
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                    <span className="hidden md:block font-semibold">{step.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="activeStep"
                        className="absolute inset-0 bg-nb-black text-white rounded-xl -z-10"
                      />
                    )}
                  </motion.button>
                  {index < steps.length - 1 && (
                    <div className="flex-1 h-1 mx-2 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: isCompleted ? '100%' : '0%' }}
                        transition={{ duration: 0.5 }}
                        className="h-full bg-nb-black text-white"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Form Section */}
          <div className="nb-card-compat">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <CurrentStepComponent
                  data={resumeData}
                  updateData={updateResumeData}
                />
              </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t">
              <button
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="btn btn-secondary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="w-4 h-4" />
                Previous
              </button>
              <div className="text-sm text-nb-black/45">
                Step {currentStep + 1} of {steps.length}
              </div>
              <button
                onClick={handleNext}
                disabled={currentStep === steps.length - 1}
                className="btn btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Preview Section */}
          {showPreview && (
            <div className="lg:sticky lg:top-6 h-fit">
              <ResumePreview data={resumeData} />
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ResumeBuilder;
