'use client';

import { useCallback, useEffect, useState } from 'react';

// Create mock implementations for server-side rendering
const createMockPrivyHooks = () => {
  return {
    usePrivy: () => ({
      login: () => {},
      logout: () => {},
      authenticated: false,
      user: null,
      ready: true,
      getAccessToken: async () => null,
    }),
    useWallets: () => ({ wallets: [] }),
  };
};

// Create safe versions of hooks that won't throw errors
const createSafeHooks = () => {
  try {
    // Only attempt to import if we're on the client
    if (typeof window !== 'undefined') {
      const privyAuth = require('@privy-io/react-auth');
      return {
        usePrivy: () => {
          try {
            return privyAuth.usePrivy();
          } catch (e) {
            console.warn('Error using Privy hook:', e);
            return createMockPrivyHooks().usePrivy();
          }
        },
        useWallets: () => {
          try {
            return privyAuth.useWallets();
          } catch (e) {
            console.warn('Error using wallets hook:', e);
            return createMockPrivyHooks().useWallets();
          }
        }
      };
    }
  } catch (e) {
    console.warn('Failed to import Privy hooks:', e);
  }
  
  return createMockPrivyHooks();
};

// Get the appropriate hooks based on environment
const { usePrivy, useWallets } = createSafeHooks();

export type UserProfile = {
  id: string;
  wallet_address?: string;
  email?: string;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, any>;
};

export const useAuth = () => {
  const {
    login,
    logout,
    authenticated,
    user,
    ready,
    getAccessToken,
  } = usePrivy();

  const { wallets } = useWallets();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Sync user data with our backend when authentication state changes
  const syncUserWithBackend = useCallback(async () => {
    if (!authenticated || !user || !wallets.length) return;

    try {
      setIsSyncing(true);
      const activeWallet = wallets[0]; // Use the first wallet as the active one
      const token = await getAccessToken();
      
      if (!token) {
        console.error('No access token available');
        setIsSyncing(false);
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          walletAddress: activeWallet.address,
          email: user.email?.address,
          metadata: {
            // Use only available properties from the user object
            userId: user.id,
            // Add any other user metadata you want to store
          }
        }),
      });

      if (!response.ok) {
        console.error('Failed to sync user with backend');
      } else {
        const data = await response.json();
        setUserProfile(data.user);
      }
    } catch (error) {
      console.error('Error syncing user with backend:', error);
    } finally {
      setIsSyncing(false);
    }
  }, [authenticated, user, wallets, getAccessToken]);

  // Fetch user profile from backend
  const fetchUserProfile = useCallback(async () => {
    if (!authenticated) return;
    
    try {
      setIsSyncing(true);
      const token = await getAccessToken();
      
      if (!token) {
        console.error('No access token available');
        setIsSyncing(false);
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUserProfile(data.user);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setIsSyncing(false);
    }
  }, [authenticated, getAccessToken]);

  // Sync user whenever authentication state changes
  useEffect(() => {
    if (ready && authenticated) {
      syncUserWithBackend();
    } else {
      setUserProfile(null);
    }
  }, [ready, authenticated, syncUserWithBackend]);

  return {
    login,
    logout,
    isAuthenticated: authenticated,
    isLoading: !ready || isSyncing,
    user,
    userProfile,
    activeWallet: wallets[0],
    syncUserWithBackend,
    fetchUserProfile,
  };
};
