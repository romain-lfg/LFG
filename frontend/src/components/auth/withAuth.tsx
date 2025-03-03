import React, { ComponentType } from 'react';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';
import { AuthProvider } from '@/context/AuthContext';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/context/AuthContext';

export type WithAuthOptions = {
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
 * Loading component displayed while authentication state is being determined
 */
const AuthLoadingComponent = () => (
  <div className="flex items-center justify-center min-h-screen">
    <LoadingSpinner size="lg" />
  </div>
);

/**
 * Higher-order component that handles authentication logic for pages
 * 
 * @example
 * // Protect a page that requires authentication
 * export default withAuth(DashboardPage, { redirectUnauthenticated: true });
 * 
 * @example
 * // Protect a page that requires admin role
 * export default withAuth(AdminPage, { requiredRole: 'admin' });
 */
export function withAuth<P extends object>(
  Component: ComponentType<P>,
  options: WithAuthOptions = {}
) {
  const WithAuthComponent: React.FC<P> = (props) => {
    // Use the hook for redirects
    useAuthRedirect(options);
    
    // Get authentication state
    const { isLoading, isAuthenticated } = useAuth();
    
    // Show loading state while determining authentication
    if (isLoading) {
      return <AuthLoadingComponent />;
    }
    
    // Handle unauthenticated users
    if (!isAuthenticated && options.redirectUnauthenticated) {
      return <AuthLoadingComponent />;
    }
    
    // Handle authenticated users
    if (isAuthenticated && options.redirectAuthenticated) {
      return <AuthLoadingComponent />;
    }
    
    // Handle role requirements
    if (
      isAuthenticated &&
      options.requiredRole &&
      !hasRequiredRole(options.requiredRole)
    ) {
      return <AuthLoadingComponent />;
    }
    
    // Render the wrapped component
    return <Component {...props} />;
  };
  
  // Helper function to check if user has required role
  const hasRequiredRole = (requiredRole: string) => {
    const { userProfile } = useAuth();
    return userProfile?.metadata?.role === requiredRole;
  };
  
  // Set display name for debugging
  const componentName = Component.displayName || Component.name || 'Component';
  WithAuthComponent.displayName = `withAuth(${componentName})`;
  
  // Wrap with AuthProvider to ensure context is available
  const WithAuthWrapper: React.FC<P> = (props) => (
    <AuthProvider>
      <WithAuthComponent {...props} />
    </AuthProvider>
  );
  
  // Set display name for the wrapper component as well
  WithAuthWrapper.displayName = `withAuth(${componentName})`;
  
  return WithAuthWrapper;
}
