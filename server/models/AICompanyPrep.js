import mongoose from 'mongoose';

const aiCompanyPrepSchema = new mongoose.Schema({
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
  
  // AI-Generated Preparation Plan
  preparationPlan: {
    duration: {
      type: Number, // in days (30, 60, 90)
      required: true,
      enum: [30, 60, 90]
    },
    startDate: {
      type: Date,
      required: true,
      default: Date.now
    },
    targetDate: {
      type: Date,
      required: true
    },
    difficulty: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      required: true
    },
    focusAreas: [{
      area: {
        type: String,
        enum: ['Technical Skills', 'System Design', 'Behavioral', 'Company Culture', 'Industry Knowledge', 'Coding Practice']
      },
      priority: {
        type: Number,
        min: 1,
        max: 5
      },
      timeAllocation: Number // percentage
    }],
    
    // AI-generated weekly breakdown
    weeklyPlan: [{
      week: Number,
      theme: String,
      objectives: [String],
      skills: [String],
      estimatedHours: Number
    }],
    
    // AI-generated daily schedule
    dailySchedule: [{
      day: Number, // day from start
      date: Date,
      tasks: [{
        type: {
          type: String,
          enum: ['Study', 'Practice', 'Mock Interview', 'Review', 'Assessment', 'Research']
        },
        title: String,
        description: String,
        estimatedTime: Number, // in minutes
        priority: {
          type: String,
          enum: ['High', 'Medium', 'Low']
        },
        resources: [String],
        completed: {
          type: Boolean,
          default: false
        },
        completedAt: Date,
        feedback: String
      }],
      totalEstimatedTime: Number,
      actualTimeSpent: Number,
      completed: {
        type: Boolean,
        default: false
      }
    }]
  },
  
  // AI-Generated Content
  aiContent: {
    // Company-specific insights
    companyInsights: {
      culture: String,
      values: [String],
      workStyle: String,
      interviewStyle: String,
      commonQuestions: [String],
      successTips: [String],
      redFlags: [String],
      recentNews: [String]
    },
    
    // Role-specific preparation
    rolePreparation: {
      targetRole: String,
      keySkills: [String],
      technicalRequirements: [String],
      experienceLevel: String,
      salaryRange: String,
      careerPath: [String]
    },
    
    // AI-generated questions and scenarios
    customQuestions: [{
      question: String,
      type: {
        type: String,
        enum: ['Technical', 'Behavioral', 'System Design', 'Case Study', 'Culture Fit']
      },
      difficulty: {
        type: String,
        enum: ['Easy', 'Medium', 'Hard']
      },
      category: String,
      aiGenerated: {
        type: Boolean,
        default: true
      },
      context: String, // Why this question is relevant
      sampleAnswer: String,
      evaluationCriteria: [String],
      followUpQuestions: [String]
    }],
    
    // Personalized study materials
    studyMaterials: [{
      title: String,
      type: {
        type: String,
        enum: ['Article', 'Video', 'Course', 'Book', 'Practice Problem', 'Mock Interview']
      },
      content: String,
      url: String,
      estimatedTime: Number,
      difficulty: String,
      relevanceScore: Number,
      aiRecommended: {
        type: Boolean,
        default: true
      }
    }]
  },
  
  // Progress Tracking
  progress: {
    overallProgress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    weeklyProgress: [{
      week: Number,
      progress: Number,
      tasksCompleted: Number,
      totalTasks: Number,
      timeSpent: Number,
      feedback: String
    }],
    skillProgress: [{
      skill: String,
      currentLevel: {
        type: Number,
        min: 0,
        max: 100
      },
      targetLevel: {
        type: Number,
        min: 0,
        max: 100
      },
      improvementRate: Number,
      lastAssessed: Date
    }],
    
    // Weekly assessments
    weeklyAssessments: [{
      week: Number,
      assessmentDate: Date,
      score: Number,
      feedback: String,
      strengths: [String],
      weaknesses: [String],
      recommendations: [String],
      nextWeekFocus: [String]
    }]
  },
  
  // AI Coaching and Feedback
  aiCoaching: {
    personalityProfile: {
      learningStyle: String,
      strengths: [String],
      weaknesses: [String],
      motivationFactors: [String],
      preferredStudyTime: String
    },
    
    adaptiveRecommendations: [{
      date: Date,
      type: {
        type: String,
        enum: ['Study Plan Adjustment', 'Resource Recommendation', 'Focus Area Change', 'Difficulty Adjustment']
      },
      recommendation: String,
      reasoning: String,
      implemented: {
        type: Boolean,
        default: false
      }
    }],
    
    motivationalMessages: [{
      date: Date,
      message: String,
      type: {
        type: String,
        enum: ['Encouragement', 'Milestone', 'Reminder', 'Challenge']
      }
    }]
  },
  
  // Calendar Integration
  calendar: {
    events: [{
      title: String,
      description: String,
      startTime: Date,
      endTime: Date,
      type: {
        type: String,
        enum: ['Study Session', 'Practice', 'Mock Interview', 'Assessment', 'Review']
      },
      reminder: {
        enabled: Boolean,
        time: Number // minutes before
      },
      completed: {
        type: Boolean,
        default: false
      }
    }],
    
    preferences: {
      studyHours: [{
        day: String,
        startTime: String,
        endTime: String
      }],
      timezone: String,
      reminderEnabled: {
        type: Boolean,
        default: true
      },
      syncWithExternalCalendar: {
        type: Boolean,
        default: false
      }
    }
  },
  
  // Analytics and Insights
  analytics: {
    studyPatterns: {
      mostProductiveTime: String,
      averageSessionLength: Number,
      consistencyScore: Number,
      preferredTopics: [String]
    },
    
    performanceMetrics: {
      accuracyTrend: [{
        date: Date,
        accuracy: Number
      }],
      speedImprovement: [{
        date: Date,
        averageTime: Number
      }],
      confidenceLevel: [{
        date: Date,
        confidence: Number
      }]
    },
    
    predictions: {
      readinessScore: Number,
      estimatedInterviewDate: Date,
      successProbability: Number,
      areasNeedingFocus: [String]
    }
  },
  
  // Status and Settings
  status: {
    type: String,
    enum: ['Active', 'Paused', 'Completed', 'Cancelled'],
    default: 'Active'
  },
  
  settings: {
    notifications: {
      dailyReminders: Boolean,
      weeklyReports: Boolean,
      milestoneAlerts: Boolean,
      adaptiveAdjustments: Boolean
    },
    
    preferences: {
      studyIntensity: {
        type: String,
        enum: ['Light', 'Moderate', 'Intensive'],
        default: 'Moderate'
      },
      focusMode: {
        type: String,
        enum: ['Balanced', 'Technical Heavy', 'Behavioral Heavy', 'Company Specific'],
        default: 'Balanced'
      }
    }
  }
}, {
  timestamps: true
});

