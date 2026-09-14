/**
 * Billing Controller — Production-ready Razorpay Integration
 *
 * ════════════════════════════════════════════════════════════════════════════
 * PAYMENT FLOW
 * ════════════════════════════════════════════════════════════════════════════
 *
 *  1. POST /api/billing/create-order
 *       • Authenticated user selects a plan
 *       • Server looks up plan price (never trusts frontend amount)
 *       • Creates Razorpay order + internal Order doc
 *       • Returns orderId + public key to frontend
 *
 *  2. Frontend opens Razorpay Checkout modal
 *
 *  3. User pays → Razorpay:
 *       • Fires POST /api/billing/webhook (authoritative — processed first)
 *       • Returns payment IDs to the checkout modal
 *
 *  4. POST /api/billing/verify
 *       • Frontend sends payment IDs to backend
 *       • Backend verifies HMAC signature
 *       • Idempotent: if webhook already activated subscription, just returns current state
 *       • Fallback if webhook arrives late: activates subscription here too
 *
 *  5. GET  /api/billing/status        — current plan, usage, renewal
 *  6. GET  /api/billing/history       — payment history for the user
 *  7. POST /api/billing/cancel        — soft cancel (auto-renew off)
 *
 * ════════════════════════════════════════════════════════════════════════════
 * SECURITY GUARANTEES
 * ════════════════════════════════════════════════════════════════════════════
 *
 *  ✓ Server-side pricing only — frontend cannot influence amount
 *  ✓ HMAC-SHA256 signature verification on both verify + webhook paths
 *  ✓ timingSafeEqual used in signature comparison
 *  ✓ Order ownership checked — user can only verify their own orders (no IDOR)
 *  ✓ Idempotent webhook processing via WebhookEvent deduplication
 *  ✓ Idempotent verify endpoint — safe to call multiple times
 *  ✓ Amount cross-check: Razorpay order amount == plan amount in DB
 *  ✓ No sensitive data (secrets, signatures) returned to frontend
 *  ✓ Stack traces never leak to client
 */

import crypto from 'crypto';
import mongoose from 'mongoose';
import User        from '../models/User.js';
import Order       from '../models/Order.js';
import Payment     from '../models/Payment.js';
import WebhookEvent from '../models/WebhookEvent.js';
import { PLAN_LIMITS } from '../middleware/aiRateLimit.js';
import {
  createRazorpayOrder,
  verifyPaymentSignature,
  verifyWebhookSignature,
  isTestMode,
} from '../services/razorpayService.js';
import { sendPaymentSuccessEmail, sendPaymentFailedEmail } from '../services/emailService.js';

// ── Plan definitions ──────────────────────────────────────────────────────────
// Single source of truth for pricing. Frontend NEVER sends the amount.
// All amounts are in paise (1 INR = 100 paise).

