import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  options: {
    type: [String],
    required: true,
  },
  correctAnswer: {
    type: String,
    required: true,
  },
  userAnswer: {
    type: String,
  },
  isCorrect: {
    type: Boolean,
  },
  explanation: {
    type: String,
  },
}, { _id: true });

const assessmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  topic: {
    type: String,
    required: true,
  },
  questions: [questionSchema],
  score: {
    type: Number,
    min: 0,
    max: 100,
  },
  analysis: {
    type: String,
  },
  weaknesses: {
    type: [String],
    default: [],
  },
  completedAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

assessmentSchema.methods.calculateScore = function() {
  if (!this.questions || this.questions.length === 0) return 0;
  
  const correctAnswers = this.questions.filter(q => q.isCorrect).length;
  this.score = Math.round((correctAnswers / this.questions.length) * 100);
  return this.score;
};

export default mongoose.models.Assessment || mongoose.model('Assessment', assessmentSchema);
