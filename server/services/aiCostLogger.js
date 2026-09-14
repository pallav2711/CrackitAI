/**
 * AI Cost Logger
 *
 * Logs every OpenAI API call's token/cost usage per user so we can track
 * real margin per plan instead of guessing.
 *
 * Pricing constants (update when OpenAI changes rates):
 *   gpt-4o-mini (used for answer eval / feedback):
 *     input  $0.15 / 1M tokens  → ₹0.0125 / 1K tokens
 *     output $0.60 / 1M tokens  → ₹0.05   / 1K tokens
 *   gpt-3.5-turbo (used for question generation):
 *     input  $0.50 / 1M tokens  → ₹0.042  / 1K tokens
 *     output $1.50 / 1M tokens  → ₹0.125  / 1K tokens
 *   gpt-realtime-mini (voice sessions, per minute):
 *     ~$0.10/min audio input + $0.20/min audio output
 *     ≈ ₹1.5–2 / minute of conversation
 *
 * USD→INR rate used: 1 USD = 83 INR (update periodically).
 */

import mongoose from 'mongoose';

const USD_TO_INR = 83;

// ---------------------------------------------------------------------------
// Mongoose schema for cost records
// ---------------------------------------------------------------------------

const AICostLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    // Which feature triggered this call
    feature: {
      type: String,
      enum: [
        'question-generation',
        'answer-evaluation',
        'overall-feedback',
        'resume-scanner',
        'voice-session',
        'comprehensive-analysis',
        'other',
      ],
      required: true,
    },
    model: { type: String, required: true }, // e.g. 'gpt-4o-mini'
    // Token counts
    promptTokens: { type: Number, default: 0 },
    completionTokens: { type: Number, default: 0 },
    totalTokens: { type: Number, default: 0 },
    // Voice-specific
    audioMinutes: { type: Number, default: 0 },
    // Estimated cost in INR (for quick margin math)
    estimatedCostINR: { type: Number, default: 0 },
    // Optional reference to the Interview or ResumeAnalysis doc
    refId: { type: mongoose.Schema.Types.ObjectId },
    refModel: { type: String, enum: ['Interview', 'ResumeAnalysis', 'Voice'] },
  },
  { timestamps: true }
);

// Index for per-user cost reporting
AICostLogSchema.index({ userId: 1, createdAt: -1 });
AICostLogSchema.index({ feature: 1, createdAt: -1 });

const AICostLog =
  mongoose.models.AICostLog ||
  mongoose.model('AICostLog', AICostLogSchema);

// ---------------------------------------------------------------------------
// Cost calculation helpers
// ---------------------------------------------------------------------------

const PRICING = {
  'gpt-4': {
    inputPer1K: (8.0 / 1000) * USD_TO_INR,   // $8/1M input
    outputPer1K: (24.0 / 1000) * USD_TO_INR,  // $24/1M output
  },
  'gpt-4o': {
    inputPer1K: (2.5 / 1000) * USD_TO_INR,
    outputPer1K: (10.0 / 1000) * USD_TO_INR,
  },
  'gpt-4o-mini': {
    inputPer1K: (0.15 / 1000) * USD_TO_INR,
    outputPer1K: (0.60 / 1000) * USD_TO_INR,
  },
  'gpt-3.5-turbo': {
    inputPer1K: (0.50 / 1000) * USD_TO_INR,
    outputPer1K: (1.50 / 1000) * USD_TO_INR,
  },
  'gpt-realtime-mini': {
    // Per minute of voice conversation (input + output audio averaged)
    perMinute: 0.10 * 3 * USD_TO_INR / 60, // rough: $0.30/min * INR
  },
};

function estimateCost(model, promptTokens, completionTokens, audioMinutes = 0) {
  const rates = PRICING[model];
  if (!rates) return 0;

  if (audioMinutes > 0 && rates.perMinute) {
    return parseFloat((audioMinutes * rates.perMinute).toFixed(4));
  }

  const inputCost = (promptTokens / 1000) * (rates.inputPer1K || 0);
  const outputCost = (completionTokens / 1000) * (rates.outputPer1K || 0);
  return parseFloat((inputCost + outputCost).toFixed(4));
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Log a chat completion call.
 *
 * @param {object} opts
 * @param {string}  opts.userId
 * @param {string}  opts.feature  — enum value from schema above
 * @param {string}  opts.model    — OpenAI model name
 * @param {object}  opts.usage    — OpenAI usage object { prompt_tokens, completion_tokens, total_tokens }
 * @param {string}  [opts.refId]  — MongoDB _id of associated doc
 * @param {string}  [opts.refModel]
 */
export async function logChatCall({ userId, feature, model, usage, refId, refModel }) {
  try {
    const promptTokens = usage?.prompt_tokens ?? 0;
    const completionTokens = usage?.completion_tokens ?? 0;
    const totalTokens = usage?.total_tokens ?? 0;
    const estimatedCostINR = estimateCost(model, promptTokens, completionTokens);

    await AICostLog.create({
      userId,
      feature,
      model,
      promptTokens,
      completionTokens,
      totalTokens,
      estimatedCostINR,
      refId,
      refModel,
    });
  } catch (err) {
    // Never crash a request due to logging failure
    console.error('[aiCostLogger] Failed to log chat call:', err.message);
  }
}

/**
 * Log a voice/realtime session.
 *
 * @param {object} opts
 * @param {string}  opts.userId
 * @param {number}  opts.audioMinutes
 * @param {string}  [opts.refId]
 */
export async function logVoiceSession({ userId, audioMinutes, refId }) {
  try {
    const estimatedCostINR = estimateCost('gpt-realtime-mini', 0, 0, audioMinutes);

    await AICostLog.create({
      userId,
      feature: 'voice-session',
      model: 'gpt-realtime-mini',
      audioMinutes,
      estimatedCostINR,
      refId,
      refModel: 'Voice',
    });
  } catch (err) {
    console.error('[aiCostLogger] Failed to log voice session:', err.message);
  }
}

/**
 * Get aggregate cost stats for a user (used in billing page / admin).
 *
 * @param {string} userId
 * @param {Date}   [since]  — default: start of current month
 */
export async function getUserCostStats(userId, since) {
  const start = since || (() => {
    const d = new Date();
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
  })();

  const results = await AICostLog.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId), createdAt: { $gte: start } } },
    {
      $group: {
        _id: '$feature',
        totalCostINR: { $sum: '$estimatedCostINR' },
        totalCalls: { $sum: 1 },
        totalTokens: { $sum: '$totalTokens' },
        totalAudioMinutes: { $sum: '$audioMinutes' },
      },
    },
  ]);

  const totals = results.reduce(
    (acc, r) => {
      acc.totalCostINR += r.totalCostINR;
      acc.totalCalls += r.totalCalls;
      return acc;
    },
    { totalCostINR: 0, totalCalls: 0 }
  );

  return { byFeature: results, ...totals };
}

export { AICostLog };
export default { logChatCall, logVoiceSession, getUserCostStats };