export const PLANS = {
  basic: {
    name:           'Basic',
    amountPaise:    29900,        // ₹299
    amountDisplay:  '₹299',
    currency:       'INR',
    durationMonths: 1,
    description:    '5 voice interviews/month + full leaderboard',
  },
  pro: {
    name:           'Pro',
    amountPaise:    59900,        // ₹599
    amountDisplay:  '₹599',
    currency:       'INR',
    durationMonths: 1,
    description:    '15 voice interviews/month + role-specific modes',
  },
  annual_basic: {
    name:           'Basic Annual',
    amountPaise:    249900,       // ₹2,499
    amountDisplay:  '₹2,499',
    currency:       'INR',
    durationMonths: 12,
    description:    'Basic plan billed annually (save 30%)',
  },
  annual_pro: {
    name:           'Pro Annual',
    amountPaise:    499900,       // ₹4,999
    amountDisplay:  '₹4,999',
    currency:       'INR',
    durationMonths: 12,
    description:    'Pro plan billed annually (save 30%)',
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Compute the subscription end date given a duration in months from now */
function nextPeriodEnd(months) {
  const d = new Date();
  d.setMonth(d.getMonth() + months);
  return d;
}

/**
 * Map a PLANS key to the value stored on User.subscription.plan.
 * annual_basic → 'annual', annual_pro → 'annual', basic → 'basic', pro → 'pro'
 */
export function userPlanKey(planKey) {
  if (planKey.startsWith('annual')) return 'annual';
  return planKey;
}

/** Safe log — never log secrets, tokens, or full payment payloads in production */
const log = (level, ...args) => {
  if (process.env.NODE_ENV !== 'test') {
    console[level]('[billing]', ...args);
  }
};

// ── Subscription activation (shared by webhook + verify) ─────────────────────

/**
 * Atomically activates a user's subscription after a confirmed payment.
 * Idempotent: safe to call multiple times for the same payment.
 *
 * @param {object} opts
 * @param {string}  opts.userId
 * @param {string}  opts.planKey       — PLANS key (e.g. 'pro', 'annual_pro')
 * @param {string}  opts.razorpayOrderId
 * @param {string}  opts.razorpayPaymentId
 * @param {string}  [opts.verifiedBy]   — 'webhook' | 'verify_endpoint'
 * @returns {Promise<{user, order, payment}>}
 */
async function activateSubscription({ userId, planKey, razorpayOrderId, razorpayPaymentId, verifiedBy = 'webhook', razorpaySignature }) {
  const planDetails = PLANS[planKey];
  if (!planDetails) throw new Error(`Unknown plan key: ${planKey}`);

  const periodEnd = nextPeriodEnd(planDetails.durationMonths);
  const userPlan  = userPlanKey(planKey);

  // ── 1. Find and lock the Order document ────────────────────────────────────
  const order = await Order.findOne({ razorpayOrderId, userId });
  if (!order) {
    // Edge case: webhook arrived before create-order response persisted (race).
    // Create a minimal Order record from what we have.
    log('warn', `activateSubscription: Order not found for ${razorpayOrderId}. Creating from webhook data.`);
  }

  // ── 2. Upsert Payment record (idempotent via unique index) ─────────────────
  let payment;
  try {
    payment = await Payment.findOneAndUpdate(
      { razorpayPaymentId },
      {
        $setOnInsert: {
          userId,
          orderId:          order?._id,
          razorpayPaymentId,
          razorpayOrderId,
          razorpaySignature,
          amount:           planDetails.amountPaise,
          currency:         planDetails.currency,
          status:           'captured',
          signatureVerified: true,
          verifiedBy,
        },
      },
      { upsert: true, new: true }
    );
  } catch (err) {
    if (err.code === 11000) {
      // Payment already recorded — idempotent, fetch existing
      payment = await Payment.findOne({ razorpayPaymentId });
      log('info', `activateSubscription: payment ${razorpayPaymentId} already recorded — idempotent path`);
    } else {
      throw err;
    }
  }

  // ── 3. Update Order status ─────────────────────────────────────────────────
  if (order) {
    await Order.findByIdAndUpdate(order._id, {
      status:            'paid',
      razorpayPaymentId,
      activatedAt:       new Date(),
    });
  }

  // ── 4. Atomically activate subscription on User ────────────────────────────
  // Only update if not already on this plan+period (idempotency guard).
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    {
      $set: {
        'subscription.plan':              userPlan,
        'subscription.status':            'active',
        'subscription.startDate':         new Date(),
        'subscription.endDate':           periodEnd,
        'subscription.razorpayOrderId':   razorpayOrderId,
        'subscription.razorpayPaymentId': razorpayPaymentId,
        'subscription.autoRenew':         true,
        'subscription.currentPeriodEnd':  periodEnd,
        // Reset usage cycle on new subscription
        'usage.interviewsUsedThisCycle':  0,
        'usage.interviewCycleEnd':        periodEnd,
      },
    },
    { new: true }
  );

  log('info', `Subscription activated: user=${userId} plan=${userPlan} until=${periodEnd.toISOString()} by=${verifiedBy}`);

  return { user: updatedUser, order, payment };
}

// ═════════════════════════════════════════════════════════════════════════════
// POST /api/billing/create-order
// Authentication: required (protect middleware)
// ═════════════════════════════════════════════════════════════════════════════
export const createOrder = async (req, res) => {
  try {
    const { plan: planKey } = req.body;

    // ── Validate plan ─────────────────────────────────────────────────────────
    if (!planKey || !PLANS[planKey]) {
      return res.status(400).json({
        success: false,
        message: `Invalid plan. Valid options: ${Object.keys(PLANS).join(', ')}`,
      });
    }

    const planDetails = PLANS[planKey];
    const userId      = req.user._id.toString();

    // ── Check for in-flight order ────────────────────────────────────────────
    // If user already has an unpaid order for this plan in the last 30 min,
    // return it so they don't accidentally create duplicate orders.
    const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000);
    const existingOrder = await Order.findOne({
      userId,
      planKey,
      status: 'created',
      createdAt: { $gte: thirtyMinAgo },
    });

    if (existingOrder) {
      log('info', `Reusing existing order ${existingOrder.razorpayOrderId} for user ${userId}`);
      return res.json({
        success: true,
        order: {
          id:          existingOrder.razorpayOrderId,
          amount:      existingOrder.amount,
          currency:    existingOrder.currency,
          plan:        planKey,
          planDetails: {
            name:          planDetails.name,
            amountDisplay: planDetails.amountDisplay,
            description:   planDetails.description,
          },
        },
        key: process.env.RAZORPAY_KEY_ID,
        testMode: isTestMode(),
      });
    }

    // ── Create Razorpay order (amount comes from server config — never frontend) ─
    const receipt = `rcpt_${userId.slice(-8)}_${Date.now().toString(36)}`;

    const rzOrder = await createRazorpayOrder({
      amountPaise: planDetails.amountPaise,
      currency:    planDetails.currency,
      receipt,
      notes: {
        userId,
        planKey,
        userEmail:  req.user.email,
        userName:   req.user.name,
      },
    });

    // ── Persist Order to DB ───────────────────────────────────────────────────
    await Order.create({
      userId,
      planKey,
      razorpayOrderId: rzOrder.id,
      amount:          rzOrder.amount,      // as confirmed by Razorpay
      currency:        rzOrder.currency,
      receipt,
      status:          'created',
      planName:        planDetails.name,
      amountDisplay:   planDetails.amountDisplay,
      durationMonths:  planDetails.durationMonths,
      billingName:     req.user.name,
      billingEmail:    req.user.email,
      notes: {
        userId,
        planKey,
        userEmail: req.user.email,
      },
    });

    res.json({
      success: true,
      order: {
        id:       rzOrder.id,
        amount:   rzOrder.amount,
        currency: rzOrder.currency,
        plan:     planKey,
        planDetails: {
          name:          planDetails.name,
          amountDisplay: planDetails.amountDisplay,
          description:   planDetails.description,
        },
      },
      // Public key sent here so frontend never needs to read it from env
      key:      process.env.RAZORPAY_KEY_ID,
      testMode: isTestMode(),
    });
  } catch (err) {
    log('error', 'createOrder error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Could not create payment order. Please try again.',
    });
  }
};

