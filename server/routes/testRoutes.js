import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getAllTests,
  getTest,
  startTest,
  submitAnswer,
  submitTest,
  getTestResults,
  getTestHistory,
  getUserStats,
  createTest,
  generateAITest
} from '../controllers/testController.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get all tests
router.get('/', getAllTests);

// Get user statistics
router.get('/stats', getUserStats);

// Get test history
router.get('/history', getTestHistory);

// Get specific test
router.get('/:id', getTest);

// Start test attempt
router.post('/start', startTest); // Start new test
router.post('/:id/start', startTest); // Start specific test

// Submit single answer
router.post('/answer', submitAnswer);

// Submit complete test
router.post('/submit', submitTest);

// Get test results
router.get('/results/:attemptId', getTestResults);

// Create test (simplified - would need admin middleware)
router.post('/create', createTest);

// Generate AI test on-demand
router.post('/generate-ai', generateAITest);

export default router;
