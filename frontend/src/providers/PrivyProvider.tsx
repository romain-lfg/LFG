'use client';

import dynamic from 'next/dynamic';
import { ReactNode, useEffect, useState } from 'react';
import { AuthProvider } from '@/context/AuthContext';

// Dynamically import Privy components with no SSR
const PrivyProvider = dynamic(
  () => import('@privy-io/react-auth').then((mod) => mod.PrivyProvider),
  { ssr: false }
);

interface AppPrivyProviderProps {
  children: ReactNode;
}

export const AppPrivyProvider = ({ children }: AppPrivyProviderProps) => {
  // Use client-side only rendering to avoid SSG issues with Privy
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // Get the app ID from environment variable
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID || '';
  
  // Check if we're in build mode or server-side rendering
  const isServer = typeof window === 'undefined';
  const skipAuthDuringBuild = isServer && process.env.NEXT_PUBLIC_SKIP_AUTH_DURING_BUILD === 'true';
  
  // During SSR or when not mounted yet, just render the AuthProvider with children
  if (isServer || !mounted) {
    return (
      <AuthProvider>
        {children}
      </AuthProvider>
    );
  }
  
  // For client-side rendering with Privy
  return (
    <PrivyProvider
      appId={appId}
      config={{
        loginMethods: ['email', 'google', 'telegram', 'wallet'],
        appearance: {
          theme: 'light',
          accentColor: '#676FFF',
          showWalletLoginFirst: false,
        },
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
        },
      }}
    >
      <AuthProvider>
        {children}
      </AuthProvider>
    </PrivyProvider>
  );
};
