import express from 'express';
import * as aiPrepController from '../controllers/aiPrepController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Companies (public - no auth required)
router.get('/companies', aiPrepController.getCompanies);

// All other routes require authentication
router.use(protect);

// Plans
router.post('/plans', aiPrepController.createPlan);
router.get('/plans', aiPrepController.getPlans);
router.get('/plans/:id', aiPrepController.getPlan);
router.patch('/plans/:id/status', aiPrepController.updatePlanStatus);
router.get('/plans/:id/analytics', aiPrepController.getPlanAnalytics);

// Tasks
router.patch('/plans/:id/tasks', aiPrepController.updateTaskCompletion);

// Assessments
router.post('/plans/:id/assessments', aiPrepController.submitAssessment);

export default router;
