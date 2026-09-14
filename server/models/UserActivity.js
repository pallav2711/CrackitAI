import mongoose from 'mongoose';

const UserActivitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  date: {
    type: Date,
    required: true,
    index: true
  },
  activityType: {
    type: String,
    enum: ['login', 'test', 'interview', 'resume', 'company-prep', 'ai-mentor'],
    required: true
  },
  activityDetails: {
    type: mongoose.Schema.Types.Mixed
  },
  points: {
    type: Number,
    default: 0
  },
  duration: Number // in seconds
}, {
  timestamps: true
});

// Compound index for efficient queries
UserActivitySchema.index({ userId: 1, date: -1 });
UserActivitySchema.index({ userId: 1, activityType: 1 });

export default mongoose.model('UserActivity', UserActivitySchema);
