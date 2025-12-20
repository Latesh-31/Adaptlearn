'use server';

import { generateJSON, generateText } from '@/lib/ai';
import connectDB from '@/lib/db';
import Assessment from '@/models/Assessment';
import Course from '@/models/Course';

export async function generateAssessment(topic, userId) {
  try {
    const prompt = `Create a diagnostic assessment for the topic: "${topic}".

Generate exactly 5 multiple-choice questions that will help identify the learner's current knowledge level and weaknesses.

Requirements:
- Questions should range from basic to advanced
- Each question must have exactly 4 options
- Include diverse difficulty levels to accurately assess understanding
- Cover different subtopics within ${topic}

Return a JSON object with this EXACT structure:
{
  "questions": [
    {
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "The exact text of the correct option"
    }
  ]
}

IMPORTANT: Return ONLY valid JSON, no markdown or additional text.`;

    const result = await generateJSON(prompt);
    
    if (!result.questions || !Array.isArray(result.questions)) {
      throw new Error('Invalid response format from AI');
    }

    await connectDB();
    
    const assessment = new Assessment({
      userId,
      topic,
      questions: result.questions.map(q => ({
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
      })),
    });
    
    await assessment.save();
    
    return {
      success: true,
      assessmentId: assessment._id.toString(),
      questions: result.questions.map(q => ({
        question: q.question,
        options: q.options,
      })),
    };
  } catch (error) {
    console.error('Error generating assessment:', error);
    return {
      success: false,
      error: error.message || 'Failed to generate assessment',
    };
  }
}

export async function submitAssessment(assessmentId, answers, userId) {
  try {
    await connectDB();
    
    const assessment = await Assessment.findById(assessmentId);
    if (!assessment) {
      throw new Error('Assessment not found');
    }
    
    if (assessment.userId.toString() !== userId) {
      throw new Error('Unauthorized');
    }

    const wrongAnswers = [];
    const weakTopics = [];
    
    assessment.questions.forEach((question, index) => {
      const userAnswer = answers[index];
      question.userAnswer = userAnswer;
      question.isCorrect = userAnswer === question.correctAnswer;
      
      if (!question.isCorrect) {
        wrongAnswers.push({
          question: question.question,
          userAnswer: userAnswer,
          correctAnswer: question.correctAnswer,
        });
      }
    });
    
    assessment.calculateScore();
    assessment.completedAt = new Date();

    const analysisPrompt = `Analyze these quiz results for the topic "${assessment.topic}":

Score: ${assessment.score}%
Wrong Answers:
${wrongAnswers.map((wa, i) => `${i + 1}. Q: ${wa.question}
   User answered: ${wa.userAnswer}
   Correct answer: ${wa.correctAnswer}`).join('\n\n')}

Provide:
1. A brief analysis of what concepts the learner struggles with
2. List 2-4 specific weakness areas/subtopics they need to focus on

Return JSON:
{
  "analysis": "Brief analysis paragraph",
  "weaknesses": ["weakness 1", "weakness 2", "weakness 3"]
}`;

    const analysisResult = await generateJSON(analysisPrompt);
    
    assessment.analysis = analysisResult.analysis;
    assessment.weaknesses = analysisResult.weaknesses || [];
    
    await assessment.save();

    const syllabusPrompt = `Generate a personalized learning syllabus for "${assessment.topic}".

Assessment Results:
- Score: ${assessment.score}%
- Identified Weaknesses: ${assessment.weaknesses.join(', ')}
- Wrong answers: ${wrongAnswers.length} out of ${assessment.questions.length}

CRITICAL REQUIREMENT:
Create exactly 6 learning modules. The first 2 modules MUST specifically target and address the identified weaknesses: ${assessment.weaknesses.join(', ')}.

Modules 3-6 should build upon this foundation and cover the broader topic comprehensively.

Return STRICT JSON with this structure:
{
  "modules": [
    {
      "title": "Module title",
      "description": "What this module covers (2-3 sentences)",
      "order": 1
    }
  ]
}

Ensure Module 1 and 2 explicitly address: ${assessment.weaknesses.join(' and ')}.`;

    const syllabusResult = await generateJSON(syllabusPrompt);
    
    if (!syllabusResult.modules || syllabusResult.modules.length !== 6) {
      throw new Error('Invalid syllabus format - must have exactly 6 modules');
    }

    const course = new Course({
      userId: assessment.userId,
      topic: assessment.topic,
      level: assessment.score >= 70 ? 'advanced' : assessment.score >= 40 ? 'intermediate' : 'beginner',
      roadmap: syllabusResult.modules.map((module, idx) => ({
        ...module,
        order: idx + 1,
        status: idx === 0 ? 'active' : 'locked',
      })),
      weaknesses: assessment.weaknesses,
      assessmentScore: assessment.score,
      currentModuleIndex: 0,
    });
    
    await course.save();

    return {
      success: true,
      courseId: course._id.toString(),
      score: assessment.score,
      analysis: assessment.analysis,
      weaknesses: assessment.weaknesses,
      roadmap: course.roadmap,
    };
  } catch (error) {
    console.error('Error submitting assessment:', error);
    return {
      success: false,
      error: error.message || 'Failed to submit assessment',
    };
  }
}

