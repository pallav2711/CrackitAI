import User from '../models/User.js';
import Interview from '../models/Interview.js';
import UserActivity from '../models/UserActivity.js';
import UserStreak from '../models/UserStreak.js';
import Achievement from '../models/Achievement.js';

// ─── GET /api/analytics/dashboard ────────────────────────────────────────────
export const getDashboardAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    const { period = 'week' } = req.query;

    const now = new Date();
    let startDate = new Date();
    switch (period) {
      case 'week':   startDate.setDate(now.getDate() - 7);          break;
      case 'month':  startDate.setMonth(now.getMonth() - 1);        break;
      case 'year':   startDate.setFullYear(now.getFullYear() - 1);  break;
      case 'all':    startDate = new Date(0);                        break;
    }

    const [user, interviews, activities, streak, achievements] = await Promise.all([
      User.findById(userId),
      Interview.find({ userId, createdAt: { $gte: startDate } }),
      UserActivity.find({ userId, date: { $gte: startDate } }).sort({ date: -1 }),
      UserStreak.findOne({ userId }),
      Achievement.find({ userId }).sort({ earnedAt: -1 }),
    ]);

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const avgInterviewScore = interviews.length > 0
      ? Math.round(interviews.reduce((s, i) => s + i.overallScore, 0) / interviews.length)
      : 0;

    const stats = {
      resumeScore:    user.stats?.resumeScore    || 0,
      interviews:     interviews.length,
      readinessScore: user.stats?.readinessScore || 0,
      avgScore:       avgInterviewScore,
    };

    res.json({
      success: true,
      data: {
        stats,
        streak: {
          current:   streak?.currentStreak  || 0,
          longest:   streak?.longestStreak  || 0,
          totalDays: streak?.totalDaysActive || 0,
        },
        weeklyProgress:    calculateWeeklyProgress(activities),
        recentActivity:    activities.slice(0, 10).map(a => ({
          type:      a.activityType,
          details:   a.activityDetails,
          timestamp: a.createdAt,
          points:    a.points,
        })),
        achievements:      achievements.slice(0, 5),
        performanceTrends: calculatePerformanceTrends(interviews),
      },
    });
  } catch (error) {
    console.error('Dashboard analytics error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch analytics' });
  }
};

// ─── GET /api/analytics/leaderboard ──────────────────────────────────────────
export const getLeaderboard = async (req, res) => {
  try {
    const { period = 'week', limit = 50 } = req.query;
    const userId = req.user.id;

    const now = new Date();
    let startDate = new Date();
    switch (period) {
      case 'week':  startDate.setDate(now.getDate() - 7);   break;
      case 'month': startDate.setMonth(now.getMonth() - 1); break;
      case 'all':   startDate = new Date(0);                 break;
    }

    const users = await User.find({ role: 'student' })
      .select('name email profile.college stats leaderboard')
      .lean();

    const leaderboardData = await Promise.all(
      users.map(async (u) => {
        const [interviews, activities] = await Promise.all([
          Interview.find({ userId: u._id, createdAt: { $gte: startDate } }),
          UserActivity.find({ userId: u._id, date: { $gte: startDate } }),
        ]);
        const totalPoints = activities.reduce((s, a) => s + (a.points || 0), 0);
        const avgInterviewScore = interviews.length > 0
          ? Math.round(interviews.reduce((s, i) => s + i.overallScore, 0) / interviews.length)
          : 0;
        return {
          userId:             u._id,
          name:               u.name,
          college:            u.profile?.college,
          totalPoints,
          interviewsCompleted: interviews.length,
          avgInterviewScore,
          isCurrentUser:      u._id.toString() === userId,
        };
      })
    );

    leaderboardData.sort((a, b) => b.totalPoints - a.totalPoints);
    leaderboardData.forEach((u, i) => { u.rank = i + 1; });

    res.json({
      success: true,
      data: {
        leaderboard:       leaderboardData.slice(0, parseInt(limit)),
        currentUser:       leaderboardData.find(u => u.isCurrentUser),
        totalParticipants: leaderboardData.length,
      },
    });
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch leaderboard' });
  }
};

