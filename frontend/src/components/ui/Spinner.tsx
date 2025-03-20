'use client';

import React from 'react';
import { cn } from '@/utils/cn';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * A reusable spinner component for loading states
 */
export const Spinner: React.FC<SpinnerProps> = ({ 
  size = 'md',
  className
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-6 w-6 border-2',
    lg: 'h-8 w-8 border-3',
  };

  return (
    <div 
      className={cn(
        'animate-spin rounded-full border-solid border-t-transparent',
        'border-indigo-600 dark:border-indigo-400',
        sizeClasses[size],
        className
      )}
    />
  );
};
