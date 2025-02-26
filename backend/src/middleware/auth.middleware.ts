import { Request, Response, NextFunction } from 'express';
import { PrivyClient } from '@privy-io/server-auth';
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
      res.status(401).json({ error: 'Unauthorized: Missing or invalid token format' });
      return;
    }
    
    // Extract token from header
    const token = authHeader.split(' ')[1];
    
    // Verify token
    try {
      const verifiedClaims = await privyClient.verifyAuthToken(token, privyPublicKey);
      
      // Add user information to request object
      req.user = {
        id: verifiedClaims.userId,
        // Additional user information can be added here
      };
      
      next();
    } catch (error) {
      console.error('Token verification error:', error);
      res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Internal server error during authentication' });
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
