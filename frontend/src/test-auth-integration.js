// Test script for frontend authentication integration
// Run this in the browser console when testing the frontend

const testAuthIntegration = async () => {
  console.log('Starting authentication integration test...');
  
  // Test variables
  const API_URL = 'http://localhost:3004'; // Use our test server
  let authToken = null;
  let userId = null;
  
  // Helper function to make API requests
  const apiRequest = async (endpoint, method = 'GET', body = null, token = null) => {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const options = {
      method,
      headers,
      credentials: 'include',
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(`${API_URL}${endpoint}`, options);
    return await response.json();
  };
  
  try {
    // Step 1: Test login
    console.log('Step 1: Testing login...');
    const loginData = {
      email: 'frontend-test@example.com',
      walletAddress: '0xfrontendtest',
    };
    
    const loginResponse = await apiRequest('/api/auth/login', 'POST', loginData);
    console.log('Login response:', loginResponse);
    
    if (!loginResponse.token) {
      throw new Error('Login failed: No token received');
    }
    
    authToken = loginResponse.token;
    userId = loginResponse.user.id;
    console.log('Login successful! Token:', authToken);
    
    // Step 2: Test profile retrieval
    console.log('Step 2: Testing profile retrieval...');
    const profileResponse = await apiRequest('/api/users/profile', 'GET', null, authToken);
    console.log('Profile response:', profileResponse);
    
    if (!profileResponse.user || profileResponse.user.id !== userId) {
      throw new Error('Profile retrieval failed: User ID mismatch');
    }
    
    console.log('Profile retrieval successful!');
    
    // Step 3: Test profile update
    console.log('Step 3: Testing profile update...');
    const updateData = {
      metadata: {
        name: 'Frontend Test User',
        bio: 'Testing the frontend integration',
        skills: ['React', 'TypeScript', 'Node.js'],
      },
    };
    
    const updateResponse = await apiRequest('/api/users/profile', 'PUT', updateData, authToken);
    console.log('Update response:', updateResponse);
    
    if (!updateResponse.user || !updateResponse.user.metadata || updateResponse.user.metadata.name !== 'Frontend Test User') {
      throw new Error('Profile update failed: Metadata not updated correctly');
    }
    
    console.log('Profile update successful!');
    
    // Step 4: Test user sync
    console.log('Step 4: Testing user sync...');
    const syncData = {
      walletAddress: '0xnewfrontendaddress',
      metadata: {
        lastLogin: new Date().toISOString(),
      },
    };
    
    const syncResponse = await apiRequest('/api/users/sync', 'POST', syncData, authToken);
    console.log('Sync response:', syncResponse);
    
    if (!syncResponse.user || syncResponse.user.walletAddress !== '0xnewfrontendaddress') {
      throw new Error('User sync failed: Wallet address not updated correctly');
    }
    
    console.log('User sync successful!');
    
    // Final check
    console.log('Step 5: Final profile check...');
    const finalProfileResponse = await apiRequest('/api/users/profile', 'GET', null, authToken);
    console.log('Final profile response:', finalProfileResponse);
    
    console.log('All tests passed successfully!');
    return {
      success: true,
      user: finalProfileResponse.user,
      token: authToken,
    };
  } catch (error) {
    console.error('Test failed:', error.message);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Instructions for running the test
console.log(`
=== Frontend Authentication Integration Test ===

This script tests the integration between the frontend and the authentication backend.
To run the test:

1. Make sure the test backend server is running on http://localhost:3004
   (run 'node test-auth-flow.js' in the backend directory)
   
2. Open your browser console and run:
   testAuthIntegration().then(result => console.log('Test result:', result));

The test will simulate the complete authentication flow and log the results.
`);

// Export for use in browser or import
if (typeof window !== 'undefined') {
  window.testAuthIntegration = testAuthIntegration;
}

export default testAuthIntegration;
