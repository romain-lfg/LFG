import { PrivyClient } from '@privy-io/server-auth';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import dotenv from 'dotenv';
import { ExtendedAuthTokenClaims, PrivyUser, PrivyLinkedAccount } from '../types/auth.types.js';

// Load environment variables
dotenv.config();

// Get environment variables
const privyAppId = process.env.PRIVY_APP_ID;
const privyAppSecret = process.env.PRIVY_APP_SECRET;
// JWKS URL for token verification
const JWKS_URL = `https://auth.privy.io/api/v1/apps/${privyAppId}/jwks.json`;
const nodeEnv = process.env.NODE_ENV || 'development';

// Log environment information with detailed key information
console.log('🔐 AuthService: Environment configuration', {
  environment: nodeEnv,
  hasPrivyAppId: !!privyAppId,
  hasPrivyAppSecret: !!privyAppSecret,
  jwksUrl: JWKS_URL
});

// Validate environment variables
if (!privyAppId) {
  console.error('Missing PRIVY_APP_ID environment variable. Please check your .env file.');
  process.exit(1);
}

// Create Privy client
const privyClient = new PrivyClient(
  privyAppId,
  privyAppSecret || ''
);

/**
 * Authentication service for handling auth-related operations
 */
export class AuthService {
  /**
   * Verify a Privy authentication token
   * @param token JWT token to verify
   * @returns Verified claims if token is valid, null otherwise
   */
  /**
   * Verify a Privy authentication token using JWKS
   * @param authHeader Authorization header containing the JWT token
   * @returns Verified claims if token is valid, null otherwise
   */
  async verifyToken(authHeader: string): Promise<ExtendedAuthTokenClaims | null> {
    try {
      if (!authHeader) {
        console.error('🔐 AuthService: No authorization header provided');
        return null;
      }
      
      // Extract token from Bearer header (following Privy's docs)
      const token = authHeader.replace(/^Bearer /, '');
      if (!token) {
        console.error('🔐 AuthService: No token found in authorization header');
        return null;
      }
      
      // Create JWKS client
      const JWKS = createRemoteJWKSet(new URL(JWKS_URL));

      // Verify token using JWKS
      const { payload } = await jwtVerify(token, JWKS, {
        issuer: 'privy.io',
        audience: privyAppId
      });

      // Cast payload to our expected claims type
      const verifiedClaims = payload as unknown as ExtendedAuthTokenClaims;
      
      // Extract user information from claims
      if (!verifiedClaims.sub) {
        console.error('🔐 AuthService: Missing sub field in verified claims');
        return null;
      }
      
      // Extract userId from the sub field (format: did:privy:<userId>)
      const userId = verifiedClaims.sub.startsWith('did:privy:') 
        ? verifiedClaims.sub.replace('did:privy:', '') 
        : verifiedClaims.sub;
      
      // Set all the fields in the verified claims
      verifiedClaims.userId = userId;
      verifiedClaims.appId = verifiedClaims.aud;
      
      // Set backward compatibility fields
      verifiedClaims.issuedAt = verifiedClaims.iat;
      verifiedClaims.expiration = verifiedClaims.exp;
      verifiedClaims.issuer = verifiedClaims.iss;
      verifiedClaims.sessionId = verifiedClaims.sid;
      
      console.log('🔐 AuthService: Token verification successful', {
        userId,
        hasLinkedAccounts: !!(verifiedClaims.linkedAccounts && verifiedClaims.linkedAccounts.length > 0)
      });

      // Extract email and wallet from linked accounts if available
      const linkedAccounts = verifiedClaims.linkedAccounts || [];
      const emailAccount = linkedAccounts.find(account => account.type === 'email');
      const walletAccount = linkedAccounts.find(account => account.type === 'wallet');

      // Construct user object from claims
      const user = {
        id: verifiedClaims.userId,
        email: emailAccount?.email,
        walletAddress: walletAccount?.address,
        appId: verifiedClaims.appId,
        linkedAccounts: verifiedClaims.linkedAccounts
      };
      
      // Log successful verification with more details
      console.log('🔐 AuthService: Token verification successful', {
        hasUserId: !!user.id,
        userId: user.id,
        hasEmail: !!user.email,
        hasWalletAddress: !!user.walletAddress,
        linkedAccounts: linkedAccounts.length,
        issuer: verifiedClaims.iss,
        subject: verifiedClaims.sub,
        tokenExpiry: verifiedClaims.exp
      });
      
      return { ...verifiedClaims, user };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('🔐 AuthService: Token verification error:', {
        error: errorMessage,
        errorType: error instanceof Error ? error.constructor.name : typeof error,
        errorStack: error instanceof Error ? error.stack : undefined,
        token: authHeader ? `${authHeader.substring(0, 10)}...` : 'none',
        tokenLength: authHeader?.length,
        jwksUrl: JWKS_URL,
        environment: process.env.NODE_ENV
      });
      return null;
    }
  }

  /**
   * Validate a session using an authorization header
   * @param authHeader Authorization header containing the JWT token (Bearer format)
   * @returns Session information if valid, null otherwise
   */
  async validateSession(authHeader: string): Promise<{ valid: boolean; user: PrivyUser | null; claims: ExtendedAuthTokenClaims | null }> {
    try {
      // Verify token from auth header
      const claims = await this.verifyToken(authHeader);
      if (!claims) {
        return { valid: false, user: null, claims: null };
      }
      
      // If we have a user object in claims, use that directly
      if (claims.user) {
        
        // Create a proper PrivyUser object from the claims.user data
        const userFromClaims: PrivyUser = {
          id: claims.userId, // Use the userId we extracted from sub
          createdAt: new Date(claims.iat * 1000),
          linkedAccounts: claims.linkedAccounts || [],
          email: claims.user.email ? { address: claims.user.email } : undefined,
          wallet: claims.user.walletAddress ? { address: claims.user.walletAddress } : undefined
        };
        
        // Return the claims with the user object
        return { valid: true, user: userFromClaims, claims };
      }

      // Otherwise, create user object from claims
      const user: PrivyUser = {
        id: claims.userId,
        createdAt: new Date(claims.iat * 1000),
        linkedAccounts: []
      };

      // Extract linked accounts if present
      if (Array.isArray(claims.linkedAccounts)) {
        for (const account of claims.linkedAccounts) {

          const linkedAccount: PrivyLinkedAccount = {
            type: account.type
          };

          if (account.address) linkedAccount.address = account.address;
          if (account.username) linkedAccount.username = account.username;
          if (account.email) linkedAccount.email = account.email;

          // Set specific account fields based on type
          switch (account.type) {
            case 'wallet':
              if (account.address) {
                user.wallet = { address: account.address };

              }
              break;
            case 'email':
              if (account.email) {
                user.email = { address: account.email };

              }
              break;
            case 'discord':
              if (account.username) {
                user.discord = { username: account.username };

              }
              break;
            case 'telegram':
              if (account.username) {
                user.telegram = { username: account.username };

              }
              break;
          }

          // Add to linked accounts array (only once)
          user.linkedAccounts.push(linkedAccount);
        }
      }

      return { valid: true, user, claims };
    } catch (error: unknown) {
      console.error('Error validating session:', error instanceof Error ? error.message : 'Unknown error');
      return { valid: false, user: null, claims: null };
    }
  }
}
