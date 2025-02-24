'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import { ReactNode } from 'react';

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
          showWalletLoginFirst: false, // Show email/social login options first
        },
        supportedChains: [
          {
            id: process.env.NEXT_PUBLIC_NETWORK === 'sepolia' ? 11155111 : 1, // Sepolia or Mainnet
            name: process.env.NEXT_PUBLIC_NETWORK === 'sepolia' ? 'Sepolia' : 'Ethereum',
          }
        ],
        defaultChain: {
          id: process.env.NEXT_PUBLIC_NETWORK === 'sepolia' ? 11155111 : 1,
          name: process.env.NEXT_PUBLIC_NETWORK === 'sepolia' ? 'Sepolia' : 'Ethereum',
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
};
