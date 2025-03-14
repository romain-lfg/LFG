// Simple script to test the user sync endpoint
const fetch = require('node-fetch');

// Configuration
const API_URL = 'https://lfg-backend-api-staging.vercel.app';
const SYNC_ENDPOINT = '/api/users/sync';

// Mock data (similar to what the frontend would send)
const mockUserData = {
  walletAddress: '0x1234567890abcdef1234567890abcdef12345678', // Mock wallet address
  email: 'test@example.com',
  metadata: {
    userId: 'test-user-id-12345', // This would normally be the Privy user ID
  }
};

// Mock token (this won't work without a real Privy token)
const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ0ZXN0LXVzZXItaWQtMTIzNDUiLCJhcHBJZCI6InRlc3QtYXBwLWlkIiwiaWF0IjoxNjE2MTYyMzk1LCJleHAiOjE2MTYyNDg3OTV9.INVALID_SIGNATURE';

async function testUserSync() {
  try {
    console.log('Testing user sync endpoint...');
    console.log(`URL: ${API_URL}${SYNC_ENDPOINT}`);
    console.log('User data:', mockUserData);
    
    const response = await fetch(`${API_URL}${SYNC_ENDPOINT}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${mockToken}`,
      },
      body: JSON.stringify(mockUserData),
    });
    
    console.log('Response status:', response.status);
    console.log('Response status text:', response.statusText);
    
    const headers = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });
    console.log('Response headers:', headers);
    
    const responseText = await response.text();
    console.log('Response body:', responseText);
    
    try {
      const responseJson = JSON.parse(responseText);
      console.log('Response JSON:', responseJson);
    } catch (e) {
      console.log('Response is not valid JSON');
    }
    
  } catch (error) {
    console.error('Error testing user sync:', error);
  }
}

// Run the test
testUserSync();
