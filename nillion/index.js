import { SecretVaultWrapper } from 'nillion-sv-wrappers';
import { v4 as uuidv4 } from 'uuid';
import { orgConfig } from './nillionOrgConfig.js';

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
  async function main() {
    try {
      // Create a secret vault wrapper and initialize the SecretVault collection to use
      const collection = new SecretVaultWrapper(
        orgConfig.nodes,
        orgConfig.orgCredentials,
        SCHEMA_ID
      );
      await collection.init();
  
      // Write collection data to nodes encrypting the specified fields ahead of time
      const dataWritten = await collection.writeToNodes(data2);
      console.log(
        '👀 Data written to nodes:',
        JSON.stringify(dataWritten, null, 2)
      );
  
      // Get the ids of the SecretVault records created
      const newIds = [
        ...new Set(dataWritten.map((item) => item.result.data.created).flat()),
      ];
      console.log('uploaded record ids:', newIds);
  
      // Read all collection data from the nodes, decrypting the specified fields
      const decryptedCollectionData = await collection.readFromNodes({});
  
      // Log first 5 records
      console.log(
        'Most recent records',
        decryptedCollectionData.slice(0, data.length)
      );
    } catch (error) {
      console.error('❌ SecretVaultWrapper error:', error.message);
      process.exit(1);
    }
  }
  
  main();