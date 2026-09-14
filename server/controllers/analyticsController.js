import User from '../models/User.js';
import TestAttempt from '../models/TestAttempt.js';
import Interview from '../models/Interview.js';
import UserActivity from '../models/UserActivity.js';
import UserStreak from '../models/UserStreak.js';
import Achievement from '../models/Achievement.js';

// Get comprehensive dashboard analytics
export const getDashboardAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    const { period = 'week' } = req.query; // week, month, year, all

    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    
    switch(period) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      case 'all':
        startDate = new Date(0);
        break;
    }

    // Fetch all data in parallel
    const [user, testAttempts, interviews, activities, streak, achievements] = await Promise.all([
      User.findById(userId),
      TestAttempt.find({ userId, createdAt: { $gte: startDate } }).populate('testId'),
      Interview.find({ userId, createdAt: { $gte: startDate } }),
      UserActivity.find({ userId, date: { $gte: startDate } }).sort({ date: -1 }),
      UserStreak.findOne({ userId }),
      Achievement.find({ userId }).sort({ earnedAt: -1 })
    ]);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Calculate stats
    const stats = {
      resumeScore: user.stats?.resumeScore || 0,
      interviews: interviews.length,
      tests: testAttempts.length,
      readinessScore: calculateReadinessScore(user, testAttempts, interviews)
    };

    // Calculate weekly progress
    const weeklyProgress = calculateWeeklyProgress(activities);

    // Recent activity
    const recentActivity = activities.slice(0, 10).map(activity => ({
      type: activity.activityType,
      details: activity.activityDetails,
      timestamp: activity.createdAt,
      points: activity.points
    }));

    // Performance trends
    const performanceTrends = calculatePerformanceTrends(testAttempts, interviews);

    res.json({
      success: true,
      data: {
        stats,
        streak: {
          current: streak?.currentStreak || 0,
          longest: streak?.longestStreak || 0,
          totalDays: streak?.totalDaysActive || 0
        },
        weeklyProgress,
        recentActivity,
        achievements: achievements.slice(0, 5),
        performanceTrends,
        featureProgress: {
          resume: user.stats?.resumeScore || 0,
          interview: calculateFeatureProgress(interviews.length, 10),
          tests: calculateFeatureProgress(testAttempts.length, 20),

          companyPrep: 0, // TODO: Implement when company prep is ready
          aiMentor: 0 // TODO: Implement when AI mentor is ready
        }
      }
    });
  } catch (error) {
    console.error('Dashboard analytics error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch analytics' });
  }
};

// Get leaderboard
export const getLeaderboard = async (req, res) => {
  try {
    const { period = 'week', limit = 50 } = req.query;
    const userId = req.user.id;

    const now = new Date();
    let startDate = new Date();
    
    switch(period) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'all':
        startDate = new Date(0);
        break;
    }

    // Get all users with their activities
    const users = await User.find({ role: 'student' })
      .select('name email profile.college stats')
      .lean();

    // Calculate scores for each user
    const leaderboardData = await Promise.all(
      users.map(async (user) => {
        const [testAttempts, interviews, activities] = await Promise.all([
          TestAttempt.find({ userId: user._id, createdAt: { $gte: startDate } }),
          Interview.find({ userId: user._id, createdAt: { $gte: startDate } }),
          UserActivity.find({ userId: user._id, date: { $gte: startDate } })
        ]);

        const totalPoints = activities.reduce((sum, act) => sum + (act.points || 0), 0);
        const avgTestScore = testAttempts.length > 0
          ? testAttempts.reduce((sum, t) => sum + t.percentage, 0) / testAttempts.length
          : 0;
        const avgInterviewScore = interviews.length > 0
          ? interviews.reduce((sum, i) => sum + i.overallScore, 0) / interviews.length
          : 0;

        return {
          userId: user._id,
          name: user.name,
          college: user.profile?.college,
          totalPoints,
          testsCompleted: testAttempts.length,
          interviewsCompleted: interviews.length,
          avgTestScore: Math.round(avgTestScore),
          avgInterviewScore: Math.round(avgInterviewScore),
          overallScore: Math.round((avgTestScore + avgInterviewScore) / 2),
          isCurrentUser: user._id.toString() === userId
        };
      })
    );

    // Sort by total points
    leaderboardData.sort((a, b) => b.totalPoints - a.totalPoints);

    // Add ranks
    leaderboardData.forEach((user, index) => {
      user.rank = index + 1;
    });

    // Find current user's position
    const currentUserRank = leaderboardData.find(u => u.isCurrentUser);

    res.json({
      success: true,
      data: {
        leaderboard: leaderboardData.slice(0, parseInt(limit)),
        currentUser: currentUserRank,
        totalParticipants: leaderboardData.length
      }
    });
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch leaderboard' });
  }
};

