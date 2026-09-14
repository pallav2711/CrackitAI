/**
 * Payment Model
 *
 * One record per Razorpay payment entity (payment_XXXXXXXX).
 * A single Order can have multiple failed payment attempts before a successful one.
 *
 * Unique constraint on razorpayPaymentId prevents duplicate payment records.
 * This is the primary idempotency guard for the verify endpoint.
 */

import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    // Internal references
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true,
    },

    // ── Razorpay identifiers ─────────────────────────────────────────────────
    razorpayPaymentId: {
      type: String,
      required: true,
      unique: true,   // hard constraint — one DB row per Razorpay payment
      index: true,
    },
    razorpayOrderId: {
      type: String,
      required: true,
      index: true,
    },
    razorpaySignature: {
      type: String,   // stored for audit; never re-used
    },

    // ── Amounts ──────────────────────────────────────────────────────────────
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'INR',
    },

    // ── Status ───────────────────────────────────────────────────────────────
    // created    → payment entity created in Razorpay but not yet captured
    // authorized → authorized but not captured (card-only; rare for UPI)
    // captured   → money is in your account
    // failed     → payment failed
    // refunded   → full refund issued
    status: {
      type: String,
      enum: ['created', 'authorized', 'captured', 'failed', 'refunded'],
      default: 'created',
    },

    // ── Verification ─────────────────────────────────────────────────────────
    signatureVerified: {
      type: Boolean,
      default: false,
    },
    // Which path set the status: 'webhook' or 'verify_endpoint'
    verifiedBy: {
      type: String,
      enum: ['webhook', 'verify_endpoint', 'admin'],
    },

    // ── Payment method metadata ───────────────────────────────────────────────
    method: String,     // upi | card | netbanking | wallet | emi
    bank: String,
    wallet: String,
    vpa: String,        // UPI VPA (Virtual Payment Address)
    cardNetwork: String,
    cardLast4: String,
    cardIssuer: String,

    // ── Failure details ───────────────────────────────────────────────────────
    errorCode: String,
    errorDescription: String,
    errorSource: String,
    errorStep: String,
    errorReason: String,

    // ── Refund tracking ───────────────────────────────────────────────────────
    refundId: String,
    refundAmount: Number,   // paise
    refundStatus: {
      type: String,
      enum: ['none', 'partial', 'full', 'failed'],
      default: 'none',
    },
    refundedAt: Date,

    // ── Raw Razorpay payload ──────────────────────────────────────────────────
    // Stored for debugging / dispute resolution. Strip before displaying to users.
    razorpayPayload: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// For admin payment list queries
paymentSchema.index({ status: 1, createdAt: -1 });
paymentSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.models.Payment || mongoose.model('Payment', paymentSchema);
