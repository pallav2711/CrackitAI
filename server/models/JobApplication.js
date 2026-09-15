import mongoose from 'mongoose';

const SkillImportanceSchema = new mongoose.Schema({
  skill: String,
  importance: { type: String, enum: ['critical', 'high', 'medium', 'low'] },
  why: String,
}, { _id: false });

const QuizQuestionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String }], // exactly 4 options
  correctAnswer: { type: Number, min: 0, max: 3 }, // index 0-3
  explanation: String,
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  category: { type: String, enum: ['technical', 'hr', 'roleSpecific', 'advanced'], default: 'technical' },
  relatedSkill: String,
  relatedJDRequirement: String,
}, { _id: false });

const UserAnswerSchema = new mongoose.Schema({
  questionIndex: Number,
  selectedOption: Number, // 0-3
  isCorrect: Boolean,
  answeredAt: { type: Date, default: Date.now },
}, { _id: false });

const JobApplicationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  company: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ['analyzing', 'ready', 'preparing', 'applied'],
    default: 'analyzing',
  },

  // ── Resume ────────────────────────────────────────────────────────────────
  resumeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resume',
  },
  resumeText: String,
  resumeFileName: String,
  parsedResume: {
    name: String,
    email: String,
    phone: String,
    summary: String,
    skills: [String],
    experience: [{
      title: String,
      company: String,
      duration: String,
      description: String,
      _id: false,
    }],
    education: [{
      degree: String,
      institution: String,
      year: String,
      _id: false,
    }],
    projects: [{
      name: String,
      description: String,
      tech: [String],
      _id: false,
    }],
    certifications: [String],
    keywords: [String],
  },

  // ── Job Description ───────────────────────────────────────────────────────
  jobDescription: {
    type: String,
  },
  parsedJD: {
    title: String,
    company: String,
    seniority: String,
    requiredSkills: [String],
    preferredSkills: [String],
    technologies: [String],
    responsibilities: [String],
    keywords: [String],
    experienceRequired: String,
    educationRequired: String,
  },

  // ── ATS Analysis ──────────────────────────────────────────────────────────
  atsScore: {
    type: Number,
    min: 0,
    max: 100,
    default: null,
  },
  atsBreakdown: {
    skillCoverage: Number,
    experienceRelevance: Number,
    educationMatch: Number,
    keywordAlignment: Number,
    projectRelevance: Number,
    seniorityMatch: Number,
    resumeStructure: Number,
  },
  atsStrongMatches: [String],
  atsMissingSkills: [String],
  atsWeakMatches: [String],
  atsRecommendations: [String],

  // ── Skill Gap ─────────────────────────────────────────────────────────────
  skillGap: {
    have: [SkillImportanceSchema],
    missing: [SkillImportanceSchema],
    improve: [SkillImportanceSchema],
    niceToHave: [SkillImportanceSchema],
  },

  // ── Tailored Resume ───────────────────────────────────────────────────────
  tailoredResume: {
    text: String,
    changes: [String],
    warnings: [String],
    generatedAt: Date,
  },

  // ── Cover Letter ──────────────────────────────────────────────────────────
  coverLetter: {
    text: String,
    generatedAt: Date,
  },

  // ── Quiz ─────────────────────────────────────────────────────────────────
  quiz: {
    questions: [QuizQuestionSchema],
    userAnswers: [UserAnswerSchema],
    score: Number,
    totalQuestions: Number,
    categoryScores: {
      technical: Number,
      hr: Number,
      roleSpecific: Number,
      advanced: Number,
    },
    weakAreas: [String],
    completedAt: Date,
  },

  // ── Preparation Plan ──────────────────────────────────────────────────────
  preparationPlan: {
    days: [{
      day: Number,
      topic: String,
      tasks: [String],
      resources: [String],
      _id: false,
    }],
    totalDays: Number,
    generatedAt: Date,
  },

  // ── Readiness Score ───────────────────────────────────────────────────────
  readinessScore: {
    type: Number,
    min: 0,
    max: 100,
    default: null,
  },
  readinessBreakdown: {
    atsMatch: Number,
    skillCoverage: Number,
    quizPerformance: Number,
    resumeTailored: Boolean,
    coverLetterDone: Boolean,
    prepPlanStarted: Boolean,
  },

}, { timestamps: true });

// Index for sorting by date per user
JobApplicationSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('JobApplication', JobApplicationSchema);
