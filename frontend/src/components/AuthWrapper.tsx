'use client';

import { ReactNode } from 'react';
import { PrivyProvider } from '@privy-io/react-auth';
import { AuthProvider } from '@/context/AuthContext';

interface AuthWrapperProps {
  children: ReactNode;
}

export const AuthWrapper = ({ children }: AuthWrapperProps) => {
  const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

  if (!privyAppId) {
    console.error('Missing NEXT_PUBLIC_PRIVY_APP_ID environment variable');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500">Authentication configuration error. Please check environment variables.</p>
      </div>
    );
  }

  return (
    <PrivyProvider
      appId={privyAppId}
      config={{
        loginMethods: ['email', 'google', 'telegram', 'wallet'],
        appearance: {
          theme: 'dark',
          accentColor: '#7C3AED', // Purple for primary brand color
          logo: '/logo.png',
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
