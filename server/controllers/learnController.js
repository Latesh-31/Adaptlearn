const { GoogleGenerativeAI } = require('@google/generative-ai');
const { ApiError } = require('../utils/ApiError');
const QuizSession = require('../models/QuizSession');
const User = require('../models/User');

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Utility function to parse JSON from Gemini response
const parseGeminiJsonResponse = (text) => {
  try {
    // Remove markdown code blocks if present
    const cleanedText = text.replace(/```json\s*/g, '').replace(/```\s*$/g, '').trim();
    
    // Parse the JSON
    const parsed = JSON.parse(cleanedText);
    return parsed;
  } catch (error) {
    console.error('Failed to parse Gemini JSON response:', error);
    throw new ApiError({
      status: 500,
      code: 'JSON_PARSE_ERROR',
      message: 'Failed to parse AI response as JSON',
      details: { originalError: error.message }
    });
  }
};

// Utility function to call Gemini API with standardized error handling
const callGeminiApi = async (prompt, systemInstruction) => {
  try {
    console.log('Calling Gemini API for assessment...');

    if (!process.env.GEMINI_API_KEY) {
      throw new ApiError({
        status: 500,
        code: 'GEMINI_CONFIG_ERROR',
        message: 'GEMINI_API_KEY is not defined in environment variables'
      });
    }

    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: systemInstruction
    });

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    console.log('Gemini response received, length:', text.length);
    return text;
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new ApiError({
      status: 500,
      code: 'GEMINI_API_ERROR',
      message: 'Failed to generate content with AI',
      details: error.message
    });
  }
};

/**
 * Function A: Generate Assessment
 * Creates a diagnostic quiz for the given topic
 */
