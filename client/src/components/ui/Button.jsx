import React from 'react';
import { Loader2 } from 'lucide-react';

import { cn } from '../../lib/cn';

const buttonVariants = {
  primary:
    'bg-brand text-white hover:bg-brand-700 active:bg-brand-700 border border-transparent',
  secondary:
    'bg-white text-gray-900 border border-gray-200 hover:bg-gray-50 active:bg-gray-100',
  ghost: 'bg-transparent text-gray-900 hover:bg-gray-50 active:bg-gray-100 border border-transparent'
};

const sizeVariants = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-9 px-3.5 text-sm',
  lg: 'h-10 px-4 text-sm'
};

export const Button = React.forwardRef(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled,
      type = 'button',
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        className={cn(
          'inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium outline-none transition-colors',
          'focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1',
          'disabled:cursor-not-allowed disabled:opacity-60',
          sizeVariants[size],
          buttonVariants[variant],
          className
        )}
        {...props}
      >
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
        <span className={cn(isLoading ? 'opacity-90' : undefined)}>{children}</span>
      </button>
    );
  }
);

Button.displayName = 'Button';
