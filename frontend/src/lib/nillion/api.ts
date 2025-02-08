import { getBountyList as nillionGetBountyList } from '../../../../nillion';
import { NillionError } from './errors';
import { BountyListParams } from '@/types/nillion';

export async function getBountyList(params?: BountyListParams) {
  try {
    console.log('[NillionAPI] Fetching bounties with params:', params);
    const bounties = await nillionGetBountyList(params?.owner);
    console.log('[NillionAPI] Bounties:', bounties);

    return {
      items: bounties,
      total: bounties.length,
      hasMore: false
    };
  } catch (error) {
    console.error('[NillionAPI] Error fetching bounties:', error);
    throw new NillionError('FETCH_BOUNTIES_ERROR', error);
  }
}

export async function createBounty(bountyData: any) {
  try {
    console.log('[NillionAPI] Creating bounty:', bountyData);
    // TODO: Implement create bounty
    throw new Error('Not implemented');
  } catch (error) {
    console.error('[NillionAPI] Error creating bounty:', error);
    throw new NillionError('CREATE_BOUNTY_ERROR', error);
  }
}
