import { SecretVaultWrapper } from 'nillion-sv-wrappers';
import { v4 as uuidv4 } from 'uuid';
import { orgConfig } from '../nillionOrgConfig.js';

const SCHEMA_ID_USER = '50375cef-636e-4505-b7ab-39d76b7f124d';
const SCHEMA_ID_BOUNTY = '492dc85e-60e6-47db-bd9d-2644f6c359ea';
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
    }
  ;

export const storeData = async (data, SCHEMA_ID) => {
    // Implementation here
    console.log('Storing user data for:', data._id);
    const collection = await getCollection(SCHEMA_ID);
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
  title: { $allot: "title1" },
  description: { $allot: "description" },
  reward: {
    amount: { $allot: "1000000000000000000" },
    token: { $allot: "ETH" },
    chainId: { $allot: "11155111" }
  },
};
const bountyDataFormat2 = {
  title: { $allot: "title2" },
  description: { $allot: "description" },
  reward: {
    amount: { $allot: "1000000000000000000" },
    token: { $allot: "BTC" },
    chainId: { $allot: "11155111" }
  },
};
const bountyFormat = 
    {
      _id: "bbbbbbbb-318e-46f2-8c2b-86e0fb00b1e5",
      bounties:[bountyDataFormat, bountyDataFormat2]
    };

export const storeBounty = async (bounty) => {
    console.log('test2');
};

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

if (isMainModule) {
    // Call the async function and handle the promise
    if (true) {
        retrieveBountyData(bountyFormat._id, SCHEMA_ID_BOUNTY)
            .then(result => console.log('Success'))
            .catch(error => console.error('Error:', error));
        console.log("Total bounties:", bountyFormat.bounties.length);
        bountyFormat.bounties.map(bounty => {
            console.log("Bounty title:", bounty.title.$allot);
            console.log("Bounty description:", bounty.description.$allot);
            console.log("Bounty reward token:", bounty.reward.token.$allot);
        });
    } else {
        storeData(bountyFormat, SCHEMA_ID_BOUNTY);
    }
}


