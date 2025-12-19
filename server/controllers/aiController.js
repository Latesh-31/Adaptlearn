const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const chat = async (req, res) => {
  try {
    const { prompt, history } = req.body;

    // 1. Log Request received
    console.log('Request received:', prompt);

    // 2. Log Calling Gemini API
    // Log API key presence (do NOT log the key itself)
    console.log('Calling Gemini API. Key present:', !!process.env.GEMINI_API_KEY);

    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not defined in environment variables');
    }

    // Use model: "gemini-1.5-flash"
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
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

Keep responses concise but comprehensive.`
    });

    const chatSession = model.startChat({
      history: history || [],
    });

    const result = await chatSession.sendMessage(prompt);
    const response = result.response;
    const text = response.text();

    // 3. Response received (log the first 20 chars of the output)
    console.log('Response received:', text.substring(0, 20));

    // Return success response with reply
    res.status(200).json({ reply: text });

  } catch (error) {
    console.error('AI Integration Error:', error);
    // Return a 500 status with the specific error message
    res.status(500).json({ 
      error: error.message || 'An unexpected error occurred processing the AI request' 
    });
  }
};

module.exports = { chat };
