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
    if (!authenticated || !user || !wallets.length) {
      console.log('Not syncing user: missing auth, user, or wallet', { 
        authenticated, 
        user: !!user, 
        wallets: wallets.length 
      });
      return;
    }

    try {
      console.log('Starting user sync with backend', {
        userId: user.id,
        email: user.email?.address,
        walletsCount: wallets.length,
        environment: process.env.NEXT_PUBLIC_ENVIRONMENT // Log the environment
      });
      setIsSyncing(true);
      const activeWallet = wallets[0]; // Use the first wallet as the active one
      
      console.log('Requesting access token from Privy...');
      const token = await getAccessToken();
      
      if (!token) {
        console.error('No access token available for user sync');
        setIsSyncing(false);
        return;
      }

      // Log token details (safely)
      console.log('Got token from Privy', { 
        tokenReceived: !!token,
        tokenLength: token.length,
        tokenPrefix: token.substring(0, 10) + '...' // Only log prefix for security
      });

      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      console.log('Preparing to send user data to backend', { 
        userId: user.id, 
        wallet: activeWallet.address,
        apiUrl: apiUrl,
        endpoint: `${apiUrl}/api/users/sync`
      });

      const userData = {
        walletAddress: activeWallet.address,
        email: user.email?.address,
        metadata: {
          userId: user.id,
          // Add any other user metadata you want to store
        }
      };
      
      console.log('User data being sent to backend:', userData);

      const response = await fetch(`${apiUrl}/api/users/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      });

      console.log('Backend sync response received', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries([...response.headers.entries()]),
        ok: response.ok
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to sync user with backend', { 
          status: response.status, 
          statusText: response.statusText,
          error: errorText 
        });
      } else {
        const data = await response.json();
        console.log('User synced successfully', {
          userData: data,
          userProfile: data.user
        });
        setUserProfile(data.user);
      }
    } catch (error) {
      console.error('Error syncing user with backend:', error);
      // Log more details about the error
      if (error instanceof Error) {
        console.error('Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
      }
    } finally {
      setIsSyncing(false);
    }
  }, [authenticated, user, wallets, getAccessToken]);

  // Fetch user profile from backend
  const fetchUserProfile = useCallback(async () => {
    if (!authenticated) {
      console.log('Not fetching profile: user not authenticated');
      return;
    }
    
    try {
      console.log('Fetching user profile from backend', {
        environment: process.env.NEXT_PUBLIC_ENVIRONMENT
      });
      setIsSyncing(true);
      
      console.log('Requesting access token from Privy for profile fetch...');
      const token = await getAccessToken();
      
      if (!token) {
        console.error('No access token available for profile fetch');
        setIsSyncing(false);
        return;
      }

      // Log token details (safely)
      console.log('Got token for profile fetch', { 
        tokenReceived: !!token,
        tokenLength: token.length,
        tokenPrefix: token.substring(0, 10) + '...' // Only log prefix for security
      });

      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      console.log('Fetching profile from API', {
        apiUrl: apiUrl,
        endpoint: `${apiUrl}/api/users/me`
      });

      const response = await fetch(`${apiUrl}/api/users/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('Profile fetch response received', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries([...response.headers.entries()]),
        ok: response.ok
      });

      if (response.ok) {
        const data = await response.json();
        console.log('User profile fetched successfully', {
          profileData: data,
          user: data.user
        });
        setUserProfile(data.user);
      } else {
        const errorText = await response.text();
        console.error('Failed to fetch user profile', { 
          status: response.status, 
          statusText: response.statusText,
          error: errorText 
        });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // Log more details about the error
      if (error instanceof Error) {
        console.error('Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
      }
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