const generateAssessment = async (req, res, next) => {
  try {
    const { topic } = req.body;

    if (!topic || typeof topic !== 'string') {
      throw new ApiError({
        status: 400,
        code: 'ASSESSMENT_001',
        message: 'Topic is required and must be a string'
      });
    }

    const userId = req.user?.id; // Assuming JWT middleware sets req.user
    if (!userId) {
      throw new ApiError({
        status: 401,
        code: 'AUTH_REQUIRED',
        message: 'Authentication required to start assessment'
      });
    }

    console.log(`Generating assessment for topic: ${topic}, user: ${userId}`);

    // Validate user exists
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError({
        status: 404,
        code: 'USER_NOT_FOUND',
        message: 'User not found'
      });
    }

    const prompt = `Create a generic diagnostic quiz for ${topic} with 5 multiple-choice questions ranging from Beginner to Intermediate level.

Requirements:
- Exactly 5 questions
- Each question should have 4 options (A, B, C, D)
- Questions should test fundamental concepts
- Cover different difficulty levels within the range
- Include questions that can identify knowledge gaps

Output STRICT JSON format:
[
  {
    "id": "unique_question_id",
    "question": "Question text here",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "answer": 0
  }
]

Note: "answer" should be the index (0-3) of the correct option.`;

    const systemInstruction = `You are an expert assessment creator for AdaptLearn AI. Your role is to:
1. Create fair, diagnostic questions that accurately gauge student knowledge
2. Ensure questions are well-structured and unambiguous
3. Cover fundamental concepts that are essential for understanding ${topic}
4. Vary difficulty from basic recall to intermediate application
5. Always output valid, parseable JSON only - no markdown or extra text`;

    const geminiResponse = await callGeminiApi(prompt, systemInstruction);
    const quizData = parseGeminiJsonResponse(geminiResponse);

    // Validate the quiz structure
    if (!Array.isArray(quizData) || quizData.length !== 5) {
      throw new ApiError({
        status: 500,
        code: 'QUIZ_STRUCTURE_ERROR',
        message: 'AI did not return expected quiz structure',
        details: { expectedLength: 5, receivedLength: Array.isArray(quizData) ? quizData.length : 'not_array' }
      });
    }

    // Validate each question has required fields
    for (let i = 0; i < quizData.length; i++) {
      const question = quizData[i];
      if (!question.id || !question.question || !Array.isArray(question.options) || question.options.length !== 4 || typeof question.answer !== 'number') {
        throw new ApiError({
          status: 500,
          code: 'QUESTION_STRUCTURE_ERROR',
          message: `Question ${i + 1} has invalid structure`,
          details: question
        });
      }
      if (question.answer < 0 || question.answer > 3) {
        throw new ApiError({
          status: 500,
          code: 'ANSWER_INDEX_ERROR',
          message: `Question ${i + 1} has invalid answer index`,
          details: { answer: question.answer, validRange: '0-3' }
        });
      }
    }

    // Store the quiz session with correct answers (server-side only)
    const quizSession = await QuizSession.createAssessmentSession(userId, topic, quizData);

    console.log(`Quiz session created: ${quizSession._id}`);

    // Remove answer field before sending to client (prevent cheating)
    const questionsForClient = quizData.map(({ answer, ...question }) => ({
      ...question,
      // Ensure all questions have proper structure
      id: question.id || `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }));

    res.status(200).json({
      success: true,
      data: {
        sessionId: quizSession._id,
        topic,
        questions: questionsForClient,
        totalQuestions: questionsForClient.length,
        timeLimit: 1800 // 30 minutes in seconds
      }
    });

  } catch (error) {
    console.error('Generate Assessment Error:', error);
    next(error);
  }
};

/**
 * Function B: Evaluate and Plan
 * Grades user answers and creates personalized study roadmap
 */
const evaluateAndPlan = async (req, res, next) => {
  try {
    const { sessionId, userAnswers } = req.body;

    if (!sessionId || !userAnswers || typeof userAnswers !== 'object') {
      throw new ApiError({
        status: 400,
        code: 'EVALUATION_001',
        message: 'Session ID and user answers are required'
      });
    }

    const userId = req.user?.id; // Assuming JWT middleware sets req.user
    if (!userId) {
      throw new ApiError({
        status: 401,
        code: 'AUTH_REQUIRED',
        message: 'Authentication required to submit assessment'
      });
    }

    console.log(`Evaluating assessment: session ${sessionId}, user: ${userId}`);

    // Find and validate the quiz session
    const quizSession = await QuizSession.findOne({ 
      _id: sessionId,
      userId,
      status: 'pending'
    });

    if (!quizSession) {
      throw new ApiError({
        status: 404,
        code: 'SESSION_NOT_FOUND',
        message: 'Quiz session not found or already completed'
      });
    }

    // Check if session is expired
    if (quizSession.isExpired) {
      throw new ApiError({
        status: 400,
        code: 'SESSION_EXPIRED',
        message: 'Quiz session has expired'
      });
    }

    // Calculate score
    let correctAnswers = 0;
    const totalQuestions = quizSession.questions.length;
    const answerComparison = [];

    // Grade each answer
    for (const question of quizSession.questions) {
      const userAnswer = userAnswers[question.id];
      const isCorrect = userAnswer === question.answer;
      
      if (isCorrect) {
        correctAnswers++;
      }

      answerComparison.push({
        questionId: question.id,
        question: question.question,
        userAnswer,
        correctAnswer: question.answer,
        isCorrect
      });
    }

    const score = Math.round((correctAnswers / totalQuestions) * 100);

    // Prepare data for AI evaluation
    const evaluationData = {
      topic: quizSession.topic,
      score,
      correctAnswers,
      totalQuestions,
      answerComparison,
      userAnswers
    };

    const prompt = `Act as a strict teacher evaluating a diagnostic assessment for ${evaluationData.topic}.

Assessment Results:
- Score: ${score}% (${correctAnswers}/${totalQuestions} correct)
- Topic: ${evaluationData.topic}

Answer Analysis:
${answerComparison.map((item, index) => 
  `Q${index + 1}: ${item.question}
   User Answer: ${item.userAnswer}
   Correct Answer: ${item.correctAnswer}
   Result: ${item.isCorrect ? 'Correct' : 'Incorrect'}`
).join('\n\n')}

Your task:
1. Grade these answers fairly
2. Identify the user's specific weak areas based on their incorrect answers
3. Generate a personalized study roadmap based on their performance level
4. If score < 70%, emphasize fundamentals and basic concepts
5. If score ≥ 70%, skip intro modules and focus on advanced topics

CRITICAL Requirements:
- Return ONLY valid JSON - no markdown formatting
- If low score (below 70%), start roadmap from basics
- If high score (70%+), skip introductory modules
- Make the roadmap practical and actionable

Return STRICT JSON format:
{
  "score": ${score},
  "level": "Beginner|Intermediate|Advanced",
  "feedback": "Detailed feedback on performance",
  "strengths": ["List of areas where user performed well"],
  "weaknesses": ["List of specific weak areas identified"],
  "roadmap": [
    {
      "module": "Module name",
      "description": "What this module covers",
      "keyTopics": ["Topic 1", "Topic 2", "Topic 3"],
      "priority": "high|medium|low",
      "estimatedHours": 2
    }
  ],
  "recommendations": ["Specific study recommendations"]
}`;

    const systemInstruction = `You are a strict but fair teacher for AdaptLearn AI. Your role is to:
1. Provide honest, constructive feedback based on performance
2. Create realistic, achievable study roadmaps
3. Focus on practical, actionable learning steps
4. Adapt the learning path to the student's demonstrated level
5. Always return valid JSON only - no markdown formatting or extra text
6. Be encouraging while being realistic about areas needing improvement`;

    const geminiResponse = await callGeminiApi(prompt, systemInstruction);
    const evaluation = parseGeminiJsonResponse(geminiResponse);

    // Validate evaluation structure
    if (!evaluation.roadmap || !Array.isArray(evaluation.roadmap) || evaluation.roadmap.length === 0) {
      throw new ApiError({
        status: 500,
        code: 'EVALUATION_STRUCTURE_ERROR',
        message: 'AI did not return expected evaluation structure'
      });
    }

    // Mark session as completed
    await quizSession.markCompleted();

    console.log(`Assessment evaluated successfully. Score: ${score}%`);

    res.status(200).json({
      success: true,
      data: {
        evaluation,
        performance: {
          score,
          correctAnswers,
          totalQuestions,
          percentage: score
        },
        sessionId
      }
    });

  } catch (error) {
    console.error('Evaluate and Plan Error:', error);
    next(error);
  }
};

module.exports = {
  generateAssessment,
  evaluateAndPlan
};