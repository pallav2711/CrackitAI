import useAuthStore from '../store/authStore';

// Use same fallback as api.js — production URL, not localhost
const API_URL = import.meta.env.VITE_API_URL || 'https://crackitai-dwhs.onrender.com/api';

const getAuthHeaders = () => {
  const token = useAuthStore.getState().token;
  return { Authorization: `Bearer ${token}` };
};

export const resumeScannerService = {

  // Scan resume — optionally include a job description for role-specific scoring
  scanResume: async (file, jobDescription = null) => {
    const formData = new FormData();
    formData.append('resume', file);
    if (jobDescription) formData.append('jobDescription', jobDescription);

    const response = await fetch(`${API_URL}/resume-scanner/scan`, {
      method:  'POST',
      headers: getAuthHeaders(),
      body:    formData,
    });

    if (!response.ok) {
      let msg = 'Failed to scan resume';
      try { const e = await response.json(); msg = e.error || e.message || msg; } catch (_) {}
      throw new Error(msg);
    }
    return response.json();
  },

  // Get scan history
  getScanHistory: async () => {
    const response = await fetch(`${API_URL}/resume-scanner/history`, {
      headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error('Failed to fetch scan history');
    return response.json();
  },

  // Get specific analysis
  getAnalysis: async (id) => {
    const response = await fetch(`${API_URL}/resume-scanner/${id}`, {
      headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error('Failed to fetch analysis');
    return response.json();
  },

  // Delete analysis
  deleteAnalysis: async (id) => {
    const response = await fetch(`${API_URL}/resume-scanner/${id}`, {
      method:  'DELETE',
      headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error('Failed to delete analysis');
    return response.json();
  },
};
