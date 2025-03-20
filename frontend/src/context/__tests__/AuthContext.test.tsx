import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';
import { useAuth as usePrivyAuth } from '@/hooks/useAuth';

// Mock the usePrivyAuth hook
jest.mock('@/hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

// Test component that uses the useAuth hook
const TestComponent = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  
  return (
    <div>
      <div data-testid="auth-status">
        {isLoading ? 'Loading' : isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
      </div>
      {user && <div data-testid="user-name">{user.name}</div>}
    </div>
  );
};

describe('AuthContext', () => {
  // Helper to set mock return values for usePrivyAuth
  const mockUsePrivyAuth = (returnValue: any) => {
    (usePrivyAuth as jest.Mock).mockReturnValue(returnValue);
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('provides authentication state to children', () => {
    mockUsePrivyAuth({
      login: jest.fn(),
      logout: jest.fn(),
      isAuthenticated: true,
      isLoading: false,
      user: { name: 'Test User' },
      userProfile: { id: '123', created_at: '2023-01-01' },
      activeWallet: { address: '0x1234' },
      syncUserWithBackend: jest.fn(),
      fetchUserProfile: jest.fn(),
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
    expect(screen.getByTestId('user-name')).toHaveTextContent('Test User');
  });

  it('provides loading state to children', () => {
    mockUsePrivyAuth({
      login: jest.fn(),
      logout: jest.fn(),
      isAuthenticated: false,
      isLoading: true,
      user: null,
      userProfile: null,
      activeWallet: null,
      syncUserWithBackend: jest.fn(),
      fetchUserProfile: jest.fn(),
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('auth-status')).toHaveTextContent('Loading');
  });

  it('provides unauthenticated state to children', () => {
    mockUsePrivyAuth({
      login: jest.fn(),
      logout: jest.fn(),
      isAuthenticated: false,
      isLoading: false,
      user: null,
      userProfile: null,
      activeWallet: null,
      syncUserWithBackend: jest.fn(),
      fetchUserProfile: jest.fn(),
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated');
  });

  it('throws an error when useAuth is used outside of AuthProvider', () => {
    // Spy on console.error to prevent the error from being logged during the test
    jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useAuth must be used within an AuthProvider');

    // Restore console.error
    (console.error as jest.Mock).mockRestore();
  });
});
