import { cn } from '../../lib/cn';

const CourseCard = ({ 
  title, 
  description, 
  progress = 0, 
  tag,
  className,
  ...props 
}) => {
  const clampedProgress = Math.max(0, Math.min(100, progress));

  return (
    <div
      className={cn(
        'group rounded-lg border border-gray-200 bg-white p-4 transition-all cursor-pointer hover:shadow-sm',
        className
      )}
      {...props}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-900 mb-1 line-clamp-2">
            {title}
          </h3>
          {description && (
            <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed">
              {description}
            </p>
          )}
        </div>
        {tag && (
          <span className="ml-3 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 flex-shrink-0">
            {tag}
          </span>
        )}
      </div>

      {/* Progress Bar */}
      {clampedProgress > 0 && (
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span>Progress</span>
            <span>{Math.round(clampedProgress)}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-0.5">
            <div
              className="bg-gray-800 h-0.5 rounded-full transition-all duration-300"
              style={{ width: `${clampedProgress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseCard;