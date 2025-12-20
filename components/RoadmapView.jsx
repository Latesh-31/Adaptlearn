'use client';

import { Lock, CheckCircle2, Circle } from 'lucide-react';
import { cn } from '@/lib/cn';

export default function RoadmapView({ roadmap, selectedModule, onSelectModule }) {
  return (
    <div className="p-6 space-y-4">
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Learning Roadmap</h3>
        <p className="text-sm text-muted-foreground">
          Your personalized path to mastery
        </p>
      </div>

      <div className="space-y-3">
        {roadmap.map((module, idx) => {
          const isSelected = selectedModule?._id === module._id;
          const isLocked = module.status === 'locked';
          const isCompleted = module.status === 'completed';
          const isActive = module.status === 'active';

          return (
            <button
              key={module._id}
              onClick={() => onSelectModule(module)}
              disabled={isLocked}
              className={cn(
                'w-full text-left p-4 border rounded-lg transition-all',
                isSelected && 'border-primary bg-primary/10',
                !isSelected && !isLocked && 'border-border hover:border-primary/50',
                isLocked && 'border-border opacity-50 cursor-not-allowed',
                isCompleted && 'border-border/50'
              )}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 pt-0.5">
                  {isLocked && <Lock className="w-5 h-5 text-muted-foreground" />}
                  {isCompleted && <CheckCircle2 className="w-5 h-5 text-primary" />}
                  {isActive && <Circle className="w-5 h-5 text-primary fill-primary" />}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-muted-foreground">
                      Module {module.order}
                    </span>
                    {isCompleted && module.completedAt && (
                      <span className="text-xs text-muted-foreground">
                        ✓ {new Date(module.completedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <h4 className={cn(
                    'font-semibold mb-1 text-sm',
                    isLocked && 'text-muted-foreground',
                    !isLocked && 'text-foreground'
                  )}>
                    {module.title}
                  </h4>
                  <p className={cn(
                    'text-xs line-clamp-2',
                    isLocked && 'text-muted-foreground/70',
                    !isLocked && 'text-muted-foreground'
                  )}>
                    {module.description}
                  </p>
                </div>
              </div>

              {isActive && (
                <div className="mt-3 pt-3 border-t border-border">
                  <div className="flex items-center gap-2 text-xs text-primary">
                    <Circle className="w-3 h-3 fill-primary" />
                    <span className="font-medium">Current Module</span>
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {roadmap.every(m => m.status === 'completed') && (
        <div className="mt-6 p-4 bg-primary/10 border border-primary rounded-lg text-center">
          <p className="text-sm font-medium text-primary">
            🎉 Congratulations! You&apos;ve completed all modules!
          </p>
        </div>
      )}
    </div>
  );
}
