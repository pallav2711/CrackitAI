// Seed routes — company/test seeding removed as part of product reset
import express from 'express';
const router = express.Router();

router.get('/status', (req, res) => {
  res.json({ success: true, message: 'Seed routes disabled in new product version.' });
});

export default router;