// Indexes
aiCompanyPrepSchema.index({ userId: 1, companyId: 1 }, { unique: true });
aiCompanyPrepSchema.index({ 'preparationPlan.targetDate': 1 });
aiCompanyPrepSchema.index({ status: 1 });
aiCompanyPrepSchema.index({ 'progress.overallProgress': -1 });

// Methods
aiCompanyPrepSchema.methods.updateDailyProgress = function(day, taskId, completed, timeSpent, feedback) {
  const daySchedule = this.preparationPlan.dailySchedule.find(d => d.day === day);
  if (daySchedule) {
    const task = daySchedule.tasks.id(taskId);
    if (task) {
      task.completed = completed;
      task.completedAt = completed ? new Date() : null;
      task.feedback = feedback;
    }
    
    // Update day completion
    const completedTasks = daySchedule.tasks.filter(t => t.completed).length;
    daySchedule.completed = completedTasks === daySchedule.tasks.length;
    daySchedule.actualTimeSpent = (daySchedule.actualTimeSpent || 0) + timeSpent;
    
    // Update overall progress
    this.calculateOverallProgress();
  }
  
  return this.save();
};

aiCompanyPrepSchema.methods.calculateOverallProgress = function() {
  const totalDays = this.preparationPlan.dailySchedule.length;
  const completedDays = this.preparationPlan.dailySchedule.filter(d => d.completed).length;
  
  this.progress.overallProgress = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;
  
  return this;
};

aiCompanyPrepSchema.methods.addWeeklyAssessment = function(week, score, feedback, strengths, weaknesses) {
  this.progress.weeklyAssessments.push({
    week,
    assessmentDate: new Date(),
    score,
    feedback,
    strengths,
    weaknesses,
    recommendations: [], // Will be filled by AI
    nextWeekFocus: [] // Will be filled by AI
  });
  
  return this.save();
};

aiCompanyPrepSchema.methods.getUpcomingTasks = function(days = 7) {
  const today = new Date();
  const futureDate = new Date(today.getTime() + (days * 24 * 60 * 60 * 1000));
  
  return this.preparationPlan.dailySchedule
    .filter(day => {
      const dayDate = new Date(day.date);
      return dayDate >= today && dayDate <= futureDate && !day.completed;
    })
    .flatMap(day => 
      day.tasks
        .filter(task => !task.completed)
        .map(task => ({
          ...task.toObject(),
          day: day.day,
          date: day.date
        }))
    )
    .sort((a, b) => new Date(a.date) - new Date(b.date));
};

aiCompanyPrepSchema.methods.adaptPlan = function(feedback, performance) {
  // This method will be called by AI service to adapt the plan based on user performance
  // Implementation will be in the AI service
  return this;
};

export default mongoose.model('AICompanyPrep', aiCompanyPrepSchema);