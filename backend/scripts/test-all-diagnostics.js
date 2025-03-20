import fetch from 'node-fetch';

// Configuration
const API_URL = process.env.API_URL || 'https://lfg-backend-api-staging.vercel.app';

async function testEndpoint(endpoint) {
  console.log(`🔍 Testing ${endpoint} endpoint...`);
  
  try {
    const response = await fetch(`${API_URL}/api/${endpoint}`);
    
    if (!response.ok) {
      console.error(`❌ Error: HTTP status ${response.status}`);
      const text = await response.text();
      console.error('Response text:', text);
      return false;
    }
    
    const data = await response.json();
    console.log(`✅ ${endpoint} endpoint response:`, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`❌ Error testing ${endpoint} endpoint:`, error);
    return false;
  }
}

async function runTests() {
  console.log(`🔗 Testing API at: ${API_URL}`);
  console.log('-------------------------------------------');
  
  // Test simple-diagnostic endpoint
  const simpleResult = await testEndpoint('simple-diagnostic');
  console.log('-------------------------------------------');
  
  // Test commonjs-diagnostic endpoint
  const commonjsResult = await testEndpoint('commonjs-diagnostic');
  console.log('-------------------------------------------');
  
  // Test auth-health endpoint
  const authHealthResult = await testEndpoint('auth-health');
  console.log('-------------------------------------------');
  
  // Summary
  console.log('🏁 Diagnostic tests summary:');
  console.log(`simple-diagnostic: ${simpleResult ? '✅ Success' : '❌ Failed'}`);
  console.log(`commonjs-diagnostic: ${commonjsResult ? '✅ Success' : '❌ Failed'}`);
  console.log(`auth-health: ${authHealthResult ? '✅ Success' : '❌ Failed'}`);
  console.log('-------------------------------------------');
}

// Run the tests
runTests();