// Get detailed performance report
export const getPerformanceReport = async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const [user, testAttempts, interviews, activities, streak, achievements] = await Promise.all([
      User.findById(userId),
      TestAttempt.find({ 
        userId, 
        createdAt: { $gte: start, $lte: end } 
      }).populate('testId'),
      Interview.find({ 
        userId, 
        createdAt: { $gte: start, $lte: end } 
      }),
      UserActivity.find({ 
        userId, 
        date: { $gte: start, $lte: end } 
      }),
      UserStreak.findOne({ userId }),
      Achievement.find({ userId })
    ]);

    // Detailed test analysis
    const testAnalysis = analyzeTests(testAttempts);
    
    // Detailed interview analysis
    const interviewAnalysis = analyzeInterviews(interviews);
    
    // Time-based analysis
    const timeAnalysis = analyzeTimePatterns(activities);
    
    // Strengths and weaknesses
    const strengthsWeaknesses = identifyStrengthsWeaknesses(testAttempts, interviews);

    res.json({
      success: true,
      data: {
        user: {
          name: user.name,
          email: user.email,
          college: user.profile?.college,
          targetRole: user.profile?.targetRole
        },
        period: { start, end },
        summary: {
          totalTests: testAttempts.length,
          totalInterviews: interviews.length,
          totalActivities: activities.length,
          currentStreak: streak?.currentStreak || 0,
          totalAchievements: achievements.length
        },
        testAnalysis,
        interviewAnalysis,
        timeAnalysis,
        strengthsWeaknesses,
        achievements,
        recommendations: generateRecommendations(testAttempts, interviews, activities)
      }
    });
  } catch (error) {
    console.error('Performance report error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate report' });
  }
};

// Track user activity
export const trackActivity = async (req, res) => {
  try {
    const userId = req.user.id;
    const { activityType, activityDetails, duration } = req.body;

    // Calculate points based on activity type
    const points = calculateActivityPoints(activityType, activityDetails);

    // Create activity record
    const activity = await UserActivity.create({
      userId,
      date: new Date(),
      activityType,
      activityDetails,
      points,
      duration
    });

    // Update streak
    let streak = await UserStreak.findOne({ userId });
    if (!streak) {
      streak = await UserStreak.create({ userId });
    }
    streak.updateStreak();
    await streak.save();

    // Check for achievements
    await checkAndAwardAchievements(userId, activityType);

    res.json({
      success: true,
      data: {
        activity,
        streak: {
          current: streak.currentStreak,
          longest: streak.longestStreak
        }
      }
    });
  } catch (error) {
    console.error('Track activity error:', error);
    res.status(500).json({ success: false, message: 'Failed to track activity' });
  }
};

// Helper functions
function calculateReadinessScore(user, tests, interviews) {
  const resumeScore = user.stats?.resumeScore || 0;
  const avgTestScore = tests.length > 0
    ? tests.reduce((sum, t) => sum + t.percentage, 0) / tests.length
    : 0;
  const avgInterviewScore = interviews.length > 0
    ? interviews.reduce((sum, i) => sum + i.overallScore, 0) / interviews.length
    : 0;

  // Weighted average
  return Math.round((resumeScore * 0.3 + avgTestScore * 0.4 + avgInterviewScore * 0.3));
}

