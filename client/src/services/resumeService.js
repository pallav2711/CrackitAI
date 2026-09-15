import useAuthStore from '../store/authStore';

// Use same fallback as api.js — production URL, not localhost
const API_URL = import.meta.env.VITE_API_URL || 'https://crackitai-dwhs.onrender.com/api';

const getAuthHeaders = () => {
  const token = useAuthStore.getState().token;
  return {
    'Content-Type': 'application/json',
    Authorization:  `Bearer ${token}`,
  };
};

const handleResponse = async (response) => {
  if (!response.ok) {
    let msg = `Request failed (${response.status})`;
    try { const e = await response.json(); msg = e.error || e.message || msg; } catch (_) {}
    throw new Error(msg);
  }
  return response.json();
};

export const resumeService = {

  getAllResumes: () =>
    fetch(`${API_URL}/resume`, { headers: getAuthHeaders() }).then(handleResponse),

  getResume: (id) =>
    fetch(`${API_URL}/resume/${id}`, { headers: getAuthHeaders() }).then(handleResponse),

  createResume: (data) =>
    fetch(`${API_URL}/resume`, {
      method:  'POST',
      headers: getAuthHeaders(),
      body:    JSON.stringify(data),
    }).then(handleResponse),

  updateResume: (id, data) =>
    fetch(`${API_URL}/resume/${id}`, {
      method:  'PUT',
      headers: getAuthHeaders(),
      body:    JSON.stringify(data),
    }).then(handleResponse),

  deleteResume: (id) =>
    fetch(`${API_URL}/resume/${id}`, {
      method:  'DELETE',
      headers: getAuthHeaders(),
    }).then(handleResponse),

  duplicateResume: (id) =>
    fetch(`${API_URL}/resume/${id}/duplicate`, {
      method:  'POST',
      headers: getAuthHeaders(),
    }).then(handleResponse),

  getATSAnalysis: (id) =>
    fetch(`${API_URL}/resume/${id}/ats-analysis`, {
      headers: getAuthHeaders(),
    }).then(handleResponse),
};
