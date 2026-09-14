import useAuthStore from '../store/authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthHeaders = () => {
  const token = useAuthStore.getState().token;
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const resumeService = {
  // Get all resumes
  getAllResumes: async () => {
    const response = await fetch(`${API_URL}/resume`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch resumes');
    return response.json();
  },

  // Get single resume
  getResume: async (id) => {
    const response = await fetch(`${API_URL}/resume/${id}`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch resume');
    return response.json();
  },

  // Create resume
  createResume: async (data) => {
    const response = await fetch(`${API_URL}/resume`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create resume');
    return response.json();
  },

  // Update resume
  updateResume: async (id, data) => {
    const response = await fetch(`${API_URL}/resume/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update resume');
    return response.json();
  },

  // Delete resume
  deleteResume: async (id) => {
    const response = await fetch(`${API_URL}/resume/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to delete resume');
    return response.json();
  },

  // Duplicate resume
  duplicateResume: async (id) => {
    const response = await fetch(`${API_URL}/resume/${id}/duplicate`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to duplicate resume');
    return response.json();
  },

  // Get ATS analysis
  getATSAnalysis: async (id) => {
    const response = await fetch(`${API_URL}/resume/${id}/ats-analysis`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to get ATS analysis');
    return response.json();
  }
};
