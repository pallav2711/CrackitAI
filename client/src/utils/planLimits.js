/**
 * Client-side mirror of server/middleware/aiRateLimit.js PLAN_LIMITS.
 * Keep in sync if server-side limits change.
 */
export const PLAN_LIMITS = {
  free:   { monthlyInterviews: 1,  dailyAICalls: 1,  maxSessionMinutes: 7  },
  basic:  { monthlyInterviews: 5,  dailyAICalls: 3,  maxSessionMinutes: 10 },
  pro:    { monthlyInterviews: 15, dailyAICalls: 10, maxSessionMinutes: 15 },
  annual: { monthlyInterviews: 15, dailyAICalls: 10, maxSessionMinutes: 15 },
};
