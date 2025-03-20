'use client';

import { ReactNode, useEffect, useState } from 'react';
import { AuthProvider } from '@/context/AuthContext';

// Import a client-only component to handle Privy
const ClientOnly = ({ children }: { children: ReactNode }) => {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return null;
  }

  return <>{children}</>;
};

// Create a separate component for Privy that only renders on client
const PrivyWrapper = ({ children, appId }: { children: ReactNode; appId: string }) => {
  // We need to use require here because this component only runs on the client
  // This prevents SSR issues with Privy
  const { PrivyProvider } = require('@privy-io/react-auth');

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
      {children}
    </PrivyProvider>
  );
};

interface AppPrivyProviderProps {
  children: ReactNode;
}

export const AppPrivyProvider = ({ children }: AppPrivyProviderProps) => {
  // Get the app ID from environment variable
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID || '';
  
  // Check if we're in server-side environment
  const isServer = typeof window === 'undefined';
  const skipAuthDuringBuild = isServer && process.env.NEXT_PUBLIC_SKIP_AUTH_DURING_BUILD === 'true';
  
  // During SSR, just render the AuthProvider with children
  if (isServer) {
    return (
      <AuthProvider>
        {children}
      </AuthProvider>
    );
  }
  
  // For client-side rendering with Privy
  return (
    <ClientOnly>
      <PrivyWrapper appId={appId}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </PrivyWrapper>
    </ClientOnly>
  );
};
