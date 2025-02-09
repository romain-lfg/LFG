import { LocalSecretVault } from './LocalSecretVault.js';
import { v4 as uuidv4 } from 'uuid';
import { orgConfig } from '../nillionOrgConfig.js';

const SCHEMA_ID_USER = '541a7214-7a50-4af8-98f7-7c0d7980175e';
const SCHEMA_ID_BOUNTY = '023c30b6-3ba0-495b-a235-cb853263ca1e';

const BOUNTY_ID = '1163837d-318e-46f2-8c2b-86e0fb00b1e7';
const USER_ID = '1163837d-318e-46f2-8c2b-42069b00b1e7';
//open -n -a "Google Chrome" --args --disable-web-security --user-data-dir="/tmp/chrome_dev_session"


//const RECORD_ID = '1163837d-318e-46f2-8c2b-86e0fb00b1e7';
// Check if this is the main module
const isMainModule = import.meta.url === `file://${process.argv[1]}`;



export const resetSchema = async (SCHEMA_ID) => {
    const org = new LocalSecretVault(
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
    const collection = new LocalSecretVault(
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
  requiredSkills: [ { $allot: "c++" }, { $allot: "typescript" }],
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
  requiredSkills: [ { $allot: "c++" }, { $allot: "typescript" }],
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

const userDataFormat = {
      name: { $allot: "username" },
      address: { $allot: "0xi29299100" },
      skills: [ { $allot: "c++" }, { $allot: "typescript" }],
      workingHoursStart: { $allot: "8am" },
      workingHoursEnd: { $allot: "16pm" },
      timeZone: { $allot: "UTC" },
      minimumBountyValue: { $allot: "0" },
    };

const userFormat = 
    {
      _id: USER_ID,
      users:[userDataFormat, userDataFormat]
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

  
  const updatedData = await collection.updateDataToNodes(data, {_id: BOUNTY_ID});

  console.log('Updated data:', updatedData);
  console.log('Update result:', updatedData.map((n) => n.result.data));


  const readUpdatedRecord = await collection.readFromNodes(filterById);
  console.log('Updated record:', readUpdatedRecord);
}
//{bounties: data.bounties}  format for data
export const updateDataUsers = async (data, SCHEMA_ID) => {
  const collection = await getCollection(SCHEMA_ID);
  const filterById = {_id: USER_ID};

  const readOriginalRecord = await collection.readFromNodes(filterById);

  
  const updatedData = await collection.updateDataToNodes(data, {_id: USER_ID});

  console.log('Updated data:', updatedData);
  console.log('Update result:', updatedData.map((n) => n.result.data));


  const readUpdatedRecord = await collection.readFromNodes(filterById);
  console.log('Updated record:', readUpdatedRecord);
}
export const storeUserData = async (data, SCHEMA_ID) => {
  // Implementation here
  console.log('Storing user data for:', data._id);
  console.log("data:", data);
  const collection = await getCollection(SCHEMA_ID);
 // console.log('Collection:', collection);
    // Write collection data to nodes encrypting the specified fields ahead of time
    
    const dataWritten = await collection.writeToNodes([data]);
    // console.log(
    //     '👀 Data written to nodes:',
    //     JSON.stringify(dataWritten, null, 2)
    //   );


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
export const createUser = async (user) => {
  const usersRetrieved   = await retrieveUserData(userFormat._id, SCHEMA_ID_USER)
  var newUsers = [];
  if(usersRetrieved !== null){
    console.log("total users:", usersRetrieved.users.length);
    newUsers = [...usersRetrieved.users, user];
    console.log("newUsers:", newUsers);
  } else {
    newUsers = [user];
  }
  console.log("newUsers:", newUsers);
  updateDataUsers({users: newUsers}, SCHEMA_ID_USER);
}

  export const getBountyList = async () => {
    console.log("Getting bounty list TTTTTESSSST");
    const bountiesRetrieved = await retrieveBountyData(bountyFormat._id, SCHEMA_ID_BOUNTY)
    console.log("bountiesRetrieved:", bountiesRetrieved[0].bounties);
    return bountiesRetrieved[0].bounties;
  }

  export const getUserList = async () => {
    const usersRetrieved = await retrieveUserData(userFormat._id, SCHEMA_ID_USER)
    console.log("usersRetrieved:", usersRetrieved.users);
    return usersRetrieved.users;
  }

export const clearBounties = async () => {
  const collection = await getCollection(SCHEMA_ID_BOUNTY);
  console.log("Clearing bounties");
  const updatedData = await collection.updateDataToNodes({bounties: []}, {_id: BOUNTY_ID});
}
export const clearUsers = async () => {
  const collection = await getCollection(SCHEMA_ID_USER);
  console.log("Clearing users");
  const updatedData = await collection.updateDataToNodes({users: []}, {_id: USER_ID});
  console.log("Updated data:", updatedData);
}

export const matchBountiesOwner = async (userId) => {
  console.log("Matching bounties for owner:", userId);
  const bounties = await getBountyList();
  const users = await getUserList();
  
  const matches = [];
  for (const bounty of bounties) {
    if (bounty.owner == userId) {
      for (const user of users) {
        // Compare bounty and user here
        //console.log(`Comparing bounty ${bounty.title} with user ${user.name}`);
        const userSkills = user.skills;
        const bountySkills = bounty.requiredSkills;
        //console.log("userSkills:", userSkills);
        //console.log("bountySkills:", bountySkills);
        const bountySkillsLower = bountySkills.map(skill => skill.toLowerCase());
        const skillsMatch = userSkills.reduce((count, skill) => {
            return bountySkillsLower.includes(skill.toLowerCase()) ? count + 1 : count;
        }, 0);
        console.log("skillsMatch:", skillsMatch, "out of", bountySkills.length);
        const match = {
          bounty: bounty,
          user: user,
          skillsMatch: skillsMatch
        };
        if(skillsMatch >= 1){
          matches.push(match);
          console.log("match:", match);
        }
      }

    }
  }

  matches.sort((a, b) => b.skillsMatch - a.skillsMatch);
  console.log("matches:", matches);
  // Log details for each match
  matches.forEach(match => {
    //console.log("Match Details:");
    //console.log("User Skills:", match.user.skills);
    //console.log("Required Bounty Skills:", match.bounty.requiredSkills); 
    //console.log("Match Score:", match.skillsMatch);
    //console.log("---");
  });
  return matches;

}

export const matchBountiesUser = async (userId) => {
  console.log("Matching bounties for user:", userId);
  const bounties = await getBountyList();
  const users = await getUserList();
  
  const matches = [];
  for (const bounty of bounties) {
      console.log("bounty:", bounty.bountyId);
      for (const user of users) {
        // Compare bounty and user here
        //console.log("user:", user.address);
        if (user.address == userId) {
          //console.log(`Comparing bounty ${bounty.title} with user ${user.name}`);
          const userSkills = user.skills;
          const bountySkills = bounty.requiredSkills;
          //console.log("userSkills:", userSkills);
          //console.log("bountySkills:", bountySkills);
          const bountySkillsLower = bountySkills.map(skill => skill.toLowerCase());
          console.log("bountySkillsLower:", bountySkillsLower);
          console.log("userSkills lowercase:", userSkills.map(skill => skill.toLowerCase()));
          const skillsMatch = userSkills.reduce((count, skill) => {
              return bountySkillsLower.includes(skill.toLowerCase() ) ? count + 1 : count;
          }, 0);
          console.log("skillsMatch:", skillsMatch, "out of", bountySkills.length);
          const match = {
            bounty: bounty,
            user: user,
            skillsMatch: skillsMatch
          };
          if(skillsMatch >= 1){
            matches.push(match);
            console.log("match:", match);
          }
        }

      }
  }

  matches.sort((a, b) => b.skillsMatch - a.skillsMatch);
  //console.log("matches:", matches);
  // Log details for each match
  matches.forEach(match => {
    //console.log("Match Details:");
    //console.log("User Skills:", match.user.skills);
    //console.log("Required Bounty Skills:", match.bounty.requiredSkills); 
    //console.log("Match Score:", match.skillsMatch);
    //console.log("---");
  });
  return matches;

}

if (isMainModule) {
    // Call the async function and handle the promise
    if (false) {
        const bountiesRetrieved = await getBountyList();
        console.log("Total bounties:", bountiesRetrieved.length);
        bountiesRetrieved.map(bounty => {
            console.log("Bounty:", bounty);
            //console.log("Bounty title:", bounty.title);
            //console.log("Bounty reward token:", bounty.reward.token);
            console.log("Bounty owner:", bounty.owner);
            //console.log("Bounty required skills:", bounty.requiredSkills);
            //console.log("Bounty datePosted:", bounty.datePosted);
            //console.log("Bounty dueDate:", bounty.dueDate);
            //console.log("Bounty state:", bounty.state);
            //console.log("Bounty estimatedTime:", bounty.estimatedTime);
        });
    } else {
      //clearUsers();
      //createUser(userDataFormat);
      //storeUserData(userFormat, SCHEMA_ID_USER);
      //getUserList();
      //getBountyList();
      //matchBountiesOwner("owner2");
      //matchBountiesUser("0xE2eE625D83C68123aCa4251d6a82f23b70d9eEE3");
      //storeUserData({users: [userDataFormat]}, SCHEMA_ID_USER);
      //storeUserData(bountyFormat, SCHEMA_ID_BOUNTY);
      //clearBounties();
      //createBounty(bountyDataFormat, SCHEMA_ID_BOUNTY);
    }
}