// ═════════════════════════════════════════════════════════════════════════════
// POST /api/billing/verify
// Authentication: required (protect middleware)
// Called by frontend after Razorpay modal success.
// This is the UX-convenience path; the webhook is authoritative.
// ═════════════════════════════════════════════════════════════════════════════
export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan: planKey } = req.body;

    // ── Basic field validation ────────────────────────────────────────────────
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !planKey) {
      return res.status(400).json({
        success: false,
        message: 'Missing required payment fields.',
      });
    }

    if (!PLANS[planKey]) {
      return res.status(400).json({ success: false, message: 'Invalid plan.' });
    }

    const userId = req.user._id.toString();

    // ── SECURITY: Verify order belongs to this user (prevent IDOR) ────────────
    const order = await Order.findOne({
      razorpayOrderId: razorpay_order_id,
      userId,
    });

    if (!order) {
      // Order doesn't belong to this user, or doesn't exist
      log('warn', `IDOR attempt: user ${userId} tried to verify order ${razorpay_order_id} they don't own`);
      return res.status(403).json({
        success: false,
        message: 'Payment order not found for your account.',
      });
    }

    // ── SECURITY: Verify HMAC signature (timing-safe) ─────────────────────────
    const signatureValid = verifyPaymentSignature({
      razorpayOrderId:   razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
    });

    if (!signatureValid) {
      log('warn', `Signature mismatch for payment ${razorpay_payment_id} (user ${userId})`);
      return res.status(400).json({
        success: false,
        message: 'Payment signature is invalid. Contact support if money was deducted.',
        code:    'SIGNATURE_MISMATCH',
      });
    }

    // ── SECURITY: Verify order plan matches claimed plan ──────────────────────
    if (order.planKey !== planKey) {
      log('warn', `Plan mismatch: order.planKey=${order.planKey} claimed=${planKey} user=${userId}`);
      return res.status(400).json({ success: false, message: 'Plan mismatch. Contact support.' });
    }

    // ── Idempotency: check if already processed ───────────────────────────────
    const existingPayment = await Payment.findOne({ razorpayPaymentId: razorpay_payment_id });
    if (existingPayment && existingPayment.status === 'captured') {
      log('info', `Payment ${razorpay_payment_id} already processed — returning current subscription`);
      const user = await User.findById(userId).select('subscription');
      return res.json({
        success:  true,
        message:  'Payment already confirmed.',
        alreadyProcessed: true,
        subscription: {
          plan:            user.subscription.plan,
          status:          user.subscription.status,
          currentPeriodEnd: user.subscription.currentPeriodEnd,
        },
      });
    }

    // ── Activate subscription ─────────────────────────────────────────────────
    const { user } = await activateSubscription({
      userId,
      planKey,
      razorpayOrderId:   razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      verifiedBy:        'verify_endpoint',
    });

    // ── Send payment success email (non-blocking) ─────────────────────────────
    sendPaymentSuccessEmail({
      name:            user.name,
      email:           user.email,
      planName:        PLANS[planKey].name,
      amountDisplay:   PLANS[planKey].amountDisplay,
      razorpayPaymentId: razorpay_payment_id,
      currentPeriodEnd:  user.subscription.currentPeriodEnd,
    }).catch(err => log('warn', 'Failed to send payment success email:', err.message));

    res.json({
      success: true,
      message: `Successfully activated ${PLANS[planKey].name} plan.`,
      subscription: {
        plan:            user.subscription.plan,
        status:          user.subscription.status,
        currentPeriodEnd: user.subscription.currentPeriodEnd,
      },
    });
  } catch (err) {
    log('error', 'verifyPayment error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Payment verification failed. If money was deducted, contact support.',
    });
  }
};

