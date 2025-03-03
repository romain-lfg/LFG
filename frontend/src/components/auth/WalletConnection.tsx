'use client';

import React, { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
// Using inline SVGs instead of Lucide React icons to avoid type conflicts
import { AuthLoading } from './AuthLoading';
import { AuthError } from './AuthError';
import { AuthSuccess } from './AuthSuccess';
import { formatWalletAddress } from '../../utils/auth';

interface WalletConnectionProps {
  onComplete?: () => void;
}

/**
 * A component for managing wallet connections
 * Allows users to connect existing wallets or create new embedded wallets
 */
export const WalletConnection: React.FC<WalletConnectionProps> = ({ onComplete }) => {
  const { user, createWallet, linkWallet } = usePrivy();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleCreateWallet = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await createWallet();
      setSuccess('Your wallet has been created successfully!');
      if (onComplete) {
        setTimeout(onComplete, 2000);
      }
    } catch (err) {
      console.error('Error creating wallet:', err);
      setError('Failed to create wallet. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectWallet = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await linkWallet();
      setSuccess('Your wallet has been connected successfully!');
      if (onComplete) {
        setTimeout(onComplete, 2000);
      }
    } catch (err) {
      console.error('Error connecting wallet:', err);
      setError('Failed to connect wallet. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <AuthLoading message="Processing wallet operation..." />;
  }

  if (error) {
    return <AuthError message={error} onRetry={() => setError(null)} />;
  }

  if (success) {
    return <AuthSuccess message={success} onContinue={onComplete} />;
  }

  // Display connected wallets if any
  const connectedWallets = user?.linkedAccounts?.filter(account => 
    account.type === 'wallet'
  );

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
            Wallet Management
          </h3>
          <div className="mt-2 max-w-xl text-sm text-gray-500 dark:text-gray-400">
            <p>
              Connect an existing wallet or create a new embedded wallet to use with LFG.
            </p>
          </div>
          
          {connectedWallets && connectedWallets.length > 0 ? (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Connected Wallets</h4>
              <ul className="mt-2 divide-y divide-gray-200 dark:divide-gray-700">
                {connectedWallets.map((wallet: any) => (
                  <li key={wallet.address} className="py-3 flex justify-between items-center">
                    <div className="flex items-center">
                      <svg className="h-5 w-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      <span className="text-sm text-gray-900 dark:text-gray-100">
                        {formatWalletAddress(wallet.address)}
                      </span>
                    </div>
                    <a 
                      href={`https://etherscan.io/address/${wallet.address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 flex items-center"
                    >
                      <span className="text-xs mr-1">View</span>
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="mt-4 p-4 border border-dashed border-gray-300 dark:border-gray-600 rounded-md">
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                No wallets connected yet
              </p>
            </div>
          )}
          
          <div className="mt-5 flex flex-col sm:flex-row sm:space-x-3 space-y-3 sm:space-y-0">
            <button
              type="button"
              onClick={handleConnectWallet}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg className="-ml-1 mr-2 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              Connect Existing Wallet
            </button>
            <button
              type="button"
              onClick={handleCreateWallet}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create New Wallet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
