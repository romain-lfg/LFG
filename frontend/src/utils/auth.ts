/**
 * Utility functions for authentication
 */

/**
 * Formats a wallet address for display by truncating the middle part
 * 
 * @example
 * // Returns "0x1234...5678"
 * formatWalletAddress("0x1234567890abcdef1234567890abcdef12345678");
 */
export const formatWalletAddress = (address: string, prefixLength = 6, suffixLength = 4): string => {
  if (!address) return '';
  
  // Remove "0x" prefix if it exists
  const cleanAddress = address.startsWith('0x') ? address.slice(2) : address;
  
  // If address is too short, return it as is
  if (cleanAddress.length <= prefixLength + suffixLength) {
    return address;
  }
  
  const prefix = cleanAddress.slice(0, prefixLength);
  const suffix = cleanAddress.slice(-suffixLength);
  
  // Add back "0x" prefix if it was there originally
  const formattedPrefix = address.startsWith('0x') ? `0x${prefix}` : prefix;
  
  return `${formattedPrefix}...${suffix}`;
};

/**
 * Checks if a user has a specific role
 */
export const hasRole = (userProfile: any, role: string): boolean => {
  if (!userProfile || !userProfile.metadata || !userProfile.metadata.role) {
    return false;
  }
  
  return userProfile.metadata.role === role;
};

/**
 * Checks if a user has admin role
 */
export const isAdmin = (userProfile: any): boolean => {
  return hasRole(userProfile, 'admin');
};

/**
 * Gets user's display name from their profile
 * Falls back to email or wallet address if name is not available
 */
export const getUserDisplayName = (user: any, activeWallet: any): string => {
  if (!user) return '';
  
  // Try to get name from user object
  if (user.name) return user.name;
  
  // Try to get email
  if (user.email?.address) return user.email.address;
  
  // Fall back to wallet address
  if (activeWallet?.address) return formatWalletAddress(activeWallet.address);
  
  return 'Anonymous User';
};

/**
 * Parses a JWT token and returns the payload
 */
export const parseJwt = (token: string): any => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join('')
    );
    
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error parsing JWT token:', error);
    return null;
  }
};

/**
 * Checks if a JWT token is expired
 */
export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = parseJwt(token);
    if (!payload || !payload.exp) return true;
    
    const expirationTime = payload.exp * 1000; // Convert to milliseconds
    const currentTime = Date.now();
    
    return currentTime > expirationTime;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true;
  }
};
