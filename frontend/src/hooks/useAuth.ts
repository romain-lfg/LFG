'use client';

import { usePrivy, useWallets, useIdentityToken } from '@privy-io/react-auth';
import { useCallback, useEffect } from 'react';

export const useAuth = () => {
  const {
    login,
    logout,
    authenticated,
    user,
    ready,
  } = usePrivy();

  const { wallets } = useWallets();
  const { identityToken } = useIdentityToken();

  // Sync user data with our backend when authentication state changes
  const syncUserWithBackend = useCallback(async () => {
    if (!authenticated || !user || !wallets.length) return;

    try {
      const activeWallet = wallets[0]; // Use the first wallet as the active one
      if (!identityToken) {
        console.error('No identity token available');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${identityToken}`,
        },
        body: JSON.stringify({
          privyUserId: user.id,
          walletAddress: activeWallet.address,
        }),
      });

      if (!response.ok) {
        console.error('Failed to sync user with backend');
      }
    } catch (error) {
      console.error('Error syncing user with backend:', error);
    }
  }, [authenticated, user, wallets, identityToken]);

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
    activeWallet: wallets[0],
  };
};
