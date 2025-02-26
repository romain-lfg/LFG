import { Request, Response } from 'express';
import { UserService } from '../services/user.service';

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

      // Sync user data
      const user = await userService.syncUser({
        id: req.user.id,
        walletAddress,
        email,
        metadata
      });

      if (!user) {
        return res.status(500).json({ error: 'Failed to sync user data' });
      }

      return res.status(200).json({ user });
    } catch (error) {
      console.error('Error in syncUser controller:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(req: Request, res: Response) {
    try {
      // Ensure user is authenticated
      if (!req.user || !req.user.id) {
        return res.status(401).json({ error: 'Unauthorized: User not authenticated' });
      }

      // Get user data
      const user = await userService.getUserById(req.user.id);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      return res.status(200).json({ user });
    } catch (error) {
      console.error('Error in getCurrentUser controller:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(req: Request, res: Response) {
    try {
      // Ensure user is authenticated
      if (!req.user || !req.user.id) {
        return res.status(401).json({ error: 'Unauthorized: User not authenticated' });
      }

      const { metadata } = req.body;

      if (!metadata) {
        return res.status(400).json({ error: 'Metadata is required' });
      }

      // Update user metadata
      const updatedUser = await userService.updateUserMetadata(req.user.id, metadata);

      if (!updatedUser) {
        return res.status(500).json({ error: 'Failed to update user profile' });
      }

      return res.status(200).json({ user: updatedUser });
    } catch (error) {
      console.error('Error in updateUserProfile controller:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}
