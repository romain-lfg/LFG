import { useQuery } from '@tanstack/react-query';
import { nillionService } from '../services/nillion.service';
import { useFeature } from './useFeature';
import { mockBounties } from '@/mocks/bounties';
import type { Bounty } from '../types/nillion';

export const BOUNTY_QUERY_KEY = 'bounty';

export function useBounty(id: string) {
  console.log('[useBounty] Hook called with id:', id);
  const isNillionEnabled = useFeature('nillion.enabled');

  console.log('[useBounty] Nillion enabled:', isNillionEnabled);

  return useQuery({
    queryKey: [BOUNTY_QUERY_KEY, id],
    queryFn: async (): Promise<Bounty> => {
      console.log('[useBounty] Fetching bounty data...');
      if (!isNillionEnabled) {
        // Use mock data when Nillion is disabled
        const bounty = mockBounties.find(b => b.id === id);
        if (!bounty) throw new Error('Bounty not found');
        return bounty;
      }

      const { items } = await nillionService.getBounties();
      const bounty = items.find(b => b.id === id);
      console.log('[useBounty] Found bounty:', bounty);
      if (!bounty) throw new Error('Bounty not found');
      return bounty;
    },
    enabled: !!id,
    staleTime: 30000, // Consider data fresh for 30 seconds
    gcTime: 5 * 60 * 1000, // Keep unused data in cache for 5 minutes
  });
}
