import express from 'express';
import multer from 'multer';
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
  processTurn,
  streamTTS,
  endVoiceSession,
} from '../controllers/voiceInterviewController.js';
import { protect } from '../middleware/auth.js';
import { aiCallLimit, interviewCreditLimit } from '../middleware/aiRateLimit.js';

const router = express.Router();

// Multer — in-memory storage for audio blobs (max 10MB)
const audioUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    const allowed = ['audio/webm', 'audio/mp4', 'audio/wav', 'audio/ogg', 'audio/mpeg', 'video/webm'];
    cb(null, allowed.includes(file.mimetype) || file.originalname?.match(/\.(webm|mp4|wav|ogg|mp3)$/i) ? true : false);
  },
});

// All routes require authentication
router.use(protect);

// ── Voice interview routes ──────────────────────────────────────────────────
router.post('/voice/start', startVoiceSession);
router.post('/voice/turn',  audioUpload.single('audio'), aiCallLimit, processTurn);
router.get('/voice/tts',    streamTTS);   // streams audio/mpeg directly
router.post('/voice/end',   endVoiceSession);

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
