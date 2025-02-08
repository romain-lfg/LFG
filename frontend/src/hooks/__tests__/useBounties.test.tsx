import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useBounties } from '../useBounties';
import { nillionService } from '../../services/nillion.service';
import * as useFeatureModule from '../useFeature';

// Mock the nillionService
jest.mock('../../services/nillion.service', () => ({
  nillionService: {
    getBounties: jest.fn()
  }
}));

// Mock the useFeature hook
jest.mock('../useFeature', () => ({
  useFeature: jest.fn()
}));

const mockBountiesResponse = {
  items: [
    {
      id: '1',
      title: 'Test Bounty',
      description: 'Test Description',
      reward: {
        amount: '1.0',
        token: 'ETH',
        chainId: 1
      },
      requirements: {
        skills: ['React', 'TypeScript'],
        estimatedTimeInHours: '10',
        deadline: '2025-03-01'
      },
      status: 'open',
      creator: {
        address: '0x123',
        name: 'Test Creator'
      },
      createdAt: '2025-02-08T00:00:00Z',
      updatedAt: '2025-02-08T00:00:00Z'
    }
  ],
  total: 1,
  page: 1,
  pageSize: 10,
  hasMore: false
};

describe('useBounties', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          cacheTime: 0,
        },
      },
    });
    jest.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  it('should fetch bounties when Nillion is enabled', async () => {
    // Mock useFeature to return true
    (useFeatureModule.useFeature as jest.Mock).mockReturnValue(true);
    
    // Mock successful API response
    (nillionService.getBounties as jest.Mock).mockResolvedValue(mockBountiesResponse);

    const { result } = renderHook(() => useBounties(), { wrapper });

    // Initial state should be loading
    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();

    // Wait for the query to complete
    await waitFor(
      () => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.data).toBeDefined();
      },
      { timeout: 5000 }
    );

    // Verify final state
    expect(result.current.data).toEqual(mockBountiesResponse);
    expect(nillionService.getBounties).toHaveBeenCalled();
  });

  it('should handle errors gracefully', async () => {
    // Mock useFeature to return true
    (useFeatureModule.useFeature as jest.Mock).mockReturnValue(true);
    
    // Mock API error
    const error = new Error('Failed to fetch bounties');
    (nillionService.getBounties as jest.Mock).mockRejectedValue(error);

    const { result } = renderHook(() => useBounties(), { wrapper });

    // Wait for the query to complete and check for error
    await waitFor(
      () => {
        const currentResult = result.current;
        return !currentResult.isLoading && currentResult.error instanceof Error;
      },
      { timeout: 5000 }
    );

    // Verify error state
    expect(result.current.error).toBeDefined();
    expect(result.current.data).toBeUndefined();
  });

  it('should not fetch when Nillion is disabled', async () => {
    // Mock useFeature to return false
    (useFeatureModule.useFeature as jest.Mock).mockReturnValue(false);

    const { result } = renderHook(() => useBounties(), { wrapper });

    // Should not be loading
    await waitFor(
      () => {
        expect(result.current.isLoading).toBe(false);
      },
      { timeout: 5000 }
    );
    
    // Should not call the service
    expect(nillionService.getBounties).not.toHaveBeenCalled();
  });
});
