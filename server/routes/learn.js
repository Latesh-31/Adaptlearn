const express = require('express');
const { generateAssessment, evaluateAndPlan } = require('../controllers/learnController');
const { verifyAccessToken } = require('../utils/jwt');

const router = express.Router();

// All assessment routes require authentication
router.use(verifyAccessToken);

/**
 * POST /assessment/start
 * Initiates a new assessment for a given topic
 * Body: { topic: "Python" }
 * Response: { success: true, data: { sessionId, topic, questions, totalQuestions, timeLimit } }
 */
router.post('/assessment/start', generateAssessment);

/**
 * POST /assessment/submit
 * Submits user answers for evaluation and creates personalized roadmap
 * Body: { sessionId: "quiz_session_id", userAnswers: { questionId: selectedOptionIndex } }
 * Response: { success: true, data: { evaluation, performance, sessionId } }
 */
router.post('/assessment/submit', evaluateAndPlan);

module.exports = router;