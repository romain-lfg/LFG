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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const auth = usePrivyAuth();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
