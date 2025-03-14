// Test script to diagnose API issues
import fetch from 'node-fetch';

// Configuration
const API_URL = process.env.API_URL || 'https://lfg-backend-api-staging.vercel.app';
const TEST_TOKEN = process.env.TEST_TOKEN || 'your-test-token-here'; // Replace with a valid token

async function testOptionsRequest() {
  console.log('Testing OPTIONS request to /api/users/sync...');
  
  try {
    const response = await fetch(`${API_URL}/api/users/sync`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://lfg-frontend-staging.vercel.app',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type, Authorization'
      }
    });
    
    console.log('OPTIONS response status:', response.status);
    console.log('OPTIONS response headers:', response.headers.raw());
    
    return response.status === 200;
  } catch (error) {
    console.error('OPTIONS request failed:', error);
    return false;
  }
}

async function testPostRequest() {
  console.log('Testing POST request to /api/users/sync...');
  
  const userData = {
    walletAddress: '0x5Af5A5b08Dc4bBA9e0D9cEe4AA55eDFfc28f4A14',
    email: 'test@example.com',
    metadata: {
      userId: 'test-user-id'
    }
  };
  
  try {
    const response = await fetch(`${API_URL}/api/users/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TEST_TOKEN}`,
        'Origin': 'https://lfg-frontend-staging.vercel.app'
      },
      body: JSON.stringify(userData)
    });
    
    console.log('POST response status:', response.status);
    
    if (response.status !== 200) {
      const text = await response.text();
      console.log('POST response body:', text);
    } else {
      const json = await response.json();
      console.log('POST response body:', json);
    }
    
    return response.status === 200;
  } catch (error) {
    console.error('POST request failed:', error);
    return false;
  }
}

async function testDebugPostRequest() {
  console.log('Testing POST request to /api/debug/test-post...');
  
  try {
    const response = await fetch(`${API_URL}/api/debug/test-post`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://lfg-frontend-staging.vercel.app'
      },
      body: JSON.stringify({ test: 'data' })
    });
    
    console.log('Debug POST response status:', response.status);
    
    if (response.status !== 200) {
      const text = await response.text();
      console.log('Debug POST response body:', text);
    } else {
      const json = await response.json();
      console.log('Debug POST response body:', json);
    }
    
    return response.status === 200;
  } catch (error) {
    console.error('Debug POST request failed:', error);
    return false;
  }
}

async function testHealthCheck() {
  console.log('Testing GET request to /api/health...');
  
  try {
    const response = await fetch(`${API_URL}/api/health`, {
      method: 'GET',
      headers: {
        'Origin': 'https://lfg-frontend-staging.vercel.app'
      }
    });
    
    console.log('Health check response status:', response.status);
    
    if (response.status === 200) {
      const json = await response.json();
      console.log('Health check response body:', json);
    } else {
      try {
        const text = await response.text();
        console.log('Health check response body:', text.substring(0, 500) + '... (truncated)');
      } catch (e) {
        console.log('Could not read response body:', e.message);
      }
    }
    
    return response.status === 200;
  } catch (error) {
    console.error('Health check request failed:', error);
    return false;
  }
}

