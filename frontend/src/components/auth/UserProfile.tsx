'use client';

import { useAuth } from '@/context/AuthContext';

interface UserProfileProps {
  className?: string;
  showWallet?: boolean;
  showEmail?: boolean;
}

export const UserProfile = ({
  className = '',
  showWallet = true,
  showEmail = true,
}: UserProfileProps) => {
  const { isAuthenticated, isLoading, user, userProfile, activeWallet } = useAuth();

  if (isLoading) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div 
          data-testid="loading-spinner"
          className="h-8 w-8 rounded-full bg-gray-700 animate-pulse" 
        />
        <div className="h-4 w-24 bg-gray-700 rounded animate-pulse" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  // Get user display name
  const displayName = user.name || userProfile?.metadata?.name || 'User';
  
  // Format wallet address for display
  const formattedWalletAddress = activeWallet?.address 
    ? `${activeWallet.address.substring(0, 6)}...${activeWallet.address.substring(activeWallet.address.length - 4)}`
    : null;

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* User Avatar */}
      <div className="h-8 w-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-medium">
        {displayName.charAt(0).toUpperCase()}
      </div>
      
      {/* User Info */}
      <div className="flex flex-col">
        <span className="text-sm font-medium text-white">{displayName}</span>
        
        {showEmail && user.email?.address && (
          <span className="text-xs text-gray-400">{user.email.address}</span>
        )}
        
        {showWallet && formattedWalletAddress && (
          <span className="text-xs text-gray-400">{formattedWalletAddress}</span>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