export async function askTutor(courseId, moduleId, question, userId) {
  try {
    await connectDB();
    
    const course = await Course.findById(courseId);
    if (!course) {
      throw new Error('Course not found');
    }
    
    if (course.userId.toString() !== userId) {
      throw new Error('Unauthorized');
    }
    
    const currentModule = course.roadmap.id(moduleId);
    if (!currentModule) {
      throw new Error('Module not found');
    }

    const prompt = `You are an AI tutor helping a student learn about "${course.topic}".

Current Module: ${currentModule.title}
Module Description: ${currentModule.description}
Student's Known Weaknesses: ${course.weaknesses.join(', ')}

Student Question: ${question}

Provide a clear, educational response that:
1. Directly answers their question
2. Relates to the module content
3. Uses simple language and examples
4. Encourages deeper understanding

Keep your response concise (3-4 paragraphs maximum).`;

    const response = await generateText(prompt);

    return {
      success: true,
      response,
      moduleTitle: currentModule.title,
    };
  } catch (error) {
    console.error('Error in tutor chat:', error);
    return {
      success: false,
      error: error.message || 'Failed to get tutor response',
    };
  }
}

export async function generateModuleContent(courseId, moduleId, userId) {
  try {
    await connectDB();
    
    const course = await Course.findById(courseId);
    if (!course) {
      throw new Error('Course not found');
    }
    
    if (course.userId.toString() !== userId) {
      throw new Error('Unauthorized');
    }
    
    const currentModule = course.roadmap.id(moduleId);
    if (!currentModule) {
      throw new Error('Module not found');
    }

    if (currentModule.content && currentModule.content.length > 0) {
      return {
        success: true,
        content: currentModule.content,
      };
    }

    const prompt = `Create comprehensive learning content for this module:

Course Topic: ${course.topic}
Module Title: ${currentModule.title}
Module Description: ${currentModule.description}
Student's Weaknesses: ${course.weaknesses.join(', ')}
Student Level: ${course.level}

Generate detailed learning content that includes:
1. Introduction to the concept
2. Key concepts and definitions
3. Detailed explanations with examples
4. Practical applications
5. Common pitfalls to avoid
6. Summary of key takeaways

Format the content in clear sections with headers. Use markdown formatting.
Make it engaging and easy to understand for a ${course.level} learner.

Content should be 400-600 words.`;

    const content = await generateText(prompt);
    
    currentModule.content = content;
    await course.save();

    return {
      success: true,
      content,
    };
  } catch (error) {
    console.error('Error generating module content:', error);
    return {
      success: false,
      error: error.message || 'Failed to generate module content',
    };
  }
}

export async function completeModule(courseId, moduleId, userId) {
  try {
    await connectDB();
    
    const course = await Course.findById(courseId);
    if (!course) {
      throw new Error('Course not found');
    }
    
    if (course.userId.toString() !== userId) {
      throw new Error('Unauthorized');
    }
    
    const currentModule = course.roadmap.id(moduleId);
    if (!currentModule) {
      throw new Error('Module not found');
    }
    
    if (currentModule.status !== 'active') {
      throw new Error('Module must be active to complete');
    }

    course.completeCurrentModule();
    await course.save();

    return {
      success: true,
      progress: course.progress,
      currentModuleIndex: course.currentModuleIndex,
    };
  } catch (error) {
    console.error('Error completing module:', error);
    return {
      success: false,
      error: error.message || 'Failed to complete module',
    };
  }
}
