import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileText, Plus, Edit, Trash2, Copy, Download,
  Eye, MoreVertical, AlertCircle, Upload, Scan
} from 'lucide-react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { resumeService } from '../services/resumeService';
import ResumeScanner from './ResumeScanner';

const ResumeList = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('my-resumes'); // 'my-resumes' or 'scanner'
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState(null);

  useEffect(() => {
    loadResumes();
  }, []);

  const loadResumes = async () => {
    try {
      const data = await resumeService.getAllResumes();
      setResumes(data);
    } catch (error) {
      console.error('Failed to load resumes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    navigate('/resume-builder');
  };

  const handleEdit = (id) => {
    navigate(`/resume-builder?id=${id}`);
  };

  const handleDuplicate = async (id) => {
    try {
      const newResume = await resumeService.duplicateResume(id);
      setResumes([newResume, ...resumes]);
      setActiveMenu(null);
    } catch (error) {
      console.error('Failed to duplicate resume:', error);
      alert('Failed to duplicate resume');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this resume?')) {
      try {
        await resumeService.deleteResume(id);
        setResumes(resumes.filter(r => r._id !== id));
        setActiveMenu(null);
      } catch (error) {
        console.error('Failed to delete resume:', error);
        alert('Failed to delete resume');
      }
    }
  };

  const getATSScoreColor = (score) => {
    if (score >= 80) return 'text-nb-green bg-nb-green/10 border border-nb-green/30';
    if (score >= 60) return 'text-nb-black bg-nb-yellow border border-nb-black/20';
    return 'text-nb-red bg-nb-red/10 border border-nb-red/30';
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

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Resume Center</h1>
          <p className="text-nb-black/55">Create, manage, and optimize your professional resumes</p>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="flex gap-2 bg-[#F5F1E8] p-1 rounded-lg inline-flex">
            <button
              onClick={() => setActiveTab('my-resumes')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all relative ${
                activeTab === 'my-resumes'
                  ? 'bg-white text-nb-black shadow-md'
                  : 'text-nb-black/55 hover:text-nb-black'
              }`}
            >
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                My Resumes
              </div>
            </button>
            <button
              onClick={() => setActiveTab('scanner')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all relative ${
                activeTab === 'scanner'
                  ? 'bg-white text-nb-black shadow-md'
                  : 'text-nb-black/55 hover:text-nb-black'
              }`}
            >
              <div className="flex items-center gap-2">
                <Scan className="w-5 h-5" />
                Resume Scanner
              </div>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'my-resumes' ? (
          <>
            {/* Create Button */}
            <div className="mb-6 flex justify-end">
              <button
                onClick={handleCreate}
                className="btn btn-primary flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Create New Resume
              </button>
            </div>

            {/* Resumes Grid */}
            {resumes.length === 0 ? (
          <div className="nb-card-compat text-center py-16">
            <FileText className="w-16 h-16 text-nb-black/35 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-nb-black mb-2">No resumes yet</h2>
            <p className="text-nb-black/55 mb-6">Create your first professional resume</p>
            <button onClick={handleCreate} className="btn btn-primary">
              Create Your First Resume
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resumes.map((resume, index) => (
              <motion.div
                key={resume._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="nb-card-compat transition-all cursor-pointer group relative"
              >
                {/* Menu Button */}
                <div className="absolute top-4 right-4 z-10">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenu(activeMenu === resume._id ? null : resume._id);
                    }}
                    className="p-2 hover:bg-[#F5F1E8] rounded-lg"
                  >
                    <MoreVertical className="w-5 h-5 text-nb-black/55" />
                  </button>

                  {/* Dropdown Menu */}
                  {activeMenu === resume._id && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-1 z-20">
                      <button
                        onClick={() => handleEdit(resume._id)}
                        className="w-full px-4 py-2 text-left hover:bg-[#F5F1E8] flex items-center gap-2"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDuplicate(resume._id)}
                        className="w-full px-4 py-2 text-left hover:bg-[#F5F1E8] flex items-center gap-2"
                      >
                        <Copy className="w-4 h-4" />
                        Duplicate
                      </button>
                      <button
                        onClick={() => handleDelete(resume._id)}
                        className="w-full px-4 py-2 text-left hover:bg-[#F5F1E8] flex items-center gap-2 text-nb-red"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>

                <div onClick={() => handleEdit(resume._id)}>
                  {/* Resume Preview */}
                  <div className="bg-nb-black text-white rounded-lg p-6 mb-4 h-48 flex items-center justify-center">
                    <FileText className="w-20 h-20 text-nb-black opacity-50" />
                  </div>

                  {/* Resume Info */}
                  <div>
                    <h3 className="font-bold text-lg mb-2 group-hover:text-nb-black transition-colors">
                      {resume.title}
                    </h3>
                    
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-nb-black/45">
                        {new Date(resume.lastModified).toLocaleDateString()}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getATSScoreColor(resume.atsScore)}`}>
                        ATS: {resume.atsScore}%
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-[#F5F1E8] text-nb-black/75 rounded-full text-xs capitalize">
                        {resume.template}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

            {/* Tips Section */}
            {resumes.length > 0 && (
              <div className="mt-8 card bg-blue-50 border-nb-blue/30">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-nb-blue flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-nb-blue mb-1">Resume Tips</h3>
                    <ul className="text-sm text-nb-blue space-y-1">
                      <li>• Keep your resume to 1-2 pages</li>
                      <li>• Use action verbs and quantify achievements</li>
                      <li>• Tailor your resume for each job application</li>
                      <li>• Aim for an ATS score of 80% or higher</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <ResumeScanner />
        )}
      </div>
    </DashboardLayout>
  );
};

export default ResumeList;
