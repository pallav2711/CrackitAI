import mongoose from 'mongoose';

const QuestionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['multiple-choice', 'coding', 'true-false'],
    default: 'multiple-choice'
  },
  options: [String],
  correctAnswer: {
    type: String,
    required: true
  },
  explanation: String,
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  points: {
    type: Number,
    default: 1
  },
  tags: [String]
});

const TestSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  category: {
    type: String,
    enum: ['aptitude', 'technical', 'logical', 'verbal', 'coding'],
    required: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  duration: {
    type: Number, // in minutes
    required: true
  },
  questions: [QuestionSchema],
  totalPoints: Number,
  passingScore: {
    type: Number,
    default: 60
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: String,
    default: 'system'
  },
  aiGenerated: {
    type: Boolean,
    default: false
  },
  isDynamic: {
    type: Boolean,
    default: false // Dynamic tests generate new questions each time
  },
  questionCount: {
    type: Number,
    default: 10 // For dynamic tests, how many questions to generate
  },
  topic: String
}, {
  timestamps: true
});

// Calculate total points before saving
TestSchema.pre('save', function(next) {
  this.totalPoints = this.questions.reduce((sum, q) => sum + q.points, 0);
  next();
});

export default mongoose.model('Test', TestSchema);
