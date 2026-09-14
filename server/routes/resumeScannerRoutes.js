import express from 'express';
import { protect } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import {
  scanResume,
  getScanHistory,
  getAnalysis,
  deleteAnalysis
} from '../controllers/resumeScannerController.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Scan resume
router.post('/scan', upload.single('resume'), scanResume);

// Get scan history
router.get('/history', getScanHistory);

// Get specific analysis
router.get('/:id', getAnalysis);

// Delete analysis
router.delete('/:id', deleteAnalysis);

export default router;
