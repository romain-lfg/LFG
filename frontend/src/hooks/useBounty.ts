import { useQuery } from '@tanstack/react-query';
import { apiClient, Bounty } from '../lib/api/client';
import { usePrivy } from '@privy-io/react-auth';

export const BOUNTY_QUERY_KEY = 'bounty';

export function useBounty(id: string) {
  return useQuery({
    queryKey: [BOUNTY_QUERY_KEY, id],
    queryFn: async (): Promise<Bounty | undefined> => {
      try {
        const { getAccessToken } = usePrivy();
        const token = await getAccessToken();
        const bounties = await apiClient.getBounties(token || undefined);
        return bounties.find(b => b.title === id); // Using title as ID for now
      } catch (error) {
        console.error('Failed to get auth token:', error);
        const bounties = await apiClient.getBounties(); // Will make an unauthenticated request
        return bounties.find(b => b.title === id);
      }
    },
    enabled: !!id,
    staleTime: 30000, // Consider data fresh for 30 seconds
    gcTime: 5 * 60 * 1000, // Keep unused data in cache for 5 minutes
  });
}
