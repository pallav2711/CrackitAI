import mongoose from 'mongoose';

const UserStreakSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  currentStreak: {
    type: Number,
    default: 0
  },
  longestStreak: {
    type: Number,
    default: 0
  },
  lastActivityDate: {
    type: Date
  },
  totalDaysActive: {
    type: Number,
    default: 0
  },
  streakHistory: [{
    startDate: Date,
    endDate: Date,
    days: Number
  }]
}, {
  timestamps: true
});

// Method to update streak
UserStreakSchema.methods.updateStreak = function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (!this.lastActivityDate) {
    // First activity
    this.currentStreak = 1;
    this.longestStreak = 1;
    this.totalDaysActive = 1;
    this.lastActivityDate = today;
    return this;
  }
  
  const lastActivity = new Date(this.lastActivityDate);
  lastActivity.setHours(0, 0, 0, 0);
  
  const daysDiff = Math.floor((today - lastActivity) / (1000 * 60 * 60 * 24));
  
  if (daysDiff === 0) {
    // Same day, no change
    return this;
  } else if (daysDiff === 1) {
    // Consecutive day
    this.currentStreak += 1;
    this.totalDaysActive += 1;
    if (this.currentStreak > this.longestStreak) {
      this.longestStreak = this.currentStreak;
    }
  } else {
    // Streak broken
    if (this.currentStreak > 0) {
      this.streakHistory.push({
        startDate: new Date(lastActivity.getTime() - (this.currentStreak - 1) * 24 * 60 * 60 * 1000),
        endDate: lastActivity,
        days: this.currentStreak
      });
    }
    this.currentStreak = 1;
    this.totalDaysActive += 1;
  }
  
  this.lastActivityDate = today;
  return this;
};

export default mongoose.model('UserStreak', UserStreakSchema);
