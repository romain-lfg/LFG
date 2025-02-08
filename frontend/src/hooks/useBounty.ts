import { useQuery } from '@tanstack/react-query';
import { nillionService } from '../services/nillion.service';
import { useFeature } from './useFeature';
import { mockBounties } from '@/mocks/bounties';
import type { Bounty } from '../types/nillion';

export const BOUNTY_QUERY_KEY = 'bounty';

export function useBounty(id: string) {
  const isNillionEnabled = useFeature('nillion.enabled');

  return useQuery<Bounty | undefined>({
    queryKey: [BOUNTY_QUERY_KEY, id],
    queryFn: async () => {
      if (!isNillionEnabled) {
        // Use mock data when Nillion is disabled
        return mockBounties.find(b => b.id === id);
      }

      const { items } = await nillionService.getBounties();
      return items.find(b => b.id === id);
    },
    enabled: !!id,
    staleTime: 30000, // Consider data fresh for 30 seconds
    gcTime: 5 * 60 * 1000, // Keep unused data in cache for 5 minutes
  });
}
