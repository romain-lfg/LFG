/**
 * Nillion API Stub
 * 
 * This is a stub implementation of the Nillion API functions to allow the application
 * to run in environments where the actual Nillion integration is not available.
 * 
 * In production, these functions would be replaced with actual calls to the Nillion API.
 */

// Import environment variables
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get environment
const nodeEnv = process.env.NODE_ENV || 'development';

// Mock data for testing
const users = [];
const bounties = [];

// Helper function for logging
function logOperation(operation, details) {
  console.log(`🔒 Nillion STUB [${nodeEnv}]: ${operation}`, {
    ...details,
    timestamp: new Date().toISOString(),
    environment: nodeEnv,
    isStubImplementation: true
  });
}

/**
 * Create a user in Nillion
 * @param {Object} userData - User data to store
 * @returns {Promise<Object>} - Created user data
 */
export async function createUser(userData) {
  logOperation('createUser called', {
    userId: userData.id,
    hasWalletAddress: !!userData.wallet_address,
    hasEmail: !!userData.email,
    operation: 'create'
  });
  
  try {
    users.push(userData);
    
    logOperation('createUser successful', {
      userId: userData.id,
      totalUsers: users.length
    });
    
    return { id: userData.id, success: true };
  } catch (error) {
    logOperation('createUser error', {
      userId: userData.id,
      error: error.message,
      stack: error.stack
    });
    
    throw error;
  }
}

/**
 * Get list of users from Nillion
 * @returns {Promise<Array>} - List of users
 */
export async function getUserList() {
  logOperation('getUserList called', {
    userCount: users.length
  });
  
  try {
    logOperation('getUserList successful', {
      returnedUsers: users.length,
      sampleUser: users.length > 0 ? { id: users[0].id } : null
    });
    
    return users;
  } catch (error) {
    logOperation('getUserList error', {
      error: error.message,
      stack: error.stack
    });
    
    throw error;
  }
}

/**
 * Create a bounty in Nillion
 * @param {Object} bountyData - Bounty data to store
 * @returns {Promise<Object>} - Created bounty data
 */
export async function createBounty(bountyData) {
  logOperation('createBounty called', {
    bountyId: bountyData.id,
    ownerId: bountyData.owner_id,
    title: bountyData.title,
    operation: 'create'
  });
  
  try {
    bounties.push(bountyData);
    
    logOperation('createBounty successful', {
      bountyId: bountyData.id,
      totalBounties: bounties.length
    });
    
    return { id: bountyData.id, success: true };
  } catch (error) {
    logOperation('createBounty error', {
      bountyId: bountyData.id,
      error: error.message,
      stack: error.stack
    });
    
    throw error;
  }
}

/**
 * Get list of bounties from Nillion
 * @returns {Promise<Array>} - List of bounties
 */
export async function getBountyList() {
  logOperation('getBountyList called', {
    bountyCount: bounties.length
  });
  
  try {
    // Add a small delay to simulate network latency
    await new Promise(resolve => setTimeout(resolve, 100));
    
    logOperation('getBountyList successful', {
      returnedBounties: bounties.length,
      sampleBounty: bounties.length > 0 ? { 
        id: bounties[0].id,
        title: bounties[0].title,
        status: bounties[0].status 
      } : null
    });
    
    return bounties;
  } catch (error) {
    logOperation('getBountyList error', {
      error: error.message,
      stack: error.stack
    });
    
    throw error;
  }
}

/**
 * Match bounties for a user
 * @param {string} userId - User ID to match bounties for
 * @returns {Promise<Array>} - List of matching bounties
 */
export async function matchBountiesUser(userId) {
  logOperation('matchBountiesUser called', {
    userId,
    totalBounties: bounties.length
  });
  
  try {
    // Add a small delay to simulate computation time
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Simple mock implementation - in reality would use Nillion's secure computation
    const matches = bounties.filter(bounty => bounty.status === 'open');
    
    logOperation('matchBountiesUser successful', {
      userId,
      matchCount: matches.length,
      sampleMatch: matches.length > 0 ? { 
        id: matches[0].id,
        title: matches[0].title,
        status: matches[0].status 
      } : null
    });
    
    // Add match score to each bounty
    const matchesWithScores = matches.map(bounty => ({
      ...bounty,
      matchScore: Math.floor(Math.random() * 100) / 100 // Random score between 0 and 1
    }));
    
    return matchesWithScores;
  } catch (error) {
    logOperation('matchBountiesUser error', {
      userId,
      error: error.message,
      stack: error.stack
    });
    
    throw error;
  }
}

/**
 * Match users for a bounty owner
 * @param {string} ownerId - Owner ID to match users for
 * @returns {Promise<Array>} - List of matching users
 */
export async function matchBountiesOwner(ownerId) {
  logOperation('matchBountiesOwner called', {
    ownerId,
    totalUsers: users.length,
    totalBounties: bounties.length
  });
  
  try {
    // Add a small delay to simulate computation time
    await new Promise(resolve => setTimeout(resolve, 150));
    
    // Get owner's bounties
    const ownerBounties = bounties.filter(bounty => bounty.owner_id === ownerId);
    
    logOperation('matchBountiesOwner successful', {
      ownerId,
      ownerBountyCount: ownerBounties.length,
      sampleBounty: ownerBounties.length > 0 ? { 
        id: ownerBounties[0].id,
        title: ownerBounties[0].title,
        status: ownerBounties[0].status 
      } : null
    });
    
    return ownerBounties;
  } catch (error) {
    logOperation('matchBountiesOwner error', {
      ownerId,
      error: error.message,
      stack: error.stack
    });
    
    throw error;
  }
}
