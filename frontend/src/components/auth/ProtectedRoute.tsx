'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallbackUrl?: string;
  requiredRole?: string;
}

export const ProtectedRoute = ({
  children,
  fallbackUrl = '/',
  requiredRole,
}: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, userProfile } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only redirect after loading is complete and user is not authenticated
    if (!isLoading && !isAuthenticated) {
      router.push(fallbackUrl);
    }

    // If role is required, check if user has the required role
    if (
      !isLoading && 
      isAuthenticated && 
      requiredRole && 
      userProfile?.metadata?.role !== requiredRole
    ) {
      router.push(fallbackUrl);
    }
  }, [isAuthenticated, isLoading, router, fallbackUrl, requiredRole, userProfile]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div 
          data-testid="loading-spinner"
          className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-400"
        ></div>
      </div>
    );
  }

  // If not authenticated, return null (will redirect in useEffect)
  if (!isAuthenticated) {
    return null;
  }

  // If role is required and user doesn't have it, return null (will redirect in useEffect)
  if (requiredRole && userProfile?.metadata?.role !== requiredRole) {
    return null;
  }

  // If authenticated and has required role (if any), render children
  return <>{children}</>;
};

export default ProtectedRoute;
