'use client';

import { useCallback, useEffect, useState } from 'react';
import { ensureAbsoluteUrl } from '@/utils/url';

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
      // Get the active wallet first
      const activeWallet = wallets[0]; // Use the first wallet as the active one
      
      // Define the type for linked accounts
      interface LinkedAccount {
        type: string;
        address?: string;
      }
      
      console.log('Starting user sync with backend', {
        userId: user.id,
        email: user.email?.address,
        walletsCount: wallets.length,
        environment: process.env.NEXT_PUBLIC_ENVIRONMENT,
        apiUrl: process.env.NEXT_PUBLIC_API_URL,
        // Log linked accounts with proper typing
        linkedAccounts: user.linkedAccounts?.map((acc: LinkedAccount) => ({ type: acc.type })),
        // Log wallet info safely
        walletInfo: activeWallet ? {
          type: activeWallet.walletClientType,
          address: activeWallet.address ? `${activeWallet.address.substring(0, 6)}...` : null
        } : null
      });
      setIsSyncing(true);
      
      console.log('Requesting access token from Privy...');
      let token;
      try {
        token = await getAccessToken();
        // Log token details safely
        if (token) {
          const [header] = token.split('.');
          const decodedHeader = JSON.parse(Buffer.from(header, 'base64').toString());
          console.log('Received token details:', {
            length: token.length,
            algorithm: decodedHeader.alg,
            keyId: decodedHeader.kid,
            tokenType: decodedHeader.typ
          });
        }
      } catch (tokenError: any) {
        console.error('Failed to get access token:', {
          error: tokenError.message,
          name: tokenError.name,
          code: tokenError.code
        });
        setIsSyncing(false);
        return;
      }
      
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

      // Construct the API URL directly to avoid any issues with URL construction
      let endpointUrl: string;
      try {
        // Get the API URL from environment variables
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        console.log('API URL from environment:', apiUrl);
        
        if (!apiUrl) {
          throw new Error('NEXT_PUBLIC_API_URL environment variable is not set');
        }
        
        // Ensure the API URL has a protocol
        let normalizedApiUrl = apiUrl;
        if (!apiUrl.startsWith('http://') && !apiUrl.startsWith('https://')) {
          normalizedApiUrl = `https://${apiUrl}`;
          console.log('Added https:// protocol to API URL:', normalizedApiUrl);
        }
        
        // Try to parse the URL, but have a fallback if it fails
        let baseUrl: string;
        try {
          // Create a URL object to validate and normalize the API URL
          const parsedUrl = new URL(normalizedApiUrl);
          baseUrl = parsedUrl.origin; // This gets just the protocol, hostname, and port
          console.log('Successfully parsed API URL:', baseUrl);
        } catch (parseError) {
          // Fallback to string manipulation if URL parsing fails
          console.warn('URL parsing failed, using string manipulation instead:', parseError);
          baseUrl = normalizedApiUrl.endsWith('/') ? normalizedApiUrl.slice(0, -1) : normalizedApiUrl;
        }
        
        // Construct the full endpoint URL
        endpointUrl = `${baseUrl}/api/users/sync`;
        
        console.log('Preparing to send user data to backend', { 
          userId: user.id, 
          wallet: activeWallet.address,
          endpoint: endpointUrl,
          apiUrlFromEnv: apiUrl,
          normalizedApiUrl
        });
      } catch (error) {
        console.error('Failed to construct API URL:', error);
        setIsSyncing(false);
        return;
      }

      // Extract user information from Privy user object
      // Handle different possible structures of the Privy user object
      let walletAddress = activeWallet.address;
      let emailAddress = user.email?.address;
      
      // If email is not directly available, try to find it in linkedAccounts
      if (!emailAddress && user.linkedAccounts) {
        // Define a type for the account to avoid the implicit 'any' type error
        interface PrivyAccount {
          type: string;
          address?: string;
        }
        
        const emailAccount = user.linkedAccounts.find((account: PrivyAccount) => account.type === 'email');
        if (emailAccount) {
          emailAddress = emailAccount.address;
        }
      }
      
      // Prepare the user data for synchronization
      const userData = {
        walletAddress,
        email: emailAddress,
        metadata: {
          userId: user.id,
          privyId: user.id,
          walletType: activeWallet.walletClientType,
          // Include additional useful metadata
          hasVerifiedEmail: user.email?.verified === true,
          linkedAccountsCount: user.linkedAccounts?.length || 0
        }
      };
      
      console.log('User data being sent to backend:', userData);
      
      try {
        // Log the exact request details (without sensitive info)
        console.log('Making API request to:', {
          url: endpointUrl,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer [token-redacted]'
          },
          // Log cookie presence
          hasCookies: typeof window !== 'undefined' && !!document.cookie,
          // Log CORS settings
          corsMode: 'include',
          // Log environment
          environment: process.env.NEXT_PUBLIC_ENVIRONMENT,
          apiUrl: process.env.NEXT_PUBLIC_API_URL
        });
        
        const response = await fetch(endpointUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          credentials: 'include', // Add this to send cookies cross-origin
          body: JSON.stringify(userData),
        });

        // Create a simple object with key response headers instead of using entries() iterator
        const headerObj: Record<string, string> = {};
        response.headers.forEach((value, key) => {
          headerObj[key] = value;
        });
        
        console.log('Backend sync response received', {
          status: response.status,
          statusText: response.statusText,
          headers: headerObj,
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
        console.error('Error during user sync fetch operation:', error);
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

      // Use the utility function to ensure we have an absolute URL
      const endpointUrl = ensureAbsoluteUrl('/api/users/me');
      console.log('Fetching profile from API', {
        endpoint: endpointUrl
      });

      const response = await fetch(endpointUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include', // Add this to send cookies cross-origin
      });

      // Create a simple object with key response headers instead of using entries() iterator
      const headerObj: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        headerObj[key] = value;
      });
      
      console.log('Profile fetch response received', {
        status: response.status,
        statusText: response.statusText,
        headers: headerObj,
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