// ─── GET /api/analytics/report ────────────────────────────────────────────────
export const getPerformanceReport = async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end   = endDate   ? new Date(endDate)   : new Date();

    const [user, interviews, activities, streak, achievements] = await Promise.all([
      User.findById(userId),
      Interview.find({ userId, createdAt: { $gte: start, $lte: end } }),
      UserActivity.find({ userId, date: { $gte: start, $lte: end } }),
      UserStreak.findOne({ userId }),
      Achievement.find({ userId }),
    ]);

    res.json({
      success: true,
      data: {
        user: {
          name:       user.name,
          email:      user.email,
          college:    user.profile?.college,
          targetRole: user.profile?.targetRole,
        },
        period: { start, end },
        summary: {
          totalInterviews: interviews.length,
          totalActivities: activities.length,
          currentStreak:   streak?.currentStreak || 0,
          totalAchievements: achievements.length,
        },
        interviewAnalysis: analyzeInterviews(interviews),
        timeAnalysis:      analyzeTimePatterns(activities),
        achievements,
        recommendations:   generateRecommendations(interviews, activities),
      },
    });
  } catch (error) {
    console.error('Performance report error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate report' });
  }
};

// ─── POST /api/analytics/activity ────────────────────────────────────────────
export const trackActivity = async (req, res) => {
  try {
    const userId = req.user.id;
    const { activityType, activityDetails, duration } = req.body;
    const points = calculateActivityPoints(activityType, activityDetails);

    const activity = await UserActivity.create({
      userId,
      date: new Date(),
      activityType,
      activityDetails,
      points,
      duration,
    });

    let streak = await UserStreak.findOne({ userId });
    if (!streak) streak = await UserStreak.create({ userId });
    if (typeof streak.updateStreak === 'function') streak.updateStreak();
    await streak.save();

    await checkAndAwardAchievements(userId, activityType);

    res.json({
      success: true,
      data: {
        activity,
        streak: { current: streak.currentStreak, longest: streak.longestStreak },
      },
    });
  } catch (error) {
    console.error('Track activity error:', error);
    res.status(500).json({ success: false, message: 'Failed to track activity' });
  }
};

// ─── GET /api/analytics/skills ────────────────────────────────────────────────
export const getSkillAssessment = async (req, res) => {
  try {
    const userId = req.user.id;
    const interviews = await Interview.find({ userId });

    const skills = {
      'Communication':      calculateInterviewSkillScore(interviews),
      'Technical Knowledge': calculateInterviewSkillScore(interviews),
      'Problem Solving':    calculateInterviewSkillScore(interviews),
      'Analytical Thinking': calculateInterviewSkillScore(interviews),
    };

    res.json({
      success: true,
      data: {
        skills,
        recommendations: generateSkillRecommendations(skills),
        lastUpdated: new Date(),
      },
    });
  } catch (error) {
    console.error('Skill assessment error:', error);
    res.status(500).json({ success: false, message: 'Failed to get skill assessment' });
  }
};

// ─── GET /api/analytics/patterns ─────────────────────────────────────────────
export const getLearningPatterns = async (req, res) => {
  try {
    const userId = req.user.id;
    const activities = await UserActivity.find({ userId }).sort({ date: -1 });

    if (!activities.length) {
      return res.json({
        success: true,
        data: {
          peakTime: 'Morning (9–11 AM)',
          avgSessionTime: 0,
          mostActiveDay: 'Monday',
          retentionRate: 0,
          learningVelocity: 'Low',
          consistencyScore: 0,
        },
      });
    }

    res.json({ success: true, data: analyzeLearningPatterns(activities) });
  } catch (error) {
    console.error('Learning patterns error:', error);
    res.status(500).json({ success: false, message: 'Failed to get learning patterns' });
  }
};

// ─── GET /api/analytics/trends ────────────────────────────────────────────────
export const getProgressTrends = async (req, res) => {
  try {
    const userId = req.user.id;
    const { period = 'month' } = req.query;

    const now = new Date();
    let startDate = new Date();
    switch (period) {
      case 'week':    startDate.setDate(now.getDate() - 7);         break;
      case 'month':   startDate.setMonth(now.getMonth() - 1);       break;
      case 'quarter': startDate.setMonth(now.getMonth() - 3);       break;
      case 'year':    startDate.setFullYear(now.getFullYear() - 1); break;
    }

    const activities = await UserActivity.find({ userId, date: { $gte: startDate } }).sort({ date: 1 });
    res.json({ success: true, data: { trends: calculateProgressTrends(activities, period) } });
  } catch (error) {
    console.error('Progress trends error:', error);
    res.status(500).json({ success: false, message: 'Failed to get progress trends' });
  }
};

