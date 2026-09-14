/**
 * Per-user AI rate limiting middleware.
 *
 * Enforces hard caps on AI-calling routes based on the user's subscription plan.
 * This runs AFTER the `protect` middleware so req.user is available.
 *
 * Plan limits (voice interviews / month):
 *   free   — 1 interview, ~7 min cap
 *   basic  — 5 interviews/month
 *   pro    — 15 interviews/month
 *   annual — same as pro (15/month)
 *
 * Resume scanner calls are unlimited on all plans (it's the free funnel).
 *
 * Daily AI call cap (prevents single-day abuse regardless of plan):
 *   free   — 1  AI call/day
 *   basic  — 3  AI calls/day
 *   pro    — 10 AI calls/day
 *   annual — 10 AI calls/day
 */

import User from '../models/User.js';

// Plan definitions — single source of truth used by this middleware AND subscription enforcement
export const PLAN_LIMITS = {
  free: {
    monthlyInterviews: 1,
    dailyAICalls: 1,
    maxSessionMinutes: 7,
  },
  basic: {
    monthlyInterviews: 5,
    dailyAICalls: 3,
    maxSessionMinutes: 10,
  },
  pro: {
    monthlyInterviews: 15,
    dailyAICalls: 10,
    maxSessionMinutes: 15,
  },
  annual: {
    monthlyInterviews: 15,
    dailyAICalls: 10,
    maxSessionMinutes: 15,
  },
};

/**
 * Checks and increments the per-user daily AI call counter stored on the User doc.
 * Returns { allowed: boolean, reason: string }.
 */
export const checkAndIncrementAICall = async (userId) => {
  const user = await User.findById(userId).select(
    'subscription usage'
  );
  if (!user) return { allowed: false, reason: 'User not found' };

  const plan = user.subscription?.plan || 'free';
  const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.free;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Reset counter if it's a new day
  const lastReset = user.usage?.dailyAICallsReset
    ? new Date(user.usage.dailyAICallsReset)
    : null;

  let dailyCalls = user.usage?.dailyAICalls ?? 0;

  if (!lastReset || lastReset < today) {
    // New day — reset
    dailyCalls = 0;
    await User.findByIdAndUpdate(userId, {
      'usage.dailyAICalls': 1,
      'usage.dailyAICallsReset': today,
    });
    return { allowed: true, remaining: limits.dailyAICalls - 1 };
  }

  if (dailyCalls >= limits.dailyAICalls) {
    return {
      allowed: false,
      reason: `Daily AI call limit reached for your ${plan} plan (${limits.dailyAICalls}/day). Upgrade or try again tomorrow.`,
    };
  }

  // Increment
  await User.findByIdAndUpdate(userId, {
    $inc: { 'usage.dailyAICalls': 1 },
  });

  return { allowed: true, remaining: limits.dailyAICalls - dailyCalls - 1 };
};

/**
 * Checks whether the user has remaining monthly interview credits.
 * Called before starting a new interview session.
 * Returns { allowed: boolean, reason: string }.
 */
export const checkInterviewCredit = async (userId) => {
  const user = await User.findById(userId).select('subscription usage');
  if (!user) return { allowed: false, reason: 'User not found' };

  const plan = user.subscription?.plan || 'free';
  const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.free;

  // Check if usage cycle needs reset
  const now = new Date();
  const cycleEnd = user.usage?.interviewCycleEnd
    ? new Date(user.usage.interviewCycleEnd)
    : null;

  let used = user.usage?.interviewsUsedThisCycle ?? 0;

  if (!cycleEnd || now > cycleEnd) {
    // New cycle — reset
    const nextCycleEnd = new Date(now);
    nextCycleEnd.setMonth(nextCycleEnd.getMonth() + 1);

    await User.findByIdAndUpdate(userId, {
      'usage.interviewsUsedThisCycle': 1,
      'usage.interviewCycleEnd': nextCycleEnd,
    });
    return {
      allowed: true,
      remaining: limits.monthlyInterviews - 1,
      plan,
    };
  }

  if (used >= limits.monthlyInterviews) {
    return {
      allowed: false,
      reason: `You've used all ${limits.monthlyInterviews} interview(s) for this month on the ${plan} plan. Upgrade to continue.`,
      plan,
    };
  }

  await User.findByIdAndUpdate(userId, {
    $inc: { 'usage.interviewsUsedThisCycle': 1 },
  });

  return {
    allowed: true,
    remaining: limits.monthlyInterviews - used - 1,
    plan,
  };
};

/**
 * Express middleware — enforces the daily AI call cap.
 * Apply to any route that makes an OpenAI API call.
 *
 * Usage:
 *   router.post('/answer', protect, aiCallLimit, submitAnswer);
 */
export const aiCallLimit = async (req, res, next) => {
  try {
    const result = await checkAndIncrementAICall(req.user.id);
    if (!result.allowed) {
      return res.status(429).json({
        success: false,
        message: result.reason,
        code: 'AI_RATE_LIMIT_EXCEEDED',
      });
    }
    // Expose remaining count for logging
    req.aiCallsRemaining = result.remaining;
    next();
  } catch (err) {
    console.error('aiCallLimit middleware error:', err);
    // Fail open (don't block the user on a middleware crash) but log it
    next();
  }
};

/**
 * Express middleware — enforces the monthly interview credit cap.
 * Apply to the "create interview" route.
 *
 * Usage:
 *   router.post('/', protect, interviewCreditLimit, createInterview);
 */
export const interviewCreditLimit = async (req, res, next) => {
  try {
    const result = await checkInterviewCredit(req.user.id);
    if (!result.allowed) {
      return res.status(403).json({
        success: false,
        message: result.reason,
        code: 'INTERVIEW_LIMIT_EXCEEDED',
        plan: result.plan,
      });
    }
    req.interviewsRemaining = result.remaining;
    next();
  } catch (err) {
    console.error('interviewCreditLimit middleware error:', err);
    next();
  }
};
