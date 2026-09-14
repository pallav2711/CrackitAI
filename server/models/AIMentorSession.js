import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant', 'system'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  messageType: {
    type: String,
    enum: ['text', 'suggestion', 'task', 'emotional-support', 'career-advice', 'study-plan'],
    default: 'text'
  },
  metadata: {
    sentiment: String, // positive, negative, neutral
    confidence: Number,
    topics: [String],
    actionItems: [String],
    resources: [{
      title: String,
      url: String,
      type: String
    }]
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const AIMentorSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    default: 'New Conversation'
  },
  
  // Conversation Data
  messages: [MessageSchema],
  
  // Session Context
  context: {
    currentGoals: [String],
    recentActivities: [String],
    emotionalState: {
      type: String,
      enum: ['motivated', 'stressed', 'confident', 'anxious', 'excited', 'overwhelmed', 'neutral'],
      default: 'neutral'
    },
    focusAreas: [String],
    learningStyle: {
      type: String,
      enum: ['visual', 'auditory', 'kinesthetic', 'reading'],
      default: 'visual'
    }
  },
  
  // AI Insights
  insights: {
    personalityProfile: {
      traits: {
        type: [String],
        default: []
      },
      strengths: {
        type: [String],
        default: []
      },
      growthAreas: {
        type: [String],
        default: []
      }
    },
    careerRecommendations: {
      type: [String],
      default: []
    },
    studyRecommendations: {
      type: [String],
      default: []
    },
    wellnessRecommendations: {
      type: [String],
      default: []
    },
    progressTracking: {
      goalsCompleted: {
        type: Number,
        default: 0
      },
      tasksCompleted: {
        type: Number,
        default: 0
      },
      streakDays: {
        type: Number,
        default: 0
      },
      lastActiveDate: {
        type: Date,
        default: Date.now
      }
    }
  },
  
  // Session Metadata
  isActive: {
    type: Boolean,
    default: true
  },
  lastMessageAt: {
    type: Date,
    default: Date.now
  },
  totalMessages: {
    type: Number,
    default: 0
  },
  sessionDuration: Number, // in minutes
  
  // AI Model Info
  aiModel: {
    type: String,
    default: 'gpt-3.5-turbo'
  },
  systemPrompt: String
}, {
  timestamps: true
});

// Indexes for performance
AIMentorSessionSchema.index({ userId: 1, createdAt: -1 });
AIMentorSessionSchema.index({ sessionId: 1 });
AIMentorSessionSchema.index({ isActive: 1, lastMessageAt: -1 });

// Methods
AIMentorSessionSchema.methods.addMessage = function(role, content, messageType = 'text', metadata = {}) {
  this.messages.push({
    role,
    content,
    messageType,
    metadata,
    timestamp: new Date()
  });
  
  this.totalMessages = this.messages.length;
  this.lastMessageAt = new Date();
  
  // Auto-generate title from first user message
  if (this.messages.length === 2 && role === 'user' && this.title === 'New Conversation') {
    this.title = content.length > 50 ? content.substring(0, 50) + '...' : content;
  }
};

AIMentorSessionSchema.methods.updateContext = function(contextUpdates) {
  this.context = { ...this.context, ...contextUpdates };
};

AIMentorSessionSchema.methods.updateInsights = function(insights) {
  // Ensure insights object exists
  if (!this.insights) {
    this.insights = {
      personalityProfile: {
        traits: [],
        strengths: [],
        growthAreas: []
      },
      careerRecommendations: [],
      studyRecommendations: [],
      wellnessRecommendations: [],
      progressTracking: {
        goalsCompleted: 0,
        tasksCompleted: 0,
        streakDays: 0,
        lastActiveDate: new Date()
      }
    };
  }
  
  // Deep merge insights
  if (insights.personalityProfile) {
    this.insights.personalityProfile = {
      ...this.insights.personalityProfile,
      ...insights.personalityProfile
    };
  }
  
  if (insights.progressTracking) {
    this.insights.progressTracking = {
      ...this.insights.progressTracking,
      ...insights.progressTracking
    };
  }
  
  // Simple array merges
  if (insights.careerRecommendations) {
    this.insights.careerRecommendations = insights.careerRecommendations;
  }
  if (insights.studyRecommendations) {
    this.insights.studyRecommendations = insights.studyRecommendations;
  }
  if (insights.wellnessRecommendations) {
    this.insights.wellnessRecommendations = insights.wellnessRecommendations;
  }
};

AIMentorSessionSchema.methods.getRecentMessages = function(limit = 10) {
  return this.messages.slice(-limit);
};

AIMentorSessionSchema.methods.calculateSessionDuration = function() {
  if (this.messages.length < 2) return 0;
  
  const firstMessage = this.messages[0].timestamp;
  const lastMessage = this.messages[this.messages.length - 1].timestamp;
  
  this.sessionDuration = Math.round((lastMessage - firstMessage) / (1000 * 60));
  return this.sessionDuration;
};

export default mongoose.model('AIMentorSession', AIMentorSessionSchema);