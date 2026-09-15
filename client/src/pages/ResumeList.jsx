import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText, Plus, Edit, Trash2, Copy, Download,
  MoreVertical, AlertCircle, Scan, Loader2, X,
} from 'lucide-react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { resumeService }  from '../services/resumeService';
import { downloadResumePDF } from '../components/resume/ResumePDF';
import ResumeScanner from './ResumeScanner';
import toast from 'react-hot-toast';

/* ── Confirm modal ───────────────────────────────────────────────────────── */
function ConfirmModal({ title, message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-nb-black/60">
      <div className="bg-white border-2 border-nb-black w-full max-w-sm" style={{ borderRadius: '8px', boxShadow: '6px 6px 0 #111111' }}>
        <div className="flex items-center justify-between p-5 border-b-2 border-nb-black">
          <h3 className="font-black text-sm uppercase tracking-widest">{title}</h3>
          <button onClick={onCancel} className="text-nb-black/40 hover:text-nb-black">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5">
          <p className="text-sm text-nb-black/70">{message}</p>
        </div>
        <div className="flex gap-3 p-4 border-t-2 border-nb-black">
          <button onClick={onCancel}  className="btn btn-ghost flex-1">Cancel</button>
          <button onClick={onConfirm} className="btn btn-red  flex-1">Delete</button>
        </div>
      </div>
    </div>
  );
}

/* ── ATS score badge ─────────────────────────────────────────────────────── */
const ATSBadge = ({ score }) => {
  const cls = score >= 80 ? 'text-green-800 bg-green-100 border-green-300'
    : score >= 60         ? 'text-amber-800 bg-amber-50 border-amber-300'
    :                       'text-red-700   bg-red-50   border-red-300';
  return (
    <span className={`text-[10px] font-black px-2 py-0.5 border-2 font-mono ${cls}`} style={{ borderRadius: '3px' }}>
      ATS {score}%
    </span>
  );
};

