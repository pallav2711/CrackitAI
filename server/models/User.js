import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['student', 'admin', 'college'],
    default: 'student'
  },
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'basic', 'pro', 'annual'],
      default: 'free'
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'cancelled'],
      default: 'active'
    },
    startDate: Date,
    endDate: Date,
    // Razorpay payment tracking
    razorpayOrderId: String,
    razorpayPaymentId: String,
    autoRenew: { type: Boolean, default: true },
    currentPeriodEnd: Date,
  },
  // Per-cycle and daily AI usage tracking (for hard-cap enforcement)
  usage: {
    interviewsUsedThisCycle: { type: Number, default: 0 },
    interviewCycleEnd: Date,
    dailyAICalls: { type: Number, default: 0 },
    dailyAICallsReset: Date,
  },
  // Leaderboard settings
  leaderboard: {
    optIn: { type: Boolean, default: false }, // privacy-first: off by default
    displayName: String,
    college: String,
    totalPoints: { type: Number, default: 0 },
    weeklyPoints: { type: Number, default: 0 },
    weeklyPointsReset: Date,
    pointsAwarded: { type: Number, default: 0 }, // voice-interview points only
  },
  profile: {
    phone: String,
    college: String,
    degree: String,
    graduationYear: Number,
    targetRole: String,
    skills: [String]
  },
  stats: {
    resumeScore: { type: Number, default: 0 },
    interviewsTaken: { type: Number, default: 0 },
    interviewsCompleted: { type: Number, default: 0 },
    testsCompleted: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    totalPoints: { type: Number, default: 0 },
    readinessScore: { type: Number, default: 0 }
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('User', userSchema);
