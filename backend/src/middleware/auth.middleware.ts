import { Request, Response, NextFunction } from 'express';
import { PrivyClient } from '@privy-io/server-auth';
import dotenv from 'dotenv';
import { AuthService } from '../services/auth.service';

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
    // Get authorization header
    const authHeader = req.headers.authorization;
    
    // Check if authorization header exists and has the correct format
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ 
        error: 'Unauthorized: Missing or invalid token format',
        message: 'Authentication token is missing or has an invalid format',
        code: 'AUTH_TOKEN_MISSING'
      });
      return;
    }
    
    // Extract token from header
    const token = authHeader.split(' ')[1];
    
    if (!token || token.trim() === '') {
      res.status(401).json({ 
        error: 'Unauthorized: Empty token',
        message: 'Authentication token cannot be empty',
        code: 'AUTH_TOKEN_EMPTY'
      });
      return;
    }
    
    // Verify token
    try {
      // According to Privy docs, verifyAuthToken accepts a string as the second parameter, not an object
      const verifiedClaims = await privyClient.verifyAuthToken(token, privyPublicKey || '');
      
      if (!verifiedClaims || !verifiedClaims.userId) {
        res.status(401).json({ 
          error: 'Unauthorized: Invalid token claims',
          message: 'Token verification failed: missing user ID in claims',
          code: 'AUTH_INVALID_CLAIMS'
        });
        return;
      }
      
      // Get user details from Privy to access wallet and email information
      const authService = new AuthService();
      const userDetails = await authService.getUserDetails(verifiedClaims.userId);
      
      // Add user information to request object
      req.user = {
        id: verifiedClaims.userId,
        // Add additional user details if available
        walletAddress: userDetails?.wallet?.address,
        email: userDetails?.email?.address,
        // Store the full claims for potential use in other middleware/routes
        claims: verifiedClaims
      };
      
      next();
    } catch (error: any) {
      console.error('Token verification error:', error);
      
      // Provide more specific error messages based on the error type
      if (error.message && error.message.includes('expired')) {
        res.status(401).json({ 
          error: 'Unauthorized: Token expired',
          message: 'Your authentication session has expired. Please log in again.',
          code: 'AUTH_TOKEN_EXPIRED'
        });
      } else if (error.message && error.message.includes('signature')) {
        res.status(401).json({ 
          error: 'Unauthorized: Invalid token signature',
          message: 'Token has an invalid signature',
          code: 'AUTH_INVALID_SIGNATURE'
        });
      } else {
        res.status(401).json({ 
          error: 'Unauthorized: Invalid token',
          message: 'Authentication failed due to an invalid token',
          code: 'AUTH_INVALID_TOKEN'
        });
      }
    }
  } catch (error) {
    console.error('Authentication error:', error);
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
