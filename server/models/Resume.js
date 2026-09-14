import mongoose from 'mongoose';

const ResumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    default: 'My Resume'
  },
  template: {
    type: String,
    enum: ['modern', 'classic', 'minimal', 'professional'],
    default: 'modern'
  },
  
  // Personal Information
  personalInfo: {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: String,
    location: String,
    linkedin: String,
    github: String,
    portfolio: String,
    summary: String
  },
  
  // Work Experience
  experience: [{
    company: { type: String, required: true },
    position: { type: String, required: true },
    location: String,
    startDate: { type: Date, required: true },
    endDate: Date,
    current: { type: Boolean, default: false },
    description: [String],
    achievements: [String]
  }],
  
  // Education
  education: [{
    institution: { type: String, required: true },
    degree: { type: String, required: true },
    field: String,
    location: String,
    startDate: Date,
    endDate: Date,
    gpa: String,
    achievements: [String]
  }],
  
  // Skills
  skills: {
    technical: [String],
    soft: [String],
    languages: [String],
    tools: [String]
  },
  
  // Projects
  projects: [{
    name: { type: String, required: true },
    description: String,
    technologies: [String],
    link: String,
    github: String,
    highlights: [String]
  }],
  
  // Certifications
  certifications: [{
    name: { type: String, required: true },
    issuer: String,
    date: Date,
    expiryDate: Date,
    credentialId: String,
    url: String
  }],
  
  // Additional Sections
  awards: [{
    title: String,
    issuer: String,
    date: Date,
    description: String
  }],
  
  publications: [{
    title: String,
    publisher: String,
    date: Date,
    url: String
  }],
  
  // ATS Optimization
  atsScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  
  keywords: [String],
  
  // Metadata
  isPublic: {
    type: Boolean,
    default: false
  },
  
  lastModified: {
    type: Date,
    default: Date.now
  },
  
  version: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true
});

// Update lastModified on save
ResumeSchema.pre('save', function(next) {
  this.lastModified = Date.now();
  next();
});

// Calculate ATS Score
ResumeSchema.methods.calculateATSScore = function() {
  let score = 0;
  
  // Personal Info (20 points)
  if (this.personalInfo.fullName) score += 5;
  if (this.personalInfo.email) score += 5;
  if (this.personalInfo.phone) score += 5;
  if (this.personalInfo.summary) score += 5;
  
  // Experience (30 points)
  if (this.experience.length > 0) score += 10;
  if (this.experience.length >= 2) score += 10;
  if (this.experience.some(exp => exp.achievements && exp.achievements.length > 0)) score += 10;
  
  // Education (15 points)
  if (this.education.length > 0) score += 15;
  
  // Skills (20 points)
  const totalSkills = (this.skills.technical?.length || 0) + 
                      (this.skills.soft?.length || 0) + 
                      (this.skills.tools?.length || 0);
  if (totalSkills >= 5) score += 10;
  if (totalSkills >= 10) score += 10;
  
  // Projects (10 points)
  if (this.projects.length > 0) score += 5;
  if (this.projects.length >= 2) score += 5;
  
  // Certifications (5 points)
  if (this.certifications.length > 0) score += 5;
  
  this.atsScore = Math.min(score, 100);
  return this.atsScore;
};

export default mongoose.model('Resume', ResumeSchema);
