import { cn } from '../../lib/cn';

export const Card = ({ className, ...props }) => {
  return (
    <div
      className={cn('rounded-lg border border-gray-200 bg-white', className)}
      {...props}
    />
  );
};
