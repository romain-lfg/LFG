import React from 'react';
import { render, screen } from '@testing-library/react';
import { withAuth } from '../withAuth';
import { useAuth } from '@/context/AuthContext';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';

// Mock the useAuth hook
jest.mock('@/context/AuthContext', () => ({
  useAuth: jest.fn(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock the useAuthRedirect hook
jest.mock('@/hooks/useAuthRedirect', () => ({
  useAuthRedirect: jest.fn(),
}));

describe('withAuth HOC', () => {
  // Test component to wrap
  const TestComponent = () => <div>Test Component</div>;
  
  // Helper to set mock return values for useAuth
  const mockUseAuth = (returnValue: any) => {
    (useAuth as jest.Mock).mockReturnValue(returnValue);
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('renders loading spinner when isLoading is true', () => {
    mockUseAuth({
      isLoading: true,
      isAuthenticated: false,
    });
    
    const WrappedComponent = withAuth(TestComponent);
    render(<WrappedComponent />);
    
    expect(screen.getByRole('presentation', { hidden: true })).toHaveClass('animate-spin');
    expect(screen.queryByText('Test Component')).not.toBeInTheDocument();
  });
  
  it('renders component when authenticated and no redirect is needed', () => {
    mockUseAuth({
      isLoading: false,
      isAuthenticated: true,
      userProfile: { metadata: { role: 'user' } },
    });
    
    const WrappedComponent = withAuth(TestComponent);
    render(<WrappedComponent />);
    
    expect(screen.getByText('Test Component')).toBeInTheDocument();
  });
  
  it('renders loading spinner when unauthenticated and redirectUnauthenticated is true', () => {
    mockUseAuth({
      isLoading: false,
      isAuthenticated: false,
    });
    
    const WrappedComponent = withAuth(TestComponent, { redirectUnauthenticated: true });
    render(<WrappedComponent />);
    
    expect(screen.getByRole('presentation', { hidden: true })).toHaveClass('animate-spin');
    expect(screen.queryByText('Test Component')).not.toBeInTheDocument();
    expect(useAuthRedirect).toHaveBeenCalledWith({ redirectUnauthenticated: true });
  });
  
  it('renders loading spinner when authenticated and redirectAuthenticated is true', () => {
    mockUseAuth({
      isLoading: false,
      isAuthenticated: true,
    });
    
    const WrappedComponent = withAuth(TestComponent, { redirectAuthenticated: true });
    render(<WrappedComponent />);
    
    expect(screen.getByRole('presentation', { hidden: true })).toHaveClass('animate-spin');
    expect(screen.queryByText('Test Component')).not.toBeInTheDocument();
    expect(useAuthRedirect).toHaveBeenCalledWith({ redirectAuthenticated: true });
  });
  
  it('calls useAuthRedirect with correct options', () => {
    mockUseAuth({
      isLoading: false,
      isAuthenticated: true,
      userProfile: { metadata: { role: 'admin' } },
    });
    
    const options = {
      redirectUnauthenticated: true,
      unauthenticatedRedirectUrl: '/login',
      requiredRole: 'admin',
    };
    
    const WrappedComponent = withAuth(TestComponent, options);
    render(<WrappedComponent />);
    
    expect(useAuthRedirect).toHaveBeenCalledWith(options);
    expect(screen.getByText('Test Component')).toBeInTheDocument();
  });
  
  it('sets correct display name for wrapped component', () => {
    const WrappedComponent = withAuth(TestComponent);
    expect(WrappedComponent.displayName).toBe('withAuth(TestComponent)');
  });
});
