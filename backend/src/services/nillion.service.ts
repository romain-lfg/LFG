import { createUser, getUserList, createBounty, getBountyList, matchBountiesUser, matchBountiesOwner } from '../../api/lib/nillion.js';
import { logger } from '../utils/logger';

export interface NillionUserData {
  id: string;
  walletAddress?: string;
  email?: string;
  metadata?: Record<string, any>;
}

export interface NillionBountyData {
  id: string;
  ownerId: string;
  title: string;
  description: string;
  reward: number;
  skills: string[];
  location?: string;
  remote: boolean;
  deadline?: string;
  status: 'open' | 'in_progress' | 'completed';
  createdAt: string;
  updatedAt: string;
}

/**
 * Service for interacting with Nillion for secure data storage and computation
 */
export class NillionService {
  /**
   * Store user data in Nillion
   * @param userData User data to store
   */
  async storeUserData(userData: NillionUserData): Promise<void> {
    try {
      // Format data for Nillion
      const nillionData = {
        id: userData.id,
        wallet_address: userData.walletAddress || null,
        email: userData.email || null,
        metadata: userData.metadata || {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      await createUser(nillionData);
      logger.info(`User data stored in Nillion for user ${userData.id}`);
    } catch (error) {
      logger.error('Error storing user data in Nillion:', error);
      throw new Error('Failed to store user data in Nillion');
    }
  }

  /**
   * Get all users from Nillion
   */
  async getAllUsers(): Promise<any[]> {
    try {
      const users = await getUserList();
      return users;
    } catch (error) {
      logger.error('Error getting users from Nillion:', error);
      throw new Error('Failed to get users from Nillion');
    }
  }

  /**
   * Store bounty data in Nillion
   * @param bountyData Bounty data to store
   */
  async storeBountyData(bountyData: NillionBountyData): Promise<void> {
    try {
      // Format data for Nillion
      const nillionData = {
        id: bountyData.id,
        owner_id: bountyData.ownerId,
        title: bountyData.title,
        description: bountyData.description,
        reward: bountyData.reward,
        skills: bountyData.skills,
        location: bountyData.location || null,
        remote: bountyData.remote,
        deadline: bountyData.deadline || null,
        status: bountyData.status,
        created_at: bountyData.createdAt,
        updated_at: bountyData.updatedAt
      };

      await createBounty(nillionData);
      logger.info(`Bounty data stored in Nillion for bounty ${bountyData.id}`);
    } catch (error) {
      logger.error('Error storing bounty data in Nillion:', error);
      throw new Error('Failed to store bounty data in Nillion');
    }
  }

  /**
   * Get all bounties from Nillion
   */
  async getAllBounties(): Promise<any[]> {
    try {
      const bounties = await getBountyList();
      return bounties;
    } catch (error) {
      logger.error('Error getting bounties from Nillion:', error);
      throw new Error('Failed to get bounties from Nillion');
    }
  }

  /**
   * Match a user with bounties based on their skills and preferences
   * @param userId User ID to match
   */
  async matchUserWithBounties(userId: string): Promise<any[]> {
    try {
      const matches = await matchBountiesUser(userId);
      return matches;
    } catch (error) {
      logger.error(`Error matching user ${userId} with bounties:`, error);
      throw new Error('Failed to match user with bounties');
    }
  }

  /**
   * Get all bounties owned by a specific user
   * @param userId User ID to get bounties for
   */
  async getBountiesByOwner(userId: string): Promise<any[]> {
    try {
      const bounties = await matchBountiesOwner(userId);
      return bounties;
    } catch (error) {
      logger.error(`Error getting bounties for owner ${userId}:`, error);
      throw new Error('Failed to get bounties by owner');
    }
  }
}
