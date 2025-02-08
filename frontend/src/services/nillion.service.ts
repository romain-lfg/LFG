import { getBountyList } from '../../../nillion/src';
import { BountyListParams, BountySchema, PaginatedBountyResponse } from '../types/nillion';

class NillionError extends Error {
  constructor(
    message: string,
    public code: string = 'NILLION_ERROR'
  ) {
    super(message);
    this.name = 'NillionError';
  }
}

export class NillionService {
  private static instance: NillionService;
  private retryCount = 3;
  private retryDelay = 1000; // 1 second

  private constructor() {}

  static getInstance(): NillionService {
    if (!NillionService.instance) {
      NillionService.instance = new NillionService();
    }
    return NillionService.instance;
  }

  private async retry<T>(fn: () => Promise<T>): Promise<T> {
    let lastError: Error;
    
    for (let i = 0; i < this.retryCount; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        if (i < this.retryCount - 1) {
          await new Promise(resolve => setTimeout(resolve, this.retryDelay * Math.pow(2, i)));
        }
      }
    }
    
    throw lastError!;
  }

  async getBounties(params: BountyListParams = {}): Promise<PaginatedBountyResponse> {
    try {
      const rawData = await this.retry(() => getBountyList(params.owner || null));
      
      // Validate and transform the raw data
      const validatedBounties = rawData.items.map(item => {
        try {
          return BountySchema.parse(item);
        } catch (error) {
          console.error('Invalid bounty data:', item, error);
          return null;
        }
      }).filter(Boolean);

      return {
        items: validatedBounties,
        total: rawData.total || validatedBounties.length,
        page: params.page || 1,
        pageSize: params.pageSize || validatedBounties.length,
        hasMore: rawData.hasMore || false
      };
    } catch (error) {
      throw new NillionError(
        error instanceof Error ? error.message : 'Failed to fetch bounties',
        'FETCH_BOUNTIES_ERROR'
      );
    }
  }
}

export const nillionService = NillionService.getInstance();