// ─── POST /api/analytics/export ───────────────────────────────────────────────
export const exportData = async (req, res) => {
  try {
    const userId = req.user.id;
    const { format = 'json', dateRange = {} } = req.body;
    const start = dateRange.startDate ? new Date(dateRange.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end   = dateRange.endDate   ? new Date(dateRange.endDate)   : new Date();

    const [user, interviews, activities] = await Promise.all([
      User.findById(userId).select('-password'),
      Interview.find({ userId, createdAt: { $gte: start, $lte: end } }),
      UserActivity.find({ userId, date: { $gte: start, $lte: end } }),
    ]);

    res.json({
      success: true,
      format,
      data: {
        user:       { name: user.name, email: user.email, profile: user.profile },
        period:     { start, end },
        summary:    { totalInterviews: interviews.length, totalActivities: activities.length },
        interviews: interviews.map(i => ({ type: i.type, overallScore: i.overallScore, date: i.createdAt })),
        activities: activities.map(a => ({ type: a.activityType, points: a.points, date: a.date })),
      },
    });
  } catch (error) {
    console.error('Export data error:', error);
    res.status(500).json({ success: false, message: 'Failed to export data' });
  }
};

// ─── GET /api/analytics/user ──────────────────────────────────────────────────
export const getUserAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    const [user, interviews, activities] = await Promise.all([
      User.findById(userId),
      Interview.find({ userId }),
      UserActivity.find({ userId }).sort({ date: -1 }).limit(30),
    ]);
    res.json({
      success: true,
      data: {
        totalInterviews: interviews.length,
        avgScore: interviews.length > 0
          ? Math.round(interviews.reduce((s, i) => s + i.overallScore, 0) / interviews.length)
          : 0,
        totalPoints: user?.stats?.totalPoints || 0,
        recentActivity: activities.slice(0, 5),
      },
    });
  } catch (error) {
    console.error('User analytics error:', error);
    res.status(500).json({ success: false, message: 'Failed to get user analytics' });
  }
};

// ─── GET /api/analytics/stats ─────────────────────────────────────────────────
export const getStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    res.json({ success: true, data: user?.stats || {} });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to get stats' });
  }
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function calculateWeeklyProgress(activities) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const progress = Array(7).fill(0);
  const counts   = Array(7).fill(0);
  activities.forEach(a => {
    const d = new Date(a.date).getDay();
    progress[d] += a.points || 0;
    counts[d]++;
  });
  return days.map((day, i) => ({
    day,
    value: counts[i] > 0 ? Math.min(100, Math.round(progress[i] / counts[i] * 10)) : 0,
  }));
}

function calculatePerformanceTrends(interviews) {
  const trend = interviews.length >= 2
    ? interviews[interviews.length - 1].overallScore - interviews[0].overallScore
    : 0;
  return {
    interviews: {
      trend: trend > 0 ? 'up' : trend < 0 ? 'down' : 'stable',
      value: Math.abs(trend),
    },
  };
}

function analyzeInterviews(interviews) {
  if (!interviews.length) return { avgScore: 0, totalInterviews: 0, typeBreakdown: {} };
  const avgScore = Math.round(interviews.reduce((s, i) => s + i.overallScore, 0) / interviews.length);
  const typeBreakdown = {};
  interviews.forEach(i => {
    if (!typeBreakdown[i.type]) typeBreakdown[i.type] = { count: 0, totalScore: 0 };
    typeBreakdown[i.type].count++;
    typeBreakdown[i.type].totalScore += i.overallScore;
  });
  Object.keys(typeBreakdown).forEach(t => {
    typeBreakdown[t].avgScore = Math.round(typeBreakdown[t].totalScore / typeBreakdown[t].count);
  });
  return { avgScore, totalInterviews: interviews.length, typeBreakdown };
}

function analyzeTimePatterns(activities) {
  const hourCounts = Array(24).fill(0);
  const dayCounts  = Array(7).fill(0);
  activities.forEach(a => {
    const d = new Date(a.date);
    hourCounts[d.getHours()]++;
    dayCounts[d.getDay()]++;
  });
  const peakHour = hourCounts.indexOf(Math.max(...hourCounts));
  const peakDay  = dayCounts.indexOf(Math.max(...dayCounts));
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return { peakHour: `${peakHour}:00`, peakDay: days[peakDay], totalActivities: activities.length };
}

function generateRecommendations(interviews, activities) {
  const recs = [];
  if (interviews.length < 3) recs.push('Practice more mock interviews to build confidence');
  if (activities.length < 10) recs.push('Increase your daily activity to maintain momentum');
  const avg = interviews.length > 0
    ? interviews.reduce((s, i) => s + i.overallScore, 0) / interviews.length : 0;
  if (avg < 70) recs.push('Focus on weak areas identified in interview feedback');
  if (!recs.length) recs.push('Keep up the great work!');
  return recs;
}

