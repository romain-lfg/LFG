import { SecretVaultWrapper } from 'nillion-sv-wrappers';
import { v4 as uuidv4 } from 'uuid';
import { orgConfig } from '../nillionOrgConfig.js';

const SCHEMA_ID_USER = '50375cef-636e-4505-b7ab-39d76b7f124d';
const SCHEMA_ID_BOUNTY = '5b85e1d1-3b6b-4e5a-aa00-45e6b8f8b1ec';

const BOUNTY_ID = '1163837d-318e-46f2-8c2b-86e0fb00b1e7';

//const RECORD_ID = '1163837d-318e-46f2-8c2b-86e0fb00b1e7';
// Check if this is the main module
const isMainModule = import.meta.url === `file://${process.argv[1]}`;

const dataFormat = 
    {
      _id: "1163837d-318e-46f2-8c2b-86e0fb00b1e7",
      name: { $allot: 'Vitalik Buterin' }, // name will be encrypted to a $share
      gender: { $allot: "Male" }, // years_in_web3 will be encrypted to a $share
      interests: [ 
        { skills: "c++", hobbies: "duneriding" },
        { skills: "typescript", hobbies: "reading" },
      ], // responses will be stored in plaintext
    };

  const dataFormat2 = 
  {
    _id: "1163837d-318e-46f2-8c2b-86e0fb00b1e7",
    name: { $allot: 'Vitalik Buterin' }, // name will be encrypted to a $share
    telegramId: { $allot: "1234567890" },
    interests: [ 
      { techstack: "c++", hobbies: "duneriding" },
      { skills: "typescript", hobbies: "reading" },
    ], // responses will be stored in plaintext
  };



export const resetSchema = async (SCHEMA_ID) => {
    const org = new SecretVaultWrapper(
      orgConfig.nodes,
      orgConfig.orgCredentials
    );
    await org.init();

    // Create a new collection schema for all nodes in the org
    const collectionName = 'Bounty Schema';
    const schema = JSON.parse(await readFile(new URL('../schemaBounty.json', import.meta.url)));
    const newSchema = await org.createSchema(schema, collectionName);
    SCHEMA_ID = newSchema[0].result.data
    return SCHEMA_ID
}

export const retrieveUserData = async (userId, SCHEMA_ID) => {
    const collection = await getCollection(SCHEMA_ID);
    console.log('Retrieving user data for:', userId);
    const decryptedCollectionData = await collection.readFromNodes({});
    console.log(decryptedCollectionData)
    // Find the record matching the userId
    const userRecord = decryptedCollectionData.find(record => {
        return record?._id === userId;
    });
    
    if (userRecord) {
        console.log('Found user record:', userRecord);
        return userRecord;
    } else {
        console.log('No record found:');
        return null;
    }
};

export const getCollection = async (SCHEMA_ID) => {
    // Create a secret vault wrapper and initialize the SecretVault collection to use
    const collection = new SecretVaultWrapper(
        orgConfig.nodes,
        orgConfig.orgCredentials,
        SCHEMA_ID
    );
    await collection.init();
    return collection;
};

export const testFn = () => {
    console.log('test');
};

const bountyDataFormat = {
  title: { $allot: "title2" },
  owner: { $allot: "owner1" },
  requiredSkills: { $allot: "requiredSkills" },
  datePosted: { $allot: "hostTime" },
  dueDate: { $allot: "dueDate" },
  state: { $allot: "state" },
  estimatedTime: { $allot: "estimatedTime" },
  description: { $allot: "description" },
  longDescription: { $allot: "longDescription" },
  bountyId: { $allot: "00000000-0000-0000-0000-000000000000" },
  reward: {
    amount: { $allot: "1000000000000000000" },
    token: { $allot: "BTC" },
    chainId: { $allot: "11155111" },
  },

};
const bountyDataFormat2 = {
  title: { $allot: "title2" },
  owner: { $allot: "owner2" },
  requiredSkills: { $allot: "requiredSkills" },
  datePosted: { $allot: "hostTime" },
  dueDate: { $allot: "dueDate" },
  state: { $allot: "state" },
  estimatedTime: { $allot: "estimatedTime" },
  description: { $allot: "description" },
  longDescription: { $allot: "longDescription" },
  reward: {
    amount: { $allot: "1000000000000000000" },
    token: { $allot: "BTC" },
    chainId: { $allot: "11155111" },
  },
};
const bountyFormat = 
    {
      _id: BOUNTY_ID,
      bounties:[bountyDataFormat, bountyDataFormat2, bountyDataFormat, bountyDataFormat2, bountyDataFormat2, bountyDataFormat2, bountyDataFormat2]
    };

