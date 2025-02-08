import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useBounty } from '../useBounty';
import { nillionService } from '../../services/nillion.service';
import * as useFeatureModule from '../useFeature';

jest.mock('../../services/nillion.service', () => ({
  nillionService: {
    getBounties: jest.fn()
  }
}));

jest.mock('../useFeature', () => ({
  useFeature: jest.fn()
}));

const mockBounty = {
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
};

describe('useBounty', () => {
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

  it('should fetch single bounty when Nillion is enabled', async () => {
    // Mock useFeature to return true
    (useFeatureModule.useFeature as jest.Mock).mockReturnValue(true);
    
    // Mock successful API response
    (nillionService.getBounties as jest.Mock).mockResolvedValue({
      items: [mockBounty]
    });

    const { result } = renderHook(() => useBounty('1'), { wrapper });

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
    expect(result.current.data).toEqual(mockBounty);
  });

  it('should return undefined for non-existent bounty', async () => {
    // Mock useFeature to return true
    (useFeatureModule.useFeature as jest.Mock).mockReturnValue(true);
    
    // Mock API response with empty list
    (nillionService.getBounties as jest.Mock).mockResolvedValue({
      items: []
    });

    const { result } = renderHook(() => useBounty('999'), { wrapper });

    // Wait for the query to complete
    await waitFor(
      () => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.data).toBeUndefined();
      },
      { timeout: 5000 }
    );
  });

  it('should handle errors gracefully', async () => {
    // Mock useFeature to return true
    (useFeatureModule.useFeature as jest.Mock).mockReturnValue(true);
    
    // Mock API error
    const error = new Error('Failed to fetch bounty');
    (nillionService.getBounties as jest.Mock).mockRejectedValue(error);

    const { result } = renderHook(() => useBounty('1'), { wrapper });

    // Wait for the query to complete
    await waitFor(
      () => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.error).toBeDefined();
      },
      { timeout: 5000 }
    );
  });

  it('should use mock data when Nillion is disabled', async () => {
    // Mock useFeature to return false
    (useFeatureModule.useFeature as jest.Mock).mockReturnValue(false);

    const { result } = renderHook(() => useBounty('1'), { wrapper });

    // Wait for the query to complete
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
