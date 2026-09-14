import mongoose from 'mongoose';

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  logo: {
    type: String, // URL or emoji
    default: '🏢'
  },
  description: {
    type: String,
    required: true
  },
  industry: {
    type: String,
    required: true,
    enum: ['Technology', 'Finance', 'Healthcare', 'Consulting', 'E-commerce', 'Automotive', 'Other']
  },
  headquarters: {
    type: String,
    required: true
  },
  founded: {
    type: Number
  },
  employees: {
    type: String // e.g., "10,000-50,000"
  },
  website: {
    type: String
  },
  
  // Preparation difficulty
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium'
  },
  
  // Interview process
  interviewProcess: [{
    round: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    duration: {
      type: String // e.g., "45 minutes"
    },
    type: {
      type: String,
      enum: ['Technical', 'HR', 'Managerial', 'Group Discussion', 'Case Study', 'Coding']
    }
  }],
  
  // Company culture and values
  culture: {
    values: [String],
    workEnvironment: String,
    benefits: [String],
    diversity: String
  },
  
  // Technical requirements
  techStack: [String],
  skillsRequired: [String],
  experienceLevel: {
    type: String,
    enum: ['Entry Level', 'Mid Level', 'Senior Level', 'All Levels'],
    default: 'All Levels'
  },
  
  // Statistics
  stats: {
    totalQuestions: {
      type: Number,
      default: 0
    },
    totalInterviews: {
      type: Number,
      default: 0
    },
    averageRating: {
      type: Number,
      default: 0
    },
    successRate: {
      type: Number,
      default: 0
    },
    popularityScore: {
      type: Number,
      default: 0
    }
  },
  
  // Content
  tips: [{
    category: {
      type: String,
      enum: ['Interview', 'Resume', 'Technical', 'Behavioral', 'General']
    },
    title: String,
    content: String,
    author: String,
    upvotes: {
      type: Number,
      default: 0
    }
  }],
  
  // Recent news and updates
  news: [{
    title: String,
    content: String,
    source: String,
    date: {
      type: Date,
      default: Date.now
    },
    category: {
      type: String,
      enum: ['Hiring', 'Product', 'Culture', 'Financial', 'Other']
    }
  }],
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  
  // SEO
  seoTitle: String,
  seoDescription: String,
  keywords: [String]
}, {
  timestamps: true
});

// Indexes
companySchema.index({ name: 'text', description: 'text' });
companySchema.index({ industry: 1 });
companySchema.index({ difficulty: 1 });
companySchema.index({ 'stats.popularityScore': -1 });
companySchema.index({ isActive: 1, isFeatured: -1 });

// Virtual for URL
companySchema.virtual('url').get(function() {
  return `/company-prep/${this.slug}`;
});

// Pre-save middleware to generate slug
companySchema.pre('save', function(next) {
  if (this.isModified('name') || this.isNew) {
    this.slug = this.name.toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
  next();
});

// Methods
companySchema.methods.updatePopularity = function() {
  // Calculate popularity based on various factors
  const questionWeight = this.stats.totalQuestions * 0.3;
  const interviewWeight = this.stats.totalInterviews * 0.4;
  const ratingWeight = this.stats.averageRating * 20;
  const successWeight = this.stats.successRate * 0.3;
  
  this.stats.popularityScore = Math.round(
    questionWeight + interviewWeight + ratingWeight + successWeight
  );
  
  return this.save();
};

export default mongoose.model('Company', companySchema);