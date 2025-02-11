import { useQuery } from '@tanstack/react-query';
import { apiClient, Bounty } from '../lib/api/client';

export const BOUNTY_QUERY_KEY = 'bounty';

export function useBounty(id: string) {
  return useQuery({
    queryKey: [BOUNTY_QUERY_KEY, id],
    queryFn: async (): Promise<Bounty | undefined> => {
      const bounties = await apiClient.getBounties();
      return bounties.find(b => b.title === id); // Using title as ID for now
    },
    enabled: !!id,
    staleTime: 30000, // Consider data fresh for 30 seconds
    gcTime: 5 * 60 * 1000, // Keep unused data in cache for 5 minutes
  });
}
