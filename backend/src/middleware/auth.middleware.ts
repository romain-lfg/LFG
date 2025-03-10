import { Request, Response, NextFunction } from 'express';
import { PrivyClient } from '@privy-io/server-auth';
import dotenv from 'dotenv';
import { AuthService } from '../services/auth.service.js';

// Load environment variables
dotenv.config();

// Get environment variables
const privyAppId = process.env.PRIVY_APP_ID;
const privyAppSecret = process.env.PRIVY_APP_SECRET;
const privyPublicKey = process.env.PRIVY_PUBLIC_KEY;
const nodeEnv = process.env.NODE_ENV || 'development';

// Log environment information
console.log('🔑 Auth middleware: Environment configuration', {
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

// Extend Express Request type to include user information
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        walletAddress?: string;
        email?: string;
        [key: string]: any;
      };
    }
  }
}

/**
 * Middleware to authenticate users using Privy token
 * @param req Express request object
 * @param res Express response object
 * @param next Express next function
 */
export const authenticateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Always allow OPTIONS requests to pass through for CORS preflight
    if (req.method === 'OPTIONS') {
      console.log('🔑 Auth middleware: Allowing OPTIONS request to pass through');
      return next();
    }

    console.log('🔑 Auth middleware: Processing authentication request', {
      path: req.path,
      method: req.method,
      hasAuthHeader: !!req.headers.authorization
    });

    // Get authorization header
    const authHeader = req.headers.authorization;
    
    // Check if authorization header exists and has the correct format
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.warn('🔑 Auth middleware: Missing or invalid token format');
      res.status(401).json({ 
        error: 'Unauthorized: Missing or invalid token format',
        message: 'Authentication token is missing or has an invalid format',
        code: 'AUTH_TOKEN_MISSING'
      });
      return;
    }
    
    // Extract token from header
    const token = authHeader.split(' ')[1];
    console.log('🔑 Auth middleware: Token extracted from header');
    
    if (!token || token.trim() === '') {
      console.warn('🔑 Auth middleware: Empty token');
      res.status(401).json({ 
        error: 'Unauthorized: Empty token',
        message: 'Authentication token cannot be empty',
        code: 'AUTH_TOKEN_EMPTY'
      });
      return;
    }
    
    // Verify token
    try {
      // Log token details (safely)
      console.log('🔑 Auth middleware: Verifying token with Privy', {
        tokenLength: token.length,
        tokenPrefix: token.substring(0, 10) + '...',
        hasPrivyPublicKey: !!privyPublicKey,
        privyPublicKeyLength: privyPublicKey ? privyPublicKey.length : 0,
        privyPublicKeyFormat: privyPublicKey ? (privyPublicKey.includes('BEGIN PUBLIC KEY') ? 'PEM format' : 'Raw format') : 'None',
        environment: nodeEnv
      });

      // Log the exact format of the public key being used
      console.log('🔑 Auth middleware: Public key format check', {
        startsWithHeader: privyPublicKey ? privyPublicKey.startsWith('-----BEGIN PUBLIC KEY-----') : false,
        endsWithFooter: privyPublicKey ? privyPublicKey.endsWith('-----END PUBLIC KEY-----') : false,
        containsNewlines: privyPublicKey ? privyPublicKey.includes('\n') : false,
        // Log a safe version of the key for debugging
        safeKeyPreview: privyPublicKey ? `${privyPublicKey.substring(0, 20)}...${privyPublicKey.substring(privyPublicKey.length - 20)}` : 'None'
      });

      // According to Privy docs, verifyAuthToken accepts a string as the second parameter, not an object
      console.log('🔑 Auth middleware: Calling Privy verifyAuthToken method');
      const verifiedClaims = await privyClient.verifyAuthToken(token, privyPublicKey || '');
      
      console.log('🔑 Auth middleware: Token verification result', {
        success: !!verifiedClaims,
        hasUserId: !!verifiedClaims?.userId,
        claims: verifiedClaims ? {
          userId: verifiedClaims.userId,
          appId: verifiedClaims.appId,
          // Add other non-sensitive claims as needed
          hasAdditionalClaims: Object.keys(verifiedClaims).length > 2
        } : null
      });

      if (!verifiedClaims || !verifiedClaims.userId) {
        console.warn('🔑 Auth middleware: Invalid token claims');
        res.status(401).json({ 
          error: 'Unauthorized: Invalid token claims',
          message: 'Token verification failed: missing user ID in claims',
          code: 'AUTH_INVALID_CLAIMS'
        });
        return;
      }
      
      // Get user details from Privy to access wallet and email information
      console.log('🔑 Auth middleware: Getting user details from Privy', {
        userId: verifiedClaims.userId
      });

      const authService = new AuthService();
      const userDetails = await authService.getUserDetails(verifiedClaims.userId);
      
      console.log('🔑 Auth middleware: User details retrieved', {
        hasWallet: !!userDetails?.wallet,
        hasEmail: !!userDetails?.email,
        userId: verifiedClaims.userId
      });

      // Add user information to request object
      req.user = {
        id: verifiedClaims.userId,
        // Add additional user details if available
        walletAddress: userDetails?.wallet?.address,
        email: userDetails?.email?.address,
        // Store the full claims for potential use in other middleware/routes
        claims: verifiedClaims
      };
      
      console.log('🔑 Auth middleware: Authentication successful', {
        userId: req.user.id,
        hasWalletAddress: !!req.user.walletAddress,
        hasEmail: !!req.user.email
      });

      next();
    } catch (error: unknown) {
      console.error('🔑 Auth middleware: Token verification error:', error);
      
      // Provide more specific error messages based on the error type
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.log('🔑 Auth middleware: Token error details', { 
        errorMessage,
        errorName: error instanceof Error ? error.name : 'Unknown',
        errorStack: error instanceof Error ? error.stack : 'No stack trace',
        environment: nodeEnv
      });
      
      // Log additional debugging information
      console.log('🔑 Auth middleware: Verification context', {
        tokenLength: token.length,
        tokenPrefix: token.substring(0, 10) + '...',
        publicKeyFormat: privyPublicKey ? (privyPublicKey.includes('BEGIN PUBLIC KEY') ? 'PEM format' : 'Raw format') : 'None'
      });
      
      if (error instanceof Error && errorMessage.includes('expired')) {
        console.warn('🔑 Auth middleware: Token expired');
        res.status(401).json({ 
          error: 'Unauthorized: Token expired',
          message: 'Your authentication session has expired. Please log in again.',
          code: 'AUTH_TOKEN_EXPIRED'
        });
      } else if (error instanceof Error && errorMessage.includes('signature')) {
        console.warn('🔑 Auth middleware: Invalid token signature');
        res.status(401).json({ 
          error: 'Unauthorized: Invalid token signature',
          message: 'Token has an invalid signature',
          code: 'AUTH_INVALID_SIGNATURE'
        });
      } else {
        console.warn('🔑 Auth middleware: General token verification failure');
        res.status(401).json({ 
          error: 'Unauthorized: Invalid token',
          message: 'Authentication failed due to an invalid token',
          code: 'AUTH_INVALID_TOKEN'
        });
      }
    }
  } catch (error: unknown) {
    console.error('🔑 Auth middleware: Authentication error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.log('🔑 Auth middleware: General auth error details', { errorMessage });
    res.status(500).json({ 
      error: 'Internal server error during authentication',
      message: 'An unexpected error occurred during authentication',
      code: 'AUTH_SERVER_ERROR'
    });
  }
};

/**
 * Middleware to check if user is authenticated
 * @param req Express request object
 * @param res Express response object
 * @param next Express next function
 */
export const isAuthenticated = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized: User not authenticated' });
    return;
  }
  
  next();
};

/**
 * Middleware to check if user has required role
 * @param role Required role
 * @returns Middleware function
 */
export const hasRole = (role: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized: User not authenticated' });
      return;
    }
    
    if (!req.user.roles || !req.user.roles.includes(role)) {
      res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
      return;
    }
    
    next();
  };
};
