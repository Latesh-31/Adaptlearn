'use client';

import { useState } from 'react';
import { X, Sparkles, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { generateAssessment, submitAssessment } from '@/app/actions/ai';

export default function QuizModal({ userId, onClose, onCourseCreated }) {
  const [step, setStep] = useState('topic');
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [assessmentId, setAssessmentId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);

  async function handleStartQuiz() {
    if (!topic.trim()) {
      toast.error('Please enter a topic');
      return;
    }

    setLoading(true);
    try {
      const response = await generateAssessment(topic, userId);
      
      if (response.success) {
        setAssessmentId(response.assessmentId);
        setQuestions(response.questions);
        setStep('quiz');
        toast.success('Quiz generated! Good luck!');
      } else {
        toast.error(response.error || 'Failed to generate quiz');
      }
    } catch (error) {
      toast.error('Failed to generate quiz');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitQuiz() {
    if (Object.keys(answers).length !== questions.length) {
      toast.error('Please answer all questions');
      return;
    }

    setLoading(true);
    try {
      const answerArray = questions.map((_, idx) => answers[idx]);
      const response = await submitAssessment(assessmentId, answerArray, userId);
      
      if (response.success) {
        setResult(response);
        setStep('result');
      } else {
        toast.error(response.error || 'Failed to submit quiz');
      }
    } catch (error) {
      toast.error('Failed to submit quiz');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  function selectAnswer(questionIndex, answer) {
    setAnswers({ ...answers, [questionIndex]: answer });
  }

  function nextQuestion() {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  }

  function prevQuestion() {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-background border border-border rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-background border-b border-border p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold">
            {step === 'topic' && 'Start New Course'}
            {step === 'quiz' && 'Diagnostic Assessment'}
            {step === 'result' && 'Your Personalized Roadmap'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-accent rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {step === 'topic' && (
            <div className="space-y-6">
              <div>
                <p className="text-muted-foreground mb-4">
                  Enter a topic you&apos;d like to learn. We&apos;ll create a diagnostic quiz to assess your current knowledge.
                </p>
                <label htmlFor="topic" className="block text-sm font-medium mb-2">
                  What do you want to learn?
                </label>
                <input
                  id="topic"
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., Python Programming, Data Structures, React.js"
                  className="w-full px-4 py-3 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  onKeyDown={(e) => e.key === 'Enter' && handleStartQuiz()}
                />
              </div>
              <button
                onClick={handleStartQuiz}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground"></div>
                    Generating Quiz...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate Diagnostic Quiz
                  </>
                )}
              </button>
            </div>
          )}

          {step === 'quiz' && questions.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <span className="text-sm text-muted-foreground">
                  Question {currentQuestion + 1} of {questions.length}
                </span>
                <div className="flex gap-1">
                  {questions.map((_, idx) => (
                    <div
                      key={idx}
                      className={`w-2 h-2 rounded-full ${
                        answers[idx] !== undefined ? 'bg-primary' : 'bg-secondary'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">
                  {questions[currentQuestion].question}
                </h3>
                <div className="space-y-3">
                  {questions[currentQuestion].options.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => selectAnswer(currentQuestion, option)}
                      className={`w-full text-left px-4 py-3 border rounded-md transition-colors ${
                        answers[currentQuestion] === option
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-6">
                <button
                  onClick={prevQuestion}
                  disabled={currentQuestion === 0}
                  className="px-6 py-2 border border-border rounded-md hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                {currentQuestion < questions.length - 1 ? (
                  <button
                    onClick={nextQuestion}
                    disabled={answers[currentQuestion] === undefined}
                    className="flex-1 px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    onClick={handleSubmitQuiz}
                    disabled={loading || Object.keys(answers).length !== questions.length}
                    className="flex-1 px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Analyzing...' : 'Submit Quiz'}
                  </button>
                )}
              </div>
            </div>
          )}

          {step === 'result' && result && (
            <div className="space-y-6">
              <div className="text-center py-6">
                <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-3xl font-bold mb-2">Score: {result.score}%</h3>
                <p className="text-muted-foreground">{result.analysis}</p>
              </div>

              {result.weaknesses && result.weaknesses.length > 0 && (
                <div className="bg-accent/50 border border-border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Focus Areas:</h4>
                  <ul className="space-y-1">
                    {result.weaknesses.map((weakness, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                        {weakness}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <h4 className="font-semibold mb-4">Your Personalized Learning Roadmap:</h4>
                <div className="space-y-3">
                  {result.roadmap.map((module, idx) => (
                    <div
                      key={idx}
                      className="border border-border rounded-lg p-4 hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                          {idx + 1}
                        </div>
                        <div className="flex-1">
                          <h5 className="font-semibold mb-1">{module.title}</h5>
                          <p className="text-sm text-muted-foreground">{module.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => onCourseCreated(result.courseId)}
                className="w-full py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium"
              >
                Start Learning
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