function calculateWeeklyProgress(activities) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const progress = Array(7).fill(0);
  const counts = Array(7).fill(0);

  activities.forEach(activity => {
    const dayIndex = new Date(activity.date).getDay();
    progress[dayIndex] += activity.points || 0;
    counts[dayIndex]++;
  });

  return days.map((day, index) => ({
    day,
    value: counts[index] > 0 ? Math.min(100, Math.round(progress[index] / counts[index] * 10)) : 0
  }));
}

function calculatePerformanceTrends(tests, interviews) {
  const testTrend = tests.length >= 2
    ? tests[tests.length - 1].percentage - tests[0].percentage
    : 0;
  const interviewTrend = interviews.length >= 2
    ? interviews[interviews.length - 1].overallScore - interviews[0].overallScore
    : 0;

  return {
    tests: { trend: testTrend > 0 ? 'up' : testTrend < 0 ? 'down' : 'stable', value: Math.abs(testTrend) },
    interviews: { trend: interviewTrend > 0 ? 'up' : interviewTrend < 0 ? 'down' : 'stable', value: Math.abs(interviewTrend) }
  };
}

function calculateFeatureProgress(completed, target) {
  return Math.min(100, Math.round((completed / target) * 100));
}

function calculateActivityPoints(activityType, details) {
  const pointsMap = {
    login: 5,
    test: details?.score ? Math.round(details.score / 10) : 10,
    interview: details?.score ? Math.round(details.score / 10) : 15,
    resume: 20,

    'company-prep': 10,
    'ai-mentor': 5
  };
  return pointsMap[activityType] || 5;
}

function analyzeTests(testAttempts) {
  if (testAttempts.length === 0) {
    return { avgScore: 0, totalTests: 0, passRate: 0, categoryBreakdown: {} };
  }

  const avgScore = testAttempts.reduce((sum, t) => sum + t.percentage, 0) / testAttempts.length;
  const passed = testAttempts.filter(t => t.passed).length;
  const passRate = (passed / testAttempts.length) * 100;

  // Category breakdown
  const categoryBreakdown = {};
  testAttempts.forEach(test => {
    const category = test.testId?.category || 'Unknown';
    if (!categoryBreakdown[category]) {
      categoryBreakdown[category] = { count: 0, totalScore: 0 };
    }
    categoryBreakdown[category].count++;
    categoryBreakdown[category].totalScore += test.percentage;
  });

  Object.keys(categoryBreakdown).forEach(category => {
    categoryBreakdown[category].avgScore = Math.round(
      categoryBreakdown[category].totalScore / categoryBreakdown[category].count
    );
  });

  return {
    avgScore: Math.round(avgScore),
    totalTests: testAttempts.length,
    passRate: Math.round(passRate),
    categoryBreakdown
  };
}

function analyzeInterviews(interviews) {
  if (interviews.length === 0) {
    return { avgScore: 0, totalInterviews: 0, typeBreakdown: {} };
  }

  const avgScore = interviews.reduce((sum, i) => sum + i.overallScore, 0) / interviews.length;

  // Type breakdown
  const typeBreakdown = {};
  interviews.forEach(interview => {
    const type = interview.type;
    if (!typeBreakdown[type]) {
      typeBreakdown[type] = { count: 0, totalScore: 0 };
    }
    typeBreakdown[type].count++;
    typeBreakdown[type].totalScore += interview.overallScore;
  });

  Object.keys(typeBreakdown).forEach(type => {
    typeBreakdown[type].avgScore = Math.round(
      typeBreakdown[type].totalScore / typeBreakdown[type].count
    );
  });

  return {
    avgScore: Math.round(avgScore),
    totalInterviews: interviews.length,
    typeBreakdown
  };
}

function analyzeTimePatterns(activities) {
  const hourCounts = Array(24).fill(0);
  const dayCounts = Array(7).fill(0);

  activities.forEach(activity => {
    const date = new Date(activity.date);
    hourCounts[date.getHours()]++;
    dayCounts[date.getDay()]++;
  });

  const peakHour = hourCounts.indexOf(Math.max(...hourCounts));
  const peakDay = dayCounts.indexOf(Math.max(...dayCounts));
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return {
    peakHour: `${peakHour}:00`,
    peakDay: days[peakDay],
    totalActivities: activities.length
  };
}

