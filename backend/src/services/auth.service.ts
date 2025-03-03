import { PrivyClient } from '@privy-io/server-auth';
import { UserService } from './user.service.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get environment variables
const privyAppId = process.env.PRIVY_APP_ID;
const privyAppSecret = process.env.PRIVY_APP_SECRET;
const privyPublicKey = process.env.PRIVY_PUBLIC_KEY;

// Validate environment variables
if (!privyAppId || !privyPublicKey) {
  console.error('Missing Privy environment variables. Please check your .env file.');
  process.exit(1);
}

// Create Privy client
const privyClient = new PrivyClient(
  privyAppId,
  privyAppSecret || ''
);

// Create user service
const userService = new UserService();

/**
 * Authentication service for handling auth-related operations
 */
export class AuthService {
  /**
   * Verify a Privy authentication token
   * @param token JWT token to verify
   * @returns Verified claims if token is valid, null otherwise
   */
  async verifyToken(token: string) {
    try {
      const verifiedClaims = await privyClient.verifyAuthToken(token, { verificationKey: privyPublicKey });
      return verifiedClaims;
    } catch (error) {
      console.error('Token verification error:', error);
      return null;
    }
  }

  /**
   * Get user information from a verified token
   * @param userId Privy user ID
   * @returns User information if found, null otherwise
   */
  async getUserFromToken(userId: string) {
    try {
      // Get user from database
      const user = await userService.getUserById(userId);
      
      if (!user) {
        return null;
      }
      
      return user;
    } catch (error) {
      console.error('Error getting user from token:', error);
      return null;
    }
  }

  /**
   * Validate a session
   * @param token JWT token to validate
   * @returns Session information if valid, null otherwise
   */
  async validateSession(token: string) {
    try {
      // Verify token
      const verifiedClaims = await this.verifyToken(token);
      
      if (!verifiedClaims || !verifiedClaims.userId) {
        return null;
      }
      
      // Get user from database
      const user = await this.getUserFromToken(verifiedClaims.userId);
      
      if (!user) {
        return null;
      }
      
      return {
        authenticated: true,
        user,
        claims: verifiedClaims
      };
    } catch (error) {
      console.error('Error validating session:', error);
      return null;
    }
  }
}
