/**
 * RazorpayService
 *
 * Single source of truth for all Razorpay SDK interactions.
 * Controllers must use this service — never call `razorpay.*` directly.
 *
 * Responsibilities:
 *  - Lazily initialises the Razorpay client (safe when keys aren't set in dev)
 *  - Creates orders
 *  - Fetches orders / payments from Razorpay
 *  - Verifies payment HMAC signatures
 *  - Verifies webhook HMAC signatures
 *  - Initiates refunds
 *
 * Security:
 *  - Key secret is read ONLY from process.env — never passed in or logged
 *  - Signature comparison uses timingSafeEqual to prevent timing attacks
 */

import crypto from 'crypto';
import Razorpay from 'razorpay';

// ── Lazy Razorpay client ──────────────────────────────────────────────────────

let _client = null;

/**
 * Returns the singleton Razorpay client.
 * Throws a descriptive error if keys are missing so the app fails fast on
 * misconfiguration rather than silently at payment time.
 */
export const getRazorpayClient = () => {
  if (_client) return _client;

  const keyId     = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error(
      'Razorpay is not configured. ' +
      'Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your environment.'
    );
  }

  if (!keyId.startsWith('rzp_')) {
    throw new Error('RAZORPAY_KEY_ID looks invalid — it must start with "rzp_test_" or "rzp_live_".');
  }

  _client = new Razorpay({ key_id: keyId, key_secret: keySecret });
  return _client;
};

/** Reset the singleton (used in tests). */
export const _resetClient = () => { _client = null; };

// ── Order ─────────────────────────────────────────────────────────────────────

/**
 * Create a Razorpay order.
 *
 * @param {object} params
 * @param {number} params.amountPaise  — Amount in paise (smallest INR unit). Integer. No floats.
 * @param {string} params.currency     — Default 'INR'
 * @param {string} params.receipt      — Short receipt reference (max 40 chars)
 * @param {object} params.notes        — Key-value metadata stored on Razorpay order
 * @returns {Promise<object>}          — Razorpay order object
 */
export const createRazorpayOrder = async ({ amountPaise, currency = 'INR', receipt, notes = {} }) => {
  if (!Number.isInteger(amountPaise) || amountPaise < 100) {
    throw new Error(`Invalid amount: ${amountPaise} paise. Must be a positive integer ≥ 100 (₹1).`);
  }

  const rz = getRazorpayClient();
  const order = await rz.orders.create({
    amount:   amountPaise,
    currency,
    receipt:  receipt?.slice(0, 40), // Razorpay max 40 chars
    notes,
  });

  return order;
};

/**
 * Fetch a Razorpay order by ID.
 * Used to cross-check amount/status before activating a subscription.
 */
export const fetchRazorpayOrder = async (razorpayOrderId) => {
  const rz = getRazorpayClient();
  return rz.orders.fetch(razorpayOrderId);
};

/**
 * Fetch a Razorpay payment by ID.
 * Used by admin to inspect payment details.
 */
export const fetchRazorpayPayment = async (razorpayPaymentId) => {
  const rz = getRazorpayClient();
  return rz.payments.fetch(razorpayPaymentId);
};

// ── Signature verification ────────────────────────────────────────────────────

/**
 * Verify the Razorpay payment signature returned by the checkout modal.
 *
 * Razorpay computes: HMAC-SHA256(orderId + "|" + paymentId, KEY_SECRET)
 * We recompute and compare with timing-safe equality.
 *
 * @returns {boolean}
 */
export const verifyPaymentSignature = ({ razorpayOrderId, razorpayPaymentId, razorpaySignature }) => {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) throw new Error('RAZORPAY_KEY_SECRET is not set.');

  const body     = `${razorpayOrderId}|${razorpayPaymentId}`;
  const expected = crypto.createHmac('sha256', secret).update(body).digest('hex');
  const received = Buffer.from(razorpaySignature || '', 'utf8');
  const computed = Buffer.from(expected, 'utf8');

  if (received.length !== computed.length) return false;
  return crypto.timingSafeEqual(received, computed);
};

/**
 * Verify the Razorpay webhook signature from `x-razorpay-signature` header.
 *
 * Razorpay computes: HMAC-SHA256(rawBody, WEBHOOK_SECRET)
 * The raw JSON body string must be passed — not a parsed object.
 *
 * @param {string} rawBody        — The raw request body string (before JSON.parse)
 * @param {string} signatureHeader — Value of x-razorpay-signature header
 * @returns {boolean}
 */
export const verifyWebhookSignature = (rawBody, signatureHeader) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    // In development without a webhook secret, log a warning but do not verify.
    // In production this path MUST NOT be reached.
    console.warn('[razorpayService] RAZORPAY_WEBHOOK_SECRET not set — skipping webhook sig verification (dev mode only)');
    return true;
  }

  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  const received = Buffer.from(signatureHeader || '', 'utf8');
  const computed = Buffer.from(expected, 'utf8');

  if (received.length !== computed.length) return false;
  return crypto.timingSafeEqual(received, computed);
};

// ── Refunds ───────────────────────────────────────────────────────────────────

/**
 * Initiate a refund for a captured payment.
 * Admin-only — never called by user-facing endpoints.
 *
 * @param {object} params
 * @param {string} params.razorpayPaymentId
 * @param {number} [params.amountPaise]  — Partial refund amount in paise. Omit for full refund.
 * @param {string} [params.reason]       — Internal reason note (not shown to customer)
 * @param {string} [params.notes]        — Key-value metadata stored on refund
 * @returns {Promise<object>}            — Razorpay refund object
 */
export const initiateRefund = async ({ razorpayPaymentId, amountPaise, reason, notes = {} }) => {
  const rz = getRazorpayClient();

  const params = { speed: 'normal', notes };
  if (amountPaise) {
    if (!Number.isInteger(amountPaise) || amountPaise < 100) {
      throw new Error(`Invalid refund amount: ${amountPaise} paise.`);
    }
    params.amount = amountPaise;
  }
  if (reason) params.notes.reason = reason.slice(0, 256);

  return rz.payments.refund(razorpayPaymentId, params);
};

// ── Environment guard ─────────────────────────────────────────────────────────

/**
 * Returns whether the Razorpay keys are configured for TEST mode.
 * Used to add a visible warning in dev logs.
 */
export const isTestMode = () => {
  return (process.env.RAZORPAY_KEY_ID || '').startsWith('rzp_test_');
};
