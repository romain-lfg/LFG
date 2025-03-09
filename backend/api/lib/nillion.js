/**
 * Nillion API Stub
 * 
 * This is a stub implementation of the Nillion API functions to allow the application
 * to run in environments where the actual Nillion integration is not available.
 * 
 * In production, these functions would be replaced with actual calls to the Nillion API.
 */

// Mock data for testing
const users = [];
const bounties = [];

/**
 * Create a user in Nillion
 * @param {Object} userData - User data to store
 * @returns {Promise<Object>} - Created user data
 */
export async function createUser(userData) {
  console.log('STUB: createUser called with:', userData);
  users.push(userData);
  return { id: userData.id, success: true };
}

/**
 * Get list of users from Nillion
 * @returns {Promise<Array>} - List of users
 */
export async function getUserList() {
  console.log('STUB: getUserList called');
  return users;
}

/**
 * Create a bounty in Nillion
 * @param {Object} bountyData - Bounty data to store
 * @returns {Promise<Object>} - Created bounty data
 */
export async function createBounty(bountyData) {
  console.log('STUB: createBounty called with:', bountyData);
  bounties.push(bountyData);
  return { id: bountyData.id, success: true };
}

/**
 * Get list of bounties from Nillion
 * @returns {Promise<Array>} - List of bounties
 */
export async function getBountyList() {
  console.log('STUB: getBountyList called');
  return bounties;
}

/**
 * Match bounties for a user
 * @param {string} userId - User ID to match bounties for
 * @returns {Promise<Array>} - List of matching bounties
 */
export async function matchBountiesUser(userId) {
  console.log('STUB: matchBountiesUser called for user:', userId);
  // Simple mock implementation - in reality would use Nillion's secure computation
  return bounties.filter(bounty => bounty.status === 'open');
}

/**
 * Match users for a bounty owner
 * @param {string} ownerId - Owner ID to match users for
 * @returns {Promise<Array>} - List of matching users
 */
export async function matchBountiesOwner(ownerId) {
  console.log('STUB: matchBountiesOwner called for owner:', ownerId);
  // Simple mock implementation - in reality would use Nillion's secure computation
  return users.filter(user => user.id !== ownerId);
}
