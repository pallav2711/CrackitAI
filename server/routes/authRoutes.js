import express from 'express';
import rateLimit from 'express-rate-limit';
import { register, login, getMe } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Strict rate limit for auth endpoints — prevents brute-force attacks
// 10 attempts per 15 minutes per IP on login/register
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts. Please try again after 15 minutes.',
  },
  skipSuccessfulRequests: true, // Only count failed attempts toward the limit
});

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.get('/me', protect, getMe);

export default router;
