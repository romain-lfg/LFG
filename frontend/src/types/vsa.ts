/**
 * Core type definitions for Virtual Synergy Agents (VSAs) in the LFG platform.
 * These types define the structure of VSA data and its interactions.
 */

/**
 * Represents the status of a VSA
 */
export type VSAStatus = 'active' | 'busy' | 'inactive';

/**
 * Represents the availability settings for a VSA
 */
export interface VSAAvailability {
  hoursPerWeek: number;
  timezone: string;           // e.g., 'UTC+1'
  preferredWorkingHours?: {   // Optional working hours preference
    start: string;           // e.g., '09:00'
    end: string;             // e.g., '17:00'
  };
}

/**
 * Represents the preferences for bounty matching
 */
export interface VSAPreferences {
  minReward: {
    amount: string;
    token: string;
  };
  categories: string[];       // e.g., ['DeFi', 'NFT', 'DAO']
  skills: string[];          // e.g., ['Solidity', 'React']
  experienceLevel: string;   // e.g., 'beginner', 'intermediate', 'expert'
}

/**
 * Represents a Virtual Synergy Agent
 */
export interface VSA {
  id: string;
  owner: string;             // Wallet address of the VSA owner
  name?: string;             // Optional display name
  availability: VSAAvailability;
  preferences: VSAPreferences;
  status: VSAStatus;
  reputation?: {
    score: number;           // 0-100
    completedBounties: number;
    totalEarned: string;     // Amount in wei
  };
  createdAt: string;         // ISO date string
  updatedAt: string;         // ISO date string
  telegramHandle?: string;   // Optional Telegram handle for notifications
}
