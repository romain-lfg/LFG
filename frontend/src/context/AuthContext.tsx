'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useAuth as usePrivyAuth, UserProfile } from '@/hooks/useAuth';

interface AuthContextType {
  login: () => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any;
  userProfile: UserProfile | null;
  activeWallet: any;
  syncUserWithBackend: () => Promise<void>;
  fetchUserProfile: () => Promise<void>;
}

// Create a mock auth context for build time and SSR
const mockAuthContext: AuthContextType = {
  login: () => {},
  logout: () => {},
  isAuthenticated: false,
  isLoading: false,
  user: null,
  userProfile: null,
  activeWallet: null,
  syncUserWithBackend: async () => {},
  fetchUserProfile: async () => {},
};

// Initialize context with mockAuthContext to ensure it's never undefined
const AuthContext = createContext<AuthContextType>(mockAuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Check if we're in server-side environment (build or SSR)
  const isServer = typeof window === 'undefined';
  const skipAuthDuringBuild = isServer && 
    process.env.NEXT_PUBLIC_SKIP_AUTH_DURING_BUILD === 'true';
  
  // Always use mock auth during server-side rendering or build
  // Only use real auth on the client
  const auth = isServer || skipAuthDuringBuild ? mockAuthContext : usePrivyAuth();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  // Context should never be undefined now, but just in case
  if (context === undefined) {
    // Check if we're in server-side environment
    if (typeof window === 'undefined') {
      return mockAuthContext;
    }
    // This should never happen with our setup, but keeping as a safeguard
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};
