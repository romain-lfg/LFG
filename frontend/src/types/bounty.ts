/**
 * Core type definitions for bounties in the LFG platform.
 * These types represent the contract between frontend and backend for bounty-related data.
 */

/**
 * Represents the status of a bounty in the system
 */
export type BountyStatus = 'open' | 'in_progress' | 'completed' | 'cancelled';

/**
 * Represents the reward structure for a bounty
 */
export interface BountyReward {
  amount: string;        // Amount in wei/tokens
  token: string;         // Token symbol (e.g., 'ETH', 'USDC')
  chainId: number;       // Network chain ID
}

/**
 * Represents the requirements for completing a bounty
 */
export interface BountyRequirements {
  skills: string[];              // Required skills (e.g., ['Solidity', 'React'])
  experienceLevel?: string;      // Optional experience level
  estimatedTimeInHours?: number; // Optional time estimate
  deadline?: string;             // Optional deadline in ISO format
}

/**
 * Represents a bounty in the system
 */
export interface Bounty {
  id: string;
  title: string;
  description: string;
  reward: BountyReward;
  requirements: BountyRequirements;
  status: BountyStatus;
  createdBy: string;            // Creator's wallet address
  assignedTo?: string;          // Assigned hunter's wallet address
  createdAt: string;            // ISO date string
  updatedAt: string;            // ISO date string
  completionCriteria: string;   // e.g., "PR merged to main branch"
  repositoryUrl?: string;       // Optional GitHub repository URL
}
