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
        body: req.body,
        headers: req.headers
      });

      // Handle OPTIONS request for CORS preflight
      if (req.method === 'OPTIONS') {
        console.log('📝 UserController.syncUser: Handling OPTIONS request');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        return res.status(200).end();
      }

      // Ensure user is authenticated
      if (!req.user || !req.user.id) {
        console.log('📝 UserController.syncUser: Unauthorized - user not authenticated');
        return res.status(401).json({ error: 'Unauthorized: User not authenticated' });
      }

      const { walletAddress, email, metadata } = req.body;
      
      console.log('📝 UserController.syncUser: Processing user data', {
        walletAddress,
        hasEmail: !!email,
        hasMetadata: !!metadata
      });
      
      // Sync user data with database
      const userData = {
        id: req.user.id,
        walletAddress,
        email,
        metadata
      };
      
      console.log('📝 UserController.syncUser: Calling userService.syncUser');
      const user = await userService.syncUser(userData);
      console.log('📝 UserController.syncUser: User synced successfully', {
        userId: user?.id,
        hasWalletAddress: !!user?.wallet_address
      });
      
      return res.status(200).json({ user });
    } catch (error) {
      console.error('📝 UserController.syncUser: Error syncing user:', error);
      return res.status(500).json({ error: 'Internal server error' });
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
