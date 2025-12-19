import React from 'react';

import { cn } from '../../lib/cn';

export const Input = React.forwardRef(
  ({ className, type = 'text', invalid = false, ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          'h-9 w-full rounded-md border bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400',
          'focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-1',
          'disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500',
          invalid ? 'border-red-300 focus:ring-red-500' : 'border-gray-200',
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';
