const mongoose = require('mongoose');

const quizSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    topic: {
      type: String,
      required: true,
      trim: true,
    },
    questions: [
      {
        id: String,
        question: String,
        options: [String],
      },
    ],
    correctAnswers: {
      type: Map,
      of: String,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 3600,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('QuizSession', quizSessionSchema);
