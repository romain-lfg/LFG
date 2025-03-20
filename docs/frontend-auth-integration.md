# Frontend Authentication Integration Guide

This guide provides instructions for integrating the Privy authentication system into the frontend of the LFG platform.

## Overview

The LFG platform uses Privy.io for authentication, which provides a seamless authentication experience with multiple login methods, including email, social login, and wallet connection. This guide will walk you through the integration process.

## Prerequisites

- React.js application
- Privy.io account
- Privy App ID

## Installation

Install the Privy React SDK:

```bash
npm install @privy-io/react-auth
```

## Configuration

### 1. Set up environment variables

Create or update your `.env` file with the following variables:

```
NEXT_PUBLIC_PRIVY_APP_ID=your-privy-app-id
NEXT_PUBLIC_API_URL=your-backend-api-url
```

### 2. Create the Authentication Context

Create a new file `src/context/AuthContext.tsx`:

```tsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import axios from 'axios';

// Define types
interface User {
  id: string;
  walletAddress?: string;
  email?: string;
  metadata?: Record<string, any>;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  syncUserData: () => Promise<void>;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

// Create context
export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
  syncUserData: async () => {},
});

// Create provider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { 
    ready,
    authenticated, 
    user: privyUser, 
    login: privyLogin, 
    logout: privyLogout,
    getAccessToken
  } = usePrivy();
  
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Sync user data with backend
  const syncUserData = async () => {
    if (!authenticated || !privyUser) return;
    
    try {
      const token = await getAccessToken();
      
      const userData = {
        walletAddress: privyUser.wallet?.address,
        email: privyUser.email?.address,
        metadata: {
          name: privyUser.name,
          // Add any additional metadata here
        },
      };
      
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/sync`,
        userData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      setUser(response.data.user);
    } catch (error) {
      console.error('Error syncing user data:', error);
    }
  };
  
  // Fetch user profile from backend
  const fetchUserProfile = async () => {
    if (!authenticated || !privyUser) return;
    
    try {
      const token = await getAccessToken();
      
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/profile`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      setUser(response.data.user);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };
  
  // Handle login
  const login = async () => {
    await privyLogin();
  };
  
  // Handle logout
  const logout = async () => {
    await privyLogout();
    setUser(null);
  };
  
  // Effect to handle authentication state changes
  useEffect(() => {
    if (!ready) return;
    
    if (authenticated && privyUser) {
      // First try to fetch the user profile
      fetchUserProfile().then(() => {
        // If we couldn't get a profile or it's a new user, sync the data
        if (!user) {
          syncUserData();
        }
      });
    } else {
      setUser(null);
    }
    
    setLoading(false);
  }, [ready, authenticated, privyUser]);
  
  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: authenticated,
        user,
        loading,
        login,
        logout,
        syncUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for using the auth context
export const useAuth = () => useContext(AuthContext);
```

### 3. Create the Privy Provider

Create a new file `src/providers/PrivyProvider.tsx`:

```tsx
import React from 'react';
import { PrivyProvider as PrivyProviderBase } from '@privy-io/react-auth';
import { AuthProvider } from '../context/AuthContext';

interface PrivyProviderProps {
  children: React.ReactNode;
}

export const PrivyProvider: React.FC<PrivyProviderProps> = ({ children }) => {
  return (
    <PrivyProviderBase
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ''}
      config={{
        loginMethods: ['email', 'google', 'wallet'],
        appearance: {
          theme: 'light',
          accentColor: '#4F46E5',
          logo: 'https://your-logo-url.com/logo.png',
        },
        embeddedWallets: {
          createOnLogin: true,
        },
      }}
    >
      <AuthProvider>{children}</AuthProvider>
    </PrivyProviderBase>
  );
};
```

### 4. Wrap your application with the Privy Provider

Update your `src/pages/_app.tsx` or main application file:

```tsx
import React from 'react';
import { PrivyProvider } from '../providers/PrivyProvider';

function MyApp({ Component, pageProps }) {
  return (
    <PrivyProvider>
      <Component {...pageProps} />
    </PrivyProvider>
  );
}

export default MyApp;
```

## Protected Routes

### 1. Create a Protected Route component

Create a new file `src/components/ProtectedRoute.tsx`:

```tsx
import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, loading, router]);
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  return isAuthenticated ? <>{children}</> : null;
};
```

### 2. Use the Protected Route component

Wrap any protected pages with the ProtectedRoute component:

```tsx
// src/pages/dashboard.tsx
import React from 'react';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { DashboardContent } from '../components/DashboardContent';

const DashboardPage: React.FC = () => {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
};

export default DashboardPage;
```

## Authentication UI Components

### 1. Login Button

Create a login button component:

```tsx
// src/components/LoginButton.tsx
import React from 'react';
import { useAuth } from '../context/AuthContext';

export const LoginButton: React.FC = () => {
  const { isAuthenticated, login, logout } = useAuth();
  
  return (
    <button
      onClick={isAuthenticated ? logout : login}
      className="btn btn-primary"
    >
      {isAuthenticated ? 'Disconnect' : 'Connect'}
    </button>
  );
};
```

### 2. User Profile

Create a user profile component:

```tsx
// src/components/UserProfile.tsx
import React from 'react';
import { useAuth } from '../context/AuthContext';

export const UserProfile: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated || !user) {
    return null;
  }
  
  return (
    <div className="user-profile">
      <h2>User Profile</h2>
      <p>ID: {user.id}</p>
      {user.email && <p>Email: {user.email}</p>}
      {user.walletAddress && <p>Wallet: {user.walletAddress}</p>}
      {user.metadata?.name && <p>Name: {user.metadata.name}</p>}
    </div>
  );
};
```

## Conditional Rendering

Use the authentication state to conditionally render UI elements:

```tsx
// src/components/Navbar.tsx
import React from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { LoginButton } from './LoginButton';

export const Navbar: React.FC = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <nav className="navbar">
      <div className="logo">
        <Link href="/">LFG</Link>
      </div>
      <div className="nav-links">
        <Link href="/">Home</Link>
        <Link href="/bounties">Bounties</Link>
        {isAuthenticated && <Link href="/dashboard">Dashboard</Link>}
      </div>
      <LoginButton />
    </nav>
  );
};
```

## API Requests with Authentication

Create a utility function for making authenticated API requests:

```tsx
// src/utils/api.ts
import axios from 'axios';
import { usePrivy } from '@privy-io/react-auth';

// Create an axios instance
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// Custom hook for authenticated API requests
export const useAuthenticatedApi = () => {
  const { getAccessToken } = usePrivy();
  
  const authGet = async (url: string) => {
    const token = await getAccessToken();
    return api.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  };
  
  const authPost = async (url: string, data: any) => {
    const token = await getAccessToken();
    return api.post(url, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  };
  
  const authPut = async (url: string, data: any) => {
    const token = await getAccessToken();
    return api.put(url, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  };
  
  const authDelete = async (url: string) => {
    const token = await getAccessToken();
    return api.delete(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  };
  
  return {
    authGet,
    authPost,
    authPut,
    authDelete,
  };
};
```

Use the authenticated API utility:

```tsx
// src/components/BountyList.tsx
import React, { useEffect, useState } from 'react';
import { useAuthenticatedApi } from '../utils/api';

export const BountyList: React.FC = () => {
  const [bounties, setBounties] = useState([]);
  const [loading, setLoading] = useState(true);
  const { authGet } = useAuthenticatedApi();
  
  useEffect(() => {
    const fetchBounties = async () => {
      try {
        const response = await authGet('/api/bounties');
        setBounties(response.data.bounties);
      } catch (error) {
        console.error('Error fetching bounties:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBounties();
  }, []);
  
  if (loading) {
    return <div>Loading bounties...</div>;
  }
  
  return (
    <div className="bounty-list">
      <h2>Bounties</h2>
      {bounties.map((bounty) => (
        <div key={bounty.id} className="bounty-item">
          <h3>{bounty.title}</h3>
          <p>{bounty.description}</p>
          <p>Reward: {bounty.reward}</p>
        </div>
      ))}
    </div>
  );
};
```

## Testing

### 1. Manual Testing

Use the test HTML page to test the authentication flow:

1. Open `http://localhost:3000/test-auth.html` in your browser.
2. Click the "Run Authentication Test" button to run the automated test.
3. Use the manual testing section to test each step individually.

### 2. Automated Testing

Create a test file for the authentication context:

```tsx
// src/context/AuthContext.test.tsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import { PrivyProvider } from '@privy-io/react-auth';

// Mock the Privy provider
jest.mock('@privy-io/react-auth', () => ({
  usePrivy: jest.fn().mockReturnValue({
    ready: true,
    authenticated: false,
    user: null,
    login: jest.fn(),
    logout: jest.fn(),
    getAccessToken: jest.fn().mockResolvedValue('mock-token'),
  }),
  PrivyProvider: ({ children }) => <div>{children}</div>,
}));

// Test component that uses the auth context
const TestComponent = () => {
  const { isAuthenticated, user, login, logout } = useAuth();
  
  return (
    <div>
      <div data-testid="auth-status">
        {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
      </div>
      <button onClick={login} data-testid="login-button">
        Login
      </button>
      <button onClick={logout} data-testid="logout-button">
        Logout
      </button>
    </div>
  );
};

describe('AuthContext', () => {
  it('provides the authentication state', async () => {
    render(
      <PrivyProvider>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </PrivyProvider>
    );
    
    // Initial state should be not authenticated
    expect(screen.getByTestId('auth-status')).toHaveTextContent(
      'Not Authenticated'
    );
    
    // Mock the authenticated state
    const mockPrivy = require('@privy-io/react-auth').usePrivy;
    mockPrivy.mockReturnValue({
      ready: true,
      authenticated: true,
      user: {
        id: 'test-user-id',
        wallet: {
          address: '0xtest',
        },
        email: {
          address: 'test@example.com',
        },
      },
      login: jest.fn(),
      logout: jest.fn(),
      getAccessToken: jest.fn().mockResolvedValue('mock-token'),
    });
    
    // Re-render with the new state
    render(
      <PrivyProvider>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </PrivyProvider>
    );
    
    // Wait for the state to update
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent(
        'Authenticated'
      );
    });
  });
});
```

## Conclusion

This guide provides a comprehensive approach to integrating Privy authentication into your frontend application. By following these steps, you'll have a fully functional authentication system that supports multiple login methods and provides a seamless user experience.

For more information, refer to the [Privy documentation](https://docs.privy.io/) and the [LFG authentication system documentation](./authentication-system.md).
