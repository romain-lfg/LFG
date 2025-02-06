/**
 * Service for handling bounty-related API calls
 */

import { APIClient } from './api';
import { API_ENDPOINTS } from './config';
import { Bounty } from '../types/bounty';
import { PaginatedResponse, PaginationParams } from '../types/api';

export class BountyService {
  private static instance: BountyService;
  private api: APIClient;

  private constructor() {
    this.api = APIClient.getInstance();
  }

  static getInstance(): BountyService {
    if (!BountyService.instance) {
      BountyService.instance = new BountyService();
    }
    return BountyService.instance;
  }

  /**
   * Get a paginated list of bounties
   */
  async listBounties(params: PaginationParams & {
    status?: string;
    skills?: string[];
    minReward?: string;
    category?: string;
  }): Promise<PaginatedResponse<Bounty>> {
    return this.api.get<PaginatedResponse<Bounty>>(API_ENDPOINTS.bounties, params as Record<string, string>);
  }

  /**
   * Get a single bounty by ID
   */
  async getBounty(id: string): Promise<Bounty> {
    return this.api.get<Bounty>(API_ENDPOINTS.bountyById(id));
  }

  /**
   * Create a new bounty
   */
  async createBounty(bounty: Omit<Bounty, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<Bounty> {
    return this.api.post<Bounty>(API_ENDPOINTS.bounties, bounty);
  }

  /**
   * Update an existing bounty
   */
  async updateBounty(id: string, updates: Partial<Bounty>): Promise<Bounty> {
    return this.api.put<Bounty>(API_ENDPOINTS.bountyById(id), updates);
  }

  /**
   * Delete a bounty
   */
  async deleteBounty(id: string): Promise<void> {
    return this.api.delete(API_ENDPOINTS.bountyById(id));
  }
}
