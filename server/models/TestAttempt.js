import mongoose from 'mongoose';

const AnswerSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  userAnswer: String,
  isCorrect: Boolean,
  pointsEarned: Number,
  timeSpent: Number // in seconds
});

const TestAttemptSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  testId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Test',
    required: true
  },
  
  // For dynamic tests, store the generated questions
  dynamicQuestions: mongoose.Schema.Types.Mixed,
  
  answers: [AnswerSchema],
  
  // Scores
  score: {
    type: Number,
    default: 0
  },
  percentage: {
    type: Number,
    default: 0
  },
  totalPoints: Number,
  earnedPoints: Number,
  
  // Timing
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: Date,
  duration: Number, // actual time taken in seconds
  
  // Status
  status: {
    type: String,
    enum: ['in-progress', 'completed', 'abandoned'],
    default: 'in-progress'
  },
  
  // Results
  correctAnswers: Number,
  incorrectAnswers: Number,
  skippedAnswers: Number,
  
  // Performance
  rank: String, // 'excellent', 'good', 'average', 'needs-improvement'
  passed: Boolean
}, {
  timestamps: true
});

// Calculate results before saving
TestAttemptSchema.methods.calculateResults = function(test) {
  let correct = 0;
  let incorrect = 0;
  let skipped = 0;
  let earnedPoints = 0;
  let totalPoints = 0;
  
  // Use dynamic questions if available, otherwise use test questions
  const questions = this.dynamicQuestions && this.dynamicQuestions.length > 0 
    ? this.dynamicQuestions 
    : test.questions;
  
  this.answers.forEach((answer, index) => {
    // For dynamic questions, match by index; for regular tests, match by ID
    const question = this.dynamicQuestions && this.dynamicQuestions.length > 0
      ? questions[index]
      : test.questions.id(answer.questionId);
      
    if (!question) return;
    
    totalPoints += question.points || 1;
    
    if (!answer.userAnswer) {
      skipped++;
      answer.isCorrect = false;
      answer.pointsEarned = 0;
    } else if (answer.userAnswer === question.correctAnswer) {
      correct++;
      answer.isCorrect = true;
      answer.pointsEarned = question.points || 1;
      earnedPoints += question.points || 1;
    } else {
      incorrect++;
      answer.isCorrect = false;
      answer.pointsEarned = 0;
    }
  });
  
  this.correctAnswers = correct;
  this.incorrectAnswers = incorrect;
  this.skippedAnswers = skipped;
  this.earnedPoints = earnedPoints;
  this.totalPoints = totalPoints || test.totalPoints;
  this.percentage = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
  this.score = this.percentage;
  this.passed = this.percentage >= test.passingScore;
  
  // Determine rank
  if (this.percentage >= 90) this.rank = 'excellent';
  else if (this.percentage >= 75) this.rank = 'good';
  else if (this.percentage >= 60) this.rank = 'average';
  else this.rank = 'needs-improvement';
  
  return this;
};

export default mongoose.model('TestAttempt', TestAttemptSchema);