function identifyStrengthsWeaknesses(tests, interviews) {
  const strengths = [];
  const weaknesses = [];

  // Analyze test performance
  if (tests.length > 0) {
    const avgTestScore = tests.reduce((sum, t) => sum + t.percentage, 0) / tests.length;
    if (avgTestScore >= 80) {
      strengths.push('Excellent test performance');
    } else if (avgTestScore < 60) {
      weaknesses.push('Test scores need improvement');
    }
  }

  // Analyze interview performance
  if (interviews.length > 0) {
    const avgInterviewScore = interviews.reduce((sum, i) => sum + i.overallScore, 0) / interviews.length;
    if (avgInterviewScore >= 80) {
      strengths.push('Strong interview skills');
    } else if (avgInterviewScore < 60) {
      weaknesses.push('Interview skills need practice');
    }
  }

  return { strengths, weaknesses };
}

function generateRecommendations(tests, interviews, activities) {
  const recommendations = [];

  if (tests.length < 5) {
    recommendations.push('Take more practice tests to improve your skills');
  }

  if (interviews.length < 3) {
    recommendations.push('Practice more mock interviews to build confidence');
  }

  if (activities.length < 10) {
    recommendations.push('Increase your daily activity to maintain momentum');
  }

  const avgTestScore = tests.length > 0
    ? tests.reduce((sum, t) => sum + t.percentage, 0) / tests.length
    : 0;

  if (avgTestScore < 70) {
    recommendations.push('Focus on weak areas identified in test results');
  }

  return recommendations;
}

// Get skill assessment
export const getSkillAssessment = async (req, res) => {
  try {
    const userId = req.user.id;

    const [testAttempts, interviews] = await Promise.all([
      TestAttempt.find({ userId }).populate('testId'),
      Interview.find({ userId })
    ]);

    // Calculate skill scores based on performance
    const skills = {
      'Technical Knowledge': calculateSkillScore(testAttempts, 'technical'),
      'Problem Solving': calculateSkillScore(testAttempts, 'logical'),
      'Communication': calculateInterviewSkillScore(interviews, 'communication'),
      'Leadership': calculateInterviewSkillScore(interviews, 'leadership'),
      'Analytical Thinking': calculateSkillScore(testAttempts, 'analytical'),
      'Time Management': calculateTimeManagementScore(testAttempts, interviews)
    };

    // Generate recommendations
    const recommendations = generateSkillRecommendations(skills);

    res.json({
      success: true,
      data: {
        skills,
        recommendations,
        lastUpdated: new Date()
      }
    });
  } catch (error) {
    console.error('Skill assessment error:', error);
    res.status(500).json({ success: false, message: 'Failed to get skill assessment' });
  }
};

// Get learning patterns
export const getLearningPatterns = async (req, res) => {
  try {
    const userId = req.user.id;

    const activities = await UserActivity.find({ userId }).sort({ date: -1 });

    if (activities.length === 0) {
      return res.json({
        success: true,
        data: {
          peakTime: 'Morning (9-11 AM)',
          avgSessionTime: 0,
          mostActiveDay: 'Monday',
          retentionRate: 0,
          learningVelocity: 'Low',
          consistencyScore: 0
        }
      });
    }

    const patterns = analyzeLearningPatterns(activities);

    res.json({
      success: true,
      data: patterns
    });
  } catch (error) {
    console.error('Learning patterns error:', error);
    res.status(500).json({ success: false, message: 'Failed to get learning patterns' });
  }
};

// Get progress trends
export const getProgressTrends = async (req, res) => {
  try {
    const userId = req.user.id;
    const { period = 'month' } = req.query;

    const now = new Date();
    let startDate = new Date();
    
    switch(period) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    const activities = await UserActivity.find({
      userId,
      date: { $gte: startDate }
    }).sort({ date: 1 });

    const trends = calculateProgressTrends(activities, period);

    res.json({
      success: true,
      data: { trends }
    });
  } catch (error) {
    console.error('Progress trends error:', error);
    res.status(500).json({ success: false, message: 'Failed to get progress trends' });
  }
};

