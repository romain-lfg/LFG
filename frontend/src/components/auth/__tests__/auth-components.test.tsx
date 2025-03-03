import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { LoginButton } from '../LoginButton';
import { LogoutButton } from '../LogoutButton';
import { UserProfile } from '../UserProfile';
import { AuthStatus } from '../AuthStatus';
import { useAuth } from '@/context/AuthContext';

// Mock the useAuth hook
jest.mock('@/context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

describe('Authentication Components', () => {
  // Helper to set mock return values for useAuth
  const mockUseAuth = (returnValue: any) => {
    (useAuth as jest.Mock).mockReturnValue(returnValue);
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('LoginButton', () => {
    it('renders correctly when not authenticated', () => {
      mockUseAuth({
        login: jest.fn(),
        isAuthenticated: false,
        isLoading: false,
      });

      render(<LoginButton>Connect Wallet</LoginButton>);
      expect(screen.getByText('Connect Wallet')).toBeInTheDocument();
    });

    it('does not render when authenticated', () => {
      mockUseAuth({
        login: jest.fn(),
        isAuthenticated: true,
        isLoading: false,
      });

      const { container } = render(<LoginButton>Connect Wallet</LoginButton>);
      expect(container.firstChild).toBeNull();
    });

    it('calls login function when clicked', () => {
      const mockLogin = jest.fn();
      mockUseAuth({
        login: mockLogin,
        isAuthenticated: false,
        isLoading: false,
      });

      render(<LoginButton>Connect Wallet</LoginButton>);
      fireEvent.click(screen.getByText('Connect Wallet'));
      expect(mockLogin).toHaveBeenCalledTimes(1);
    });

    it('shows loading state when isLoading is true', () => {
      mockUseAuth({
        login: jest.fn(),
        isAuthenticated: false,
        isLoading: true,
      });

      render(<LoginButton>Connect Wallet</LoginButton>);
      expect(screen.getByText('Connect Wallet')).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeDisabled();
      expect(screen.getByRole('button').querySelector('div.animate-spin')).toBeInTheDocument();
    });
  });

  describe('LogoutButton', () => {
    it('renders correctly when authenticated', () => {
      mockUseAuth({
        logout: jest.fn(),
        isAuthenticated: true,
        isLoading: false,
      });

      render(<LogoutButton>Disconnect</LogoutButton>);
      expect(screen.getByText('Disconnect')).toBeInTheDocument();
    });

    it('does not render when not authenticated', () => {
      mockUseAuth({
        logout: jest.fn(),
        isAuthenticated: false,
        isLoading: false,
      });

      const { container } = render(<LogoutButton>Disconnect</LogoutButton>);
      expect(container.firstChild).toBeNull();
    });

    it('calls logout function when clicked', () => {
      const mockLogout = jest.fn();
      mockUseAuth({
        logout: mockLogout,
        isAuthenticated: true,
        isLoading: false,
      });

      render(<LogoutButton>Disconnect</LogoutButton>);
      fireEvent.click(screen.getByText('Disconnect'));
      expect(mockLogout).toHaveBeenCalledTimes(1);
    });
  });

  describe('UserProfile', () => {
    it('renders user profile when authenticated', () => {
      mockUseAuth({
        isAuthenticated: true,
        isLoading: false,
        user: { name: 'Test User', email: { address: 'test@example.com' } },
        activeWallet: { address: '0x1234567890abcdef1234567890abcdef12345678' },
      });

      render(<UserProfile />);
      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
      expect(screen.getByText('0x1234...5678')).toBeInTheDocument();
    });

    it('does not render when not authenticated', () => {
      mockUseAuth({
        isAuthenticated: false,
        isLoading: false,
      });

      const { container } = render(<UserProfile />);
      expect(container.firstChild).toBeNull();
    });

    it('shows loading state when isLoading is true', () => {
      mockUseAuth({
        isAuthenticated: true,
        isLoading: true,
      });

      render(<UserProfile />);
      expect(screen.getByTestId('loading-spinner')).toHaveClass('animate-pulse');
    });

    it('respects showEmail and showWallet props', () => {
      mockUseAuth({
        isAuthenticated: true,
        isLoading: false,
        user: { name: 'Test User', email: { address: 'test@example.com' } },
        activeWallet: { address: '0x1234567890abcdef1234567890abcdef12345678' },
      });

      // Don't show email
      const { rerender } = render(<UserProfile showEmail={false} />);
      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.queryByText('test@example.com')).not.toBeInTheDocument();
      expect(screen.getByText('0x1234...5678')).toBeInTheDocument();

      // Don't show wallet
      rerender(<UserProfile showWallet={false} />);
      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
      expect(screen.queryByText('0x1234...5678')).not.toBeInTheDocument();
    });
  });

  describe('AuthStatus', () => {
    it('renders authenticatedComponent when authenticated', () => {
      mockUseAuth({
        isAuthenticated: true,
        isLoading: false,
      });

      render(
        <AuthStatus
          authenticatedComponent={<div>Authenticated Content</div>}
          unauthenticatedComponent={<div>Unauthenticated Content</div>}
        />
      );
      expect(screen.getByText('Authenticated Content')).toBeInTheDocument();
      expect(screen.queryByText('Unauthenticated Content')).not.toBeInTheDocument();
    });

    it('renders unauthenticatedComponent when not authenticated', () => {
      mockUseAuth({
        isAuthenticated: false,
        isLoading: false,
      });

      render(
        <AuthStatus
          authenticatedComponent={<div>Authenticated Content</div>}
          unauthenticatedComponent={<div>Unauthenticated Content</div>}
        />
      );
      expect(screen.queryByText('Authenticated Content')).not.toBeInTheDocument();
      expect(screen.getByText('Unauthenticated Content')).toBeInTheDocument();
    });

    it('renders loadingComponent when loading', () => {
      mockUseAuth({
        isAuthenticated: false,
        isLoading: true,
      });

      render(
        <AuthStatus
          loadingComponent={<div>Loading Content</div>}
          authenticatedComponent={<div>Authenticated Content</div>}
          unauthenticatedComponent={<div>Unauthenticated Content</div>}
        />
      );
      expect(screen.getByText('Loading Content')).toBeInTheDocument();
      expect(screen.queryByText('Authenticated Content')).not.toBeInTheDocument();
      expect(screen.queryByText('Unauthenticated Content')).not.toBeInTheDocument();
    });

    it('renders default loading state when no loadingComponent is provided', () => {
      mockUseAuth({
        isAuthenticated: false,
        isLoading: true,
      });

      render(
        <AuthStatus
          authenticatedComponent={<div>Authenticated Content</div>}
          unauthenticatedComponent={<div>Unauthenticated Content</div>}
        />
      );
      expect(screen.getByTestId('loading-spinner')).toHaveClass('animate-spin');
    });
  });
});
