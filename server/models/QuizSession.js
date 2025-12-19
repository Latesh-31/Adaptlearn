const mongoose = require('mongoose');

const quizSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  topic: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  questions: {
    type: [mongoose.Schema.Types.Mixed],
    required: true,
  },
  correctAnswers: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: { expireAfterSeconds: 3600 },
  },
});

quizSessionSchema.index({ userId: 1, topic: 1 });

module.exports = mongoose.model('QuizSession', quizSessionSchema);