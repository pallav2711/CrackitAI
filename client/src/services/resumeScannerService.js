import useAuthStore from '../store/authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthHeaders = () => {
  const token = useAuthStore.getState().token;
  return {
    'Authorization': `Bearer ${token}`
  };
};

export const resumeScannerService = {
  // Scan resume
  scanResume: async (file) => {
    const formData = new FormData();
    formData.append('resume', file);
    
    const response = await fetch(`${API_URL}/resume-scanner/scan`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to scan resume');
    }
    
    return response.json();
  },

  // Get scan history
  getScanHistory: async () => {
    const response = await fetch(`${API_URL}/resume-scanner/history`, {
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) throw new Error('Failed to fetch scan history');
    return response.json();
  },

  // Get specific analysis
  getAnalysis: async (id) => {
    const response = await fetch(`${API_URL}/resume-scanner/${id}`, {
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) throw new Error('Failed to fetch analysis');
    return response.json();
  },

  // Delete analysis
  deleteAnalysis: async (id) => {
    const response = await fetch(`${API_URL}/resume-scanner/${id}`, {
      method: 'DELETE',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) throw new Error('Failed to delete analysis');
    return response.json();
  }
};
