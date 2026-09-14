/**
 * Subscription enforcement middleware.
 *
 * Use this on routes that should only be accessible to paid users,
 * or where you want to gate specific plan tiers.
 *
 * Usage:
 *   router.get('/some-pro-feature', protect, requirePlan('pro', 'annual'), handler);
 *   router.get('/any-paid',         protect, requirePaid, handler);
 *   router.get('/basic-plus',       protect, requirePlan('basic','pro','annual'), handler);
 *
 * The middleware also auto-downgrades expired subscriptions before checking,
 * so it's safe to use as the single authoritative gate without a separate cron job.
 */

import User from '../models/User.js';

/**
 * Checks that the user's subscription is active and on one of the allowed plans.
 * Auto-downgrades expired subscriptions to 'free' before checking.
 *
 * @param  {...string} allowedPlans — e.g. 'basic', 'pro', 'annual'
 */
export const requirePlan = (...allowedPlans) => {
  return async (req, res, next) => {
    try {
      // req.user is already loaded by the `protect` middleware;
      // re-fetch to get the freshest subscription data (avoids stale JWT claims)
      const user = await User.findById(req.user.id).select('subscription');
      if (!user) {
        return res.status(401).json({ success: false, message: 'User not found.' });
      }

      const now       = new Date();
      const periodEnd = user.subscription?.currentPeriodEnd;
      let   plan      = user.subscription?.plan || 'free';

      // ── Auto-downgrade: period elapsed + auto-renew is off ────────────────
      if (
        plan !== 'free' &&
        periodEnd &&
        now > periodEnd &&
        !user.subscription?.autoRenew
      ) {
        await User.findByIdAndUpdate(req.user.id, {
          'subscription.plan':   'free',
          'subscription.status': 'inactive',
        });
        plan = 'free';
      }

      // ── Subscription status check: cancelled / inactive plans block access ─
      const status = user.subscription?.status;
      if (plan !== 'free' && status && status !== 'active') {
        return res.status(403).json({
          success: false,
          message: `Your ${plan} subscription is ${status}. Please renew to access this feature.`,
          code:    'SUBSCRIPTION_INACTIVE',
          currentPlan: plan,
          subscriptionStatus: status,
        });
      }

      // ── Plan tier check ───────────────────────────────────────────────────
      if (!allowedPlans.includes(plan)) {
        return res.status(403).json({
          success:      false,
          message:      `This feature requires one of the following plans: ${allowedPlans.join(', ')}. Your current plan is "${plan}".`,
          code:         'PLAN_REQUIRED',
          requiredPlans: allowedPlans,
          currentPlan:  plan,
        });
      }

      // Attach resolved plan to req for downstream use
      req.userPlan = plan;
      next();
    } catch (err) {
      console.error('[requireSubscription] error:', err);
      next(err);
    }
  };
};

/**
 * Shorthand: any paid plan (basic, pro, annual)
 */
export const requirePaid = requirePlan('basic', 'pro', 'annual');

/**
 * Shorthand: pro or annual only
 */
export const requirePro = requirePlan('pro', 'annual');
