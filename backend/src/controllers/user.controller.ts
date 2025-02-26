import { Request, Response } from 'express';
import { UserService } from '../services/user.service.js';

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
      // Ensure user is authenticated
      if (!req.user || !req.user.id) {
        return res.status(401).json({ error: 'Unauthorized: User not authenticated' });
      }

      const { walletAddress, email, metadata } = req.body;
      
      // Sync user data with database
      const userData = {
        id: req.user.id,
        walletAddress,
        email,
        metadata
      };
      
      const user = await userService.syncUser(userData);
      
      return res.status(200).json({ user });
    } catch (error) {
      console.error('Error syncing user:', error);
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
