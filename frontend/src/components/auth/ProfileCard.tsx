'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { formatWalletAddress, getUserDisplayName } from '@/utils/auth';
import { Spinner } from '../ui/Spinner';

/**
 * A component to display user profile information
 * Shows user details, wallet address, and other profile information
 */
export const ProfileCard: React.FC = () => {
  const { isLoading, user, userProfile, activeWallet } = useAuth();

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg p-6">
        <div className="flex justify-center items-center h-40">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  if (!user || !userProfile) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg p-6">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <p>User profile not available</p>
        </div>
      </div>
    );
  }

  const displayName = getUserDisplayName(user, activeWallet);
  const joinDate = new Date(userProfile.created_at).toLocaleDateString();

  return (
    <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-24" />
      <div className="px-6 py-5 relative">
        <div className="absolute -top-12 left-6 bg-white dark:bg-gray-700 rounded-full p-1 shadow-lg">
          {userProfile.metadata?.avatar ? (
            <img 
              src={userProfile.metadata.avatar} 
              alt={displayName} 
              className="h-20 w-20 rounded-full object-cover"
            />
          ) : (
            <div className="h-20 w-20 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
              <svg className="h-10 w-10 text-indigo-600 dark:text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          )}
        </div>
        
        <div className="mt-10">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {displayName}
          </h2>
          
          <div className="mt-4 space-y-3">
            {activeWallet && (
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <svg className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                <span>{formatWalletAddress(activeWallet.address)}</span>
              </div>
            )}
            
            {user.email?.address && (
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <svg className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>{user.email.address}</span>
              </div>
            )}
            
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <svg className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Joined {joinDate}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
          Account Information
        </h3>
        <dl className="mt-2 divide-y divide-gray-200 dark:divide-gray-700">
          <div className="py-2 flex justify-between">
            <dt className="text-sm text-gray-500 dark:text-gray-400">User ID</dt>
            <dd className="text-sm text-gray-900 dark:text-gray-300 font-mono">{userProfile.id.substring(0, 8)}...</dd>
          </div>
          <div className="py-2 flex justify-between">
            <dt className="text-sm text-gray-500 dark:text-gray-400">Authentication Method</dt>
            <dd className="text-sm text-gray-900 dark:text-gray-300">
              {user.email ? 'Email' : activeWallet ? 'Wallet' : 'Other'}
            </dd>
          </div>
          <div className="py-2 flex justify-between">
            <dt className="text-sm text-gray-500 dark:text-gray-400">Last Updated</dt>
            <dd className="text-sm text-gray-900 dark:text-gray-300">
              {new Date(userProfile.updated_at).toLocaleDateString()}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
};
