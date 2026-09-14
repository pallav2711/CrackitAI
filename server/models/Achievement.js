import mongoose from 'mongoose';

const AchievementSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  achievementType: {
    type: String,
    required: true,
    enum: [
      'first-test', 'first-interview', 'first-resume',
      'streak-7', 'streak-30', 'streak-100',
      'tests-10', 'tests-50', 'tests-100',
      'interviews-10', 'interviews-50',
      'perfect-score', 'top-performer',
      'early-bird', 'night-owl', 'weekend-warrior'
    ]
  },
  title: String,
  description: String,
  icon: String,
  earnedAt: {
    type: Date,
    default: Date.now
  },
  metadata: mongoose.Schema.Types.Mixed
}, {
  timestamps: true
});

// Compound index to prevent duplicate achievements
AchievementSchema.index({ userId: 1, achievementType: 1 }, { unique: true });

export default mongoose.model('Achievement', AchievementSchema);
