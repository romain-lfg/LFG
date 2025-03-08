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
      // Format the public key correctly if it's not already in the right format
      let formattedPublicKey = privyPublicKey || '';
      
      // Ensure the key has the correct header and footer
      if (!formattedPublicKey.includes('-----BEGIN PUBLIC KEY-----')) {
        formattedPublicKey = '-----BEGIN PUBLIC KEY-----\n' + formattedPublicKey;
      }
      if (!formattedPublicKey.includes('-----END PUBLIC KEY-----')) {
        formattedPublicKey = formattedPublicKey + '\n-----END PUBLIC KEY-----';
      }
      
      // Ensure there are newlines after the header and before the footer
      formattedPublicKey = formattedPublicKey.replace('-----BEGIN PUBLIC KEY-----', '-----BEGIN PUBLIC KEY-----\n');
      formattedPublicKey = formattedPublicKey.replace('-----END PUBLIC KEY-----', '\n-----END PUBLIC KEY-----');
      
      // Add newlines every 64 characters in the base64 part if they're not already there
      const headerIndex = formattedPublicKey.indexOf('-----BEGIN PUBLIC KEY-----\n');
      const footerIndex = formattedPublicKey.indexOf('\n-----END PUBLIC KEY-----');
      
      if (headerIndex !== -1 && footerIndex !== -1) {
        const base64Part = formattedPublicKey.substring(headerIndex + 28, footerIndex);
        
        // If the base64 part doesn't have newlines, add them every 64 characters
        if (!base64Part.includes('\n')) {
          let formattedBase64 = '';
          for (let i = 0; i < base64Part.length; i += 64) {
            formattedBase64 += base64Part.substring(i, Math.min(i + 64, base64Part.length)) + '\n';
          }
          
          formattedPublicKey = '-----BEGIN PUBLIC KEY-----\n' + formattedBase64 + '-----END PUBLIC KEY-----';
        }
      }
      
      console.log('Using formatted public key for verification');
      
      // Verify the token with the formatted public key
      const verifiedClaims = await privyClient.verifyAuthToken(token, formattedPublicKey);
      return verifiedClaims;
    } catch (error) {
      console.error('Token verification error:', error);
      return null;
    }
  }

  /**
   * Get user details from Privy
   * @param userId The Privy user ID
   * @returns User object or null if not found
   */
  async getUserDetails(userId: string) {
    try {
      const user = await privyClient.getUser(userId);
      return user;
    } catch (error) {
      console.error('Error fetching user details:', error);
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
