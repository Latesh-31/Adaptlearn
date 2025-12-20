import Link from 'next/link';
import { getCurrentUser } from './actions/auth';
import { Brain, Sparkles, Target, Zap } from 'lucide-react';

export default async function HomePage() {
  const { user } = await getCurrentUser();

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Brain className="w-6 h-6 text-primary" />
              <span className="text-xl font-semibold">AdaptLearn AI</span>
            </div>
            <div className="flex gap-4">
              {user ? (
                <Link
                  href="/dashboard"
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/auth/signin"
                    className="px-4 py-2 text-foreground hover:text-primary transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center space-y-8 mb-20">
          <h1 className="text-6xl font-bold tracking-tight">
            Learn Smarter, Not Harder
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            AI-powered adaptive learning that creates personalized study paths based on your unique knowledge gaps and learning style.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href={user ? '/dashboard' : '/auth/signup'}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium"
            >
              Start Learning
            </Link>
            <Link
              href="#features"
              className="px-6 py-3 border border-border rounded-md hover:bg-accent transition-colors font-medium"
            >
              Learn More
            </Link>
          </div>
        </div>

        <div id="features" className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-20">
          <div className="p-6 border border-border rounded-lg space-y-3">
            <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold">Diagnostic Assessment</h3>
            <p className="text-muted-foreground">
              AI analyzes your current knowledge to identify strengths and weaknesses.
            </p>
          </div>

          <div className="p-6 border border-border rounded-lg space-y-3">
            <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold">Personalized Roadmap</h3>
            <p className="text-muted-foreground">
              Get a custom learning path that targets your specific gaps first.
            </p>
          </div>

          <div className="p-6 border border-border rounded-lg space-y-3">
            <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center">
              <Brain className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold">AI Tutor</h3>
            <p className="text-muted-foreground">
              Chat with your personal AI tutor for instant explanations and guidance.
            </p>
          </div>

          <div className="p-6 border border-border rounded-lg space-y-3">
            <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold">Adaptive Content</h3>
            <p className="text-muted-foreground">
              Content difficulty adjusts based on your progress and performance.
            </p>
          </div>
        </div>

        <div className="mt-32 text-center">
          <h2 className="text-4xl font-bold mb-8">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mx-auto">
                1
              </div>
              <h3 className="text-xl font-semibold">Choose Your Topic</h3>
              <p className="text-muted-foreground">
                Select what you want to learn and take a quick diagnostic quiz.
              </p>
            </div>

            <div className="space-y-4">
              <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mx-auto">
                2
              </div>
              <h3 className="text-xl font-semibold">Get Your Roadmap</h3>
              <p className="text-muted-foreground">
                AI generates a personalized 6-module learning path based on your results.
              </p>
            </div>

            <div className="space-y-4">
              <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mx-auto">
                3
              </div>
              <h3 className="text-xl font-semibold">Learn & Master</h3>
              <p className="text-muted-foreground">
                Progress through modules with AI tutor support whenever you need help.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-border mt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              <span className="font-semibold">AdaptLearn AI</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 AdaptLearn AI. Powered by Google Gemini.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
