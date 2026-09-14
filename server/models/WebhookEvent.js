/**
 * WebhookEvent Model
 *
 * Idempotency store for Razorpay webhook events.
 *
 * Every incoming webhook is checked against this collection BEFORE processing.
 * If the event ID already exists, the handler returns 200 immediately without
 * reprocessing — protecting against Razorpay's retry behaviour.
 *
 * Razorpay uses the field `payload.payment.entity.id` or `payload.subscription.entity.id`
 * as the entity ID, but does NOT currently send a unique event_id at the envelope level.
 * We derive a deduplication key from (event_type + entity_id) to guarantee idempotency.
 */

import mongoose from 'mongoose';

const webhookEventSchema = new mongoose.Schema(
  {
    // Deduplication key: "<event_type>|<entity_id>"
    // e.g. "payment.captured|pay_XXXXXXXXXXXXXXXX"
    dedupeKey: {
      type: String,
      required: true,
      unique: true,    // THE core idempotency constraint
      index: true,
    },

    // Raw Razorpay event type string
    eventType: {
      type: String,
      required: true,
      index: true,
    },

    // Razorpay entity ID embedded in the payload (payment ID, subscription ID, etc.)
    entityId: {
      type: String,
      index: true,
    },

    // Processing state
    // pending    → received, signature verified, not yet processed
    // processing → handler is actively running (guards against race conditions)
    // processed  → handler completed successfully
    // failed     → handler threw an error
    // skipped    → event type not handled
    status: {
      type: String,
      enum: ['pending', 'processing', 'processed', 'failed', 'skipped'],
      default: 'pending',
    },

    processedAt: Date,

    // Number of attempts (for manual retry tracking / alerting)
    attempts: {
      type: Number,
      default: 0,
    },

    // Last error if status === 'failed'
    lastError: String,

    // Compact summary stored for admin auditing (not the full body)
    summary: {
      userId: String,
      planKey: String,
      amount: Number,
    },

    // Full raw payload stored for debugging / dispute resolution
    // In high-volume production you may move this to a separate collection / S3
    payload: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true, // createdAt = time webhook was received
  }
);

// TTL index — auto-delete processed events after 90 days to keep collection small
// Remove this if you need long-term webhook audit logs
webhookEventSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 90 * 24 * 60 * 60, partialFilterExpression: { status: { $in: ['processed', 'skipped'] } } }
);

webhookEventSchema.index({ status: 1, createdAt: -1 });

export default mongoose.models.WebhookEvent || mongoose.model('WebhookEvent', webhookEventSchema);
