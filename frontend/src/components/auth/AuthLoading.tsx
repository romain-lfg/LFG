'use client';

import React from 'react';
import { Spinner } from '../ui/Spinner';

interface AuthLoadingProps {
  message?: string;
}

/**
 * A loading component specifically for authentication operations
 * Displays a spinner with a customizable message
 */
export const AuthLoading: React.FC<AuthLoadingProps> = ({ 
  message = 'Authenticating...' 
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-4">
      <Spinner size="lg" />
      <p className="text-gray-600 dark:text-gray-300 text-center">{message}</p>
    </div>
  );
};
