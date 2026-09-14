import api from './api';

const analyticsService = {
  // Get comprehensive dashboard analytics
  getDashboardAnalytics: async (period = 'week') => {
    try {
      const response = await api.get(`/analytics/dashboard?period=${period}`);
      return response.data;
    } catch (error) {
      console.error('Analytics service error:', error);
      // Return empty data structure instead of mock data
      return {
        data: {
          stats: {
            resumeScore: 0,
            interviews: 0,
            tests: 0,
            readiness: 0,
            totalPoints: 0,
            rank: 0,
            completionRate: 0
          },
          streak: {
            current: 0,
            longest: 0,
            totalDays: 0
          },
          weeklyProgress: [
            { day: 'Mon', value: 0 },
            { day: 'Tue', value: 0 },
            { day: 'Wed', value: 0 },
            { day: 'Thu', value: 0 },
            { day: 'Fri', value: 0 },
            { day: 'Sat', value: 0 },
            { day: 'Sun', value: 0 }
          ],
          recentActivity: [],
          achievements: [],
          trends: null,
          skillBreakdown: null,
          categoryPerformance: null,
          insights: null,
          patterns: null
        }
      };
    }
  },

  // Get leaderboard
  getLeaderboard: async (period = 'week', limit = 50) => {
    try {
      const response = await api.get(`/analytics/leaderboard?period=${period}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Leaderboard service error:', error);
      return {
        data: {
          leaderboard: [],
          currentUser: null,
          totalParticipants: 0
        }
      };
    }
  },

  // Get comprehensive performance report
  getPerformanceReport: async (startDate, endDate) => {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      const response = await api.get(`/analytics/report?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Report service error:', error);
      return {
        data: null
      };
    }
  },

  // Get skill assessment data
  getSkillAssessment: async () => {
    try {
      const response = await api.get('/analytics/skills');
      return response.data;
    } catch (error) {
      console.error('Skill assessment service error:', error);
      return {
        data: {
          skills: {},
          recommendations: []
        }
      };
    }
  },

  // Get learning patterns
  getLearningPatterns: async () => {
    try {
      const response = await api.get('/analytics/patterns');
      return response.data;
    } catch (error) {
      console.error('Learning patterns service error:', error);
      return {
        data: {
          peakTime: null,
          avgSessionTime: 0,
          mostActiveDay: null,
          retentionRate: 0,
          learningVelocity: 'Low',
          consistencyScore: 0
        }
      };
    }
  },

  // Track activity
  trackActivity: async (activityType, activityDetails, duration) => {
    try {
      const response = await api.post('/analytics/activity', {
        activityType,
        activityDetails,
        duration,
        timestamp: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      console.error('Activity tracking error:', error);
      return { success: false, error: error.message };
    }
  },

  // Get progress trends
  getProgressTrends: async (period = 'month') => {
    try {
      const response = await api.get(`/analytics/trends?period=${period}`);
      return response.data;
    } catch (error) {
      console.error('Progress trends service error:', error);
      return {
        data: {
          trends: []
        }
      };
    }
  },

  // Export data
  exportData: async (format = 'pdf', dateRange = {}) => {
    try {
      const response = await api.post('/analytics/export', {
        format,
        dateRange,
        timestamp: new Date().toISOString()
      }, {
        responseType: format === 'pdf' ? 'blob' : 'json'
      });
      return response.data;
    } catch (error) {
      console.error('Export service error:', error);
      throw error;
    }
  }
};

export default analyticsService;
