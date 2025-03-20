import { useQuery } from '@tanstack/react-query';
import { apiClient, Bounty } from '../lib/api/client';
import { usePrivy } from '@privy-io/react-auth';

export const BOUNTIES_QUERY_KEY = 'bounties';

export function useBounties() {
  return useQuery<Bounty[]>({
    queryKey: [BOUNTIES_QUERY_KEY],
    queryFn: async () => {
      try {
        const { getAccessToken } = usePrivy();
        const token = await getAccessToken();
        if (!token) {
          console.warn('No auth token available for bounties request');
          return apiClient.getBounties(); // Will make an unauthenticated request
        }
        return apiClient.getBounties(token);
      } catch (error) {
        console.error('Failed to get auth token:', error);
        return apiClient.getBounties(); // Will make an unauthenticated request
      }
    },
    staleTime: 30000, // Consider data fresh for 30 seconds
    gcTime: 5 * 60 * 1000, // Keep unused data in cache for 5 minutes
    retry: 3,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
}
