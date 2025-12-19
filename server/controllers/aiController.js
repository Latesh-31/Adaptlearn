const { z } = require('zod');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { ApiError } = require('../utils/ApiError');
const { asyncHandler } = require('../utils/asyncHandler');

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const chatSchema = z.object({
  prompt: z.string().min(1).max(4000),
  history: z.array(z.object({
    role: z.enum(['user', 'model']),
    parts: z.array(z.object({
      text: z.string()
    }))
  })).optional().default([])
}).strict();

const chat = asyncHandler(async (req, res) => {
  // Validate input
  const parsed = chatSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError({
      status: 400,
      code: 'VALIDATION_001',
      message: 'Invalid input',
      details: parsed.error.flatten(),
    });
  }

  const { prompt, history } = parsed.data;

  // Check if API key exists
  if (!process.env.GEMINI_API_KEY) {
    throw new ApiError({
      status: 500,
      code: 'CONFIG_001',
      message: 'AI service is not configured',
    });
  }

  try {
    // Get the generative model with system instruction
    const model = genAI.getGenerativeModel({
      systemInstruction: `You are a Helpful Tutor for AdaptLearn AI. Your role is to:

1. Explain complex concepts in simple, easy-to-understand terms
2. Use analogies and real-world examples when helpful
3. Break down difficult topics into smaller, manageable parts
4. Ask clarifying questions when needed
5. Be encouraging and supportive
6. Provide accurate, educational information
7. Adapt your explanation style to the student's level

Always structure your responses clearly with:
- A brief explanation in simple terms
- Key points or steps if applicable
- A real-world example or analogy when helpful
- A follow-up question to encourage further learning

Keep responses concise but comprehensive.`,
    });

    // Start a chat session with history
    const chat = model.startChat({
      history: history || [],
    });

    // Send message and get response
    const result = await chat.sendMessage(prompt);
    const response = result.response;
    const text = response.text();

    // Return structured response
    res.status(200).json({
      data: {
        message: text,
        timestamp: new Date().toISOString(),
      }
    });

  } catch (error) {
    console.error('AI Chat Error:', error);
    
    // Handle specific API errors
    if (error.message?.includes('API_KEY_INVALID')) {
      throw new ApiError({
        status: 500,
        code: 'AI_002',
        message: 'AI service configuration error',
      });
    }

    if (error.message?.includes('QUOTA_EXCEEDED')) {
      throw new ApiError({
        status: 503,
        code: 'AI_003',
        message: 'AI service is temporarily overloaded. Please try again later.',
      });
    }

    if (error.message?.includes('SAFETY')) {
      throw new ApiError({
        status: 400,
        code: 'AI_004',
        message: 'Your question could not be processed. Please try rephrasing it.',
      });
    }

    // Generic error
    throw new ApiError({
      status: 500,
      code: 'AI_001',
      message: 'AI service is temporarily unavailable. Please try again later.',
    });
  }
});

module.exports = { chat };