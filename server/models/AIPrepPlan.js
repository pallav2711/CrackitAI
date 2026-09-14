import mongoose from 'mongoose';

// Using Mixed type for flexibility - no validation on subdocuments
const dailyTaskSchema = new mongoose.Schema({
  day: Number,
  date: Date,
  title: String,
  description: String,
  tasks: [mongoose.Schema.Types.Mixed],
  totalDuration: Number,
  completed: { type: Boolean, default: false }
}, { _id: false, strict: false });

const weeklyAssessmentSchema = new mongoose.Schema({
  week: Number,
  title: String,
  description: String,
  questions: [mongoose.Schema.Types.Mixed],
  status: { type: String, default: 'pending' },
  score: Number,
  totalPoints: Number,
  completedAt: Date,
  feedback: String
}, { _id: false, strict: false });

const aiPrepPlanSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  companyName: { type: String, required: true },
  companyIndustry: String,
  companyLogo: String,
  
  // Plan Configuration
  targetRole: { type: String, required: true },
  experienceLevel: { type: String, enum: ['Entry Level', 'Mid Level', 'Senior Level'], required: true },
  duration: { type: Number, required: true }, // 30, 60, or 90 days
  focusAreas: [String],
  studyIntensity: { type: String, enum: ['Light', 'Moderate', 'Intensive'] },
  availableHours: Number,
  preferredTime: String,
  interviewDate: Date,
  
  // Schedule
  startDate: { type: Date, default: Date.now },
  endDate: Date,
  dailySchedule: [dailyTaskSchema],
  weeklyAssessments: [weeklyAssessmentSchema],
  
  // Progress Tracking
  status: { type: String, enum: ['Active', 'Paused', 'Completed', 'Abandoned'], default: 'Active' },
  currentDay: { type: Number, default: 1 },
  completedDays: { type: Number, default: 0 },
  completedTasks: { type: Number, default: 0 },
  totalTasks: { type: Number, default: 0 },
  overallProgress: { type: Number, default: 0 },
  
  // Analytics
  studyStreak: { type: Number, default: 0 },
  totalStudyTime: { type: Number, default: 0 }, // in minutes
  averageScore: { type: Number, default: 0 },
  lastActivityDate: Date,
  
  // AI Generated Content
  aiGeneratedContent: {
    companyInsights: String,
    interviewTips: [String],
    commonQuestions: [String],
    cultureFit: String,
    technicalFocus: [String]
  }
}, {
  timestamps: true
});

// Calculate end date
aiPrepPlanSchema.pre('save', function(next) {
  if (this.isNew || this.isModified('startDate') || this.isModified('duration')) {
    const start = new Date(this.startDate);
    this.endDate = new Date(start.getTime() + (this.duration * 24 * 60 * 60 * 1000));
  }
  next();
});

// Update progress
aiPrepPlanSchema.methods.updateProgress = function() {
  const completedTasks = this.dailySchedule.reduce((acc, day) => {
    return acc + day.tasks.filter(task => task.completed).length;
  }, 0);
  
  this.completedTasks = completedTasks;
  this.totalTasks = this.dailySchedule.reduce((acc, day) => acc + day.tasks.length, 0);
  this.overallProgress = this.totalTasks > 0 ? Math.round((completedTasks / this.totalTasks) * 100) : 0;
  this.completedDays = this.dailySchedule.filter(day => day.completed).length;
  
  // Calculate average score
  const completedAssessments = this.weeklyAssessments.filter(a => a.status === 'completed');
  if (completedAssessments.length > 0) {
    const totalScore = completedAssessments.reduce((acc, a) => acc + (a.score || 0), 0);
    this.averageScore = Math.round(totalScore / completedAssessments.length);
  }
};

const AIPrepPlan = mongoose.model('AIPrepPlan', aiPrepPlanSchema);
export default AIPrepPlan;
