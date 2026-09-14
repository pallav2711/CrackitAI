import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getUserResumes,
  getResume,
  createResume,
  updateResume,
  deleteResume,
  duplicateResume,
  getATSAnalysis
} from '../controllers/resumeController.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get all resumes for user
router.get('/', getUserResumes);

// Get specific resume
router.get('/:id', getResume);

// Create new resume
router.post('/', createResume);

// Update resume
router.put('/:id', updateResume);

// Delete resume
router.delete('/:id', deleteResume);

// Duplicate resume
router.post('/:id/duplicate', duplicateResume);

// Get ATS analysis
router.get('/:id/ats-analysis', getATSAnalysis);

export default router;
