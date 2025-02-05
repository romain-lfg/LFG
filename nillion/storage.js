import { SecretVaultWrapper } from 'nillion-sv-wrappers';
import { v4 as uuidv4 } from 'uuid';
import { orgConfig } from './nillionOrgConfig.js';

const SCHEMA_ID = '50375cef-636e-4505-b7ab-39d76b7f124d';

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


export const storeUserData = async (data) => {
    // Implementation here
    console.log('Storing user data for:', data._id);
    const collection = await getCollection();
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

export const retrieveUserData = async (userId) => {
    const collection = await getCollection();
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

export const getCollection = async () => {
    // Create a secret vault wrapper and initialize the SecretVault collection to use
    const collection = new SecretVaultWrapper(
        orgConfig.nodes,
        orgConfig.orgCredentials,
        SCHEMA_ID
    );
    await collection.init();
    return collection;
};


if (isMainModule) {
    // Call the async function and handle the promise
    if (true) {
        retrieveUserData(dataFormat._id)
            .then(result => console.log('Result:', result))
            .catch(error => console.error('Error:', error));
    } else {
        storeUserData(dataFormat);
    }
}


