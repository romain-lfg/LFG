import { Request, Response } from 'express';
import { NillionService } from '../services/nillion.service.js';
import { logger } from '../utils/logger';

/**
 * Controller for Nillion-related operations
 */
export class NillionController {
  private nillionService: NillionService;

  constructor() {
    this.nillionService = new NillionService();
  }

  /**
   * Match a user with bounties based on their skills and preferences
   */
  async matchUserWithBounties(req: Request, res: Response): Promise<void> {
    try {
      // Use the authenticated user's ID
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const matches = await this.nillionService.matchUserWithBounties(userId);
      
      res.status(200).json({
        success: true,
        matches
      });
    } catch (error: unknown) {
      logger.error('Error in matchUserWithBounties:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ 
        error: 'Failed to match user with bounties',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      });
    }
  }

  /**
   * Get all bounties owned by the authenticated user
   */
  async getUserBounties(req: Request, res: Response): Promise<void> {
    try {
      // Use the authenticated user's ID
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const bounties = await this.nillionService.getBountiesByOwner(userId);
      
      res.status(200).json({
        success: true,
        bounties
      });
    } catch (error: unknown) {
      logger.error('Error in getUserBounties:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ 
        error: 'Failed to get user bounties',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      });
    }
  }

  /**
   * Create a new bounty and store it in Nillion
   */
  async createBounty(req: Request, res: Response): Promise<void> {
    try {
      // Use the authenticated user's ID as the owner
      const ownerId = req.user?.id;
      
      if (!ownerId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const { title, description, reward, skills, location, remote, deadline, status } = req.body;
      
      // Validate required fields
      if (!title || !description || !reward || !skills || !Array.isArray(skills)) {
        res.status(400).json({ error: 'Missing required bounty fields' });
        return;
      }

      // Generate a unique ID for the bounty
      const bountyId = `bounty_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const now = new Date().toISOString();

      const bountyData = {
        id: bountyId,
        ownerId,
        title,
        description,
        reward: Number(reward),
        skills,
        location,
        remote: Boolean(remote),
        deadline,
        status: status || 'open',
        createdAt: now,
        updatedAt: now
      };

      await this.nillionService.storeBountyData(bountyData);
      
      res.status(201).json({
        success: true,
        bounty: bountyData
      });
    } catch (error: unknown) {
      logger.error('Error in createBounty:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ 
        error: 'Failed to create bounty',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      });
    }
  }

  /**
   * Get all bounties from Nillion
   */
  async getAllBounties(req: Request, res: Response): Promise<void> {
    try {
      const bounties = await this.nillionService.getAllBounties();
      
      res.status(200).json({
        success: true,
        bounties
      });
    } catch (error: unknown) {
      logger.error('Error in getAllBounties:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ 
        error: 'Failed to get all bounties',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      });
    }
  }
}
