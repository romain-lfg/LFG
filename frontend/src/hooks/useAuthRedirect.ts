import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

type UseAuthRedirectOptions = {
  /**
   * When true, redirects authenticated users away from the page
   */
  redirectAuthenticated?: boolean;
  
  /**
   * When true, redirects unauthenticated users away from the page
   */
  redirectUnauthenticated?: boolean;
  
  /**
   * URL to redirect authenticated users to
   */
  authenticatedRedirectUrl?: string;
  
  /**
   * URL to redirect unauthenticated users to
   */
  unauthenticatedRedirectUrl?: string;
  
  /**
   * Required role for accessing the page
   */
  requiredRole?: string;
};

/**
 * Hook to handle authentication-based redirects
 * 
 * @example
 * // Redirect authenticated users away from login page
 * useAuthRedirect({ redirectAuthenticated: true, authenticatedRedirectUrl: '/dashboard' });
 * 
 * @example
 * // Redirect unauthenticated users away from protected page
 * useAuthRedirect({ redirectUnauthenticated: true, unauthenticatedRedirectUrl: '/login' });
 * 
 * @example
 * // Redirect users without admin role
 * useAuthRedirect({ requiredRole: 'admin', unauthenticatedRedirectUrl: '/unauthorized' });
 */
export const useAuthRedirect = ({
  redirectAuthenticated = false,
  redirectUnauthenticated = false,
  authenticatedRedirectUrl = '/dashboard',
  unauthenticatedRedirectUrl = '/',
  requiredRole,
}: UseAuthRedirectOptions = {}) => {
  const router = useRouter();
  const { isAuthenticated, isLoading, userProfile } = useAuth();

  useEffect(() => {
    // Don't redirect while still loading
    if (isLoading) return;

    // Check if user has required role
    const hasRequiredRole = requiredRole
      ? userProfile?.metadata?.role === requiredRole
      : true;

    // Redirect authenticated users
    if (isAuthenticated && redirectAuthenticated) {
      router.push(authenticatedRedirectUrl);
      return;
    }

    // Redirect unauthenticated users
    if (!isAuthenticated && redirectUnauthenticated) {
      router.push(unauthenticatedRedirectUrl);
      return;
    }

    // Redirect users without required role
    if (isAuthenticated && requiredRole && !hasRequiredRole) {
      router.push(unauthenticatedRedirectUrl);
      return;
    }
  }, [
    isAuthenticated,
    isLoading,
    redirectAuthenticated,
    redirectUnauthenticated,
    authenticatedRedirectUrl,
    unauthenticatedRedirectUrl,
    requiredRole,
    userProfile,
    router,
  ]);
};
