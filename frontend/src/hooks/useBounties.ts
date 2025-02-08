import { useQuery } from '@tanstack/react-query';
import { nillionService } from '../services/nillion.service';
import type { BountyListParams, PaginatedBountyResponse } from '../types/nillion';
import { useFeature } from './useFeature';

export const BOUNTIES_QUERY_KEY = 'bounties';

export function useBounties(params: BountyListParams = {}) {
  const isNillionEnabled = useFeature('nillion.enabled');

  return useQuery<PaginatedBountyResponse>({
    queryKey: [BOUNTIES_QUERY_KEY, params],
    queryFn: () => nillionService.getBounties(params),
    enabled: isNillionEnabled,
    staleTime: 30000, // Consider data fresh for 30 seconds
    gcTime: 5 * 60 * 1000, // Keep unused data in cache for 5 minutes
    retry: (failureCount, error) => {
      // Don't retry if it's a validation error or if we've tried 3 times
      if (error instanceof Error && error.name === 'NillionError') {
        return false;
      }
      return failureCount < 3;
    },
    refetchOnWindowFocus: true, // Refetch when user focuses the window
    refetchOnMount: true, // Refetch when component mounts
  });
}
