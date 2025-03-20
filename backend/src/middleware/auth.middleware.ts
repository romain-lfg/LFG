import { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import { AuthService } from '../services/auth.service.js';
import { PrivyUser } from '../types/auth.types.js';

// Load environment variables
dotenv.config();

// Initialize auth service
const authService = new AuthService();

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: PrivyUser;
    }
  }
}

/**
 * Authenticate user middleware using Privy token
 */
export const authenticateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Log entry point
    console.log('🔑 Auth middleware: Starting authentication', {
      method: req.method,
      path: req.path,
      hasAuthHeader: !!req.headers.authorization,
      hasCookies: !!req.headers.cookie
    });

    // Get authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.status(401).json({ error: 'Unauthorized: Missing authorization header' });
      return;
    }

    // Validate session using auth service
    const { valid, user, claims } = await authService.validateSession(authHeader);
    
    if (!valid || !claims) {
      console.log('🔑 Auth middleware: Invalid session', {
        valid,
        hasUser: !!user,
        hasClaims: !!claims
      });
      res.status(401).json({ error: 'Unauthorized: Invalid session' });
      return;
    }

    // Extract user info from claims if user object is not available
    if (!user && claims.user) {
      console.log('🔑 Auth middleware: Using user from claims', {
        userId: claims.user.id,
        hasEmail: !!claims.user.email,
        hasWalletAddress: !!claims.user.walletAddress
      });
      
      // Create user object from claims.user
      const userFromClaims: PrivyUser = {
        id: claims.user.id,
        createdAt: new Date(claims.iat * 1000),
        linkedAccounts: claims.linkedAccounts || [],
        email: claims.user.email ? { address: claims.user.email } : undefined,
        wallet: claims.user.walletAddress ? { address: claims.user.walletAddress } : undefined
      };
      
      // Attach user to request
      req.user = userFromClaims;
    } else if (user) {
      // Attach user to request if available from service
      req.user = user;
    } else {
      console.log('🔑 Auth middleware: No user data available');
      res.status(401).json({ error: 'Unauthorized: No user data available' });
      return;
    }

    // Log successful authentication
    console.log('🔑 Auth middleware: Authentication successful', {
      userId: req.user.id,
      hasWallet: !!req.user.wallet,
      hasEmail: !!req.user.email,
      linkedAccountCount: req.user.linkedAccounts.length
    });

    next();
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('🔑 Auth middleware: Authentication error:', errorMessage);
    res.status(500).json({ error: 'Internal server error during authentication' });
  }
};

/**
 * Check if user has required role
 * @param role Role to check for
 * @returns Express middleware function
 */
export const hasRole = (role: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized: User not authenticated' });
      return;
    }

    const userRoles = req.user.customMetadata?.roles as string[] | undefined;
    if (!userRoles?.includes(role)) {
      res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
      return;
    }

    next();
  };
};