/* ── Page ────────────────────────────────────────────────────────────────── */
const ResumeList = () => {
  const navigate = useNavigate();
  const [activeTab,   setActiveTab]   = useState('my-resumes');
  const [resumes,     setResumes]     = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [activeMenu,  setActiveMenu]  = useState(null);
  const [confirmDel,  setConfirmDel]  = useState(null); // id of resume to delete
  const [downloading, setDownloading] = useState(null); // id of resume being downloaded

  const loadResumes = useCallback(async () => {
    try {
      const data = await resumeService.getAllResumes();
      setResumes(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(`Failed to load resumes: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadResumes(); }, [loadResumes]);

  const handleDuplicate = async (id) => {
    setActiveMenu(null);
    try {
      const newResume = await resumeService.duplicateResume(id);
      setResumes(prev => [newResume, ...prev]);
      toast.success('Resume duplicated');
    } catch (err) {
      toast.error(`Duplicate failed: ${err.message}`);
    }
  };

  const handleDeleteConfirm = async () => {
    const id = confirmDel;
    setConfirmDel(null);
    try {
      await resumeService.deleteResume(id);
      setResumes(prev => prev.filter(r => r._id !== id));
      toast.success('Resume deleted');
    } catch (err) {
      toast.error(`Delete failed: ${err.message}`);
    }
  };

  const handleDownload = async (id) => {
    setActiveMenu(null);
    setDownloading(id);
    try {
      const data = await resumeService.getResume(id);
      await downloadResumePDF(data);
      toast.success('PDF downloaded!');
    } catch (err) {
      toast.error(`Download failed: ${err.message}`);
    } finally {
      setDownloading(null);
    }
  };

  if (loading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-nb-black/30" />
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="max-w-6xl">

        {/* Header */}
        <div className="border-b-3 border-nb-black pb-6 mb-8">
          <h1 className="font-black text-nb-black" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.75rem,4vw,2.5rem)', letterSpacing: '-0.03em' }}>
            Resume Center
          </h1>
          <p className="text-sm text-nb-black/50 mt-1">Build, scan, and download professional resumes</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 bg-[#F5F1E8] border-2 border-nb-black p-1 inline-flex" style={{ borderRadius: '6px' }}>
          {[
            { id: 'my-resumes', label: 'My Resumes', icon: FileText },
            { id: 'scanner',    label: 'ATS Scanner', icon: Scan },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-5 py-2.5 text-sm font-bold transition-all ${
                activeTab === id
                  ? 'bg-white border-2 border-nb-black text-nb-black'
                  : 'text-nb-black/50 hover:text-nb-black border-2 border-transparent'
              }`}
              style={{ borderRadius: '4px', boxShadow: activeTab === id ? '2px 2px 0 #111' : 'none' }}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* ── My Resumes tab ─────────────────────────────────────────────── */}
        {activeTab === 'my-resumes' && (
          <>
            <div className="mb-6 flex justify-end">
              <button onClick={() => navigate('/resume-builder')} className="btn btn-primary">
                <Plus className="w-4 h-4" /> Create New Resume
              </button>
            </div>

            {resumes.length === 0 ? (
              <div className="bg-white border-2 border-nb-black p-16 text-center" style={{ borderRadius: '8px', boxShadow: '4px 4px 0 #111' }}>
                <FileText className="w-14 h-14 text-nb-black/20 mx-auto mb-4" />
                <h2 className="font-black text-lg uppercase tracking-tight mb-2">No resumes yet</h2>
                <p className="text-sm text-nb-black/50 mb-6">Create your first professional resume</p>
                <button onClick={() => navigate('/resume-builder')} className="btn btn-primary">
                  Create Your First Resume
                </button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {resumes.map((resume) => (
                  <div
                    key={resume._id}
                    className="bg-white border-2 border-nb-black flex flex-col relative hover:-translate-x-0.5 hover:-translate-y-0.5 transition-transform duration-100"
                    style={{ borderRadius: '8px', boxShadow: '4px 4px 0 #111111' }}
                  >
                    {/* Menu button */}
                    <div className="absolute top-3 right-3 z-10">
                      <button
                        onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === resume._id ? null : resume._id); }}
                        className="w-8 h-8 flex items-center justify-center hover:bg-[#F5F1E8] transition-colors"
                        style={{ borderRadius: '4px' }}
                      >
                        <MoreVertical className="w-4 h-4 text-nb-black/50" />
                      </button>
                      {activeMenu === resume._id && (
                        <div className="absolute right-0 mt-1 w-44 bg-white border-2 border-nb-black z-20" style={{ borderRadius: '6px', boxShadow: '4px 4px 0 #111' }}>
                          <button onClick={() => { navigate(`/resume-builder?id=${resume._id}`); setActiveMenu(null); }}
                            className="w-full px-4 py-2.5 text-left text-sm font-bold hover:bg-[#F5F1E8] flex items-center gap-2">
                            <Edit className="w-4 h-4" /> Edit
                          </button>
                          <button onClick={() => handleDuplicate(resume._id)}
                            className="w-full px-4 py-2.5 text-left text-sm font-bold hover:bg-[#F5F1E8] flex items-center gap-2 border-t border-nb-black/10">
                            <Copy className="w-4 h-4" /> Duplicate
                          </button>
                          <button onClick={() => { handleDownload(resume._id); }}
                            className="w-full px-4 py-2.5 text-left text-sm font-bold hover:bg-[#F5F1E8] flex items-center gap-2 border-t border-nb-black/10">
                            {downloading === resume._id
                              ? <Loader2 className="w-4 h-4 animate-spin" />
                              : <Download className="w-4 h-4" />}
                            Download PDF
                          </button>
                          <button onClick={() => { setConfirmDel(resume._id); setActiveMenu(null); }}
                            className="w-full px-4 py-2.5 text-left text-sm font-bold text-nb-red hover:bg-red-50 flex items-center gap-2 border-t border-nb-black/10">
                            <Trash2 className="w-4 h-4" /> Delete
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Preview thumbnail */}
                    <div
                      className="bg-[#F5F1E8] border-b-2 border-nb-black p-6 flex flex-col items-start gap-2 cursor-pointer"
                      onClick={() => navigate(`/resume-builder?id=${resume._id}`)}
                    >
                      <div className="w-10 h-10 bg-nb-yellow border-2 border-nb-black flex items-center justify-center" style={{ borderRadius: '5px', boxShadow: '2px 2px 0 #111' }}>
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-black text-sm uppercase tracking-tight">{resume.title}</p>
                        <p className="text-[11px] text-nb-black/40 font-mono mt-0.5 capitalize">{resume.template} template</p>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="p-4 flex items-center justify-between">
                      <span className="text-[10px] font-mono text-nb-black/35">
                        {new Date(resume.lastModified || resume.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </span>
                      <ATSBadge score={resume.atsScore || 0} />
                    </div>

                    {/* Quick actions row */}
                    <div className="border-t-2 border-nb-black/10 flex">
                      <button
                        onClick={() => navigate(`/resume-builder?id=${resume._id}`)}
                        className="flex-1 py-2.5 text-xs font-bold text-nb-black/60 hover:bg-nb-yellow/20 hover:text-nb-black transition-colors flex items-center justify-center gap-1.5 border-r-2 border-nb-black/10"
                      >
                        <Edit className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button
                        onClick={() => handleDownload(resume._id)}
                        disabled={downloading === resume._id}
                        className="flex-1 py-2.5 text-xs font-bold text-nb-black/60 hover:bg-nb-yellow/20 hover:text-nb-black transition-colors flex items-center justify-center gap-1.5"
                      >
                        {downloading === resume._id
                          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          : <Download className="w-3.5 h-3.5" />}
                        PDF
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {resumes.length > 0 && (
              <div className="mt-8 bg-nb-yellow/30 border-2 border-nb-black p-4 flex gap-3" style={{ borderRadius: '6px' }}>
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div className="text-sm space-y-0.5">
                  <p className="font-black">Resume Tips</p>
                  <ul className="text-nb-black/65 space-y-0.5">
                    <li>• Keep your resume to 1–2 pages and use action verbs.</li>
                    <li>• Quantify achievements — numbers stand out to ATS and recruiters.</li>
                    <li>• Aim for an ATS score of 80%+ before applying.</li>
                    <li>• Use the ATS Scanner tab to check your resume against a job description.</li>
                  </ul>
                </div>
              </div>
            )}
          </>
        )}

        {/* ── Scanner tab ──────────────────────────────────────────────────── */}
        {activeTab === 'scanner' && <ResumeScanner />}
      </div>

      {/* Close menu on outside click */}
      {activeMenu && (
        <div className="fixed inset-0 z-0" onClick={() => setActiveMenu(null)} />
      )}

      {/* Delete confirmation modal */}
      {confirmDel && (
        <ConfirmModal
          title="Delete Resume"
          message="Are you sure you want to delete this resume? This action cannot be undone."
          onConfirm={handleDeleteConfirm}
          onCancel={() => setConfirmDel(null)}
        />
      )}
    </DashboardLayout>
  );
};

export default ResumeList;
