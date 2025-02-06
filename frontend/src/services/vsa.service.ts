/**
 * Service for handling VSA-related API calls
 */

import { APIClient } from './api';
import { API_ENDPOINTS } from './config';
import { VSA } from '../types/vsa';
import { PaginatedResponse, PaginationParams } from '../types/api';

export class VSAService {
  private static instance: VSAService;
  private api: APIClient;

  private constructor() {
    this.api = APIClient.getInstance();
  }

  static getInstance(): VSAService {
    if (!VSAService.instance) {
      VSAService.instance = new VSAService();
    }
    return VSAService.instance;
  }

  /**
   * Get a paginated list of VSAs
   */
  async listVSAs(params: PaginationParams & {
    status?: string;
    skills?: string[];
    category?: string;
  }): Promise<PaginatedResponse<VSA>> {
    return this.api.get<PaginatedResponse<VSA>>(API_ENDPOINTS.vsas, params as Record<string, string>);
  }

  /**
   * Get a VSA by ID
   */
  async getVSA(id: string): Promise<VSA> {
    return this.api.get<VSA>(API_ENDPOINTS.vsaById(id));
  }

  /**
   * Get a VSA by owner's wallet address
   */
  async getVSAByOwner(address: string): Promise<VSA> {
    return this.api.get<VSA>(API_ENDPOINTS.vsaByOwner(address));
  }

  /**
   * Create a new VSA
   */
  async createVSA(vsa: Omit<VSA, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'reputation'>): Promise<VSA> {
    return this.api.post<VSA>(API_ENDPOINTS.vsas, vsa);
  }

  /**
   * Update an existing VSA
   */
  async updateVSA(id: string, updates: Partial<VSA>): Promise<VSA> {
    return this.api.put<VSA>(API_ENDPOINTS.vsaById(id), updates);
  }

  /**
   * Delete a VSA
   */
  async deleteVSA(id: string): Promise<void> {
    return this.api.delete(API_ENDPOINTS.vsaById(id));
  }
}
