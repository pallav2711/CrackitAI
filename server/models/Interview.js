import mongoose from 'mongoose';

const QuestionResponseSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  expectedKeywords: [String],
  userAnswer: String,
  audioUrl: String,
  videoUrl: String,
  duration: Number, // seconds
  score: Number, // 0-100
  feedback: String,
  strengths: [String],
  improvements: [String],
  
  // Enhanced AI Evaluation Fields
  scoreBreakdown: {
    relevance: Number,
    depth: Number,
    structure: Number,
    technicalAccuracy: Number,
    communication: Number
  },
  detailedAnalysis: {
    whatWorkedWell: String,
    whatNeedsWork: String,
    missedOpportunities: String
  },
  keywordAnalysis: {
    covered: [String],
    missing: [String],
    coverageScore: Number
  },
  exampleQuality: {
    hasExamples: Boolean,
    exampleRelevance: String,
    quantifiableResults: Boolean
  },
  structureAnalysis: {
    followsSTAR: Boolean,
    logicalFlow: Boolean,
    clarity: Number
  },
  nextLevelTips: [String],
  sampleImprovedAnswer: String,
  
  // Speech and Communication Analysis
  speechAnalysis: {
    clarityScore: Number,
    paceAnalysis: String,
    fillerWordCount: Number,
    confidenceLevel: Number,
    vocabularyRichness: Number,
    professionalTone: Number
  },
  communicationStrengths: [String],
  communicationImprovements: [String],
  speechTips: [String],
  practiceExercises: [String],
  
  // Video Presence Analysis (for video interviews)
  videoPresenceAnalysis: {
    eyeContactScore: Number,
    facialExpressionScore: Number,
    postureScore: Number,
    gestureNaturalness: Number,
    environmentProfessionalism: Number,
    overallPresence: Number
  },
  presenceStrengths: [String],
  presenceImprovements: [String],
  videoTips: [String],
  setupRecommendations: [String],
  
  answeredAt: {
    type: Date,
    default: Date.now
  }
});

const InterviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['hr', 'technical', 'behavioral', 'coding', 'system-design'],
    required: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  role: {
    type: String,
    required: true // e.g., "Software Engineer", "Data Scientist"
  },
  experience: {
    type: String,
    enum: ['fresher', 'junior', 'mid', 'senior'],
    default: 'fresher'
  },
  
  // Interview Configuration
  duration: Number, // total duration in minutes
  questionCount: {
    type: Number,
    default: 5
  },
  mode: {
    type: String,
    enum: ['text', 'voice', 'video'],
    default: 'text'
  },
  
  // Questions and Responses
  questions: [QuestionResponseSchema],
  
  // Status
  status: {
    type: String,
    enum: ['scheduled', 'in-progress', 'completed', 'abandoned'],
    default: 'scheduled'
  },
  
  // Timing
  startTime: Date,
  endTime: Date,
  actualDuration: Number, // actual time taken in seconds
  
  // Scoring
  overallScore: {
    type: Number,
    default: 0
  },
  communicationScore: Number,
  technicalScore: Number,
  confidenceScore: Number,
  clarityScore: Number,
  
  // AI Analysis
  overallFeedback: String,
  strengths: [String],
  areasForImprovement: [String],
  recommendations: [String],
  
  // Enhanced Overall Feedback
  overallAssessment: {
    summary: String,
    readinessLevel: String,
    marketCompetitiveness: String
  },
  performanceAnalysis: {
    consistencyScore: Number,
    communicationClarity: Number,
    technicalDepth: Number,
    exampleQuality: Number,
    confidenceLevel: Number
  },
  criticalImprovements: [String],
  roleSpecificAdvice: [String],
  experienceLevelGuidance: {
    currentLevel: String,
    nextLevelRequirements: String,
    timelineToImprovement: String
  },
  interviewStrategy: {
    preparationFocus: [String],
    practiceRecommendations: [String],
    resourceSuggestions: [String]
  },
  nextSteps: {
    immediate: [String],
    shortTerm: [String],
    longTerm: [String]
  },
  benchmarkComparison: {
    percentileRanking: String,
    competitiveAdvantages: [String],
    competitiveWeaknesses: [String]
  },
  motivationalMessage: String,
  recommendedNextInterview: String,
  
  // Comprehensive Analysis Results
  comprehensiveAnalysis: {
    speechAnalyses: mongoose.Schema.Types.Mixed,
    improvementRoadmap: {
      priorityLevel: String,
      estimatedTimeToImprovement: String,
      focusAreas: [{
        area: String,
        currentLevel: String,
        targetLevel: String,
        priority: String,
        timeframe: String,
        specificActions: [String],
        resources: [String],
        milestones: [String]
      }],
      weeklyPlan: mongoose.Schema.Types.Mixed,
      resourceLibrary: {
        books: [String],
        onlineCourses: [String],
        practiceWebsites: [String],
        youtubeChannels: [String]
      },
      mockInterviewPlan: {
        frequency: String,
        focusAreas: [String],
        progressionPlan: String,
        recordingAnalysis: String
      },
      successMetrics: [String],
      motivationalMessage: String,
      nextInterviewReadiness: String
    },
    benchmarkAnalysis: {
      industryPercentile: String,
      marketReadiness: String,
      competitiveAdvantages: [String],
      competitiveWeaknesses: [String],
      salaryNegotiationPosition: String,
      hiringProbability: String,
      topCompaniesReadiness: mongoose.Schema.Types.Mixed,
      marketInsights: mongoose.Schema.Types.Mixed,
      careerGuidance: mongoose.Schema.Types.Mixed
    },
    generatedAt: Date,
    analysisVersion: String
  },
  
  // Performance Metrics
  averageResponseTime: Number,
  fillerWordsCount: Number,
  speakingPace: String, // 'too-fast', 'optimal', 'too-slow'
  eyeContactScore: Number, // for video interviews
  
  // Metadata
  aiModel: {
    type: String,
    default: 'gpt-3.5-turbo'
  },
  aiGenerated: {
    type: Boolean,
    default: true // Questions generated by AI
  },
  aiEvaluated: {
    type: Boolean,
    default: true // Answers evaluated by AI
  },
  language: {
    type: String,
    default: 'en'
  },
  // Persisted voice session state (messages + transcript as JSON string)
  // Used to survive server restarts on Render free tier
  voiceSession: {
    type: String,
    default: null,
  },
}, {
  timestamps: true
});

// Calculate overall score
InterviewSchema.methods.calculateScore = function() {
  if (this.questions.length === 0) return 0;
  
  const totalScore = this.questions.reduce((sum, q) => sum + (q.score || 0), 0);
  this.overallScore = Math.round(totalScore / this.questions.length);
  
  // Calculate component scores
  const answeredQuestions = this.questions.filter(q => q.userAnswer);
  if (answeredQuestions.length > 0) {
    this.communicationScore = Math.round(
      answeredQuestions.reduce((sum, q) => sum + (q.score || 0), 0) / answeredQuestions.length
    );
  }
  
  return this.overallScore;
};

// Get performance level
InterviewSchema.methods.getPerformanceLevel = function() {
  const score = this.overallScore;
  if (score >= 90) return 'excellent';
  if (score >= 75) return 'good';
  if (score >= 60) return 'average';
  return 'needs-improvement';
};

// Calculate average response time
InterviewSchema.methods.calculateMetrics = function() {
  const answeredQuestions = this.questions.filter(q => q.userAnswer && q.duration);
  
  if (answeredQuestions.length > 0) {
    this.averageResponseTime = Math.round(
      answeredQuestions.reduce((sum, q) => sum + q.duration, 0) / answeredQuestions.length
    );
  }
  
  // Count filler words
  this.fillerWordsCount = 0;
  const fillerWords = ['um', 'uh', 'like', 'you know', 'basically', 'actually'];
  answeredQuestions.forEach(q => {
    if (q.userAnswer) {
      const text = q.userAnswer.toLowerCase();
      fillerWords.forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        const matches = text.match(regex);
        if (matches) this.fillerWordsCount += matches.length;
      });
    }
  });
};

export default mongoose.model('Interview', InterviewSchema);
