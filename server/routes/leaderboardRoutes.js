/**
 * Leaderboard Routes
 *
 * GET  /api/leaderboard          — ranked list with scope/period filters
 * GET  /api/leaderboard/my-rank  — current user's rank + points
 * POST /api/leaderboard/opt-in   — join the leaderboard (sets leaderboard.optIn = true)
 * POST /api/leaderboard/opt-out  — leave the leaderboard (removes user from public views)
 *
 * Scope filters:  global | college | role
 * Period filters: weekly | alltime
 *
 * Anti-gaming notes enforced at data level:
 *  - Only users who opted in are returned (privacy-first).
 *  - Points stored on leaderboard.weeklyPoints reset weekly via a cron-style
 *    check on read (lazy reset — no cron job needed).
 *  - Daily cap enforced in aiRateLimit.js middleware; per-session point cap in
 *    voiceInterviewController.js (200 pts max per session).
 */

import express from 'express';
import { protect } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

// ─── Lazy weekly reset helper ─────────────────────────────────────────────────
// Resets weeklyPoints for users whose weeklyPointsReset date has passed.
// Called at read time so we don't need a scheduled job.
const resetExpiredWeeklyPoints = async () => {
  const now = new Date();
  await User.updateMany(
    { 'leaderboard.weeklyPointsReset': { $lt: now } },
    {
      $set: {
        'leaderboard.weeklyPoints': 0,
        // Roll to next Monday
        'leaderboard.weeklyPointsReset': getNextMonday(),
      },
    }
  );
};

function getNextMonday() {
  const d = new Date();
  const day = d.getDay(); // 0=Sun, 1=Mon, ...
  const daysUntilMonday = day === 1 ? 7 : (8 - day) % 7 || 7;
  d.setDate(d.getDate() + daysUntilMonday);
  d.setHours(0, 0, 0, 0);
  return d;
}

// ─── GET /api/leaderboard ─────────────────────────────────────────────────────
router.get('/', protect, async (req, res) => {
  try {
    const {
      scope = 'global',    // global | college | role
      period = 'weekly',   // weekly | alltime
      role,                // used when scope=role
      limit = 50,
    } = req.query;

    // Lazy weekly reset
    await resetExpiredWeeklyPoints();

    const pointsField = period === 'weekly' ? 'leaderboard.weeklyPoints' : 'leaderboard.totalPoints';

    // Build match query
    const match = {
      'leaderboard.optIn': true,      // privacy: only show opted-in users
      [pointsField]: { $gt: 0 },      // hide zero-point entries to keep board meaningful
    };

    if (scope === 'college') {
      const currentUser = await User.findById(req.user.id).select('leaderboard.college profile.college');
      const college = currentUser?.leaderboard?.college || currentUser?.profile?.college;
      if (college) {
        match.$or = [
          { 'leaderboard.college': college },
          { 'profile.college': college },
        ];
      }
    }

    if (scope === 'role' && role) {
      match['profile.targetRole'] = { $regex: role, $options: 'i' };
    }

    // Fetch ranked users
    const users = await User.find(match)
      .select('leaderboard profile.college profile.targetRole stats.interviewsCompleted')
      .sort({ [pointsField]: -1 })
      .limit(parseInt(limit));

    // Build ranked entries — never expose email
    const ranked = users.map((u, idx) => {
      const pts = period === 'weekly'
        ? (u.leaderboard?.weeklyPoints ?? 0)
        : (u.leaderboard?.totalPoints ?? 0);

      return {
        rank: idx + 1,
        userId: u._id,
        displayName: u.leaderboard?.displayName || 'Anonymous',
        college: u.leaderboard?.college || u.profile?.college || null,
        points: pts,
        interviewsCompleted: u.stats?.interviewsCompleted ?? 0,
        isCurrentUser: u._id.toString() === req.user._id.toString(),
      };
    });

    // Find the current user's rank (even if outside top N)
    const currentUserEntry = ranked.find((r) => r.isCurrentUser);
    let userRank = currentUserEntry?.rank ?? null;

    // If user isn't in the top N, compute their actual rank
    if (!userRank) {
      const countAbove = await User.countDocuments({
        ...match,
        [pointsField]: {
          $gt: (await User.findById(req.user.id).select(pointsField))?.[pointsField.split('.')[0]]?.[pointsField.split('.')[1]] ?? 0,
        },
      });
      userRank = countAbove + 1;
    }

    const totalOptedIn = await User.countDocuments({ 'leaderboard.optIn': true });

    res.json({
      success: true,
      data: {
        leaderboard: ranked,
        userRank,
        totalParticipants: totalOptedIn,
        scope,
        period,
        weekResetsOn: getNextMonday(),
      },
    });
  } catch (err) {
    console.error('[leaderboard] GET error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch leaderboard' });
  }
});

// ─── GET /api/leaderboard/my-rank ────────────────────────────────────────────
router.get('/my-rank', protect, async (req, res) => {
  try {
    await resetExpiredWeeklyPoints();

    const user = await User.findById(req.user.id).select('leaderboard stats');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const weeklyPts = user.leaderboard?.weeklyPoints ?? 0;
    const totalPts = user.leaderboard?.totalPoints ?? 0;

    // Count users ranked above in weekly
    const weeklyRankAbove = await User.countDocuments({
      'leaderboard.optIn': true,
      'leaderboard.weeklyPoints': { $gt: weeklyPts },
    });
    // Count users ranked above in alltime
    const alltimeRankAbove = await User.countDocuments({
      'leaderboard.optIn': true,
      'leaderboard.totalPoints': { $gt: totalPts },
    });

    const totalParticipants = await User.countDocuments({ 'leaderboard.optIn': true });

    res.json({
      success: true,
      data: {
        weeklyRank: weeklyRankAbove + 1,
        alltimeRank: alltimeRankAbove + 1,
        totalParticipants,
        weeklyPoints: weeklyPts,
        totalPoints: totalPts,
        optedIn: user.leaderboard?.optIn ?? false,
        displayName: user.leaderboard?.displayName || null,
        college: user.leaderboard?.college || null,
        interviewsCompleted: user.stats?.interviewsCompleted ?? 0,
      },
    });
  } catch (err) {
    console.error('[leaderboard] my-rank error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch rank' });
  }
});

// ─── POST /api/leaderboard/opt-in ────────────────────────────────────────────
router.post('/opt-in', protect, async (req, res) => {
  try {
    const { displayName, college } = req.body;

    const update = { 'leaderboard.optIn': true };
    if (displayName?.trim()) update['leaderboard.displayName'] = displayName.trim().substring(0, 40);
    if (college?.trim()) update['leaderboard.college'] = college.trim().substring(0, 80);

    // Initialise weeklyPointsReset if not set
    const user = await User.findById(req.user.id).select('leaderboard');
    if (!user?.leaderboard?.weeklyPointsReset) {
      update['leaderboard.weeklyPointsReset'] = getNextMonday();
    }

    await User.findByIdAndUpdate(req.user.id, { $set: update });

    res.json({ success: true, message: 'You are now on the leaderboard!' });
  } catch (err) {
    console.error('[leaderboard] opt-in error:', err);
    res.status(500).json({ success: false, message: 'Failed to opt in' });
  }
});

// ─── POST /api/leaderboard/opt-out ───────────────────────────────────────────
router.post('/opt-out', protect, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, {
      $set: { 'leaderboard.optIn': false },
    });
    res.json({ success: true, message: 'You have been removed from the leaderboard.' });
  } catch (err) {
    console.error('[leaderboard] opt-out error:', err);
    res.status(500).json({ success: false, message: 'Failed to opt out' });
  }
});

export default router;
