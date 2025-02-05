import { SecretVaultWrapper } from 'nillion-sv-wrappers';
import { v4 as uuidv4 } from 'uuid';
import { orgConfig } from '../nillionOrgConfig.js';

const SCHEMA_ID = '50375cef-636e-4505-b7ab-39d76b7f124d';

const data = [
    {
        _id: "1163837d-318e-46f2-8c2b-86e0fb00b1e4",
      name: { $allot: 'Vitalik Buterin' }, // name will be encrypted to a $share
      gender: { $allot: "Male" }, // years_in_web3 will be encrypted to a $share
      interests: [ 
        { skills: "c++", hobbies: "duneriding" },
        { skills: "typescript", hobbies: "reading" },
      ], // responses will be stored in plaintext
    },
  ];
const data2 = [
  {
      _id: "1163837d-318e-46f2-8c2b-86e0fb00b2e5",
    name: { $allot: 'Terry Yamato' }, // name will be encrypted to a $share
    gender: { $allot: "Female" }, // years_in_web3 will be encrypted to a $share
    interests: [ 
      { skills: "c+++++", hobbies: "potato" },
      { skills: "wipescript", hobbies: "cheering" },
    ], // responses will be stored in plaintext
  },
];

export const storeUserData = async (userData) => {
  try {
    // Create a secret vault wrapper and initialize the SecretVault collection
    const collection = new SecretVaultWrapper(
      orgConfig.nodes,
      orgConfig.orgCredentials, 
      SCHEMA_ID
    );
    await collection.init();

    // Add _id if not present
    const dataToStore = {
      _id: userData._id || uuidv4(),
      ...userData
    };

    // Write data to nodes
    const dataWritten = await collection.writeToNodes([dataToStore]);
    console.log('Data written to nodes:', JSON.stringify(dataWritten, null, 2));

    return dataWritten;
  } catch (error) {
    console.error('Error storing user data:', error.message);
    throw error;
  }
};

export const retrieveUserData = async (userId) => {
  try {
    // Create and initialize collection
    const collection = new SecretVaultWrapper(
      orgConfig.nodes,
      orgConfig.orgCredentials,
      SCHEMA_ID
    );
    await collection.init();

    // Read all data and find matching user
    const decryptedData = await collection.readFromNodes({});
    const userData = decryptedData.find(record => record._id === userId);

    if (!userData) {
      throw new Error(`User with ID ${userId} not found`);
    }

    return userData;
  } catch (error) {
    console.error('Error retrieving user data:', error.message);
    throw error;
  }
};

export const testFn = () => {
  console.log('test complete');
};

//export { storeUserData, retrieveUserData, getCollection, testFn } from './storage.js';

async function main() {
  console.log("Nillion Loaded");
}

main();
