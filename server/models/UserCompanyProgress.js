import mongoose from 'mongoose';

const userCompanyProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  
  // Overall progress
  overallProgress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  
  // Questions progress
  questionsProgress: {
    total: {
      type: Number,
      default: 0
    },
    attempted: {
      type: Number,
      default: 0
    },
    correct: {
      type: Number,
      default: 0
    },
    byCategory: [{
      category: String,
      total: Number,
      attempted: Number,
      correct: Number
    }],
    byDifficulty: [{
      difficulty: String,
      total: Number,
      attempted: Number,
      correct: Number
    }]
  },
  
  // Time tracking
  timeSpent: {
    total: {
      type: Number,
      default: 0 // in minutes
    },
    bySession: [{
      date: {
        type: Date,
        default: Date.now
      },
      duration: Number, // in minutes
      questionsAttempted: Number,
      questionsCorrect: Number
    }]
  },
  
  // Streak tracking
  streak: {
    current: {
      type: Number,
      default: 0
    },
    longest: {
      type: Number,
      default: 0
    },
    lastActivity: {
      type: Date,
      default: Date.now
    }
  },
  
  // Performance metrics
  performance: {
    averageScore: {
      type: Number,
      default: 0
    },
    averageTime: {
      type: Number,
      default: 0
    },
    strongAreas: [String],
    weakAreas: [String],
    improvementRate: {
      type: Number,
      default: 0
    }
  },
  
  // Milestones and achievements
  milestones: [{
    type: {
      type: String,
      enum: ['First Question', '10 Questions', '50 Questions', '100 Questions', 
             'Perfect Score', 'Week Streak', 'Month Streak', 'Category Master']
    },
    achievedAt: {
      type: Date,
      default: Date.now
    },
    description: String
  }],
  
  // Study plan
  studyPlan: {
    isActive: {
      type: Boolean,
      default: false
    },
    targetDate: Date,
    dailyGoal: {
      type: Number,
      default: 5 // questions per day
    },
    weeklyGoal: {
      type: Number,
      default: 35
    },
    focusAreas: [String],
    schedule: [{
      day: {
        type: String,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
      },
      timeSlot: String,
      topics: [String]
    }]
  },
  
  // Bookmarks and notes
  bookmarkedQuestions: [{
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CompanyQuestion'
    },
    note: String,
    bookmarkedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Interview preparation status
  interviewPrep: {
    status: {
      type: String,
      enum: ['Not Started', 'In Progress', 'Ready', 'Completed'],
      default: 'Not Started'
    },
    targetRole: String,
    interviewDate: Date,
    preparationLevel: {
      technical: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
      },
      behavioral: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
      },
      systemDesign: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
      },
      culturefit: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
      }
    }
  },
  
  // Preferences
  preferences: {
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard', 'Mixed'],
      default: 'Mixed'
    },
    categories: [String],
    studyMode: {
      type: String,
      enum: ['Practice', 'Timed', 'Interview Simulation'],
      default: 'Practice'
    },
    reminderEnabled: {
      type: Boolean,
      default: true
    },
    reminderTime: {
      type: String,
      default: '09:00'
    }
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  lastAccessed: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound indexes
userCompanyProgressSchema.index({ userId: 1, companyId: 1 }, { unique: true });
userCompanyProgressSchema.index({ userId: 1, 'streak.current': -1 });
userCompanyProgressSchema.index({ userId: 1, overallProgress: -1 });

// Methods
userCompanyProgressSchema.methods.updateProgress = function() {
  const { attempted, total } = this.questionsProgress;
  this.overallProgress = total > 0 ? Math.round((attempted / total) * 100) : 0;
  
  // Update performance metrics
  if (attempted > 0) {
    this.performance.averageScore = Math.round(
      (this.questionsProgress.correct / attempted) * 100
    );
  }
  
  return this.save();
};

userCompanyProgressSchema.methods.updateStreak = function() {
  const now = new Date();
  const lastActivity = new Date(this.streak.lastActivity);
  const daysDiff = Math.floor((now - lastActivity) / (1000 * 60 * 60 * 24));
  
  if (daysDiff === 1) {
    // Consecutive day
    this.streak.current += 1;
    if (this.streak.current > this.streak.longest) {
      this.streak.longest = this.streak.current;
    }
  } else if (daysDiff > 1) {
    // Streak broken
    this.streak.current = 1;
  }
  // If daysDiff === 0, same day activity, don't change streak
  
  this.streak.lastActivity = now;
  return this.save();
};

userCompanyProgressSchema.methods.addMilestone = function(type, description) {
  // Check if milestone already exists
  const exists = this.milestones.some(m => m.type === type);
  if (!exists) {
    this.milestones.push({
      type,
      description,
      achievedAt: new Date()
    });
    return this.save();
  }
  return Promise.resolve(this);
};

userCompanyProgressSchema.methods.bookmarkQuestion = function(questionId, note = '') {
  // Check if already bookmarked
  const existingIndex = this.bookmarkedQuestions.findIndex(
    b => b.questionId.toString() === questionId.toString()
  );
  
  if (existingIndex === -1) {
    this.bookmarkedQuestions.push({
      questionId,
      note,
      bookmarkedAt: new Date()
    });
  } else {
    // Update note if provided
    if (note) {
      this.bookmarkedQuestions[existingIndex].note = note;
    }
  }
  
  return this.save();
};

userCompanyProgressSchema.methods.removeBookmark = function(questionId) {
  this.bookmarkedQuestions = this.bookmarkedQuestions.filter(
    b => b.questionId.toString() !== questionId.toString()
  );
  return this.save();
};

export default mongoose.model('UserCompanyProgress', userCompanyProgressSchema);