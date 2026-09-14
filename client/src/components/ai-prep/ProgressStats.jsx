import { motion } from 'framer-motion';
import {
  TrendingUp, Calendar, CheckCircle, Clock, Award, Target,
  BarChart3, Zap
} from 'lucide-react';

const ProgressStats = ({ plan }) => {
  const daysRemaining = Math.max(0, plan.duration - plan.completedDays);
  const progressPercentage = (plan.completedDays / plan.duration) * 100;
  const taskCompletionRate = plan.totalTasks > 0 ? (plan.completedTasks / plan.totalTasks) * 100 : 0;
  const onTrack = plan.completedDays >= (plan.currentDay - 1);

  // Calculate weekly progress
  const weeklyProgress = [];
  const weeksCount = Math.ceil(plan.duration / 7);
  for (let week = 1; week <= weeksCount; week++) {
    const weekStart = (week - 1) * 7 + 1;
    const weekEnd = Math.min(week * 7, plan.duration);
    const weekDays = plan.dailySchedule.filter(d => d.day >= weekStart && d.day <= weekEnd);
    const completedInWeek = weekDays.filter(d => d.completed).length;
    
    weeklyProgress.push({
      week,
      total: weekDays.length,
      completed: completedInWeek,
      percentage: (completedInWeek / weekDays.length) * 100
    });
  }

  // Study time stats
  const hoursStudied = Math.floor(plan.totalStudyTime / 60);
  const minutesStudied = plan.totalStudyTime % 60;
  const avgDailyTime = plan.completedDays > 0 ? Math.round(plan.totalStudyTime / plan.completedDays) : 0;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="nb-card-compat bg-nb-black text-white"
        >
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-nb-black">Overall Progress</h4>
            <TrendingUp className="w-5 h-5 text-nb-blue" />
          </div>
          <div className="text-3xl font-bold text-nb-blue mb-2">{plan.overallProgress}%</div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="h-full bg-nb-black text-white rounded-full transition-all"
              style={{ width: `${plan.overallProgress}%` }}
            />
          </div>
          <p className="text-sm text-nb-black/55 mt-2">
            {onTrack ? '✅ On track!' : '⚠️ Behind schedule'}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="nb-card-compat bg-nb-black text-white"
        >
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-nb-black">Study Time</h4>
            <Clock className="w-5 h-5 text-nb-blue" />
          </div>
          <div className="text-3xl font-bold text-nb-blue mb-2">
            {hoursStudied}h {minutesStudied}m
          </div>
          <p className="text-sm text-nb-black/55">
            Avg: {avgDailyTime} min/day
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="nb-card-compat bg-nb-black text-white"
        >
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-nb-black">Assessment Score</h4>
            <Award className="w-5 h-5 text-nb-green" />
          </div>
          <div className="text-3xl font-bold text-nb-green mb-2">{plan.averageScore || 0}%</div>
          <p className="text-sm text-nb-black/55">
            {plan.weeklyAssessments.filter(a => a.status === 'completed').length} / {plan.weeklyAssessments.length} completed
          </p>
        </motion.div>
      </div>

      {/* Detailed Stats */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Days Progress */}
        <div className="nb-card-compat">
          <h4 className="font-semibold text-nb-black mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-nb-blue" />
            Days Progress
          </h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-nb-black/55">Total Days</span>
              <span className="font-semibold text-nb-black">{plan.duration}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-nb-black/55">Completed</span>
              <span className="font-semibold text-nb-green">{plan.completedDays}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-nb-black/55">Remaining</span>
              <span className="font-semibold text-nb-blue">{daysRemaining}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-nb-black/55">Current Streak</span>
              <span className="font-semibold text-nb-black">{plan.studyStreak} days 🔥</span>
            </div>
          </div>
        </div>

        {/* Tasks Progress */}
        <div className="nb-card-compat">
          <h4 className="font-semibold text-nb-black mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-nb-green" />
            Tasks Progress
          </h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-nb-black/55">Total Tasks</span>
              <span className="font-semibold text-nb-black">{plan.totalTasks}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-nb-black/55">Completed</span>
              <span className="font-semibold text-nb-green">{plan.completedTasks}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-nb-black/55">Remaining</span>
              <span className="font-semibold text-nb-blue">{plan.totalTasks - plan.completedTasks}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-nb-black/55">Completion Rate</span>
              <span className="font-semibold text-nb-blue">{Math.round(taskCompletionRate)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Progress Chart */}
      <div className="nb-card-compat">
        <h4 className="font-semibold text-nb-black mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-nb-blue" />
          Weekly Progress
        </h4>
        <div className="space-y-3">
          {weeklyProgress.map((week) => (
            <div key={week.week}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-nb-black/75">Week {week.week}</span>
                <span className="text-sm text-nb-black/55">
                  {week.completed}/{week.total} days ({Math.round(week.percentage)}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-full bg-nb-black text-white rounded-full transition-all"
                  style={{ width: `${week.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Focus Areas */}
      <div className="nb-card-compat bg-nb-black text-white">
        <h4 className="font-semibold text-nb-black mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-nb-blue" />
          Focus Areas
        </h4>
        <div className="flex flex-wrap gap-2">
          {plan.focusAreas.map((area, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-white border-2 border-nb-blue/30 text-nb-blue rounded-full text-sm font-medium"
            >
              {area}
            </span>
          ))}
        </div>
      </div>

      {/* Motivational Message */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="nb-card-compat bg-nb-black text-white text-white text-center"
      >
        <Zap className="w-12 h-12 mx-auto mb-3" />
        <h4 className="text-xl font-bold mb-2">
          {plan.overallProgress >= 75 ? "You're almost there!" :
           plan.overallProgress >= 50 ? "Great progress!" :
           plan.overallProgress >= 25 ? "Keep going!" :
           "You've got this!"}
        </h4>
        <p className="text-nb-blue">
          {daysRemaining > 0 
            ? `${daysRemaining} days remaining until your interview. Stay focused!`
            : "You've completed your preparation plan! Time to ace that interview!"}
        </p>
      </motion.div>
    </div>
  );
};

export default ProgressStats;