// Export data
export const exportData = async (req, res) => {
  try {
    const userId = req.user.id;
    const { format = 'json', dateRange = {} } = req.body;

    const startDate = dateRange.startDate ? new Date(dateRange.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = dateRange.endDate ? new Date(dateRange.endDate) : new Date();

    const [user, testAttempts, interviews, activities] = await Promise.all([
      User.findById(userId).select('-password'),
      TestAttempt.find({ userId, createdAt: { $gte: startDate, $lte: endDate } }).populate('testId'),
      Interview.find({ userId, createdAt: { $gte: startDate, $lte: endDate } }),
      UserActivity.find({ userId, date: { $gte: startDate, $lte: endDate } })
    ]);

    const exportData = {
      user: {
        name: user.name,
        email: user.email,
        profile: user.profile
      },
      period: { startDate, endDate },
      summary: {
        totalTests: testAttempts.length,
        totalInterviews: interviews.length,
        totalActivities: activities.length
      },
      testAttempts: testAttempts.map(t => ({
        testName: t.testId?.title,
        category: t.testId?.category,
        score: t.percentage,
        passed: t.passed,
        date: t.createdAt
      })),
      interviews: interviews.map(i => ({
        type: i.type,
        overallScore: i.overallScore,
        date: i.createdAt
      })),
      activities: activities.map(a => ({
        type: a.activityType,
        points: a.points,
        date: a.date
      }))
    };

    if (format === 'json') {
      res.json({
        success: true,
        data: exportData
      });
    } else {
      // For PDF/other formats, return the data and let frontend handle it
      res.json({
        success: true,
        data: exportData,
        format
      });
    }
  } catch (error) {
    console.error('Export data error:', error);
    res.status(500).json({ success: false, message: 'Failed to export data' });
  }
};

// Helper functions for new endpoints
function calculateSkillScore(testAttempts, category) {
  const categoryTests = testAttempts.filter(t => 
    t.testId?.category?.toLowerCase().includes(category.toLowerCase())
  );
  
  if (categoryTests.length === 0) return 0;
  
  const avgScore = categoryTests.reduce((sum, t) => sum + t.percentage, 0) / categoryTests.length;
  return Math.round(avgScore);
}

function calculateInterviewSkillScore(interviews, skillType) {
  if (interviews.length === 0) return 0;
  
  // For now, use overall score as proxy for specific skills
  const avgScore = interviews.reduce((sum, i) => sum + i.overallScore, 0) / interviews.length;
  return Math.round(avgScore);
}

function calculateTimeManagementScore(testAttempts, interviews) {
  // Calculate based on completion rates and time efficiency
  const totalAttempts = testAttempts.length + interviews.length;
  if (totalAttempts === 0) return 0;
  
  const completedOnTime = testAttempts.filter(t => t.passed).length + interviews.length;
  return Math.round((completedOnTime / totalAttempts) * 100);
}

function generateSkillRecommendations(skills) {
  const recommendations = [];
  
  Object.entries(skills).forEach(([skill, score]) => {
    if (score < 60) {
      recommendations.push(`Focus on improving ${skill} through targeted practice`);
    } else if (score > 85) {
      recommendations.push(`Excellent ${skill} - maintain this strength`);
    }
  });
  
  if (recommendations.length === 0) {
    recommendations.push('Continue practicing to maintain your current skill levels');
  }
  
  return recommendations;
}

function analyzeLearningPatterns(activities) {
  const hourCounts = Array(24).fill(0);
  const dayCounts = Array(7).fill(0);
  const sessionTimes = [];
  
  activities.forEach(activity => {
    const date = new Date(activity.date);
    hourCounts[date.getHours()]++;
    dayCounts[date.getDay()]++;
    if (activity.duration) {
      sessionTimes.push(activity.duration);
    }
  });
  
  const peakHour = hourCounts.indexOf(Math.max(...hourCounts));
  const peakDay = dayCounts.indexOf(Math.max(...dayCounts));
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  const avgSessionTime = sessionTimes.length > 0
    ? sessionTimes.reduce((sum, time) => sum + time, 0) / sessionTimes.length
    : 0;
  
  // Calculate consistency score based on activity distribution
  const consistencyScore = calculateConsistencyScore(activities);
  
  return {
    peakTime: `${peakHour}:00 - ${peakHour + 1}:00`,
    avgSessionTime: Math.round(avgSessionTime),
    mostActiveDay: days[peakDay],
    retentionRate: 85, // Placeholder - would need more complex calculation
    learningVelocity: activities.length > 20 ? 'High' : activities.length > 10 ? 'Medium' : 'Low',
    consistencyScore
  };
}

function calculateConsistencyScore(activities) {
  if (activities.length < 7) return 0;
  
  // Group activities by day
  const dailyActivity = {};
  activities.forEach(activity => {
    const day = activity.date.toDateString();
    dailyActivity[day] = (dailyActivity[day] || 0) + 1;
  });
  
  const activeDays = Object.keys(dailyActivity).length;
  const totalDays = Math.ceil((new Date() - new Date(activities[activities.length - 1].date)) / (1000 * 60 * 60 * 24));
  
  return Math.round((activeDays / Math.min(totalDays, 30)) * 100);
}

function calculateProgressTrends(activities, period) {
  const trends = [];
  const groupBy = period === 'week' ? 'day' : period === 'month' ? 'week' : 'month';
  
  // Group activities by time period
  const grouped = {};
  activities.forEach(activity => {
    let key;
    const date = new Date(activity.date);
    
    if (groupBy === 'day') {
      key = date.toDateString();
    } else if (groupBy === 'week') {
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      key = weekStart.toDateString();
    } else {
      key = `${date.getFullYear()}-${date.getMonth()}`;
    }
    
    if (!grouped[key]) {
      grouped[key] = { date: key, score: 0, count: 0 };
    }
    grouped[key].score += activity.points || 0;
    grouped[key].count++;
  });
  
  // Convert to array and calculate averages
  Object.values(grouped).forEach(group => {
    trends.push({
      date: group.date,
      score: group.count > 0 ? Math.round(group.score / group.count) : 0
    });
  });
  
  return trends.sort((a, b) => new Date(a.date) - new Date(b.date));
}

async function checkAndAwardAchievements(userId, activityType) {
  try {
    const achievements = [];

    // Check for first-time achievements
    if (activityType === 'test') {
      const testCount = await TestAttempt.countDocuments({ userId });
      if (testCount === 1) {
        achievements.push({ type: 'first-test', title: 'First Test', description: 'Completed your first test' });
      } else if (testCount === 10) {
        achievements.push({ type: 'tests-10', title: 'Test Taker', description: 'Completed 10 tests' });
      } else if (testCount === 50) {
        achievements.push({ type: 'tests-50', title: 'Test Master', description: 'Completed 50 tests' });
      }
    }

    if (activityType === 'interview') {
      const interviewCount = await Interview.countDocuments({ userId });
      if (interviewCount === 1) {
        achievements.push({ type: 'first-interview', title: 'First Interview', description: 'Completed your first interview' });
      } else if (interviewCount === 10) {
        achievements.push({ type: 'interviews-10', title: 'Interview Pro', description: 'Completed 10 interviews' });
      }
    }

    // Check streak achievements
    const streak = await UserStreak.findOne({ userId });
    if (streak) {
      if (streak.currentStreak === 7) {
        achievements.push({ type: 'streak-7', title: 'Week Warrior', description: '7-day streak' });
      } else if (streak.currentStreak === 30) {
        achievements.push({ type: 'streak-30', title: 'Month Master', description: '30-day streak' });
      }
    }

    // Award achievements
    for (const ach of achievements) {
      try {
        await Achievement.create({
          userId,
          achievementType: ach.type,
          title: ach.title,
          description: ach.description,
          icon: ach.type
        });
      } catch (error) {
        // Ignore duplicate key errors
        if (error.code !== 11000) {
          console.error('Achievement award error:', error);
        }
      }
    }
  } catch (error) {
    console.error('Check achievements error:', error);
  }
}
