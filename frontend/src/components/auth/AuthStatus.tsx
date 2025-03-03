'use client';

import { useAuth } from '@/context/AuthContext';

interface AuthStatusProps {
  loadingComponent?: React.ReactNode;
  authenticatedComponent?: React.ReactNode | ((props: { user: any }) => React.ReactNode);
  unauthenticatedComponent?: React.ReactNode;
}

export const AuthStatus = ({
  loadingComponent,
  authenticatedComponent,
  unauthenticatedComponent,
}: AuthStatusProps) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return loadingComponent ? (
      <>{loadingComponent}</>
    ) : (
      <div className="flex items-center justify-center py-4">
        <div 
          data-testid="loading-spinner"
          className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-indigo-400"
        ></div>
      </div>
    );
  }

  if (isAuthenticated) {
    if (typeof authenticatedComponent === 'function') {
      return <>{authenticatedComponent({ user })}</>;
    }
    return authenticatedComponent ? <>{authenticatedComponent}</> : null;
  }

  return unauthenticatedComponent ? <>{unauthenticatedComponent}</> : null;
};

export default AuthStatus;
