// Fallback implementation of Nillion functions for when the actual module can't be loaded
// This allows the application to start up successfully in environments where Nillion isn't available

export const createBounty = async (bountyData) => {
  console.warn('Using fallback Nillion implementation: createBounty');
  return { id: 'mock-bounty-id', ...bountyData };
};

export const getBountyList = async () => {
  console.warn('Using fallback Nillion implementation: getBountyList');
  return [];
};

export const clearBounties = async () => {
  console.warn('Using fallback Nillion implementation: clearBounties');
  return { success: true };
};

export const matchBountiesUser = async (userData) => {
  console.warn('Using fallback Nillion implementation: matchBountiesUser');
  return [];
};
