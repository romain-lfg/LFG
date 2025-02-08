import { getBountyList as getNillionBounties } from '@/lib/nillion/api';
import { BountyListParams, BountySchema, PaginatedBountyResponse } from '@/types/nillion';
import { NillionError } from '@/lib/nillion/errors';

export class NillionService {
  private maxRetries = 3;
  private retryDelay = 1000; // 1 second

  private async retry<T>(fn: () => Promise<T>): Promise<T> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.warn(`[NillionService] Attempt ${attempt} failed:`, error);
        
        if (attempt < this.maxRetries) {
          await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempt));
        }
      }
    }
    
    throw lastError || new Error('All retry attempts failed');
  }

  async getBounties(params: BountyListParams = {}): Promise<PaginatedBountyResponse> {
    console.log('[NillionService] Fetching bounties with params:', params);
    try {
      const rawData = await this.retry(() => getNillionBounties(params));
      
      // Validate and transform the raw data
      const validatedBounties = rawData.items.map(item => {
        try {
          return BountySchema.parse(item);
        } catch (error) {
          console.error('[NillionService] Bounty validation failed:', error);
          return null;
        }
      }).filter(Boolean);

      console.log('[NillionService] Successfully fetched bounties:', validatedBounties);
      return {
        items: validatedBounties,
        total: rawData.total || validatedBounties.length,
        page: params.page || 1,
        hasMore: rawData.hasMore || false
      };
    } catch (error) {
      console.error('[NillionService] Error fetching bounties:', error);
      throw new NillionError(
        error instanceof Error ? error.message : 'Failed to fetch bounties',
        'FETCH_BOUNTIES_ERROR',
        error
      );
    }
  }
}

export const nillionService = new NillionService();
