import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { AuthProvider } from '@/context/AuthContext';
import { LoginButton } from '@/components/auth/LoginButton';
import { LogoutButton } from '@/components/auth/LogoutButton';
import { UserProfile } from '@/components/auth/UserProfile';
import { AuthStatus } from '@/components/auth/AuthStatus';
import { useAuth as usePrivyAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

// Mock the usePrivyAuth hook
jest.mock('@/hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

// Mock the useRouter hook
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Create a test component that simulates a complete auth flow
const AuthFlowTestComponent = () => {
  const { isAuthenticated, isLoading } = useAuth();
  
  return (
    <div>
      <h1>Authentication Flow Test</h1>
      
      <div data-testid="auth-status">
        Status: {isLoading ? 'Loading' : isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
      </div>
      
      <LoginButton>Login</LoginButton>
      <LogoutButton>Logout</LogoutButton>
      
      <UserProfile />
      
      <AuthStatus
        authenticatedComponent={<div>Welcome, you are logged in!</div>}
        unauthenticatedComponent={<div>Please login to continue</div>}
        loadingComponent={<div>Checking authentication...</div>}
      />
    </div>
  );
};

// Import the actual useAuth hook from the context
const { useAuth } = jest.requireActual('@/context/AuthContext');

describe('Authentication Flow Integration', () => {
  // Helper to set mock return values for usePrivyAuth
  const mockUsePrivyAuth = (returnValue: any) => {
    (usePrivyAuth as jest.Mock).mockReturnValue(returnValue);
  };
  
  // Helper to set mock return values for useRouter
  const mockUseRouter = (returnValue: any) => {
    (useRouter as jest.Mock).mockReturnValue(returnValue);
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter({
      push: jest.fn(),
    });
  });
  
  it('shows the complete authentication flow', async () => {
    // 1. Start with loading state
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
    
    const { rerender } = render(
      <AuthProvider>
        <AuthFlowTestComponent />
      </AuthProvider>
    );
    
    // Verify loading state
    expect(screen.getByTestId('auth-status')).toHaveTextContent('Loading');
    expect(screen.getByText('Checking authentication...')).toBeInTheDocument();
    
    // 2. Transition to unauthenticated state
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
    
    rerender(
      <AuthProvider>
        <AuthFlowTestComponent />
      </AuthProvider>
    );
    
    // Verify unauthenticated state
    expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated');
    expect(screen.getByText('Please login to continue')).toBeInTheDocument();
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.queryByText('Logout')).not.toBeInTheDocument();
    expect(screen.queryByText('Welcome, you are logged in!')).not.toBeInTheDocument();
    
    // 3. Simulate login action
    const mockLogin = jest.fn();
    mockUsePrivyAuth({
      login: mockLogin,
      logout: jest.fn(),
      isAuthenticated: false,
      isLoading: false,
      user: null,
      userProfile: null,
      activeWallet: null,
      syncUserWithBackend: jest.fn(),
      fetchUserProfile: jest.fn(),
    });
    
    rerender(
      <AuthProvider>
        <AuthFlowTestComponent />
      </AuthProvider>
    );
    
    // Click login button
    fireEvent.click(screen.getByText('Login'));
    expect(mockLogin).toHaveBeenCalledTimes(1);
    
    // 4. Transition to loading state after login click
    mockUsePrivyAuth({
      login: mockLogin,
      logout: jest.fn(),
      isAuthenticated: false,
      isLoading: true,
      user: null,
      userProfile: null,
      activeWallet: null,
      syncUserWithBackend: jest.fn(),
      fetchUserProfile: jest.fn(),
    });
    
    rerender(
      <AuthProvider>
        <AuthFlowTestComponent />
      </AuthProvider>
    );
    
    // Verify loading state
    expect(screen.getByTestId('auth-status')).toHaveTextContent('Loading');
    expect(screen.getByText('Checking authentication...')).toBeInTheDocument();
    
    // 5. Transition to authenticated state
    const mockLogout = jest.fn();
    mockUsePrivyAuth({
      login: mockLogin,
      logout: mockLogout,
      isAuthenticated: true,
      isLoading: false,
      user: { 
        name: 'Test User',
        email: { address: 'test@example.com' }
      },
      userProfile: {
        id: 'user-123',
        metadata: { role: 'user' }
      },
      activeWallet: { 
        address: '0x1234567890abcdef1234567890abcdef12345678'
      },
      syncUserWithBackend: jest.fn(),
      fetchUserProfile: jest.fn(),
    });
    
    rerender(
      <AuthProvider>
        <AuthFlowTestComponent />
      </AuthProvider>
    );
    
    // Verify authenticated state
    expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
    expect(screen.getByText('Welcome, you are logged in!')).toBeInTheDocument();
    expect(screen.queryByText('Please login to continue')).not.toBeInTheDocument();
    expect(screen.queryByText('Login')).not.toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
    
    // Verify user profile is displayed
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    // Use a more flexible regex to match the wallet address format
    expect(screen.getByText(/0x1234.*5678/)).toBeInTheDocument();
    
    // 6. Simulate logout action
    fireEvent.click(screen.getByText('Logout'));
    expect(mockLogout).toHaveBeenCalledTimes(1);
    
    // 7. Transition back to loading state after logout
    mockUsePrivyAuth({
      login: mockLogin,
      logout: mockLogout,
      isAuthenticated: true,
      isLoading: true,
      user: { 
        name: 'Test User',
        email: { address: 'test@example.com' }
      },
      userProfile: {
        id: 'user-123',
        metadata: { role: 'user' }
      },
      activeWallet: { 
        address: '0x1234567890abcdef1234567890abcdef12345678'
      },
      syncUserWithBackend: jest.fn(),
      fetchUserProfile: jest.fn(),
    });
    
    rerender(
      <AuthProvider>
        <AuthFlowTestComponent />
      </AuthProvider>
    );
    
    // Verify loading state
    expect(screen.getByTestId('auth-status')).toHaveTextContent('Loading');
    
    // 8. Finally transition back to unauthenticated state
    mockUsePrivyAuth({
      login: mockLogin,
      logout: mockLogout,
      isAuthenticated: false,
      isLoading: false,
      user: null,
      userProfile: null,
      activeWallet: null,
      syncUserWithBackend: jest.fn(),
      fetchUserProfile: jest.fn(),
    });
    
    rerender(
      <AuthProvider>
        <AuthFlowTestComponent />
      </AuthProvider>
    );
    
    // Verify unauthenticated state
    expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated');
    expect(screen.getByText('Please login to continue')).toBeInTheDocument();
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.queryByText('Logout')).not.toBeInTheDocument();
  });
  
  it('handles role-based access correctly', async () => {
    // Set up with admin role
    mockUsePrivyAuth({
      login: jest.fn(),
      logout: jest.fn(),
      isAuthenticated: true,
      isLoading: false,
      user: { 
        name: 'Admin User',
        email: { address: 'admin@example.com' },
        role: 'admin' // Add role directly to user object
      },
      userProfile: {
        id: 'user-456',
        metadata: { role: 'admin' }
      },
      activeWallet: { 
        address: '0x1234567890abcdef1234567890abcdef12345678'
      },
      syncUserWithBackend: jest.fn(),
      fetchUserProfile: jest.fn(),
    });
    
    // Create a component with role-based content
    const RoleBasedComponent = () => (
      <AuthStatus
        authenticatedComponent={({ user }) => (
          <>
            <div>Base authenticated content</div>
            {/* Create a custom component to check for admin role */}
            {user?.role === 'admin' ? (
              <div>Admin content</div>
            ) : (
              <div>Not an admin</div>
            )}
          </>
        )}
        unauthenticatedComponent={<div>Please login</div>}
      />
    );
    
    const { rerender } = render(
      <AuthProvider>
        <RoleBasedComponent />
      </AuthProvider>
    );
    
    // Verify admin content is shown
    expect(screen.getByText('Base authenticated content')).toBeInTheDocument();
    expect(screen.getByText('Admin content')).toBeInTheDocument();
    expect(screen.queryByText('Not an admin')).not.toBeInTheDocument();
    expect(screen.queryByText('Please login')).not.toBeInTheDocument();
    
    // Change to regular user role
    mockUsePrivyAuth({
      login: jest.fn(),
      logout: jest.fn(),
      isAuthenticated: true,
      isLoading: false,
      user: { 
        name: 'Regular User',
        email: { address: 'user@example.com' },
        role: 'user' // Add role directly to user object
      },
      userProfile: {
        id: 'user-789',
        metadata: { role: 'user' }
      },
      activeWallet: { 
        address: '0x1234567890abcdef1234567890abcdef12345678'
      },
      syncUserWithBackend: jest.fn(),
      fetchUserProfile: jest.fn(),
    });
    
    rerender(
      <AuthProvider>
        <RoleBasedComponent />
      </AuthProvider>
    );
    
    // Verify regular user content
    expect(screen.getByText('Base authenticated content')).toBeInTheDocument();
    expect(screen.queryByText('Admin content')).not.toBeInTheDocument();
    expect(screen.getByText('Not an admin')).toBeInTheDocument();
  });
  
  it('handles wallet connection status correctly', async () => {
    // Set up with no wallet
    mockUsePrivyAuth({
      login: jest.fn(),
      logout: jest.fn(),
      isAuthenticated: true,
      isLoading: false,
      user: { 
        name: 'No Wallet User',
        email: { address: 'nowallet@example.com' }
      },
      userProfile: {
        id: 'user-no-wallet',
        metadata: { role: 'user' }
      },
      activeWallet: null,
      syncUserWithBackend: jest.fn(),
      fetchUserProfile: jest.fn(),
    });
    
    // Create a component with wallet-dependent content
    const WalletComponent = () => (
      <div>
        <UserProfile />
        {/* Custom component that checks for wallet */}
        <div data-testid="wallet-status">
          {useAuth().activeWallet ? 'Wallet Connected' : 'No Wallet Connected'}
        </div>
      </div>
    );
    
    const { rerender } = render(
      <AuthProvider>
        <WalletComponent />
      </AuthProvider>
    );
    
    // Verify no wallet status
    expect(screen.getByTestId('wallet-status')).toHaveTextContent('No Wallet Connected');
    expect(screen.queryByText('0x')).not.toBeInTheDocument();
    
    // Change to user with wallet
    mockUsePrivyAuth({
      login: jest.fn(),
      logout: jest.fn(),
      isAuthenticated: true,
      isLoading: false,
      user: { 
        name: 'Wallet User',
        email: { address: 'wallet@example.com' }
      },
      userProfile: {
        id: 'user-with-wallet',
        metadata: { role: 'user' }
      },
      activeWallet: { 
        address: '0x1234567890abcdef1234567890abcdef12345678'
      },
      syncUserWithBackend: jest.fn(),
      fetchUserProfile: jest.fn(),
    });
    
    rerender(
      <AuthProvider>
        <WalletComponent />
      </AuthProvider>
    );
    
    // Verify wallet connected status
    expect(screen.getByTestId('wallet-status')).toHaveTextContent('Wallet Connected');
    // The wallet address might be displayed differently, so use a partial match
    expect(screen.getByText(/0x1234/)).toBeInTheDocument();
  });
});
