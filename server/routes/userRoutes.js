import express from 'express';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Placeholder routes - to be implemented
router.get('/profile', protect, (req, res) => {
  res.json({ success: true, message: 'User profile endpoint' });
});

router.put('/profile', protect, (req, res) => {
  res.json({ success: true, message: 'Update profile endpoint' });
});

export default router;
