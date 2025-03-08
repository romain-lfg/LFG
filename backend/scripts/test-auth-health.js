import fetch from 'node-fetch';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Configuration
const API_URL = process.env.API_URL || 'https://lfg-backend-api-staging-ncgphhpt0-lfg-5fd382da.vercel.app';
const TEST_TOKEN = process.env.TEST_TOKEN || 'your-test-token-here'; // Replace with a valid token

async function testAuthHealth() {
  console.log('🧪 Testing standalone auth health endpoint...');
  console.log(`🔗 Testing API at: ${API_URL}`);
  console.log('-------------------------------------------');

  try {
    // Test without auth token first
    console.log('Testing auth health endpoint WITHOUT token...');
    const noAuthResponse = await fetch(`${API_URL}/api/auth-health`);
    const noAuthData = await noAuthResponse.json();
    
    console.log(`Response status: ${noAuthResponse.status}`);
    console.log('Response body:', JSON.stringify(noAuthData, null, 2));
    
    if (noAuthResponse.status === 200 && noAuthData.status === 'ok') {
      console.log('✅ Auth health endpoint accessible without token');
    } else {
      console.log('❌ Auth health endpoint not accessible without token');
    }
    
    console.log('-------------------------------------------');
    
    // Test with auth token
    if (TEST_TOKEN && TEST_TOKEN !== 'your-test-token-here') {
      console.log('Testing auth health endpoint WITH token...');
      const authResponse = await fetch(`${API_URL}/api/auth-health`, {
        headers: {
          'Authorization': `Bearer ${TEST_TOKEN}`
        }
      });
      
      const authData = await authResponse.json();
      
      console.log(`Response status: ${authResponse.status}`);
      console.log('Response body:', JSON.stringify(authData, null, 2));
      
      if (authResponse.status === 200 && authData.authentication?.verified) {
        console.log('✅ Token verification successful');
        console.log(`User ID: ${authData.authentication.userId}`);
      } else {
        console.log('❌ Token verification failed');
        console.log(`Message: ${authData.authentication?.message}`);
      }
    } else {
      console.log('⚠️ No valid test token provided. Skipping authenticated test.');
      console.log('To test with authentication, set the TEST_TOKEN environment variable.');
    }
  } catch (error) {
    console.error('❌ Error testing auth health endpoint:', error);
  }
  
  console.log('-------------------------------------------');
  console.log('🏁 Auth health tests completed');
}

// Run the tests
testAuthHealth();
