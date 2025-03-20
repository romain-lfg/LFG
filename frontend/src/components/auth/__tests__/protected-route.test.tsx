import React from 'react';
import { render, screen } from '@testing-library/react';
import { ProtectedRoute } from '../ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

// Mock the useAuth hook
jest.mock('@/context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

// Mock the useRouter hook
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('ProtectedRoute', () => {
  // Helper to set mock return values for useAuth
  const mockUseAuth = (returnValue: any) => {
    (useAuth as jest.Mock).mockReturnValue(returnValue);
  };

  // Helper to set mock return values for useRouter
  const mockUseRouter = (returnValue: any) => {
    (useRouter as jest.Mock).mockReturnValue(returnValue);
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders children when authenticated', () => {
    mockUseAuth({
      isAuthenticated: true,
      isLoading: false,
      userProfile: { metadata: { role: 'user' } },
    });

    mockUseRouter({
      push: jest.fn(),
    });

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('redirects to fallbackUrl when not authenticated', () => {
    const mockPush = jest.fn();
    mockUseAuth({
      isAuthenticated: false,
      isLoading: false,
    });

    mockUseRouter({
      push: mockPush,
    });

    render(
      <ProtectedRoute fallbackUrl="/login">
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(mockPush).toHaveBeenCalledWith('/login');
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('shows loading state when isLoading is true', () => {
    mockUseAuth({
      isAuthenticated: false,
      isLoading: true,
    });

    mockUseRouter({
      push: jest.fn(),
    });

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByTestId('loading-spinner')).toHaveClass('animate-spin');
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('redirects when user does not have required role', () => {
    const mockPush = jest.fn();
    mockUseAuth({
      isAuthenticated: true,
      isLoading: false,
      userProfile: { metadata: { role: 'user' } },
    });

    mockUseRouter({
      push: mockPush,
    });

    render(
      <ProtectedRoute requiredRole="admin" fallbackUrl="/unauthorized">
        <div>Admin Content</div>
      </ProtectedRoute>
    );

    expect(mockPush).toHaveBeenCalledWith('/unauthorized');
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
  });

  it('renders children when user has required role', () => {
    mockUseAuth({
      isAuthenticated: true,
      isLoading: false,
      userProfile: { metadata: { role: 'admin' } },
    });

    mockUseRouter({
      push: jest.fn(),
    });

    render(
      <ProtectedRoute requiredRole="admin">
        <div>Admin Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Admin Content')).toBeInTheDocument();
  });
});