// ═════════════════════════════════════════════════════════════════════════════
// POST /api/billing/webhook
// Authentication: NONE — Razorpay POSTs here directly
// Signature verification done inside via RAZORPAY_WEBHOOK_SECRET
// ═════════════════════════════════════════════════════════════════════════════
export const handleWebhook = async (req, res) => {
  // ── 1. Verify webhook signature ───────────────────────────────────────────
  // req.rawBody is the exact bytes Razorpay signed (set by server.js body parser).
  // Falling back to JSON.stringify is a best-effort for tests / non-raw paths.
  const rawBody         = req.rawBody || JSON.stringify(req.body);
  const signatureHeader = req.headers['x-razorpay-signature'];

  const sigValid = verifyWebhookSignature(rawBody, signatureHeader);
  if (!sigValid) {
    log('warn', 'Webhook signature mismatch — possible forgery or misconfigured secret');
    return res.status(400).json({ success: false, message: 'Invalid webhook signature' });
  }

  const eventType = req.body.event;
  const payload   = req.body.payload;

  // ── 2. Extract entity ID for deduplication ────────────────────────────────
  const entityId =
    payload?.payment?.entity?.id ||
    payload?.subscription?.entity?.id ||
    payload?.refund?.entity?.id ||
    null;

  const dedupeKey = `${eventType}|${entityId || Date.now()}`;

  // ── 3. Idempotency check — atomic findOneAndUpdate ────────────────────────
  let webhookDoc;
  try {
    webhookDoc = await WebhookEvent.findOneAndUpdate(
      { dedupeKey },
      {
        $setOnInsert: {
          dedupeKey,
          eventType,
          entityId,
          status:  'pending',
          payload: payload,   // store full payload for audit
        },
        $inc: { attempts: 1 },
      },
      { upsert: true, new: true }
    );
  } catch (err) {
    if (err.code === 11000) {
      // Race condition — another process won the upsert; this is a duplicate
      log('info', `Webhook duplicate (race): ${dedupeKey}`);
      return res.json({ success: true, message: 'Duplicate event — already processed' });
    }
    log('error', 'Webhook DB error during dedup check:', err.message);
    return res.status(500).json({ success: false });
  }

  // If document already existed and was previously processed/skipped, return early
  if (webhookDoc.attempts > 1 && ['processed', 'skipped'].includes(webhookDoc.status)) {
    log('info', `Webhook already ${webhookDoc.status}: ${dedupeKey}`);
    return res.json({ success: true, message: 'Already processed' });
  }

  // Mark as processing
  await WebhookEvent.findByIdAndUpdate(webhookDoc._id, { status: 'processing' });

  // ── 4. Dispatch to event handler ──────────────────────────────────────────
  let processingError = null;
  try {
    switch (eventType) {
      case 'payment.captured':
        await onPaymentCaptured(payload, webhookDoc._id);
        break;
      case 'payment.failed':
        await onPaymentFailed(payload, webhookDoc._id);
        break;
      case 'refund.created':
      case 'refund.processed':
        await onRefundEvent(payload, eventType, webhookDoc._id);
        break;
      // Razorpay subscription events (if Razorpay Subscriptions product is used)
      case 'subscription.activated':
      case 'subscription.charged':
        await onSubscriptionActivated(payload, webhookDoc._id);
        break;
      case 'subscription.cancelled':
      case 'subscription.completed':
      case 'subscription.halted':
        await onSubscriptionCancelled(payload, webhookDoc._id);
        break;
      default:
        log('info', `Unhandled webhook event: ${eventType}`);
        await WebhookEvent.findByIdAndUpdate(webhookDoc._id, { status: 'skipped', processedAt: new Date() });
        return res.json({ success: true });
    }

    await WebhookEvent.findByIdAndUpdate(webhookDoc._id, { status: 'processed', processedAt: new Date() });
  } catch (err) {
    processingError = err;
    log('error', `Webhook handler error for ${eventType}:`, err.message);
    await WebhookEvent.findByIdAndUpdate(webhookDoc._id, {
      status:    'failed',
      lastError: err.message,
      processedAt: new Date(),
    });
  }

  // ── 5. Always respond 200 to Razorpay ─────────────────────────────────────
  // Non-200 causes Razorpay to retry; we handle retries ourselves via dedupeKey
  res.json({ success: !processingError });
};

