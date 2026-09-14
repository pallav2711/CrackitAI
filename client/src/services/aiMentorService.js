import api from './api';

class AIMentorService {
  // Start or continue a chat session
  async startSession(sessionId = null) {
    try {
      const response = await api.post('/ai-mentor/sessions', { sessionId });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to start session');
    }
  }

  // Send message to AI mentor
  async sendMessage(sessionId, message) {
    try {
      const response = await api.post('/ai-mentor/chat', {
        sessionId,
        message
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to send message');
    }
  }

  // Get user's chat sessions
  async getSessions(limit = 10) {
    try {
      const response = await api.get(`/ai-mentor/sessions?limit=${limit}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get sessions');
    }
  }

  // Get specific chat session
  async getSession(sessionId) {
    try {
      const response = await api.get(`/ai-mentor/sessions/${sessionId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get session');
    }
  }

  // Delete chat session
  async deleteSession(sessionId) {
    try {
      const response = await api.delete(`/ai-mentor/sessions/${sessionId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete session');
    }
  }

  // Get daily motivation
  async getDailyMotivation() {
    try {
      const response = await api.get('/ai-mentor/daily-motivation');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get daily motivation');
    }
  }

  // Get wellness check-in
  async getWellnessCheckIn() {
    try {
      const response = await api.get('/ai-mentor/wellness-checkin');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get wellness check-in');
    }
  }

  // Update session context
  async updateSessionContext(sessionId, context) {
    try {
      const response = await api.put(`/ai-mentor/sessions/${sessionId}/context`, {
        context
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update context');
    }
  }

  // Get mentor analytics
  async getAnalytics() {
    try {
      const response = await api.get('/ai-mentor/analytics');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get analytics');
    }
  }
}

export const aiMentorService = new AIMentorService();