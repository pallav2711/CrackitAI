/**
 * Order Model
 *
 * One record per Razorpay order created.
 * Created when a user initiates checkout; updated as payment flows through.
 *
 * Unique constraints on razorpayOrderId prevent duplicate order records.
 */

import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    // Internal references
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // The plan key sent by the user (e.g. 'basic', 'pro', 'annual_pro')
    planKey: {
      type: String,
      required: true,
    },

    // ── Razorpay fields ─────────────────────────────────────────────────────
    // Razorpay order ID (e.g. order_XXXXXXXXXXXXXXXX)
    razorpayOrderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // Amount in smallest currency unit (paise for INR). Set server-side — never from frontend.
    amount: {
      type: Number,
      required: true,
      min: 1,
    },

    currency: {
      type: String,
      default: 'INR',
    },

    receipt: {
      type: String, // e.g. rcpt_<userId>_<timestamp>
    },

    // ── Status ───────────────────────────────────────────────────────────────
    // created   → Razorpay order created, user has not paid yet
    // attempted → User has attempted payment (at least one payment entity exists in Razorpay)
    // paid      → Payment captured successfully (set by webhook or verify)
    // failed    → All payment attempts failed
    // cancelled → User abandoned without paying
    status: {
      type: String,
      enum: ['created', 'attempted', 'paid', 'failed', 'cancelled'],
      default: 'created',
    },

    // ── Payment link ─────────────────────────────────────────────────────────
    // Populated once payment is verified / webhook fires
    razorpayPaymentId: {
      type: String,
      index: true,
      sparse: true, // NULL allowed — not all orders result in a payment
    },

    // ── Display / billing info ────────────────────────────────────────────────
    planName: String,         // human-readable, e.g. 'Pro'
    amountDisplay: String,    // formatted, e.g. '₹599'
    durationMonths: Number,   // subscription period in months

    // ── GST / tax readiness ───────────────────────────────────────────────────
    // These are stored for invoice generation; tax is NOT charged at checkout
    // unless you have GST registration. Fill in from user profile if available.
    billingName: String,
    billingEmail: String,
    billingPhone: String,
    billingAddress: String,
    gstin: String,            // customer's GSTIN if provided

    // ── Metadata ─────────────────────────────────────────────────────────────
    notes: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // When the subscription activated from this order
    activatedAt: Date,

    // If the order was refunded
    refundedAt: Date,
    refundId: String,
    refundAmount: Number,     // paise
    refundStatus: {
      type: String,
      enum: ['none', 'partial', 'full', 'failed'],
      default: 'none',
    },
    refundReason: String,
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

// Compound index for fast user payment history queries
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });

export default mongoose.models.Order || mongoose.model('Order', orderSchema);