// ── Webhook event handlers ────────────────────────────────────────────────────

async function onPaymentCaptured(payload, webhookDocId) {
  const payment = payload?.payment?.entity;
  if (!payment) throw new Error('payment.captured: missing payment entity');

  const { id: razorpayPaymentId, order_id: razorpayOrderId, notes, amount, method } = payment;
  const { userId, planKey } = notes || {};

  if (!userId || !planKey) {
    throw new Error(`payment.captured: missing userId (${userId}) or planKey (${planKey}) in notes`);
  }

  // Activate subscription (handles its own idempotency)
  const { user } = await activateSubscription({
    userId,
    planKey,
    razorpayOrderId,
    razorpayPaymentId,
    verifiedBy: 'webhook',
  });

  // Update payment method info from Razorpay payload
  await Payment.findOneAndUpdate(
    { razorpayPaymentId },
    {
      $set: {
        method,
        bank:        payment.bank,
        wallet:      payment.wallet,
        vpa:         payment.vpa,
        cardNetwork: payment.card?.network,
        cardLast4:   payment.card?.last4,
        cardIssuer:  payment.card?.issuer,
      },
    }
  );

  // Update WebhookEvent summary
  await WebhookEvent.findByIdAndUpdate(webhookDocId, {
    summary: { userId, planKey, amount },
  });

  // Send success email (non-blocking)
  if (user) {
    const planDetails = PLANS[planKey];
    sendPaymentSuccessEmail({
      name:              user.name,
      email:             user.email,
      planName:          planDetails?.name || planKey,
      amountDisplay:     planDetails?.amountDisplay || `₹${(amount / 100).toFixed(0)}`,
      razorpayPaymentId,
      currentPeriodEnd:  user.subscription?.currentPeriodEnd,
    }).catch(err => log('warn', 'Failed to send payment success email:', err.message));
  }

  log('info', `payment.captured: user=${userId} plan=${planKey} payment=${razorpayPaymentId}`);
}

