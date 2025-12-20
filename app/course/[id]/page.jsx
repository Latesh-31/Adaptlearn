'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Brain, Lock, CheckCircle2, Circle, MessageSquare, ChevronLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { getCourse } from '@/app/actions/courses';
import { generateModuleContent, completeModule, askTutor } from '@/app/actions/ai';
import ChatInterface from '@/components/ChatInterface';
import RoadmapView from '@/components/RoadmapView';

export default function CoursePage() {
  const router = useRouter();
  const params = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);
  const [moduleContent, setModuleContent] = useState('');
  const [loadingContent, setLoadingContent] = useState(false);
  const [showChat, setShowChat] = useState(false);

  const handleSelectModule = useCallback(async (module) => {
    if (module.status === 'locked') {
      toast.error('Complete previous modules first');
      return;
    }

    setSelectedModule(module);
    setLoadingContent(true);
    setModuleContent('');

    try {
      const result = await generateModuleContent(params.id, module._id, user.id);
      if (result.success) {
        setModuleContent(result.content);
      } else {
        toast.error(result.error || 'Failed to load module content');
      }
    } catch (error) {
      console.error('Error loading module:', error);
      toast.error('Failed to load module content');
    } finally {
      setLoadingContent(false);
    }
  }, [params.id, user]);

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
        
        const result = await getCourse(params.id, data.user.id);
        if (result.success) {
          setCourse(result.course);
          const activeModule = result.course.roadmap.find(m => m.status === 'active');
          if (activeModule) {
            handleSelectModule(activeModule);
          }
        } else {
          toast.error(result.error || 'Failed to load course');
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('Error loading course:', error);
        toast.error('Failed to load course');
        router.push('/dashboard');
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, [params.id, router, handleSelectModule]);

  async function handleCompleteModule() {
    if (!selectedModule) return;

    try {
      const result = await completeModule(params.id, selectedModule._id, user.id);
      if (result.success) {
        const updatedCourse = await getCourse(params.id, user.id);
        if (updatedCourse.success) {
          setCourse(updatedCourse.course);
          toast.success('Module completed!');
          
          const nextModule = updatedCourse.course.roadmap.find(m => m.status === 'active');
          if (nextModule) {
            handleSelectModule(nextModule);
          } else {
            toast.success('🎉 Course completed!');
            setSelectedModule(null);
          }
        }
      } else {
        toast.error(result.error || 'Failed to complete module');
      }
    } catch (error) {
      console.error('Error completing module:', error);
      toast.error('Failed to complete module');
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!course) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <nav className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="p-2 hover:bg-accent rounded-md transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2">
                <Brain className="w-6 h-6 text-primary" />
                <div>
                  <h1 className="text-lg font-semibold">{course.topic}</h1>
                  <p className="text-xs text-muted-foreground capitalize">{course.level}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm font-medium">{course.progress}% Complete</div>
                <div className="text-xs text-muted-foreground">
                  Module {course.currentModuleIndex + 1} of {course.roadmap.length}
                </div>
              </div>
              <div className="w-32 h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${course.progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex-1 flex overflow-hidden">
        <aside className="w-80 border-r border-border overflow-y-auto">
          <RoadmapView
            roadmap={course.roadmap}
            selectedModule={selectedModule}
            onSelectModule={handleSelectModule}
          />
        </aside>

        <main className="flex-1 overflow-y-auto">
          {selectedModule ? (
            <div className="max-w-3xl mx-auto p-8">
              <div className="mb-8">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <span>Module {selectedModule.order}</span>
                  <span>•</span>
                  <span className="capitalize">{selectedModule.status}</span>
                </div>
                <h2 className="text-3xl font-bold mb-4">{selectedModule.title}</h2>
                <p className="text-lg text-muted-foreground">{selectedModule.description}</p>
              </div>

              {loadingContent ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="prose prose-invert prose-zinc max-w-none">
                  <div className="whitespace-pre-wrap text-foreground leading-relaxed">
                    {moduleContent}
                  </div>
                </div>
              )}

              {selectedModule.status === 'active' && (
                <div className="mt-12 flex gap-4">
                  <button
                    onClick={() => setShowChat(true)}
                    className="flex items-center gap-2 px-6 py-3 border border-border rounded-md hover:bg-accent transition-colors"
                  >
                    <MessageSquare className="w-5 h-5" />
                    Ask AI Tutor
                  </button>
                  <button
                    onClick={handleCompleteModule}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    Complete Module
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Brain className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Select a module to begin</h3>
                <p className="text-muted-foreground">
                  Choose a module from the roadmap to start learning
                </p>
              </div>
            </div>
          )}
        </main>
      </div>

      {showChat && selectedModule && user && (
        <ChatInterface
          courseId={course._id}
          moduleId={selectedModule._id}
          moduleTitle={selectedModule.title}
          userId={user.id}
          onClose={() => setShowChat(false)}
        />
      )}
    </div>
  );
}
