import { renderHook } from '@testing-library/react';
import { useAuthRedirect } from '../useAuthRedirect';
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

describe('useAuthRedirect', () => {
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

  it('redirects authenticated users when redirectAuthenticated is true', () => {
    const mockPush = jest.fn();
    mockUseAuth({
      isAuthenticated: true,
      isLoading: false,
      userProfile: { metadata: { role: 'user' } },
    });
    mockUseRouter({
      push: mockPush,
    });

    renderHook(() => useAuthRedirect({
      redirectAuthenticated: true,
      authenticatedRedirectUrl: '/dashboard',
    }));

    expect(mockPush).toHaveBeenCalledWith('/dashboard');
  });

  it('redirects unauthenticated users when redirectUnauthenticated is true', () => {
    const mockPush = jest.fn();
    mockUseAuth({
      isAuthenticated: false,
      isLoading: false,
      userProfile: null,
    });
    mockUseRouter({
      push: mockPush,
    });

    renderHook(() => useAuthRedirect({
      redirectUnauthenticated: true,
      unauthenticatedRedirectUrl: '/login',
    }));

    expect(mockPush).toHaveBeenCalledWith('/login');
  });

  it('does not redirect when isLoading is true', () => {
    const mockPush = jest.fn();
    mockUseAuth({
      isAuthenticated: false,
      isLoading: true,
      userProfile: null,
    });
    mockUseRouter({
      push: mockPush,
    });

    renderHook(() => useAuthRedirect({
      redirectUnauthenticated: true,
      unauthenticatedRedirectUrl: '/login',
    }));

    expect(mockPush).not.toHaveBeenCalled();
  });

  it('redirects users without required role', () => {
    const mockPush = jest.fn();
    mockUseAuth({
      isAuthenticated: true,
      isLoading: false,
      userProfile: { metadata: { role: 'user' } },
    });
    mockUseRouter({
      push: mockPush,
    });

    renderHook(() => useAuthRedirect({
      requiredRole: 'admin',
      unauthenticatedRedirectUrl: '/unauthorized',
    }));

    expect(mockPush).toHaveBeenCalledWith('/unauthorized');
  });

  it('does not redirect users with required role', () => {
    const mockPush = jest.fn();
    mockUseAuth({
      isAuthenticated: true,
      isLoading: false,
      userProfile: { metadata: { role: 'admin' } },
    });
    mockUseRouter({
      push: mockPush,
    });

    renderHook(() => useAuthRedirect({
      requiredRole: 'admin',
      unauthenticatedRedirectUrl: '/unauthorized',
    }));

    expect(mockPush).not.toHaveBeenCalled();
  });

  it('does not redirect when no redirect options are provided', () => {
    const mockPush = jest.fn();
    mockUseAuth({
      isAuthenticated: true,
      isLoading: false,
      userProfile: { metadata: { role: 'user' } },
    });
    mockUseRouter({
      push: mockPush,
    });

    renderHook(() => useAuthRedirect());

    expect(mockPush).not.toHaveBeenCalled();
  });
});
