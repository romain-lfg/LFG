import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service.js';
import { ExtendedAuthTokenClaims, PrivyUser } from '../types/auth.types.js';

/**
 * Authentication controller for handling auth-related API endpoints
 */
export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  /**
   * Verify authentication token
   * Returns user information if token is valid
   */
  async verifyToken(req: Request, res: Response) {
    try {
      // If we've reached this point, the token has already been verified by the middleware
      // Return the authenticated status, user ID, and any additional claims
      return res.status(200).json({
        authenticated: true,
        userId: req.user?.id,
        walletAddress: req.user?.wallet?.address,
        email: req.user?.email?.address,
        discord: req.user?.discord?.username,
        telegram: req.user?.telegram?.username,
        linkedAccounts: req.user?.linkedAccounts
      });
    } catch (error) {
      console.error('Error verifying token:', error);
      return res.status(500).json({ 
        error: 'Internal server error',
        message: 'An unexpected error occurred while verifying the token',
        code: 'AUTH_VERIFY_ERROR'
      });
    }
  }

  /**
   * Get current session information
   * Returns information about the current authenticated session
   */
  async getSession(req: Request, res: Response) {
    try {
      // Get the authorization header
      const authHeader = req.headers.authorization;
      
      if (!authHeader) {
        return res.status(401).json({ 
          error: 'Unauthorized: Missing authorization header',
          message: 'Authentication header is missing',
          code: 'AUTH_HEADER_MISSING'
        });
      }
      
      // Validate session using auth service
      const { valid, user, claims } = await this.authService.validateSession(authHeader);
      
      if (!valid || !user) {
        return res.status(401).json({ 
          error: 'Unauthorized: Invalid session',
          message: 'Your session is invalid or has expired',
          code: 'AUTH_INVALID_SESSION'
        });
      }
      
      // Return session information with complete user object
      return res.status(200).json({
        authenticated: true,
        user: {
          id: user.id,
          walletAddress: user.wallet?.address,
          email: user.email?.address,
          discord: user.discord?.username,
          telegram: user.telegram?.username,
          linkedAccounts: user.linkedAccounts,
          customMetadata: user.customMetadata,
          createdAt: user.createdAt
        },
        claims
      });
    } catch (error) {
      console.error('Error getting session:', error);
      return res.status(500).json({ 
        error: 'Internal server error',
        message: 'An unexpected error occurred while retrieving session information',
        code: 'AUTH_SESSION_ERROR'
      });
    }
  }

  /**
   * Logout user
   * Invalidates the current session
   * Note: With JWT-based auth, we can't actually invalidate tokens on the server
   * The client should clear the token from storage
   */
  async logout(req: Request, res: Response) {
    try {
      // Log logout attempt
      console.log('🔑 Auth controller: Logout attempt', {
        userId: req.user?.id,
        hasWallet: !!req.user?.wallet,
        hasEmail: !!req.user?.email,
        method: req.method,
        path: req.path
      });
      
      // In a stateful session system, we would invalidate the session here
      // For JWT-based auth, we just return success - client will clear the token
      // TODO: Implement token blacklist using Redis for better security
      
      return res.status(200).json({ 
        success: true, 
        message: 'Logged out successfully',
        code: 'AUTH_LOGOUT_SUCCESS'
      });
    } catch (error) {
      console.error('Error logging out:', error);
      return res.status(500).json({ 
        error: 'Internal server error',
        message: 'An unexpected error occurred during logout',
        code: 'AUTH_LOGOUT_ERROR'
      });
    }
  }
}
