import { createUser, getUserList, createBounty, getBountyList, matchBountiesUser, matchBountiesOwner } from '../../api/lib/nillion.js';
import { logger } from '../utils/logger';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get environment
const nodeEnv = process.env.NODE_ENV || 'development';

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
      logger.info(`🔒 NillionService: Storing user data in Nillion for user ${userData.id} (wallet: ${!!userData.walletAddress}, email: ${!!userData.email}, env: ${nodeEnv})`);
      
      // Format data for Nillion
      const nillionData = {
        id: userData.id,
        wallet_address: userData.walletAddress || null,
        email: userData.email || null,
        metadata: userData.metadata || {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      logger.info(`🔒 NillionService: Calling Nillion createUser function for user ${userData.id} (env: ${nodeEnv})`);
      
      await createUser(nillionData);
      
      logger.info(`🔒 NillionService: User data stored in Nillion successfully for user ${userData.id} (env: ${nodeEnv})`);
    } catch (error) {
      logger.error('🔒 NillionService: Error storing user data in Nillion:', error);
      
      // Log detailed error information
      if (error instanceof Error) {
        logger.error(`🔒 NillionService: Error details - Name: ${error.name}, Message: ${error.message}, Env: ${nodeEnv}`);
      }
      
      throw new Error('Failed to store user data in Nillion');
    }
  }

  /**
   * Get all users from Nillion
   */
  async getAllUsers(): Promise<any[]> {
    try {
      logger.info(`🔒 NillionService: Getting all users from Nillion (env: ${nodeEnv})`);
      
      const users = await getUserList();
      
      logger.info(`🔒 NillionService: Retrieved ${users.length} users from Nillion (env: ${nodeEnv})`);
      
      return users;
    } catch (error) {
      logger.error('🔒 NillionService: Error getting users from Nillion:', error);
      
      // Log detailed error information
      if (error instanceof Error) {
        logger.error(`🔒 NillionService: Error details - Name: ${error.name}, Message: ${error.message}, Env: ${nodeEnv}`);
      }
      
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
      logger.info(`🔒 NillionService: Getting all bounties from Nillion (env: ${nodeEnv})`);
      
      const bounties = await getBountyList();
      
      const sampleInfo = bounties.length > 0 ? ` Sample: ID=${bounties[0].id}, Title=${bounties[0].title}, Status=${bounties[0].status}` : '';
      logger.info(`🔒 NillionService: Retrieved ${bounties.length} bounties from Nillion (env: ${nodeEnv}).${sampleInfo}`);
      
      return bounties;
    } catch (error) {
      logger.error('🔒 NillionService: Error getting bounties from Nillion:', error);
      
      // Log detailed error information
      if (error instanceof Error) {
        logger.error(`🔒 NillionService: Error details - Name: ${error.name}, Message: ${error.message}, Env: ${nodeEnv}`);
      }
      
      throw new Error('Failed to get bounties from Nillion');
    }
  }

  /**
   * Match a user with bounties based on their skills and preferences
   * @param userId User ID to match
   */
  async matchUserWithBounties(userId: string): Promise<any[]> {
    try {
      logger.info(`🔒 NillionService: Matching user with bounties for user ${userId} (env: ${nodeEnv})`);
      
      const matches = await matchBountiesUser(userId);
      
      const sampleMatchInfo = matches.length > 0 ? ` Sample: ID=${matches[0].id}, Title=${matches[0].title}, Score=${matches[0].matchScore || 'N/A'}` : '';
      logger.info(`🔒 NillionService: Found ${matches.length} matching bounties for user ${userId} (env: ${nodeEnv}).${sampleMatchInfo}`);
      
      return matches;
    } catch (error) {
      logger.error(`🔒 NillionService: Error matching user ${userId} with bounties:`, error);
      
      // Log detailed error information
      if (error instanceof Error) {
        logger.error('🔒 NillionService: Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack,
          userId,
          environment: nodeEnv
        });
      }
      
      throw new Error('Failed to match user with bounties');
    }
  }

  /**
   * Get all bounties owned by a specific user
   * @param userId User ID to get bounties for
   */
  async getBountiesByOwner(userId: string): Promise<any[]> {
    try {
      logger.info(`🔒 NillionService: Getting bounties for owner ${userId} (env: ${nodeEnv})`);
      
      const bounties = await matchBountiesOwner(userId);
      
      const sampleOwnerInfo = bounties.length > 0 ? ` Sample: ID=${bounties[0].id}, Title=${bounties[0].title}, Status=${bounties[0].status}` : '';
      logger.info(`🔒 NillionService: Retrieved ${bounties.length} bounties for owner ${userId} (env: ${nodeEnv}).${sampleOwnerInfo}`);
      
      return bounties;
    } catch (error) {
      logger.error(`🔒 NillionService: Error getting bounties for owner ${userId}:`, error);
      
      // Log detailed error information
      if (error instanceof Error) {
        logger.error('🔒 NillionService: Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack,
          userId,
          environment: nodeEnv
        });
      }
      
      throw new Error('Failed to get bounties by owner');
    }
  }
}
