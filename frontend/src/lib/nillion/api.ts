import { getBountyList as nillionGetBountyList } from '../../../../nillion';
import { NillionError } from './errors';
import { BountyListParams } from '@/types/nillion';

export async function getBountyList(params?: BountyListParams) {
  try {
    console.log('[NillionAPI] Fetching bounties with params:', params);
    const bounties = await nillionGetBountyList();
    console.log('[NillionAPI] Bounties:', bounties);

    return {
      items: bounties || [],
      total: bounties?.length || 0,
      hasMore: false
    };
  } catch (error) {
    console.error('[NillionAPI] Error fetching bounties:', error);
    throw NillionError.fromError(error, 'FETCH_BOUNTIES_ERROR');
  }
}

export async function createBounty(bountyData: any) {
  try {
    console.log('[NillionAPI] Creating bounty:', bountyData);
    // TODO: Implement create bounty
    throw new Error('Not implemented');
  } catch (error) {
    console.error('[NillionAPI] Error creating bounty:', error);
    throw NillionError.fromError(error, 'CREATE_BOUNTY_ERROR');
  }
}
