import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getCompanies,
  getCompanyDetails,
  getCompanyQuestions,
  getQuestionDetails,
  submitQuestionAnswer,
  getUserCompanyProgress,
  toggleBookmark,
  getCompanyDashboardStats,
  getTrendingCompanies
} from '../controllers/companyController.js';
import { seedCompanies } from '../utils/seedCompanies.js';

const router = express.Router();

// Initialize database (companies + AI tests)
router.post('/initialize', async (req, res) => {
  try {
    const initializeDatabase = (await import('../scripts/initializeDatabase.js')).default;
    
    // Run initialization in background
    initializeDatabase()
      .then(() => console.log('Database initialization completed'))
      .catch(error => console.error('Database initialization failed:', error));
    
    res.json({ 
      success: true, 
      message: 'Database initialization started. This may take a few minutes to complete.' 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Seed route (for initial setup) - legacy
router.post('/seed', async (req, res) => {
  try {
    await seedCompanies();
    res.json({ success: true, message: 'Companies seeded successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Public routes
router.get('/', getCompanies);
router.get('/trending', getTrendingCompanies);
router.get('/:slug', getCompanyDetails);
router.get('/:slug/questions', getCompanyQuestions);

// Protected routes
router.use(protect);

// Dashboard stats
router.get('/dashboard/stats', getCompanyDashboardStats);

// Question routes
router.get('/questions/:questionId', getQuestionDetails);
router.post('/questions/:questionId/submit', submitQuestionAnswer);
router.post('/questions/:questionId/bookmark', toggleBookmark);

// User progress routes
router.get('/:slug/progress', getUserCompanyProgress);

export default router;