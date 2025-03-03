'use client';

import { useAuth } from '@/context/AuthContext';

interface LogoutButtonProps {
  className?: string;
  variant?: 'primary' | 'secondary' | 'text';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  children?: React.ReactNode;
}

export const LogoutButton = ({
  className = '',
  variant = 'text',
  size = 'md',
  fullWidth = false,
  children,
}: LogoutButtonProps) => {
  const { logout, isAuthenticated, isLoading } = useAuth();

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  // Base styles
  let buttonClasses = `inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${className}`;
  
  // Size styles
  if (size === 'sm') {
    buttonClasses += ' px-3 py-1.5 text-sm';
  } else if (size === 'lg') {
    buttonClasses += ' px-6 py-3 text-lg';
  } else {
    buttonClasses += ' px-4 py-2 text-base';
  }
  
  // Variant styles
  if (variant === 'primary') {
    buttonClasses += ' bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-500 hover:to-purple-500';
  } else if (variant === 'secondary') {
    buttonClasses += ' bg-white/10 text-white hover:bg-white/20';
  } else {
    buttonClasses += ' text-indigo-400 hover:text-indigo-300';
  }
  
  // Width style
  if (fullWidth) {
    buttonClasses += ' w-full';
  }
  
  // Disabled style
  if (isLoading) {
    buttonClasses += ' opacity-70 cursor-not-allowed';
  }

  return (
    <button
      className={buttonClasses}
      onClick={logout}
      disabled={isLoading}
    >
      {isLoading ? (
        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
      ) : null}
      {children || 'Disconnect'}
    </button>
  );
};

export default LogoutButton;
