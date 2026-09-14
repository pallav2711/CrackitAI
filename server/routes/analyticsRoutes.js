import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getDashboardAnalytics,
  getLeaderboard,
  getPerformanceReport,
  trackActivity,
  getSkillAssessment,
  getLearningPatterns,
  getProgressTrends,
  exportData
} from '../controllers/analyticsController.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Dashboard analytics
router.get('/dashboard', getDashboardAnalytics);

// Leaderboard
router.get('/leaderboard', getLeaderboard);

// Performance report
router.get('/report', getPerformanceReport);

// Track activity
router.post('/activity', trackActivity);

// Skill assessment
router.get('/skills', getSkillAssessment);

// Learning patterns
router.get('/patterns', getLearningPatterns);

// Progress trends
router.get('/trends', getProgressTrends);

// Export data
router.post('/export', exportData);

// Aliases for common endpoints
router.get('/user', getDashboardAnalytics); // Alias for user analytics
router.get('/stats', getPerformanceReport); // Alias for stats

export default router;
