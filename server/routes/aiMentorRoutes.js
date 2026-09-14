import express from 'express';
import {
  startChatSession,
  sendMessage,
  getChatSessions,
  getChatSession,
  deleteChatSession,
  getDailyMotivation,
  getWellnessCheckIn,
  updateSessionContext,
  getMentorAnalytics
} from '../controllers/aiMentorController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Chat session management
router.post('/sessions', startChatSession);
router.get('/sessions', getChatSessions);
router.get('/sessions/:sessionId', getChatSession);
router.delete('/sessions/:sessionId', deleteChatSession);
router.put('/sessions/:sessionId/context', updateSessionContext);

// Chat functionality
router.post('/chat', sendMessage);

// Daily content
router.get('/daily-motivation', getDailyMotivation);
router.get('/wellness-checkin', getWellnessCheckIn);

// Analytics
router.get('/analytics', getMentorAnalytics);

// Aliases
router.get('/history', getChatSessions); // Alias for chat history

export default router;