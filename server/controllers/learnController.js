const { GoogleGenerativeAI } = require('@google/generative-ai');
const { z } = require('zod');
const QuizSession = require('../models/QuizSession');
const { asyncHandler } = require('../utils/asyncHandler');
const { ApiError } = require('../utils/ApiError');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const extractJsonFromMarkdown = (text) => {
  const jsonMatch = text.match(/```json\\s*([\\s\\S]*?)\\s*```/);
  if (jsonMatch) {
    return jsonMatch[1];
  }
  
  const jsonMatch2 = text.match(/```\\s*([\\s\\S]*?)\\s*```/);
  if (jsonMatch2) {
    try {
      JSON.parse(jsonMatch2[1]);
      return jsonMatch2[1];
    } catch {
      
    }
  }
  
  return text;
};

const generateAssessment = asyncHandler(async (req, res) => {
  const schema = z.object({
    topic: z.string().min(1).max(100),
  }).strict();

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError({
      status: 400,
      code: 'VALIDATION_001',
      message: 'Invalid input',
      details: parsed.error.flatten(),
    });
  }

  const { topic } = parsed.data;
  const userId = req.user?.id;

  if (!process.env.GEMINI_API_KEY) {
    throw new ApiError({
      status: 500,
      code: 'AI_001',
      message: 'AI service configuration error',
    });
  }

  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
  });

  const prompt = `Create a generic diagnostic assessment quiz for "${topic}" with 5-10 multiple-choice questions ranging from Beginner to Intermediate level.

Each question should have:
- A unique id
- A clear question text
- An array of 4 options
- The correct answer (as the actual text, not just an index)

The questions should progressively assess understanding from basic concepts to intermediate applications.

Output STRICT JSON in this exact format without any additional text:
[
  {
    "id": "string",
    "question": "string",
    "options": ["string", "string", "string", "string"],
    "answer": "string"
  }
]`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    const jsonText = extractJsonFromMarkdown(text);
    const questions = JSON.parse(jsonText);

    if (!Array.isArray(questions)) {
      throw new Error('Invalid response format from AI');
    }

    const questionsToSend = questions.map(q => {
      const { answer, ...questionWithoutAnswer } = q;
      return questionWithoutAnswer;
    });

    const correctAnswers = questions.reduce((acc, q) => {
      acc[q.id] = q.answer;
      return acc;
    }, {});

    if (userId) {
      const quizSession = new QuizSession({
        userId,
        topic,
        questions,
        correctAnswers,
      });
      await quizSession.save();
    }

    res.status(200).json({
      data: {
        topic,
        questions: questionsToSend,
      },
    });
  } catch (error) {
    console.error('Assessment generation error:', error);
    throw new ApiError({
      status: 500,
      code: 'AI_002',
      message: 'Failed to generate assessment',
    });
  }
});

const evaluateAndPlan = asyncHandler(async (req, res) => {
  const schema = z.object({
    topic: z.string().min(1).max(100),
    userAnswers: z.record(z.string()),
    quizSessionId: z.string().optional(),
  }).strict();

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError({
      status: 400,
      code: 'VALIDATION_001',
      message: 'Invalid input',
      details: parsed.error.flatten(),
    });
  }

  const { topic, userAnswers, quizSessionId } = parsed.data;
  const userId = req.user?.id;

  if (!process.env.GEMINI_API_KEY) {
    throw new ApiError({
      status: 500,
      code: 'AI_001',
      message: 'AI service configuration error',
    });
  }

  let correctAnswers = {};
  let quizQuestions = [];

  if (userId && quizSessionId) {
    const quizSession = await QuizSession.findOne({ 
      _id: quizSessionId, 
      userId 
    });
    
    if (quizSession) {
      correctAnswers = quizSession.correctAnswers;
      quizQuestions = quizSession.questions;
    }
  }

  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
  });

  const evaluationPrompt = `Act as a strict teacher. Your task is to:
1. Grade these answers from a student:
   Student answers: ${JSON.stringify(userAnswers)}
   Correct answers: ${JSON.stringify(correctAnswers)}

2. Identify the student's specific weak areas (e.g., 'Weak in Recursion', 'Struggles with OOP concepts')

3. Generate a personalized study roadmap based on their performance:
   - If they scored low (< 40%), start from fundamentals
   - If they scored medium (40-70%), include review sections
   - If they scored high (> 70%), skip basics and focus on advanced topics

4. Return a strict JSON object in this format:
{
  "score": number (0-100),
  "level": "Beginner|Intermediate|Advanced",
  "feedback": "Detailed feedback on strengths and weaknesses",
  "weakAreas": ["area1", "area2"],
  "roadmap": [
    {
      "module": "string",
      "description": "string",
      "keyTopics": ["topic1", "topic2"]
    }
  ]
}

The roadmap should be targeted to the topic: "${topic}" and adapt based on their performance level.`;

  try {
    const result = await model.generateContent(evaluationPrompt);
    const response = result.response;
    const text = response.text();

    const jsonText = extractJsonFromMarkdown(text);
    const evaluation = JSON.parse(jsonText);

    const validationSchema = z.object({
      score: z.number().min(0).max(100),
      level: z.enum(['Beginner', 'Intermediate', 'Advanced']),
      feedback: z.string().min(1),
      weakAreas: z.array(z.string()),
      roadmap: z.array(z.object({
        module: z.string(),
        description: z.string(),
        keyTopics: z.array(z.string()),
      })),
    });

    const validatedEvaluation = validationSchema.parse(evaluation);

    res.status(200).json({
      data: {
        evaluation: validatedEvaluation,
      },
    });
  } catch (error) {
    console.error('Evaluation error:', error);
    throw new ApiError({
      status: 500,
      code: 'AI_003',
      message: 'Failed to evaluate answers and generate plan',
    });
  }
});

module.exports = { generateAssessment, evaluateAndPlan };