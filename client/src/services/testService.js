const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthHeaders = () => {
  // Try to get token from auth-storage (Zustand persist)
  const authStorage = localStorage.getItem('auth-storage');
  let token = null;
  
  if (authStorage) {
    try {
      const parsed = JSON.parse(authStorage);
      token = parsed.state?.token;
    } catch (e) {
      console.error('Failed to parse auth storage:', e);
    }
  }
  
  // Fallback to direct token key
  if (!token) {
    token = localStorage.getItem('token');
  }
  
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const testService = {
  // Get all tests
  getAllTests: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await fetch(`${API_URL}/tests?${params}`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch tests');
    return response.json();
  },

  // Get single test
  getTest: async (id) => {
    const response = await fetch(`${API_URL}/tests/${id}`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch test');
    return response.json();
  },

  // Start test
  startTest: async (id) => {
    const response = await fetch(`${API_URL}/tests/${id}/start`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to start test');
    return response.json();
  },

  // Submit answer
  submitAnswer: async (data) => {
    const response = await fetch(`${API_URL}/tests/answer`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to submit answer');
    return response.json();
  },

  // Submit test
  submitTest: async (data) => {
    const response = await fetch(`${API_URL}/tests/submit`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to submit test');
    return response.json();
  },

  // Get results
  getResults: async (attemptId) => {
    const response = await fetch(`${API_URL}/tests/results/${attemptId}`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch results');
    return response.json();
  },

  // Get history
  getHistory: async () => {
    const response = await fetch(`${API_URL}/tests/history`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch history');
    return response.json();
  },

  // Get stats
  getStats: async () => {
    const response = await fetch(`${API_URL}/tests/stats`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch stats');
    return response.json();
  }
};