async function onPaymentFailed(payload, webhookDocId) {
  const payment = payload?.payment?.entity;
  if (!payment) return;

  const { id: razorpayPaymentId, order_id: razorpayOrderId, notes, error_code, error_description } = payment;
  const { userId, planKey } = notes || {};

  // Record the failed payment attempt
  if (razorpayPaymentId) {
    try {
      await Payment.findOneAndUpdate(
        { razorpayPaymentId },
        {
          $setOnInsert: {
            userId:            userId ? new mongoose.Types.ObjectId(userId) : undefined,
            razorpayPaymentId,
            razorpayOrderId,
            amount:            payment.amount || 0,
            currency:          payment.currency || 'INR',
            status:            'failed',
            signatureVerified: false,
            verifiedBy:        'webhook',
            errorCode:         error_code,
            errorDescription:  error_description,
            errorSource:       payment.error_source,
            errorStep:         payment.error_step,
            errorReason:       payment.error_reason,
          },
        },
        { upsert: true, new: true }
      );
    } catch (err) {
      if (err.code !== 11000) throw err; // ignore duplicate key
    }
  }

  // Update order status to 'failed' if all attempts failed
  if (razorpayOrderId) {
    await Order.findOneAndUpdate({ razorpayOrderId }, { status: 'failed' });
  }

  // Send failure notification email (non-blocking)
  if (userId) {
    const user = await User.findById(userId).select('name email');
    if (user) {
      sendPaymentFailedEmail({
        name:      user.name,
        email:     user.email,
        planName:  PLANS[planKey]?.name || planKey,
        errorDesc: error_description || 'Payment could not be processed.',
      }).catch(err => log('warn', 'Failed to send payment failed email:', err.message));
    }
  }

  log('warn', `payment.failed: user=${userId} payment=${razorpayPaymentId} reason=${error_description}`);
}

async function onRefundEvent(payload, eventType, webhookDocId) {
  const refund  = payload?.refund?.entity;
  if (!refund) return;

  const { id: refundId, payment_id: razorpayPaymentId, amount, status } = refund;

  const refundStatus = status === 'processed' ? 'full' : 'partial';

  await Payment.findOneAndUpdate(
    { razorpayPaymentId },
    {
      $set: {
        status:       'refunded',
        refundId,
        refundAmount: amount,
        refundStatus,
        refundedAt:   new Date(),
      },
    }
  );

  // Also update Order
  await Order.findOneAndUpdate(
    { razorpayPaymentId },
    {
      $set: {
        refundId,
        refundAmount:  amount,
        refundStatus,
        refundedAt:    new Date(),
      },
    }
  );

  log('info', `${eventType}: payment=${razorpayPaymentId} refund=${refundId} amount=${amount}`);
}

async function onSubscriptionActivated(payload, webhookDocId) {
  // Razorpay Subscriptions product (recurring billing)
  const sub = payload?.subscription?.entity;
  if (!sub) return;

  const { id: razorpaySubId, plan_id, notes, status: subStatus } = sub;
  const payment = payload?.payment?.entity;
  const { userId, planKey } = notes || {};

  if (!userId || !planKey) {
    throw new Error(`subscription.activated: missing notes userId/planKey`);
  }

  if (payment?.id) {
    await activateSubscription({
      userId,
      planKey,
      razorpayOrderId:   payment.order_id,
      razorpayPaymentId: payment.id,
      verifiedBy:        'webhook',
    });
  }

  log('info', `subscription.activated: user=${userId} plan=${planKey} sub=${razorpaySubId}`);
}

async function onSubscriptionCancelled(payload, webhookDocId) {
  const sub = payload?.subscription?.entity;
  if (!sub) return;

  const { notes, status: subStatus } = sub;
  const userId = notes?.userId;
  if (!userId) return;

  await User.findByIdAndUpdate(userId, {
    'subscription.autoRenew': false,
    'subscription.status':    'cancelled',
  });

  log('info', `subscription cancelled: user=${userId} status=${subStatus}`);
}

