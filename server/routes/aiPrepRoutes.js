import express from 'express';
import {
  createAIPreparationPlan,
  getUserAIPreparationPlans,
  getAIPreparationPlan,
  updateTaskProgress,
  getDailySchedule,
  getUpcomingTasks,
  submitWeeklyAssessment,
  getAIQuestions,
  getStudyMaterials,
  getProgressAnalytics,
  updatePlanSettings,
  togglePlanStatus,
  getCalendarEvents,
  getAICoachingInsights,
  getAvailableCompanies
} from '../controllers/aiPrepController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Company routes
router.get('/companies', getAvailableCompanies);

// Preparation plan routes
router.post('/plans', createAIPreparationPlan);
router.get('/plans', getUserAIPreparationPlans);
router.get('/plans/:planId', getAIPreparationPlan);
router.patch('/plans/:planId/status', togglePlanStatus);
router.patch('/plans/:planId/settings', updatePlanSettings);

// Daily schedule and tasks
router.get('/plans/:planId/schedule', getDailySchedule);
router.get('/plans/:planId/tasks/upcoming', getUpcomingTasks);
router.patch('/plans/:planId/tasks/progress', updateTaskProgress);

// Assessments
router.post('/plans/:planId/assessments', submitWeeklyAssessment);

// AI-generated content
router.get('/plans/:planId/questions', getAIQuestions);
router.get('/plans/:planId/materials', getStudyMaterials);

// Analytics and insights
router.get('/plans/:planId/analytics', getProgressAnalytics);
router.get('/plans/:planId/coaching', getAICoachingInsights);

// Calendar integration
router.get('/plans/:planId/calendar', getCalendarEvents);

export default router;