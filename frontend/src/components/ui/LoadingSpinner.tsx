import React from 'react';
import { cn } from '@/lib/utils';

type LoadingSpinnerProps = {
  /**
   * Size of the spinner
   * @default "md"
   */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  
  /**
   * Color of the spinner
   * @default "primary"
   */
  color?: 'primary' | 'secondary' | 'white' | 'black';
  
  /**
   * Additional CSS classes
   */
  className?: string;
};

/**
 * Loading spinner component
 */
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'primary',
  className,
}) => {
  // Size classes
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-3',
    xl: 'w-12 h-12 border-4',
  };
  
  // Color classes
  const colorClasses = {
    primary: 'border-blue-600 border-t-transparent',
    secondary: 'border-gray-600 border-t-transparent',
    white: 'border-white border-t-transparent',
    black: 'border-black border-t-transparent',
  };
  
  return (
    <div
      role="presentation"
      aria-hidden="true"
      data-testid="loading-spinner"
      className={cn(
        'animate-spin rounded-full',
        sizeClasses[size],
        colorClasses[color],
        className
      )}
    />
  );
};

export default LoadingSpinner;
