import { nillionClient, Bounty } from './client';
import { SCHEMA_IDS, RECORD_IDS } from './constants';
import { NillionError } from './errors';
import { BountyListParams } from '@/types/nillion';

export async function getBountyList(params?: BountyListParams) {
  try {
    console.log('[NillionAPI] Fetching bounties with params:', params);

    // Get collection
    console.log('[NillionAPI] Getting collection with schema:', SCHEMA_IDS.BOUNTY);
    const collection = await nillionClient.getCollection(SCHEMA_IDS.BOUNTY);
    console.log('[NillionAPI] Collection initialized');

    // Retrieve data
    console.log('[NillionAPI] Reading from nodes...');
    const decryptedCollectionData = await collection.readFromNodes({});
    console.log('[NillionAPI] Raw data:', JSON.stringify(decryptedCollectionData, null, 2));
    console.log('[NillionAPI] Raw data type:', typeof decryptedCollectionData);

    // Find all records (userId === "0") or filter by owner
    const records = params?.owner
      ? decryptedCollectionData?.filter(record => record?._id === params.owner)
      : decryptedCollectionData;

    console.log('[NillionAPI] Filtered records:', records);

    if (!records || !Array.isArray(records) || records.length === 0) {
      console.log('[NillionAPI] No records found');
      return { items: [], total: 0, hasMore: false };
    }

    // Transform records to bounties
    const transformedBounties: Bounty[] = records.flatMap(record => {
      const bounties = record?.bounties || [];
      return bounties.map((bounty: any) => ({
        title: bounty.title || '',
        owner: bounty.owner || '',
        requiredSkills: bounty.requiredSkills || '',
        datePosted: bounty.datePosted || '',
        dueDate: bounty.dueDate || '',
        state: bounty.state || 'Open',
        estimatedTime: bounty.estimatedTime || '',
        description: bounty.description || '',
        longDescription: bounty.longDescription || '',
        bountyId: bounty.bountyId || '',
        reward: {
          amount: bounty.reward?.amount || '0',
          token: bounty.reward?.token || 'ETH',
          chainId: bounty.reward?.chainId || '1'
        }
      }));
    });

    return {
      items: transformedBounties,
      total: transformedBounties.length,
      hasMore: false // TODO: Implement pagination
    };
  } catch (error) {
    console.error('[NillionAPI] Error fetching bounties:', error);
    throw NillionError.fromError(error, 'FETCH_BOUNTIES_ERROR');
  }
}

export async function createBounty(bountyData: any) {
  try {
    console.log('[NillionAPI] Creating bounty:', bountyData);

    // Get collection
    const collection = await nillionClient.getCollection(SCHEMA_IDS.BOUNTY);
    console.log('[NillionAPI] Collection initialized');

    // Retrieve current bounties
    const bountiesData = await collection.readFromNodes({});
    console.log('[NillionAPI] Current bounties data:', bountiesData);

    if (!bountiesData || !Array.isArray(bountiesData) || bountiesData.length === 0) {
      throw new NillionError('Failed to retrieve bounties collection', 'FETCH_BOUNTIES_ERROR');
    }

    const currentBounties = bountiesData[0]?.bounties || [];
    const newBounties = [...currentBounties, bountyData];

    // Update data
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
