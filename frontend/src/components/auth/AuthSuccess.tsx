'use client';

import React from 'react';
import { CheckCircle } from 'lucide-react';

interface AuthSuccessProps {
  title?: string;
  message: string;
  onContinue?: () => void;
  continueText?: string;
}

/**
 * A component for displaying authentication success messages
 * Provides a consistent way to show success messages with an optional continue button
 */
export const AuthSuccess: React.FC<AuthSuccessProps> = ({ 
  title = 'Authentication Successful',
  message,
  onContinue,
  continueText = 'Continue'
}) => {
  return (
    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 my-4">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <CheckCircle className="h-5 w-5 text-green-500" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-green-800 dark:text-green-300">{title}</h3>
          <div className="mt-2 text-sm text-green-700 dark:text-green-400">
            <p>{message}</p>
          </div>
          {onContinue && (
            <div className="mt-4">
              <button
                type="button"
                onClick={onContinue}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 dark:text-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                {continueText}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
