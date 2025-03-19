/**
 * Type definitions for Privy authentication
 * Based on Privy's documentation: https://docs.privy.io/guide/server/authorization/verification
 */

/**
 * Represents a linked account in Privy's authentication system
 * Users can link multiple account types (email, wallet, social, etc.)
 */
export interface PrivyLinkedAccount {
  type: string;        // Account type: 'email', 'wallet', 'discord', 'telegram', etc.
  address?: string;    // Wallet address (for wallet accounts)
  username?: string;   // Username (for social accounts)
  email?: string;      // Email address (for email accounts)
}

/**
 * User information extracted from JWT claims
 */
export interface PrivyUserInfo {
  id: string;                      // Privy user ID
  email?: string;                  // User's email address
  walletAddress?: string;          // User's wallet address
  appId?: string;                  // Privy app ID
  linkedAccounts?: PrivyLinkedAccount[];
}

/**
 * Extended JWT claims from Privy's authentication token
 * Includes standard JWT fields and our custom fields
 */
export interface ExtendedAuthTokenClaims {
  // Standard JWT fields from Privy
  iat: number;         // Issued at timestamp
  exp: number;         // Expiration timestamp
  sub: string;         // DID of the user in format 'did:privy:<userId>'
  aud: string;         // App ID (your Privy app ID)
  iss: string;         // Issuer (should be 'privy.io')
  sid: string;         // Session ID for the current user session
  
  // Our custom fields
  userId: string;      // Extracted user ID from the sub field
  appId: string;       // App ID (same as aud)
  
  // Backward compatibility fields
  issuedAt?: number;   // Same as iat
  expiration?: number; // Same as exp
  issuer?: string;     // Same as iss
  sessionId?: string;  // Same as sid
  
  // User data
  linkedAccounts?: PrivyLinkedAccount[];
  user?: PrivyUserInfo; // User information extracted from claims
}

export interface PrivyUser {
  id: string;
  createdAt: Date;
  email?: { address: string };
  wallet?: { address: string };
  discord?: { username: string };
  telegram?: { username: string };
  customMetadata?: Record<string, any>;
  linkedAccounts: PrivyLinkedAccount[];
}
