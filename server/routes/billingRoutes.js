import express from 'express';
import rateLimit from 'express-rate-limit';
import { protect } from '../middleware/auth.js';
import {
  createOrder,
  handleWebhook,
  verifyPayment,
  getBillingStatus,
  getPaymentHistory,
  cancelSubscription,
} from '../controllers/billingController.js';

const router = express.Router();

// ── Webhook ───────────────────────────────────────────────────────────────────
// No auth middleware — Razorpay POSTs here without a user JWT.
// Signature verification is done inside handleWebhook using RAZORPAY_WEBHOOK_SECRET.
// Rate limit is generous — Razorpay can retry up to 15 times per event.
const webhookLimiter = rateLimit({
  windowMs: 60 * 1000,      // 1 minute
  max:      60,             // 60 webhook deliveries per minute (generous for Razorpay retries)
  skipSuccessfulRequests: false,
  standardHeaders: true,
  legacyHeaders:  false,
});

router.post('/webhook', webhookLimiter, handleWebhook);

// ── Authenticated billing routes ──────────────────────────────────────────────
router.use(protect);

// Tight rate limit on order creation to prevent spam orders
const orderCreationLimiter = rateLimit({
  windowMs: 60 * 1000,      // 1 minute
  max:      5,              // 5 order attempts per minute per IP
  standardHeaders: true,
  legacyHeaders:  false,
  message: { success: false, message: 'Too many payment requests. Please wait a moment.' },
});

// Create Razorpay order → returns orderId for frontend checkout
router.post('/create-order', orderCreationLimiter, createOrder);

// Frontend calls this after Razorpay checkout modal success
// (UX convenience + fallback if webhook arrives late)
router.post('/verify', verifyPayment);

// Current plan, usage stats, available plan options
router.get('/status', getBillingStatus);

// Paginated payment / order history for this user
router.get('/history', getPaymentHistory);

// Disable auto-renew (soft cancel — plan stays active until period end)
router.post('/cancel', cancelSubscription);

export default router;
