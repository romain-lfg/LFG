'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import { ReactNode } from 'react';
import { AuthProvider } from '@/context/AuthContext';

interface AppPrivyProviderProps {
  children: ReactNode;
}

export const AppPrivyProvider = ({ children }: AppPrivyProviderProps) => {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
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
