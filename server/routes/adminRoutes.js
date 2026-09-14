/**
 * Admin Routes
 *
 * All routes require:
 *  1. Valid JWT (protect middleware)
 *  2. role === 'admin' on the User document (authorize middleware)
 *
 * These endpoints are NOT exposed to regular users.
 * Mount in server.js: app.use('/api/admin', adminRoutes)
 */

import express from 'express';
import rateLimit from 'express-rate-limit';
import { protect, authorize } from '../middleware/auth.js';
import {
  listPayments,
  getPaymentStats,
  getOrderDetail,
  initiateRefundAdmin,
  listUsers,
  listWebhookEvents,
} from '../controllers/adminController.js';

const router = express.Router();

// All admin routes require authentication + admin role
router.use(protect);
router.use(authorize('admin'));

// Conservative rate limit for admin endpoints
const adminLimiter = rateLimit({
  windowMs: 60 * 1000,   // 1 minute
  max: 120,              // 120 requests per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many admin requests. Slow down.' },
});
router.use(adminLimiter);

// ── Payment management ───────────────────────────────────────────────────────
// GET  /api/admin/payments          — list with filters (page, status, planKey, userId, from, to)
// GET  /api/admin/payments/stats    — revenue + subscription summary
// GET  /api/admin/payments/:id      — single order detail
// POST /api/admin/payments/:id/refund — initiate refund
router.get('/payments',              listPayments);
router.get('/payments/stats',        getPaymentStats);
router.get('/payments/:orderId',     getOrderDetail);
router.post('/payments/:orderId/refund', initiateRefundAdmin);

// ── User management ───────────────────────────────────────────────────────────
// GET /api/admin/users — paginated user list with subscription info
router.get('/users', listUsers);

// ── Webhook monitoring ────────────────────────────────────────────────────────
// GET /api/admin/webhooks — recent webhook events
router.get('/webhooks', listWebhookEvents);

export default router;
