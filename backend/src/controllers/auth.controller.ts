import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service.js';

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
        walletAddress: req.user?.walletAddress,
        email: req.user?.email
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
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ 
          error: 'Unauthorized: Missing or invalid token format',
          message: 'Authentication token is missing or has an invalid format',
          code: 'AUTH_TOKEN_MISSING'
        });
      }
      
      // Extract token from header
      const token = authHeader.split(' ')[1];
      
      // Validate session
      const session = await this.authService.validateSession(token);
      
      if (!session) {
        return res.status(401).json({ 
          error: 'Unauthorized: Invalid session',
          message: 'Your session is invalid or has expired',
          code: 'AUTH_INVALID_SESSION'
        });
      }
      
      // Return session information
      return res.status(200).json({
        authenticated: true,
        user: session.user,
        // Include safe claims (don't expose sensitive information)
        claims: {
          userId: session.claims.userId,
          walletAddress: session.claims.wallet?.address,
          email: session.claims.email?.address,
          name: session.claims.name
        }
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
      // In a stateful session system, we would invalidate the session here
      // For JWT-based auth, we just return success - client will clear the token
      
      // You could implement a token blacklist here if needed
      // For example, store the token in a Redis cache with the token's expiration time
      
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
