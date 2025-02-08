import { nillionClient, Bounty } from './client';
import { SCHEMA_IDS, RECORD_IDS } from './constants';
import { NillionError } from './errors';
import { BountyListParams } from '@/types/nillion';

export async function getBountyList(params?: BountyListParams) {
  try {
    console.log('[NillionAPI] Fetching bounties with params:', params);

    // Initialize schema if needed
    try {
      console.log('[NillionAPI] Initializing schema...');
      const newSchemaId = await nillionClient.initializeSchema();
      console.log('[NillionAPI] Schema initialized with ID:', newSchemaId);
      SCHEMA_IDS.BOUNTY = newSchemaId;
    } catch (error) {
      console.log('[NillionAPI] Schema already exists, using existing schema');
    }

    // Get collection
    console.log('[NillionAPI] Getting collection with schema:', SCHEMA_IDS.BOUNTY);
    const collection = await nillionClient.getCollection(SCHEMA_IDS.BOUNTY);
    console.log('[NillionAPI] Collection initialized');

    // Try to read data first
    console.log('[NillionAPI] Reading from nodes...');
    const decryptedCollectionData = await collection.readFromNodes({});
    console.log('[NillionAPI] Raw data:', JSON.stringify(decryptedCollectionData, null, 2));
    console.log('[NillionAPI] Raw data type:', typeof decryptedCollectionData);

    // If no data exists, initialize with a test bounty
    if (!decryptedCollectionData || !Array.isArray(decryptedCollectionData) || decryptedCollectionData.length === 0) {
      console.log('[NillionAPI] No data found, initializing with test bounty...');
      const testBounty = {
        title: { $allot: 'Test Bounty' },
        owner: { $allot: '0x1234567890123456789012345678901234567890' },
        requiredSkills: { $allot: 'TypeScript,C#' },
        datePosted: { $allot: new Date().toISOString() },
        dueDate: { $allot: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() },
        state: { $allot: 'Open' },
        estimatedTime: { $allot: '10 hrs' },
        description: { $allot: 'Test bounty for initialization' },
        longDescription: { $allot: 'This is a test bounty to initialize the collection' },
        bountyId: { $allot: '00000000-0000-0000-0000-000000000000' },
        reward: {
          amount: { $allot: '1992' },
          token: { $allot: 'ETH' },
          chainId: { $allot: '11192' }
        }
      };

      await collection.updateDataToNodes(
        { _id: RECORD_IDS.BOUNTY, bounties: [testBounty] },
        { _id: RECORD_IDS.BOUNTY }
      );

      // Read the data again after initialization
      const initializedData = await collection.readFromNodes({});
      console.log('[NillionAPI] Initialized data:', JSON.stringify(initializedData, null, 2));
      return {
        items: [testBounty],
        total: 1,
        hasMore: false
      };
    }

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
        title: bounty.title?.$allot || '',
        owner: bounty.owner?.$allot || '',
        requiredSkills: bounty.requiredSkills?.$allot || '',
        datePosted: bounty.datePosted?.$allot || '',
        dueDate: bounty.dueDate?.$allot || '',
        state: bounty.state?.$allot || 'Open',
        estimatedTime: bounty.estimatedTime?.$allot || '',
        description: bounty.description?.$allot || '',
        longDescription: bounty.longDescription?.$allot || '',
        bountyId: bounty.bountyId?.$allot || '',
        reward: {
          amount: bounty.reward?.amount?.$allot || '0',
          token: bounty.reward?.token?.$allot || 'ETH',
          chainId: bounty.reward?.chainId?.$allot || '1'
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