function calculateActivityPoints(activityType, details) {
  const map = {
    login:     5,
    interview: details?.score ? Math.round(details.score / 10) : 15,
    resume:    20,
    quiz:      details?.score ? Math.round(details.score / 10) : 10,
    'ats-scan': 10,
    'cover-letter': 15,
  };
  return map[activityType] || 5;
}

function calculateInterviewSkillScore(interviews) {
  if (!interviews.length) return 0;
  return Math.round(interviews.reduce((s, i) => s + i.overallScore, 0) / interviews.length);
}

function generateSkillRecommendations(skills) {
  const recs = [];
  Object.entries(skills).forEach(([skill, score]) => {
    if (score < 60)      recs.push(`Focus on improving ${skill} through targeted practice`);
    else if (score > 85) recs.push(`Excellent ${skill} — keep it up`);
  });
  if (!recs.length) recs.push('Continue practicing to maintain your current skill levels');
  return recs;
}

function analyzeLearningPatterns(activities) {
  const hourCounts  = Array(24).fill(0);
  const dayCounts   = Array(7).fill(0);
  const sessionTimes = [];
  activities.forEach(a => {
    const d = new Date(a.date);
    hourCounts[d.getHours()]++;
    dayCounts[d.getDay()]++;
    if (a.duration) sessionTimes.push(a.duration);
  });
  const peakHour = hourCounts.indexOf(Math.max(...hourCounts));
  const peakDay  = dayCounts.indexOf(Math.max(...dayCounts));
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const avgSessionTime = sessionTimes.length
    ? Math.round(sessionTimes.reduce((s, t) => s + t, 0) / sessionTimes.length) : 0;
  return {
    peakTime:        `${peakHour}:00–${peakHour + 1}:00`,
    avgSessionTime,
    mostActiveDay:   days[peakDay],
    retentionRate:   75,
    learningVelocity: activities.length > 20 ? 'High' : activities.length > 10 ? 'Medium' : 'Low',
    consistencyScore: calculateConsistencyScore(activities),
  };
}

function calculateConsistencyScore(activities) {
  if (activities.length < 7) return 0;
  const dailyActivity = {};
  activities.forEach(a => { dailyActivity[new Date(a.date).toDateString()] = true; });
  const activeDays = Object.keys(dailyActivity).length;
  const totalDays  = Math.ceil((Date.now() - new Date(activities[activities.length - 1].date)) / 86400000);
  return Math.round((activeDays / Math.min(totalDays, 30)) * 100);
}

function calculateProgressTrends(activities, period) {
  const grouped = {};
  activities.forEach(a => {
    const d = new Date(a.date);
    const key = period === 'week'
      ? d.toDateString()
      : period === 'month'
      ? (() => { const w = new Date(d); w.setDate(d.getDate() - d.getDay()); return w.toDateString(); })()
      : `${d.getFullYear()}-${d.getMonth()}`;
    if (!grouped[key]) grouped[key] = { date: key, score: 0, count: 0 };
    grouped[key].score += a.points || 0;
    grouped[key].count++;
  });
  return Object.values(grouped)
    .map(g => ({ date: g.date, score: g.count > 0 ? Math.round(g.score / g.count) : 0 }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));
}

async function checkAndAwardAchievements(userId, activityType) {
  try {
    const toAward = [];
    if (activityType === 'interview') {
      const count = await Interview.countDocuments({ userId });
      if (count === 1)  toAward.push({ type: 'first-interview', title: 'First Interview', description: 'Completed your first interview' });
      if (count === 10) toAward.push({ type: 'interviews-10',  title: 'Interview Pro',   description: 'Completed 10 interviews' });
    }
    const streak = await UserStreak.findOne({ userId });
    if (streak?.currentStreak === 7)  toAward.push({ type: 'streak-7',  title: 'Week Warrior',  description: '7-day streak' });
    if (streak?.currentStreak === 30) toAward.push({ type: 'streak-30', title: 'Month Master',  description: '30-day streak' });
    for (const a of toAward) {
      try {
        await Achievement.create({ userId, achievementType: a.type, title: a.title, description: a.description, icon: a.type });
      } catch (e) {
        if (e.code !== 11000) console.error('Achievement error:', e);
      }
    }
  } catch (e) {
    console.error('checkAndAwardAchievements error:', e);
  }
}
