import { PrivyClient } from '@privy-io/server-auth';
import { UserService } from './user.service.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get environment variables
const privyAppId = process.env.PRIVY_APP_ID;
const privyAppSecret = process.env.PRIVY_APP_SECRET;
const privyPublicKey = process.env.PRIVY_PUBLIC_KEY;
const nodeEnv = process.env.NODE_ENV || 'development';

// Log environment information
console.log('🔐 AuthService: Environment configuration', {
  environment: nodeEnv,
  hasPrivyAppId: !!privyAppId,
  hasPrivyAppSecret: !!privyAppSecret,
  hasPrivyPublicKey: !!privyPublicKey,
  privyPublicKeyLength: privyPublicKey ? privyPublicKey.length : 0,
  privyPublicKeyFormat: privyPublicKey ? (privyPublicKey.includes('BEGIN PUBLIC KEY') ? 'PEM format' : 'Raw format') : 'None'
});

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
      console.log('🔐 AuthService: Starting token verification', {
        tokenReceived: !!token,
        tokenLength: token ? token.length : 0,
        tokenPrefix: token ? token.substring(0, 10) + '...' : 'None',
        environment: nodeEnv
      });

      // Log the original public key format
      console.log('🔐 AuthService: Original public key format', {
        originalKeyLength: privyPublicKey ? privyPublicKey.length : 0,
        hasHeader: privyPublicKey ? privyPublicKey.includes('-----BEGIN PUBLIC KEY-----') : false,
        hasFooter: privyPublicKey ? privyPublicKey.includes('-----END PUBLIC KEY-----') : false,
        hasNewlines: privyPublicKey ? privyPublicKey.includes('\n') : false,
        // Log a safe version of the key for debugging
        safeKeyPreview: privyPublicKey ? `${privyPublicKey.substring(0, 20)}...${privyPublicKey.substring(privyPublicKey.length - 20)}` : 'None'
      });
      
      // Format the public key correctly if it's not already in the right format
      let formattedPublicKey = privyPublicKey || '';
      
      // Ensure the key has the correct header and footer
      let keyModified = false;
      if (!formattedPublicKey.includes('-----BEGIN PUBLIC KEY-----')) {
        formattedPublicKey = '-----BEGIN PUBLIC KEY-----\n' + formattedPublicKey;
        keyModified = true;
        console.log('🔐 AuthService: Added missing header to public key');
      }
      if (!formattedPublicKey.includes('-----END PUBLIC KEY-----')) {
        formattedPublicKey = formattedPublicKey + '\n-----END PUBLIC KEY-----';
        keyModified = true;
        console.log('🔐 AuthService: Added missing footer to public key');
      }
      
      // Ensure there are newlines after the header and before the footer
      if (!formattedPublicKey.includes('-----BEGIN PUBLIC KEY-----\n')) {
        formattedPublicKey = formattedPublicKey.replace('-----BEGIN PUBLIC KEY-----', '-----BEGIN PUBLIC KEY-----\n');
        keyModified = true;
        console.log('🔐 AuthService: Added missing newline after header');
      }
      if (!formattedPublicKey.includes('\n-----END PUBLIC KEY-----')) {
        formattedPublicKey = formattedPublicKey.replace('-----END PUBLIC KEY-----', '\n-----END PUBLIC KEY-----');
        keyModified = true;
        console.log('🔐 AuthService: Added missing newline before footer');
      }
      
      // Add newlines every 64 characters in the base64 part if they're not already there
      const headerIndex = formattedPublicKey.indexOf('-----BEGIN PUBLIC KEY-----\n');
      const footerIndex = formattedPublicKey.indexOf('\n-----END PUBLIC KEY-----');
      
      if (headerIndex !== -1 && footerIndex !== -1) {
        const base64Part = formattedPublicKey.substring(headerIndex + 28, footerIndex);
        
        // Log the base64 part format
        console.log('🔐 AuthService: Base64 part format', {
          length: base64Part.length,
          hasNewlines: base64Part.includes('\n'),
          samplePart: base64Part.length > 20 ? base64Part.substring(0, 20) + '...' : base64Part
        });
        
        // If the base64 part doesn't have newlines, add them every 64 characters
        if (!base64Part.includes('\n')) {
          let formattedBase64 = '';
          for (let i = 0; i < base64Part.length; i += 64) {
            formattedBase64 += base64Part.substring(i, Math.min(i + 64, base64Part.length)) + '\n';
          }
          
          formattedPublicKey = '-----BEGIN PUBLIC KEY-----\n' + formattedBase64 + '-----END PUBLIC KEY-----';
          keyModified = true;
          console.log('🔐 AuthService: Added newlines to base64 part every 64 characters');
        }
      }
      
      // Log the formatted public key
      console.log('🔐 AuthService: Using formatted public key for verification', {
        wasModified: keyModified,
        formattedKeyLength: formattedPublicKey.length,
        // Log a safe version of the key for debugging
        safeKeyPreview: `${formattedPublicKey.substring(0, 20)}...${formattedPublicKey.substring(formattedPublicKey.length - 20)}`
      });
      
      // Verify the token with the formatted public key
      console.log('🔐 AuthService: Calling Privy verifyAuthToken method');
      const verifiedClaims = await privyClient.verifyAuthToken(token, formattedPublicKey);
      
      // Log the verification result
      console.log('🔐 AuthService: Token verification successful', {
        success: !!verifiedClaims,
        hasUserId: !!verifiedClaims?.userId,
        claims: verifiedClaims ? {
          userId: verifiedClaims.userId,
          appId: verifiedClaims.appId,
          // Add other non-sensitive claims as needed
          hasAdditionalClaims: Object.keys(verifiedClaims).length > 2
        } : null
      });
      
      return verifiedClaims;
    } catch (error) {
      console.error('🔐 AuthService: Token verification error:', error);
      
      // Log detailed error information
      if (error instanceof Error) {
        console.error('🔐 AuthService: Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack,
          environment: nodeEnv
        });
      }
      
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
      console.log('🔐 AuthService: Fetching user details from Privy', {
        userId,
        environment: nodeEnv
      });
      
      const user = await privyClient.getUser(userId);
      
      console.log('🔐 AuthService: User details retrieved', {
        success: !!user,
        hasWallet: !!user?.wallet,
        hasEmail: !!user?.email,
        userId: userId
      });
      
      return user;
    } catch (error) {
      console.error('🔐 AuthService: Error fetching user details:', error);
      
      // Log detailed error information
      if (error instanceof Error) {
        console.error('🔐 AuthService: Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack,
          environment: nodeEnv
        });
      }
      
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
      console.log('🔐 AuthService: Getting user from database', {
        userId,
        environment: nodeEnv
      });
      
      // Get user from database
      const user = await userService.getUserById(userId);
      
      console.log('🔐 AuthService: User retrieval result', {
        success: !!user,
        hasWalletAddress: user ? !!user.wallet_address : false,
        hasEmail: user ? !!user.email : false,
        userId: userId
      });
      
      if (!user) {
        console.log('🔐 AuthService: User not found in database', { userId });
        return null;
      }
      
      return user;
    } catch (error) {
      console.error('🔐 AuthService: Error getting user from token:', error);
      
      // Log detailed error information
      if (error instanceof Error) {
        console.error('🔐 AuthService: Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack,
          environment: nodeEnv
        });
      }
      
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
      console.log('🔐 AuthService: Validating session', {
        hasToken: !!token,
        tokenLength: token ? token.length : 0,
        environment: nodeEnv
      });
      
      // Verify token
      const verifiedClaims = await this.verifyToken(token);
      
      if (!verifiedClaims || !verifiedClaims.userId) {
        console.log('🔐 AuthService: Session validation failed - invalid token claims');
        return null;
      }
      
      console.log('🔐 AuthService: Token verified, fetching user from database', {
        userId: verifiedClaims.userId
      });
      
      // Get user from database
      const user = await this.getUserFromToken(verifiedClaims.userId);
      
      if (!user) {
        console.log('🔐 AuthService: Session validation failed - user not found in database', {
          userId: verifiedClaims.userId
        });
        return null;
      }
      
      console.log('🔐 AuthService: Session validation successful', {
        userId: user.id,
        hasWalletAddress: !!user.wallet_address,
        hasEmail: !!user.email
      });
      
      return {
        authenticated: true,
        user,
        claims: verifiedClaims
      };
    } catch (error) {
      console.error('🔐 AuthService: Error validating session:', error);
      
      // Log detailed error information
      if (error instanceof Error) {
        console.error('🔐 AuthService: Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack,
          environment: nodeEnv
        });
      }
      
      return null;
    }
  }
}
