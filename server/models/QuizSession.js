const mongoose = require('mongoose');

const quizSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    topic: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    questions: [{
      id: {
        type: String,
        required: true
      },
      question: {
        type: String,
        required: true
      },
      options: [{
        type: String,
        required: true
      }],
      answer: {
        type: Number, // Index of correct answer (0-based)
        required: true
      }
    }],
    userAnswers: {
      type: Map,
      of: Number // questionId -> selectedOptionIndex
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'expired'],
      default: 'pending',
      index: true
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 } // MongoDB TTL index
    }
  },
  { 
    timestamps: true,
    // Enable virtual fields
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Create TTL index to automatically delete expired sessions
quizSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Virtual to check if session is expired
quizSessionSchema.virtual('isExpired').get(function() {
  return new Date() > this.expiresAt;
});

// Method to mark session as completed
quizSessionSchema.methods.markCompleted = function() {
  this.status = 'completed';
  return this.save();
};

// Static method to create new assessment session
quizSessionSchema.statics.createAssessmentSession = function(userId, topic, questions) {
  // Set expiration to 1 hour from now
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 1);

  return this.create({
    userId,
    topic,
    questions,
    status: 'pending',
    expiresAt
  });
};

// Static method to cleanup expired sessions (for cron jobs)
quizSessionSchema.statics.cleanupExpired = function() {
  return this.deleteMany({
    status: 'pending',
    expiresAt: { $lt: new Date() }
  });
};

module.exports = mongoose.model('QuizSession', quizSessionSchema);