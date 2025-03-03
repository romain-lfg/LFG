'use client';

import React from 'react';
import { AlertCircle } from 'lucide-react';

interface AuthErrorProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

/**
 * A component for displaying authentication errors
 * Provides a consistent way to show error messages with an optional retry button
 */
export const AuthError: React.FC<AuthErrorProps> = ({ 
  title = 'Authentication Error',
  message,
  onRetry
}) => {
  return (
    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 my-4">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <AlertCircle className="h-5 w-5 text-red-500" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800 dark:text-red-300">{title}</h3>
          <div className="mt-2 text-sm text-red-700 dark:text-red-400">
            <p>{message}</p>
          </div>
          {onRetry && (
            <div className="mt-4">
              <button
                type="button"
                onClick={onRetry}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 dark:text-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
