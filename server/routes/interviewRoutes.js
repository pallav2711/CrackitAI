import express from 'express';
import {
  createInterview,
  startInterview,
  submitAnswer,
  completeInterview,
  getInterview,
  getInterviewHistory,
  getInterviewStats,
  getEnhancedAnalysis,
  regenerateEnhancedAnalysis
} from '../controllers/interviewController.js';
import {
  startVoiceSession,
  endVoiceSession,
} from '../controllers/voiceInterviewController.js';
import { protect } from '../middleware/auth.js';
import { aiCallLimit, interviewCreditLimit } from '../middleware/aiRateLimit.js';
// requireSubscription: plan-level route guard
// Voice interviews and text interviews require at least the free plan (effectively all authenticated users)
// We apply requirePaid only where we want to gate specific paid features.
// Currently, interview credit limits already enforce the free/paid distinction via PLAN_LIMITS.
// requirePaid is reserved for future features that are purely paid (no free tier).

const router = express.Router();

// All routes require authentication
router.use(protect);

// ── Voice interview routes ──────────────────────────────────────────────────
// (credit check is inside the controller — it needs to roll back on Realtime failure)
router.post('/voice/start', startVoiceSession);
router.post('/voice/end', aiCallLimit, endVoiceSession);

// ── Text interview routes ───────────────────────────────────────────────────
// Create new interview — enforce monthly interview credit cap
router.post('/', interviewCreditLimit, createInterview);

// Start interview
router.post('/:id/start', startInterview);

// Submit answer — enforce daily AI call cap (each answer = one GPT call)
router.post('/answer', aiCallLimit, submitAnswer);

// Complete interview (triggers one more GPT call for overall feedback)
router.post('/:id/complete', aiCallLimit, completeInterview);

// Get interview details
router.get('/:id', getInterview);

// Get interview history
router.get('/user/history', getInterviewHistory);

// Get all interviews (alias)
router.get('/', getInterviewHistory);

// Get interview statistics
router.get('/user/stats', getInterviewStats);

// Get enhanced AI analysis for completed interview
router.get('/:id/enhanced-analysis', getEnhancedAnalysis);

// Regenerate enhanced analysis (when AI models improve)
router.post('/:id/regenerate-analysis', aiCallLimit, regenerateEnhancedAnalysis);

export default router;
