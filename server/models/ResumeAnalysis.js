import mongoose from 'mongoose';

const ResumeAnalysisSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  fileSize: Number,
  
  // Extracted Content
  extractedText: String,
  
  // Analysis Results
  atsScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  
  // Detailed Scores
  scores: {
    contactInfo: { type: Number, default: 0 },
    formatting: { type: Number, default: 0 },
    keywords: { type: Number, default: 0 },
    experience: { type: Number, default: 0 },
    education: { type: Number, default: 0 },
    skills: { type: Number, default: 0 },
    length: { type: Number, default: 0 }
  },
  
  // Detected Sections
  detectedSections: {
    hasContactInfo: { type: Boolean, default: false },
    hasEmail: { type: Boolean, default: false },
    hasPhone: { type: Boolean, default: false },
    hasSummary: { type: Boolean, default: false },
    hasExperience: { type: Boolean, default: false },
    hasEducation: { type: Boolean, default: false },
    hasSkills: { type: Boolean, default: false },
    hasProjects: { type: Boolean, default: false },
    hasCertifications: { type: Boolean, default: false }
  },
  
  // Extracted Data
  extractedData: {
    email: String,
    phone: String,
    name: String,
    skills: [String],
    keywords: [String],
    experienceYears: Number,
    educationLevel: String
  },
  
  // Analysis
  strengths: [String],
  weaknesses: [String],
  suggestions: [String],
  missingKeywords: [String],
  
  // Formatting Issues
  formattingIssues: [String],
  
  // Word Count
  wordCount: Number,
  
  // ATS Compatibility
  atsCompatible: {
    type: Boolean,
    default: true
  },
  
  atsIssues: [String]
}, {
  timestamps: true
});

// Calculate overall ATS score
ResumeAnalysisSchema.methods.calculateATSScore = function() {
  const weights = {
    contactInfo: 15,
    formatting: 15,
    keywords: 20,
    experience: 20,
    education: 10,
    skills: 15,
    length: 5
  };
  
  let totalScore = 0;
  Object.keys(weights).forEach(key => {
    totalScore += (this.scores[key] / 100) * weights[key];
  });
  
  this.atsScore = Math.round(totalScore);
  return this.atsScore;
};

export default mongoose.model('ResumeAnalysis', ResumeAnalysisSchema);
