import mongoose from 'mongoose';

const companyQuestionSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  
  // Question details
  question: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['Technical', 'Behavioral', 'Case Study', 'Coding', 'System Design', 'HR'],
    required: true
  },
  category: {
    type: String,
    enum: ['Data Structures', 'Algorithms', 'System Design', 'Database', 'Networking', 
           'Leadership', 'Teamwork', 'Problem Solving', 'Communication', 'Culture Fit', 'Other'],
    required: true
  },
  
  // Difficulty and metadata
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    required: true
  },
  estimatedTime: {
    type: Number, // in minutes
    default: 30
  },
  
  // For coding questions
  codeTemplate: {
    type: String
  },
  testCases: [{
    input: String,
    expectedOutput: String,
    explanation: String
  }],
  
  // For multiple choice questions
  options: [{
    text: String,
    isCorrect: Boolean
  }],
  
  // Answer and explanation
  answer: {
    type: String
  },
  explanation: {
    type: String
  },
  hints: [String],
  
  // Additional resources
  resources: [{
    title: String,
    url: String,
    type: {
      type: String,
      enum: ['Article', 'Video', 'Documentation', 'Tutorial', 'Book']
    }
  }],
  
  // Tags for better searchability
  tags: [String],
  
  // Statistics
  stats: {
    totalAttempts: {
      type: Number,
      default: 0
    },
    correctAttempts: {
      type: Number,
      default: 0
    },
    averageTime: {
      type: Number,
      default: 0
    },
    rating: {
      type: Number,
      default: 0
    },
    ratingCount: {
      type: Number,
      default: 0
    }
  },
  
  // Source information
  source: {
    type: String,
    enum: ['Interview Experience', 'Official', 'Community', 'Glassdoor', 'LeetCode', 'Other'],
    default: 'Community'
  },
  sourceUrl: String,
  
  // Verification
  isVerified: {
    type: Boolean,
    default: false
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Author information
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Interview round information
  interviewRound: {
    type: String,
    enum: ['Phone Screen', 'Technical Round 1', 'Technical Round 2', 'System Design', 
           'Behavioral', 'Final Round', 'HR Round', 'Other']
  },
  
  // Frequency (how often this question is asked)
  frequency: {
    type: String,
    enum: ['Very High', 'High', 'Medium', 'Low', 'Very Low'],
    default: 'Medium'
  }
}, {
  timestamps: true
});

// Indexes
companyQuestionSchema.index({ companyId: 1, type: 1 });
companyQuestionSchema.index({ difficulty: 1 });
companyQuestionSchema.index({ category: 1 });
companyQuestionSchema.index({ 'stats.rating': -1 });
companyQuestionSchema.index({ frequency: 1 });
companyQuestionSchema.index({ isActive: 1, isVerified: -1 });
companyQuestionSchema.index({ question: 'text', explanation: 'text' });

// Methods
companyQuestionSchema.methods.updateStats = function(isCorrect, timeSpent) {
  this.stats.totalAttempts += 1;
  if (isCorrect) {
    this.stats.correctAttempts += 1;
  }
  
  // Update average time
  const totalTime = this.stats.averageTime * (this.stats.totalAttempts - 1) + timeSpent;
  this.stats.averageTime = Math.round(totalTime / this.stats.totalAttempts);
  
  return this.save();
};

companyQuestionSchema.methods.addRating = function(rating) {
  const totalRating = this.stats.rating * this.stats.ratingCount + rating;
  this.stats.ratingCount += 1;
  this.stats.rating = Math.round((totalRating / this.stats.ratingCount) * 10) / 10;
  
  return this.save();
};

// Virtual for success rate
companyQuestionSchema.virtual('successRate').get(function() {
  if (this.stats.totalAttempts === 0) return 0;
  return Math.round((this.stats.correctAttempts / this.stats.totalAttempts) * 100);
});

export default mongoose.model('CompanyQuestion', companyQuestionSchema);