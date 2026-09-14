import api from './api';

const companyService = {
  // Get all companies with filters
  getCompanies: async (params = {}) => {
    try {
      const response = await api.get('/companies', { params });
      return response.data;
    } catch (error) {
      console.error('Get companies error:', error);
      throw error;
    }
  },

  // Get trending companies
  getTrendingCompanies: async (limit = 6) => {
    try {
      const response = await api.get(`/companies/trending?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Get trending companies error:', error);
      throw error;
    }
  },

  // Get company details
  getCompanyDetails: async (slug) => {
    try {
      const response = await api.get(`/companies/${slug}`);
      return response.data;
    } catch (error) {
      console.error('Get company details error:', error);
      throw error;
    }
  },

  // Get company questions
  getCompanyQuestions: async (slug, params = {}) => {
    try {
      const response = await api.get(`/companies/${slug}/questions`, { params });
      return response.data;
    } catch (error) {
      console.error('Get company questions error:', error);
      throw error;
    }
  },

  // Get question details
  getQuestionDetails: async (questionId) => {
    try {
      const response = await api.get(`/companies/questions/${questionId}`);
      return response.data;
    } catch (error) {
      console.error('Get question details error:', error);
      throw error;
    }
  },

  // Submit question answer
  submitAnswer: async (questionId, answer, timeSpent) => {
    try {
      const response = await api.post(`/companies/questions/${questionId}/submit`, {
        answer,
        timeSpent
      });
      return response.data;
    } catch (error) {
      console.error('Submit answer error:', error);
      throw error;
    }
  },

  // Toggle bookmark
  toggleBookmark: async (questionId, note = '') => {
    try {
      const response = await api.post(`/companies/questions/${questionId}/bookmark`, {
        note
      });
      return response.data;
    } catch (error) {
      console.error('Toggle bookmark error:', error);
      throw error;
    }
  },

  // Get user progress for a company
  getUserProgress: async (slug) => {
    try {
      const response = await api.get(`/companies/${slug}/progress`);
      return response.data;
    } catch (error) {
      console.error('Get user progress error:', error);
      throw error;
    }
  },

  // Get dashboard stats
  getDashboardStats: async () => {
    try {
      const response = await api.get('/companies/dashboard/stats');
      return response.data;
    } catch (error) {
      console.error('Get dashboard stats error:', error);
      throw error;
    }
  },

  // Search companies
  searchCompanies: async (query) => {
    try {
      const response = await api.get('/companies', {
        params: { search: query, limit: 10 }
      });
      return response.data;
    } catch (error) {
      console.error('Search companies error:', error);
      throw error;
    }
  },

  // Get company statistics
  getCompanyStats: async (slug) => {
    try {
      const response = await api.get(`/companies/${slug}/stats`);
      return response.data;
    } catch (error) {
      console.error('Get company stats error:', error);
      throw error;
    }
  }
};

export default companyService;