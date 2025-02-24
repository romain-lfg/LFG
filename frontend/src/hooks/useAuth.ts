import { usePrivy } from '@privy-io/react-auth';
import { useCallback, useEffect } from 'react';

export const useAuth = () => {
  const {
    login,
    logout,
    authenticated,
    user,
    ready,
    wallet,
  } = usePrivy();

  // Sync user data with our backend when authentication state changes
  const syncUserWithBackend = useCallback(async () => {
    if (!authenticated || !user || !wallet) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await user.getIdToken()}`,
        },
        body: JSON.stringify({
          privyUserId: user.id,
          walletAddress: wallet.address,
        }),
      });

      if (!response.ok) {
        console.error('Failed to sync user with backend');
      }
    } catch (error) {
      console.error('Error syncing user with backend:', error);
    }
  }, [authenticated, user, wallet]);

  // Sync user whenever authentication state changes
  useEffect(() => {
    if (ready && authenticated) {
      syncUserWithBackend();
    }
  }, [ready, authenticated, syncUserWithBackend]);

  return {
    login,
    logout,
    isAuthenticated: authenticated,
    isLoading: !ready,
    user,
    wallet,
  };
};
