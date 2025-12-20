const { GoogleGenerativeAI } = require('@google/generative-ai');
const { ApiError } = require('../utils/ApiError');
const { asyncHandler } = require('../utils/asyncHandler');
const QuizSession = require('../models/QuizSession');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const parseJsonFromText = (text) => {
  const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[1]);
  }
  return JSON.parse(text);
};

const generateAssessment = asyncHandler(async (req, res) => {
  const { topic } = req.body;

  if (!topic || typeof topic !== 'string' || topic.trim() === '') {
    throw new ApiError({
      status: 400,
      code: 'VALIDATION_001',
      message: 'Topic is required and must be a non-empty string',
    });
  }

  if (!process.env.GEMINI_API_KEY) {
    throw new ApiError({
      status: 500,
      code: 'CONFIG_ERROR',
      message: 'GEMINI_API_KEY is not configured',
    });
  }

  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
  });

  const prompt = `Create a diagnostic quiz for the topic "${topic}" with exactly 5 multiple-choice questions ranging from Beginner to Intermediate difficulty.

Return STRICT JSON in this format (no markdown, no extra text):
[
  {
    "id": "q1",
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "answer": "Option A"
  }
]

Requirements:
- Each question must have exactly 4 options
- The "answer" field must be the EXACT text of one of the options
- Questions should progressively increase in difficulty
- Be specific to the topic "${topic}"`;

  const result = await model.generateContent(prompt);
  const responseText = result.response.text();

  let questions;
  try {
    questions = parseJsonFromText(responseText);
  } catch (parseError) {
    console.error('JSON Parse Error:', parseError, 'Raw response:', responseText);
    throw new ApiError({
      status: 500,
      code: 'AI_PARSE_ERROR',
      message: 'Failed to parse assessment questions from AI response',
    });
  }

  if (!Array.isArray(questions) || questions.length === 0) {
    throw new ApiError({
      status: 500,
      code: 'AI_VALIDATION_ERROR',
      message: 'Assessment generation failed: Invalid response structure',
    });
  }

  const correctAnswersMap = new Map();
  questions.forEach((q) => {
    correctAnswersMap.set(q.id, q.answer);
  });

  const quizSession = await QuizSession.create({
    userId: req.user?.id || req.body.userId,
    topic,
    questions: questions.map(({ id, question, options }) => ({
      id,
      question,
      options,
    })),
    correctAnswers: correctAnswersMap,
  });

  const clientQuestions = questions.map(({ id, question, options }) => ({
    id,
    question,
    options,
  }));

  res.status(201).json({
    data: {
      sessionId: quizSession._id,
      topic,
      questions: clientQuestions,
    },
  });
});

const evaluateAndPlan = asyncHandler(async (req, res) => {
  const { sessionId, userAnswers } = req.body;

  if (!sessionId || !userAnswers || typeof userAnswers !== 'object') {
    throw new ApiError({
      status: 400,
      code: 'VALIDATION_001',
      message: 'sessionId and userAnswers are required',
    });
  }

  const quizSession = await QuizSession.findById(sessionId);
  if (!quizSession) {
    throw new ApiError({
      status: 404,
      code: 'NOT_FOUND',
      message: 'Quiz session not found or has expired',
    });
  }

  const correctAnswers = Object.fromEntries(quizSession.correctAnswers);
  const questions = quizSession.questions;

  let score = 0;
  const evaluation = [];

  Object.entries(userAnswers).forEach(([questionId, userAnswer]) => {
    const question = questions.find((q) => q.id === questionId);
    const correctAnswer = correctAnswers[questionId];

    if (question && correctAnswer) {
      const isCorrect = userAnswer === correctAnswer;
      if (isCorrect) score += 1;

      evaluation.push({
        questionId,
        question: question.question,
        userAnswer,
        correctAnswer,
        isCorrect,
      });
    }
  });

  const scorePercentage = Math.round((score / Object.keys(userAnswers).length) * 100);

  let level = 'Beginner';
  if (scorePercentage >= 80) {
    level = 'Advanced';
  } else if (scorePercentage >= 60) {
    level = 'Intermediate';
  }

  const weakAreas = evaluation
    .filter((e) => !e.isCorrect)
    .map((e) => e.question);

  const geminiPrompt = `You are a strict and effective educator. Based on the following quiz performance for the topic "${quizSession.topic}", create a personalized study roadmap.

User Performance:
- Score: ${scorePercentage}%
- Level: ${level}
- Topic: ${quizSession.topic}
- Weak Areas (questions answered incorrectly):
${weakAreas.map((area) => `- ${area}`).join('\n')}

Based on this performance, create a JSON study roadmap with this structure:
{
  "feedback": "Specific feedback about their performance",
  "keyStrengths": ["strength 1", "strength 2"],
  "keyWeaknesses": ["weakness 1", "weakness 2"],
  "roadmap": [
    {
      "module": "Module Name",
      "description": "What they'll learn",
      "keyTopics": ["topic1", "topic2"],
      "priority": "high|medium|low",
      "estimatedHours": number
    }
  ]
}

${
  scorePercentage < 40
    ? 'Since the user scored very low, start from fundamentals and basics. Emphasize foundational concepts.'
    : scorePercentage < 60
      ? 'Since the user scored moderately, focus on weak areas identified above while reinforcing basics.'
      : scorePercentage >= 80
        ? 'Since the user scored high, focus on advanced topics and edge cases. Skip basic modules.'
        : 'Create a balanced curriculum addressing gaps while building on strengths.'
}

Return ONLY valid JSON with no markdown wrapping or extra text.`;

  if (!process.env.GEMINI_API_KEY) {
    throw new ApiError({
      status: 500,
      code: 'CONFIG_ERROR',
      message: 'GEMINI_API_KEY is not configured',
    });
  }

  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
  });

  const result = await model.generateContent(geminiPrompt);
  const responseText = result.response.text();

  let roadmapData;
  try {
    roadmapData = parseJsonFromText(responseText);
  } catch (parseError) {
    console.error('Roadmap Parse Error:', parseError, 'Raw response:', responseText);
    throw new ApiError({
      status: 500,
      code: 'AI_PARSE_ERROR',
      message: 'Failed to parse study roadmap from AI response',
    });
  }

  await QuizSession.deleteOne({ _id: sessionId });

  res.status(200).json({
    data: {
      score: scorePercentage,
      level,
      feedback: roadmapData.feedback || 'Assessment complete',
      keyStrengths: roadmapData.keyStrengths || [],
      keyWeaknesses: roadmapData.keyWeaknesses || [],
      roadmap: roadmapData.roadmap || [],
      evaluation,
    },
  });
});

module.exports = { generateAssessment, evaluateAndPlan };