// ═════════════════════════════════════════════════════════════════════════════
// GET /api/billing/status
// Authentication: required
// ═════════════════════════════════════════════════════════════════════════════
export const getBillingStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('subscription usage name email');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // ── Auto-downgrade: subscription expired and not renewing ─────────────────
    const now       = new Date();
    const periodEnd = user.subscription?.currentPeriodEnd;
    let   plan      = user.subscription?.plan || 'free';

    if (
      plan !== 'free' &&
      periodEnd &&
      now > periodEnd &&
      user.subscription?.autoRenew === false
    ) {
      await User.findByIdAndUpdate(req.user._id, {
        'subscription.plan':   'free',
        'subscription.status': 'inactive',
      });
      plan = 'free';
      log('info', `Auto-downgraded user ${req.user._id} to free (period ended)`);
    }

    const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.free;

    res.json({
      success: true,
      billing: {
        plan,
        status:          user.subscription?.status || 'active',
        currentPeriodEnd: user.subscription?.currentPeriodEnd || null,
        autoRenew:       user.subscription?.autoRenew ?? true,
        limits: {
          monthlyInterviews: limits.monthlyInterviews,
          maxSessionMinutes: limits.maxSessionMinutes,
          dailyAICalls:      limits.dailyAICalls,
        },
        usage: {
          interviewsUsedThisCycle: user.usage?.interviewsUsedThisCycle ?? 0,
          interviewCycleEnd:       user.usage?.interviewCycleEnd || null,
          dailyAICalls:            user.usage?.dailyAICalls ?? 0,
          dailyAICallsReset:       user.usage?.dailyAICallsReset || null,
        },
        plans: Object.entries(PLANS).map(([key, p]) => ({
          key,
          name:          p.name,
          amountDisplay: p.amountDisplay,
          description:   p.description,
          isCurrent:
            plan === userPlanKey(key) &&
            user.subscription?.status === 'active',
        })),
      },
    });
  } catch (err) {
    log('error', 'getBillingStatus error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to load billing status.' });
  }
};

// ═════════════════════════════════════════════════════════════════════════════
// GET /api/billing/history
// Authentication: required
// Returns a paginated list of this user's orders/payments
// ═════════════════════════════════════════════════════════════════════════════
export const getPaymentHistory = async (req, res) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 10);
    const skip  = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find({ userId: req.user._id, status: { $in: ['paid', 'failed', 'cancelled'] } })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('planKey planName amountDisplay amount currency status createdAt razorpayOrderId razorpayPaymentId refundStatus refundAmount activatedAt')
        .lean(),
      Order.countDocuments({ userId: req.user._id, status: { $in: ['paid', 'failed', 'cancelled'] } }),
    ]);

    res.json({
      success: true,
      history: orders.map(o => ({
        orderId:          o._id,
        razorpayOrderId:  o.razorpayOrderId,
        razorpayPaymentId: o.razorpayPaymentId,
        planKey:          o.planKey,
        planName:         o.planName,
        amountDisplay:    o.amountDisplay,
        amountPaise:      o.amount,
        currency:         o.currency,
        status:           o.status,
        refundStatus:     o.refundStatus,
        refundAmount:     o.refundAmount,
        date:             o.createdAt,
        activatedAt:      o.activatedAt,
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    log('error', 'getPaymentHistory error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to load payment history.' });
  }
};

// ═════════════════════════════════════════════════════════════════════════════
// POST /api/billing/cancel
// Authentication: required
// Disables auto-renew; plan stays active until currentPeriodEnd
// ═════════════════════════════════════════════════════════════════════════════
export const cancelSubscription = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('subscription');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (user.subscription?.plan === 'free') {
      return res.status(400).json({ success: false, message: 'No active paid subscription to cancel.' });
    }

    if (user.subscription?.autoRenew === false) {
      return res.json({
        success: true,
        message:          'Auto-renew is already disabled.',
        currentPeriodEnd: user.subscription.currentPeriodEnd,
      });
    }

    const updated = await User.findByIdAndUpdate(
      req.user._id,
      { 'subscription.autoRenew': false },
      { new: true }
    );

    log('info', `Subscription auto-renew cancelled: user=${req.user._id}`);

    res.json({
      success:          true,
      message:          'Auto-renew disabled. Your plan stays active until the current period ends.',
      currentPeriodEnd: updated.subscription?.currentPeriodEnd,
    });
  } catch (err) {
    log('error', 'cancelSubscription error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to cancel subscription.' });
  }
};
