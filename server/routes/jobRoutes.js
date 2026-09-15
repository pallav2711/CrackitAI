import express from 'express';
import { protect } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import {
  createJob,
  listJobs,
  getJob,
  deleteJob,
  uploadResume,
  parseJDRoute,
  runATSScore,
  runSkillGap,
  runTailorResume,
  runCoverLetter,
  runGenerateQuiz,
  submitQuiz,
  runPreparationPlan,
  getReadinessScore,
} from '../controllers/jobController.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// CRUD
router.post('/', createJob);
router.get('/', listJobs);
router.get('/:id', getJob);
router.delete('/:id', deleteJob);

// Resume upload
router.post('/:id/upload-resume', upload.single('resume'), uploadResume);

// JD
router.post('/:id/parse-jd', parseJDRoute);

// Analysis
router.post('/:id/ats-score', runATSScore);
router.post('/:id/skill-gap', runSkillGap);
router.post('/:id/tailor-resume', runTailorResume);
router.post('/:id/cover-letter', runCoverLetter);

// Quiz
router.post('/:id/generate-quiz', runGenerateQuiz);
router.post('/:id/submit-quiz', submitQuiz);

// Prep
router.post('/:id/preparation-plan', runPreparationPlan);
router.get('/:id/readiness-score', getReadinessScore);

export default router;
