import { Request, Response } from 'express';
import { UserService } from '../services/user.service.js';
import { supabase } from '../config/supabase.js';

const userService = new UserService();

/**
 * User controller for handling user-related API endpoints
 */
export class UserController {
  /**
   * Sync user data with the database
   * Creates a new user if they don't exist, updates if they do
   */
  async syncUser(req: Request, res: Response) {
    try {
      console.log('📝 UserController.syncUser: Request received', {
        method: req.method,
        path: req.path,
        hasUser: !!req.user,
        userId: req.user?.id,
        headers: Object.keys(req.headers),
        hasAuthHeader: !!req.headers.authorization
      });

      // Ensure user is authenticated
      if (!req.user) {
        console.log('📝 UserController.syncUser: Unauthorized - no user object');
        return res.status(401).json({ error: 'Unauthorized: User not authenticated' });
      }
      
      // Extract user ID from the request object
      // The auth middleware should have set this consistently
      const userId = req.user.id;
      
      if (!userId) {
        console.log('📝 UserController.syncUser: Unauthorized - could not extract user ID', { user: req.user });
        return res.status(401).json({ error: 'Unauthorized: User ID missing' });
      }

      // Extract data from request body
      // If data is missing from the body, try to use data from the req.user object
      // which was populated by the auth middleware from the token claims
      const walletAddress = req.body.walletAddress || req.user.walletAddress;
      const email = req.body.email || req.user.email;
      const metadata = req.body.metadata || {};
      
      console.log('📝 UserController.syncUser: Processing user data', {
        userId,
        walletAddress,
        hasEmail: !!email,
        hasMetadata: !!metadata
      });
      
      // Validate required fields
      if (!userId) {
        console.log('📝 UserController.syncUser: Missing required user ID');
        return res.status(400).json({ error: 'Bad Request: User ID is required' });
      }
      
      // Sync user data with database
      const userData = {
        id: userId,
        walletAddress,
        email,
        metadata
      };
      
      console.log('📝 UserController.syncUser: Calling userService.syncUser', userData);
      const user = await userService.syncUser(userData);
      
      if (!user) {
        console.error('📝 UserController.syncUser: Failed to sync user - no user returned');
        return res.status(500).json({ error: 'Failed to sync user data' });
      }
      
      console.log('📝 UserController.syncUser: User synced successfully', {
        userId: user.id,
        hasWalletAddress: !!user.wallet_address,
        hasEmail: !!user.email
      });
      
      return res.status(200).json({ user });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('📝 UserController.syncUser: Error syncing user:', errorMessage);
      
      if (error instanceof Error) {
        console.error('📝 UserController.syncUser: Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
      }
      
      return res.status(500).json({ error: 'Internal server error', message: errorMessage });
    }
  }
  
  /**
   * Get user profile
   */
  async getProfile(req: Request, res: Response) {
    try {
      // Ensure user is authenticated
      if (!req.user || !req.user.id) {
        return res.status(401).json({ error: 'Unauthorized: User not authenticated' });
      }
      
      const user = await userService.getUserById(req.user.id);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      return res.status(200).json({ user });
    } catch (error) {
      console.error('Error getting user profile:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
  
  /**
   * Test database connection
   * This endpoint is used to verify that the Supabase connection is working
   * This is a public endpoint that doesn't require authentication
   */
  async testDatabaseConnection(req: Request, res: Response) {
    try {
      console.log('🔍 Testing database connection...');
      
      // Add CORS headers to ensure this endpoint can be called from any origin
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET');
      res.header('Access-Control-Allow-Headers', 'Content-Type');
      
      // Test the connection by running a simple query
      const startTime = Date.now();
      const { data, error, status } = await supabase
        .from('users')
        .select('count')
        .limit(1);
      const responseTime = Date.now() - startTime;
      
      if (error) {
        console.error('❌ Database connection test failed:', error);
        return res.status(500).json({ 
          success: false, 
          error: error.message,
          details: error,
          responseTime
        });
      }
      
      console.log('✅ Database connection test successful', { responseTime, status });
      return res.status(200).json({ 
        success: true, 
        message: 'Database connection successful', 
        responseTime,
        status,
        data
      });
    } catch (error) {
      console.error('❌ Error testing database connection:', error);
      return res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        responseTime: null
      });
    }
  }
  
  /**
   * Update user profile
   */
  async updateProfile(req: Request, res: Response) {
    try {
      // Ensure user is authenticated
      if (!req.user || !req.user.id) {
        return res.status(401).json({ error: 'Unauthorized: User not authenticated' });
      }
      
      const { walletAddress, email, metadata } = req.body;
      
      // Update user data
      const userData = {
        id: req.user.id,
        walletAddress,
        email,
        metadata
      };
      
      const user = await userService.updateUser(userData);
      
      return res.status(200).json({ user });
    } catch (error) {
      console.error('Error updating user profile:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}