async function testAuthEndpoint() {
  console.log('Testing GET request to /api/auth/status...');
  
  try {
    const response = await fetch(`${API_URL}/api/auth/status`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`,
        'Origin': 'https://lfg-frontend-staging.vercel.app'
      }
    });
    
    console.log('Auth status response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Auth status response data:', data);
    } else {
      const text = await response.text();
      console.log('Auth status response body:', text);
    }
    
    return response.ok;
  } catch (error) {
    console.error('Auth status request failed:', error);
    return false;
  }
}

async function testAuthHealthEndpoint() {
  console.log('Testing GET request to /api/auth/health...');
  
  try {
    const response = await fetch(`${API_URL}/api/auth/health`, {
      method: 'GET',
      headers: {
        'Origin': 'https://lfg-frontend-staging.vercel.app'
      }
    });
    
    console.log('Auth health response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Auth health response data:', data);
    } else {
      try {
        const text = await response.text();
        console.log('Auth health response body:', text.substring(0, 500) + '... (truncated)');
      } catch (e) {
        console.log('Could not read response body:', e.message);
      }
    }
    
    return response.ok;
  } catch (error) {
    console.error('Auth health request failed:', error);
    return false;
  }
}

async function testRootEndpoint() {
  console.log('Testing GET request to root endpoint (/)...');
  
  try {
    const response = await fetch(`${API_URL}/`, {
      method: 'GET',
      headers: {
        'Origin': 'https://lfg-frontend-staging.vercel.app'
      }
    });
    
    console.log('Root endpoint response status:', response.status);
    
    if (response.ok) {
      try {
        const data = await response.json();
        console.log('Root endpoint response data:', data);
      } catch (e) {
        const text = await response.text();
        console.log('Root endpoint response text:', text.substring(0, 100) + '... (truncated)');
      }
    } else {
      try {
        const text = await response.text();
        console.log('Root endpoint response body:', text.substring(0, 500) + '... (truncated)');
      } catch (e) {
        console.log('Could not read response body:', e.message);
      }
    }
    
    // Consider any response a success for diagnostic purposes
    return true;
  } catch (error) {
    console.error('Root endpoint request failed:', error);
    return false;
  }
}

async function testDebugEnvEndpoint() {
  console.log('Testing GET request to /api/debug-env...');
  
  try {
    const response = await fetch(`${API_URL}/api/debug-env`, {
      method: 'GET',
      headers: {
        'Origin': 'https://lfg-frontend-staging.vercel.app'
      }
    });
    
    console.log('Debug env response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Debug env response data:', JSON.stringify(data, null, 2));
    } else {
      try {
        const text = await response.text();
        console.log('Debug env response body:', text.substring(0, 500) + '... (truncated)');
      } catch (e) {
        console.log('Could not read response body:', e.message);
      }
    }
    
    return response.ok;
  } catch (error) {
    console.error('Debug env request failed:', error);
    return false;
  }
}

async function testDebugModulesEndpoint() {
  console.log('Testing GET request to /api/debug-modules...');
  
  try {
    const response = await fetch(`${API_URL}/api/debug-modules`, {
      method: 'GET',
      headers: {
        'Origin': 'https://lfg-frontend-staging.vercel.app'
      }
    });
    
    console.log('Debug modules response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Debug modules response data:', JSON.stringify(data, null, 2));
    } else {
      try {
        const text = await response.text();
        console.log('Debug modules response body:', text.substring(0, 500) + '... (truncated)');
      } catch (e) {
        console.log('Could not read response body:', e.message);
      }
    }
    
    return response.ok;
  } catch (error) {
    console.error('Debug modules request failed:', error);
    return false;
  }
}

async function testDebugMiddlewareEndpoint() {
  console.log('Testing GET request to /api/debug-middleware...');
  
  try {
    const response = await fetch(`${API_URL}/api/debug-middleware`, {
      method: 'GET',
      headers: {
        'Origin': 'https://lfg-frontend-staging.vercel.app'
      }
    });
    
    console.log('Debug middleware response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Debug middleware response data:', JSON.stringify(data, null, 2));
    } else {
      try {
        const text = await response.text();
        console.log('Debug middleware response body:', text.substring(0, 500) + '... (truncated)');
      } catch (e) {
        console.log('Could not read response body:', e.message);
      }
    }
    
    return response.ok;
  } catch (error) {
    console.error('Debug middleware request failed:', error);
    return false;
  }
}

async function testPublicHealthEndpoint() {
  console.log('Testing GET request to /api/public-health...');
  
  try {
    const response = await fetch(`${API_URL}/api/public-health`, {
      method: 'GET',
      headers: {
        'Origin': 'https://lfg-frontend-staging.vercel.app'
      }
    });
    
    console.log('Public health response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Public health response data:', JSON.stringify(data, null, 2));
    } else {
      try {
        const text = await response.text();
        console.log('Public health response body:', text.substring(0, 500) + '... (truncated)');
      } catch (e) {
        console.log('Could not read response body:', e.message);
      }
    }
    
    return response.ok;
  } catch (error) {
    console.error('Public health request failed:', error);
    return false;
  }
}

async function runTests() {
  console.log('🧪 Starting API tests...');
  console.log(`🔗 Testing API at: ${API_URL}`);
  console.log('-------------------------------------------');
  
  // Test root endpoint first
  const rootPassed = await testRootEndpoint();
  console.log('Root endpoint test:', rootPassed ? '✅ PASSED' : '❌ FAILED');
  console.log('-------------------------------------------');
  
  // Test health check to ensure API is accessible
  const healthCheckPassed = await testHealthCheck();
  console.log('Health check test:', healthCheckPassed ? '✅ PASSED' : '❌ FAILED');
  console.log('-------------------------------------------');
  
  // Test auth health endpoint
  const authHealthPassed = await testAuthHealthEndpoint();
  console.log('Auth health endpoint test:', authHealthPassed ? '✅ PASSED' : '❌ FAILED');
  console.log('-------------------------------------------');
  
  // Test diagnostic endpoints
  console.log('\n🔍 RUNNING DIAGNOSTIC TESTS...');
  console.log('-------------------------------------------');
  
  // Test debug environment variables endpoint
  const debugEnvPassed = await testDebugEnvEndpoint();
  console.log('Debug env endpoint test:', debugEnvPassed ? '✅ PASSED' : '❌ FAILED');
  console.log('-------------------------------------------');
  
  // Test debug modules endpoint
  const debugModulesPassed = await testDebugModulesEndpoint();
  console.log('Debug modules endpoint test:', debugModulesPassed ? '✅ PASSED' : '❌ FAILED');
  console.log('-------------------------------------------');
  
  // Test debug middleware endpoint
  const debugMiddlewarePassed = await testDebugMiddlewareEndpoint();
  console.log('Debug middleware endpoint test:', debugMiddlewarePassed ? '✅ PASSED' : '❌ FAILED');
  console.log('-------------------------------------------');
  
  // Test public health endpoint (bypasses all middleware)
  const publicHealthPassed = await testPublicHealthEndpoint();
  console.log('Public health endpoint test:', publicHealthPassed ? '✅ PASSED' : '❌ FAILED');
  console.log('-------------------------------------------');
  
  // Test debug endpoint to verify basic POST functionality
  const debugPostPassed = await testDebugPostRequest();
  console.log('Debug POST test:', debugPostPassed ? '✅ PASSED' : '❌ FAILED');
  console.log('-------------------------------------------');
  
  // Test OPTIONS request for CORS preflight
  const optionsPassed = await testOptionsRequest();
  console.log('OPTIONS test:', optionsPassed ? '✅ PASSED' : '❌ FAILED');
  console.log('-------------------------------------------');
  
  // Test actual POST request
  const postPassed = await testPostRequest();
  console.log('POST test:', postPassed ? '✅ PASSED' : '❌ FAILED');
  console.log('-------------------------------------------');
  
  // Test auth endpoint
  const authPassed = await testAuthEndpoint();
  console.log('Auth endpoint test:', authPassed ? '✅ PASSED' : '❌ FAILED');
  console.log('-------------------------------------------');
  
  console.log('🏁 All tests completed');
}

runTests().catch(console.error);
