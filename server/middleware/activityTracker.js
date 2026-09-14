import UserActivity from '../models/UserActivity.js';
import UserStreak from '../models/UserStreak.js';
import User from '../models/User.js';

/**
 * Activity tracker middleware.
 *
 * Tracks user actions, updates streaks, AND writes earned points back to
 * User.stats.totalPoints so the leaderboard actually reflects real activity.
 */
export const trackActivity = (activityType) => {
  return async (req, res, next) => {
    const originalSend = res.send;

    res.send = function (data) {
      // Only track on successful responses for authenticated users
      if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
        setImmediate(async () => {
          try {
            const userId = req.user.id || req.user._id;

            // Parse response data for activity details
            let activityDetails = {};
            try {
              const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
              activityDetails = {
                success: parsedData.success,
                endpoint: req.originalUrl,
                method: req.method,
              };
            } catch (_) {}

            const points = calculateActivityPoints(activityType, activityDetails);

            // 1. Log the activity
            await UserActivity.create({
              userId,
              date: new Date(),
              activityType,
              activityDetails,
              points,
              duration: Date.now() - (req.startTime || Date.now()),
            });

            // 2. Update streak
            let streak = await UserStreak.findOne({ userId });
            if (!streak) {
              streak = await UserStreak.create({ userId });
            }
            streak.updateStreak();
            await streak.save();

            // 3. Write points to User.stats.totalPoints (fixes leaderboard)
            //    Also update averageScore if we have it from an interview completion
            const statsUpdate = { $inc: { 'stats.totalPoints': points } };

            if (activityType === 'interview') {
              statsUpdate.$inc['stats.interviewsCompleted'] = 1;
            }

            await User.findByIdAndUpdate(userId, statsUpdate);
          } catch (error) {
            console.error('Activity tracking error:', error);
          }
        });
      }

      originalSend.call(this, data);
    };

    req.startTime = Date.now();
    next();
  };
};

function calculateActivityPoints(activityType) {
  const pointsMap = {
    login: 5,
    test: 10,
    interview: 15,
    resume: 20,
    'company-prep': 10,
    'ai-mentor': 5,
  };
  return pointsMap[activityType] || 5;
}
