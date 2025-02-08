import { nillionClient } from './client';
import { SCHEMA_IDS, RECORD_IDS } from './constants';
import { NillionError } from './errors';
import { BountyListParams } from '@/types/nillion';

export async function getBountyList(params?: BountyListParams) {
  try {
    const client = await nillionClient.getClient();
    console.log('[NillionAPI] Fetching bounties with params:', params);

    const collection = await client.getCollection(SCHEMA_IDS.BOUNTY);
    const bountiesData = await collection.retrieveDataFromNodes(RECORD_IDS.BOUNTY);

    if (!bountiesData || !Array.isArray(bountiesData) || bountiesData.length === 0) {
      console.log('[NillionAPI] No bounties found');
      return { items: [], total: 0, hasMore: false };
    }

    const bounties = bountiesData[0].bounties || [];
    console.log('[NillionAPI] Found bounties:', bounties.length);

    // Filter by owner if specified
    const filteredBounties = params?.owner 
      ? bounties.filter(bounty => bounty.owner === params.owner)
      : bounties;

    return {
      items: filteredBounties,
      total: filteredBounties.length,
      hasMore: false // TODO: Implement pagination
    };
  } catch (error) {
    console.error('[NillionAPI] Error fetching bounties:', error);
    throw NillionError.fromError(error, 'FETCH_BOUNTIES_ERROR');
  }
}

export async function createBounty(bountyData: any) {
  try {
    const client = await nillionClient.getClient();
    console.log('[NillionAPI] Creating bounty:', bountyData);

    const collection = await client.getCollection(SCHEMA_IDS.BOUNTY);
    const bountiesData = await collection.retrieveDataFromNodes(RECORD_IDS.BOUNTY);

    if (!bountiesData || !Array.isArray(bountiesData) || bountiesData.length === 0) {
      throw new NillionError('Failed to retrieve bounties collection', 'FETCH_BOUNTIES_ERROR');
    }

    const currentBounties = bountiesData[0].bounties || [];
    const newBounties = [...currentBounties, bountyData];

    await collection.updateDataToNodes(
      { bounties: newBounties },
      { _id: RECORD_IDS.BOUNTY }
    );

    console.log('[NillionAPI] Bounty created successfully');
    return bountyData;
  } catch (error) {
    console.error('[NillionAPI] Error creating bounty:', error);
    throw NillionError.fromError(error, 'CREATE_BOUNTY_ERROR');
  }
}
