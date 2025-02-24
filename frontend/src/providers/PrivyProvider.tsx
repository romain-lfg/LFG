'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import { ReactNode } from 'react';

interface AppPrivyProviderProps {
  children: ReactNode;
}

export const AppPrivyProvider = ({ children }: AppPrivyProviderProps) => {
  const chainId = process.env.NEXT_PUBLIC_NETWORK === 'sepolia' ? 11155111 : 1;
  const chainName = process.env.NEXT_PUBLIC_NETWORK === 'sepolia' ? 'Sepolia' : 'Ethereum';

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
        supportedWallets: ['metamask', 'walletconnect', 'privy'],
        defaultWallet: 'privy',
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
          noPromptOnSignature: false,
        },
        supportedChains: [{
          id: chainId,
          name: chainName,
          rpcUrl: `https://${chainName.toLowerCase()}.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_ID}`,
          nativeCurrency: {
            name: 'Ether',
            symbol: 'ETH',
            decimals: 18,
          },
        }],
        defaultChain: {
          id: chainId,
          name: chainName,
          rpcUrl: `https://${chainName.toLowerCase()}.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_ID}`,
          nativeCurrency: {
            name: 'Ether',
            symbol: 'ETH',
            decimals: 18,
          },
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
};
