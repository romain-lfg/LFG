import { Request, Response, NextFunction } from 'express';
import { PrivyClient } from '@privy-io/server-auth';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Privy client
const privyAppId = process.env.PRIVY_APP_ID;
const privyAppSecret = process.env.PRIVY_APP_SECRET;
const privyPublicKey = process.env.PRIVY_PUBLIC_KEY;

if (!privyAppId || !privyPublicKey) {
  throw new Error('Missing Privy environment variables. Please check your .env file.');
}

// Initialize Privy client with app ID and app secret
const privyClient = new PrivyClient(
  privyAppId,
  privyAppSecret || '' // App secret is optional for token verification
);

// Extend Express Request type to include user information
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        walletAddress?: string;
        email?: string;
      };
    }
  }
}

/**
 * Middleware to verify Privy authentication token
 * Extracts the token from the Authorization header and verifies it
 * Adds the user information to the request object
 */
export const authenticateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: Missing or invalid token format' });
    }
    
    // Extract token
    const token = authHeader.split(' ')[1];
    
    // Verify token - the second parameter should be a string, not an object
    const verifiedClaims = await privyClient.verifyAuthToken(token, privyPublicKey);
    
    if (!verifiedClaims || !verifiedClaims.userId) {
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
    
    // Add user info to request
    req.user = {
      id: verifiedClaims.userId,
      // Additional user info will be populated from database in user routes
    };
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ error: 'Unauthorized: Token verification failed' });
  }
};

/**
 * Optional authentication middleware
 * Tries to authenticate the user but continues even if authentication fails
 * Useful for routes that can be accessed by both authenticated and unauthenticated users
 */
export const optionalAuthentication = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // Continue without authentication
    }
    
    const token = authHeader.split(' ')[1];
    // Fix the verifyAuthToken call here as well - the second parameter should be a string
    const verifiedClaims = await privyClient.verifyAuthToken(token, privyPublicKey);
    
    if (verifiedClaims && verifiedClaims.userId) {
      req.user = {
        id: verifiedClaims.userId,
      };
    }
    
    next();
  } catch (error) {
    // Continue without authentication if token verification fails
    next();
  }
};
