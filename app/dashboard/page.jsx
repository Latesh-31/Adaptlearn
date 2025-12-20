'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Brain, Plus, BookOpen, TrendingUp, LogOut, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import QuizModal from '@/components/QuizModal';
import { getUserCourses, deleteCourse } from '@/app/actions/courses';
import { signOut } from '@/app/actions/auth';

export default function DashboardPage() {
  const router = useRouter();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch('/api/auth/me');
        if (!response.ok) {
          router.push('/auth/signin');
          return;
        }
        
        const data = await response.json();
        setUser(data.user);
        
        const result = await getUserCourses(data.user.id);
        if (result.success) {
          setCourses(result.courses);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, [router]);

  async function handleSignOut() {
    await signOut();
    router.push('/');
  }

  async function handleDeleteCourse(courseId) {
    if (!confirm('Are you sure you want to delete this course?')) return;
    
    const result = await deleteCourse(courseId, user.id);
    if (result.success) {
      setCourses(courses.filter(c => c._id !== courseId));
      toast.success('Course deleted');
    } else {
      toast.error(result.error || 'Failed to delete course');
    }
  }

  function handleCourseCreated(courseId) {
    setShowQuizModal(false);
    router.push(`/course/${courseId}`);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Brain className="w-6 h-6 text-primary" />
              <span className="text-xl font-semibold">AdaptLearn AI</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {user?.name}
              </span>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold">My Learning Dashboard</h1>
            <p className="mt-2 text-muted-foreground">
              Track your progress and continue your learning journey
            </p>
          </div>
          <button
            onClick={() => setShowQuizModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            Start New Course
          </button>
        </div>

        {courses.length === 0 ? (
          <div className="border border-border rounded-lg p-12 text-center">
            <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No courses yet</h3>
            <p className="text-muted-foreground mb-6">
              Start your first course by taking a diagnostic quiz
            </p>
            <button
              onClick={() => setShowQuizModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium"
            >
              <Plus className="w-5 h-5" />
              Create Your First Course
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <div
                key={course._id}
                className="border border-border rounded-lg p-6 hover:border-primary/50 transition-colors cursor-pointer group relative"
                onClick={() => router.push(`/course/${course._id}`)}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteCourse(course._id);
                  }}
                  className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold truncate">
                      {course.topic}
                    </h3>
                    <p className="text-sm text-muted-foreground capitalize">
                      {course.level} Level
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{course.progress}%</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Module {course.currentModuleIndex + 1} of {course.roadmap.length}
                    </span>
                    {course.assessmentScore !== undefined && (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <TrendingUp className="w-4 h-4" />
                        <span>{course.assessmentScore}%</span>
                      </div>
                    )}
                  </div>

                  {course.weaknesses && course.weaknesses.length > 0 && (
                    <div className="pt-3 border-t border-border">
                      <p className="text-xs text-muted-foreground mb-1">Focus Areas:</p>
                      <div className="flex flex-wrap gap-1">
                        {course.weaknesses.slice(0, 2).map((weakness, idx) => (
                          <span
                            key={idx}
                            className="text-xs px-2 py-1 bg-secondary rounded text-muted-foreground"
                          >
                            {weakness}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {showQuizModal && user && (
        <QuizModal
          userId={user.id}
          onClose={() => setShowQuizModal(false)}
          onCourseCreated={handleCourseCreated}
        />
      )}
    </div>
  );
}
