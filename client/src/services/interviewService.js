const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthHeaders = () => {
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
  
  if (!token) {
    token = localStorage.getItem('token');
  }
  
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const interviewService = {
  // Create new interview
  createInterview: async (data) => {
    console.log('📤 Sending interview creation request:', data);
    console.log('📍 API URL:', `${API_URL}/interview`);
    
    const headers = getAuthHeaders();
    console.log('🔑 Auth headers:', headers);
    
    const response = await fetch(`${API_URL}/interview`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data)
    });
    
    console.log('📥 Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error response:', errorText);
      throw new Error(`Failed to create interview: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json();
    console.log('✅ Interview created successfully:', result);
    return result;
  },

  // Start interview
  startInterview: async (id) => {
    const response = await fetch(`${API_URL}/interview/${id}/start`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to start interview');
    return response.json();
  },

  // Submit answer
  submitAnswer: async (data) => {
    const response = await fetch(`${API_URL}/interview/answer`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to submit answer');
    return response.json();
  },

  // Complete interview
  completeInterview: async (id) => {
    const response = await fetch(`${API_URL}/interview/${id}/complete`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to complete interview');
    return response.json();
  },

  // Get interview details
  getInterview: async (id) => {
    const response = await fetch(`${API_URL}/interview/${id}`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch interview');
    return response.json();
  },

  // Get interview history
  getHistory: async () => {
    const response = await fetch(`${API_URL}/interview/user/history`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch history');
    return response.json();
  },

  // Get interview statistics
  getStats: async () => {
    const response = await fetch(`${API_URL}/interview/user/stats`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch stats');
    return response.json();
  },

  // Get enhanced AI analysis
  getEnhancedAnalysis: async (id) => {
    const response = await fetch(`${API_URL}/interview/${id}/enhanced-analysis`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch enhanced analysis');
    return response.json();
  },

  // Regenerate enhanced analysis
  regenerateEnhancedAnalysis: async (id) => {
    const response = await fetch(`${API_URL}/interview/${id}/regenerate-analysis`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to regenerate enhanced analysis');
    return response.json();
  }
};
