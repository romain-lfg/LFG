import { useQuery } from '@tanstack/react-query';
import { apiClient, Bounty } from '../lib/api/client';

export const BOUNTIES_QUERY_KEY = 'bounties';

export function useBounties() {
  return useQuery<Bounty[]>({
    queryKey: [BOUNTIES_QUERY_KEY],
    queryFn: () => apiClient.getBounties(),
    staleTime: 30000, // Consider data fresh for 30 seconds
    gcTime: 5 * 60 * 1000, // Keep unused data in cache for 5 minutes
    retry: 3,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
}
