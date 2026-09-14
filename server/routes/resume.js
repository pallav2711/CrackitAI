const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const resumeController = require('../controllers/resumeController');

// All routes require authentication
router.use(auth);

// Get all resumes for user
router.get('/', resumeController.getUserResumes);

// Get specific resume
router.get('/:id', resumeController.getResume);

// Create new resume
router.post('/', resumeController.createResume);

// Update resume
router.put('/:id', resumeController.updateResume);

// Delete resume
router.delete('/:id', resumeController.deleteResume);

// Duplicate resume
router.post('/:id/duplicate', resumeController.duplicateResume);

// Get ATS analysis
router.get('/:id/ats-analysis', resumeController.getATSAnalysis);

module.exports = router;