export const getUserBounties = async (userId, BountyData) => {
  const userBounties = BountyData.filter(bounty => {
    return bounty.owner === userId;
  });
  return userBounties;
}

export const retrieveBountyData = async (userId, SCHEMA_ID) => {
  const collection = await getCollection(SCHEMA_ID);
  console.log('Retrieving bounty data for:', userId);
  const decryptedCollectionData = await collection.readFromNodes({});
  // console.log(decryptedCollectionData)s
  // Find the bounties matching the userId
  const userRecord = userId === "0" 
    ? decryptedCollectionData
    : decryptedCollectionData.filter(record => {
        return record?._id === userId;
    });

  
  if (userRecord.length >= 1) {
      console.log('Found bounties:', userRecord);
      return userRecord;
  } else {
      console.log('No record found:');
      return null;
  }
};


//{bounties: data.bounties}  format for data
export const updateDataBounties = async (data, SCHEMA_ID) => {
  const collection = await getCollection(SCHEMA_ID);
  const filterById = {_id: BOUNTY_ID};

  const readOriginalRecord = await collection.readFromNodes(filterById);

  console.log('Original record:', readOriginalRecord);
  console.log('Updating id:', BOUNTY_ID);

  console.log("dataUpdate", {data});
  const updateContent = {_id: data._id, bounties: data.bounties};
  console.log("updateContent", updateContent);
  
  const updatedData = await collection.updateDataToNodes(data, {_id: BOUNTY_ID});

  console.log('Updated data:', updatedData);
  console.log('Update result:', updatedData.map((n) => n.result.data));


  const readUpdatedRecord = await collection.readFromNodes(filterById);
  console.log('Updated record:', readUpdatedRecord);
}

export const storeUserData = async (data, SCHEMA_ID) => {
  // Implementation here
  console.log('Storing user data for:', data._id);
  const collection = await getCollection(SCHEMA_ID);
 // console.log('Collection:', collection);
    // Write collection data to nodes encrypting the specified fields ahead of time
    
    const dataWritten = await collection.writeToNodes([data]);
    console.log(
      '👀 Data written to nodes:',
      JSON.stringify(dataWritten, null, 2)
    );


    // Get the ids of the SecretVault records created
    const newIds = [
      ...new Set(dataWritten.map((item) => item.result.data.created).flat()),
    ];
    console.log('uploaded record ids:', newIds);
};

export const createBounty = async (bounty) => {
  const bountiesRetrieved = await retrieveBountyData(bountyFormat._id, SCHEMA_ID_BOUNTY)
  console.log("total bounties:", bountiesRetrieved[0].bounties.length);
  const newBounties = [...bountiesRetrieved[0].bounties, bounty];
  updateDataBounties({bounties: newBounties}, SCHEMA_ID_BOUNTY);
}

export const getBountyList = async () => {
  const bountiesRetrieved = await retrieveBountyData(bountyFormat._id, SCHEMA_ID_BOUNTY)
  return bountiesRetrieved[0].bounties;
}

if (isMainModule) {
    // Call the async function and handle the promise
    if (true) {
        const bountiesRetrieved = await getBountyList();
        console.log("Total bounties:", bountiesRetrieved.length);
        bountiesRetrieved.map(bounty => {
            //console.log("Bounty:", bounty);
            //console.log("Bounty title:", bounty.title);
            //console.log("Bounty description:", bounty.description);
            //console.log("Bounty reward token:", bounty.reward.token);
            console.log("Bounty owner:", bounty.owner);
            //console.log("Bounty required skills:", bounty.requiredSkills);
            //console.log("Bounty datePosted:", bounty.datePosted);
            //console.log("Bounty dueDate:", bounty.dueDate);
            //console.log("Bounty state:", bounty.state);
            //console.log("Bounty estimatedTime:", bounty.estimatedTime);
        });
    } else {
        //storeUserData(bountyFormat, SCHEMA_ID_BOUNTY);
        createBounty(bountyFormat, SCHEMA_ID_BOUNTY);
    }
}


