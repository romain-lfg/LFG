#!/usr/bin/env node

/**
 * Authentication Debugging Script
 * 
 * This script helps debug authentication issues by:
 * 1. Checking environment variables
 * 2. Testing API endpoints
 * 3. Verifying token handling
 * 4. Providing detailed error information
 * 
 * Usage:
 * 1. Run this script with: node scripts/debug-auth.js
 * 2. Follow the interactive prompts
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const readline = require('readline');

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Helper functions for logging
const log = {
  info: (msg) => console.log(`${colors.blue}[INFO]${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}[SUCCESS]${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}[ERROR]${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}[WARNING]${colors.reset} ${msg}`),
  step: (msg) => console.log(`\n${colors.cyan}[STEP]${colors.reset} ${msg}`),
  result: (msg) => console.log(`${colors.magenta}[RESULT]${colors.reset} ${msg}`),
  divider: () => console.log('\n' + '='.repeat(50) + '\n'),
};

// Ask for user input
const askQuestion = (question) => {
  return new Promise((resolve) => {
    rl.question(`${colors.yellow}[QUESTION]${colors.reset} ${question} `, (answer) => {
      resolve(answer);
    });
  });
};

// Function to load environment variables
function loadEnvVars() {
  // Try to load from .env file
  const envPath = path.resolve(process.cwd(), '.env');
  let envVars = {};
  
  if (fs.existsSync(envPath)) {
    log.info(`Loading environment variables from ${envPath}`);
    envVars = dotenv.parse(fs.readFileSync(envPath));
  } else {
    log.warning(`.env file not found at ${envPath}`);
    log.info('Using environment variables from process.env');
  }
  
  // Merge with process.env
  return { ...envVars, ...process.env };
}

// Function to check environment variables
function checkEnvVars(envVars) {
  log.step('Checking environment variables');
  
  const requiredVars = [
    'NEXT_PUBLIC_PRIVY_APP_ID',
    'PRIVY_APP_SECRET',
    'PRIVY_PUBLIC_KEY',
  ];
  
  const optionalVars = [
    'NEXT_PUBLIC_PRIVY_AUTH_URL',
    'NEXT_PUBLIC_API_URL',
  ];
  
  let missingRequired = [];
  let missingOptional = [];
  
  // Check required variables
  for (const varName of requiredVars) {
    if (!envVars[varName]) {
      missingRequired.push(varName);
    } else {
      log.success(`✓ ${varName} is set`);
    }
  }
  
  // Check optional variables
  for (const varName of optionalVars) {
    if (!envVars[varName]) {
      missingOptional.push(varName);
    } else {
      log.success(`✓ ${varName} is set (optional)`);
    }
  }
  
  // Display results
  if (missingRequired.length > 0) {
    log.error('\nMissing required environment variables:');
    for (const varName of missingRequired) {
      log.error(`  - ${varName}`);
    }
  }
  
  if (missingOptional.length > 0) {
    log.warning('\nMissing optional environment variables:');
    for (const varName of missingOptional) {
      log.warning(`  - ${varName}`);
    }
  }
  
  return missingRequired.length === 0;
}

// Function to test API connection
async function testApiConnection(apiUrl) {
  log.step(`Testing API connection to ${apiUrl}`);
  
  try {
    const response = await axios.get(`${apiUrl}/api/health`, { timeout: 5000 });
    
    if (response.status === 200) {
      log.success('API connection successful');
      log.result(`Response: ${JSON.stringify(response.data)}`);
      return true;
    } else {
      log.error(`API connection failed with status ${response.status}`);
      log.result(`Response: ${JSON.stringify(response.data)}`);
      return false;
    }
  } catch (error) {
    log.error('API connection failed');
    
    if (error.code === 'ECONNREFUSED') {
      log.error(`Could not connect to ${apiUrl}. Is the backend server running?`);
    } else if (error.code === 'ETIMEDOUT') {
      log.error(`Connection to ${apiUrl} timed out. Check your network connection.`);
    } else {
      log.error(`Error: ${error.message}`);
      
      if (error.response) {
        log.error(`Status: ${error.response.status}`);
        log.error(`Data: ${JSON.stringify(error.response.data)}`);
      }
    }
    
    return false;
  }
}

// Function to test Privy integration
async function testPrivyIntegration(apiUrl) {
  log.step('Testing Privy integration');
  
  try {
    const response = await axios.get(`${apiUrl}/api/auth/privy-status`, { timeout: 5000 });
    
    if (response.status === 200 && response.data.status === 'ok') {
      log.success('Privy integration is working');
      log.result(`Response: ${JSON.stringify(response.data)}`);
      return true;
    } else {
      log.error('Privy integration test failed');
      log.result(`Response: ${JSON.stringify(response.data)}`);
      return false;
    }
  } catch (error) {
    log.error('Privy integration test failed');
    log.error(`Error: ${error.message}`);
    
    if (error.response) {
      log.error(`Status: ${error.response.status}`);
      log.error(`Data: ${JSON.stringify(error.response.data)}`);
    }
    
    return false;
  }
}

// Function to test token generation and verification
async function testTokenFlow(apiUrl) {
  log.step('Testing token generation and verification');
  
  const testEmail = 'debug@example.com';
  const testWallet = '0xDebugWalletAddress';
  
  try {
    // Generate test token
    log.info('Generating test token...');
    const tokenResponse = await axios.post(
      `${apiUrl}/api/auth/test-token`,
      {
        email: testEmail,
        walletAddress: testWallet,
      },
      { timeout: 5000 }
    );
    
    if (!tokenResponse.data.token) {
      log.error('Failed to generate test token');
      log.result(`Response: ${JSON.stringify(tokenResponse.data)}`);
      return false;
    }
    
    const token = tokenResponse.data.token;
    log.success('Test token generated successfully');
    log.result(`Token: ${token.substring(0, 20)}...`);
    
    // Verify token
    log.info('Verifying token...');
    const verifyResponse = await axios.get(
      `${apiUrl}/api/auth/verify`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        timeout: 5000,
      }
    );
    
    if (verifyResponse.status === 200 && verifyResponse.data.user) {
      log.success('Token verification successful');
      log.result(`User: ${JSON.stringify(verifyResponse.data.user)}`);
      return true;
    } else {
      log.error('Token verification failed');
      log.result(`Response: ${JSON.stringify(verifyResponse.data)}`);
      return false;
    }
  } catch (error) {
    log.error('Token flow test failed');
    log.error(`Error: ${error.message}`);
    
    if (error.response) {
      log.error(`Status: ${error.response.status}`);
      log.error(`Data: ${JSON.stringify(error.response.data)}`);
    }
    
    return false;
  }
}

// Function to test protected route access
async function testProtectedRoute(apiUrl, token) {
  log.step('Testing protected route access');
  
  try {
    // Test with token
    log.info('Accessing protected route with token...');
    const protectedResponse = await axios.get(
      `${apiUrl}/api/protected`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        timeout: 5000,
      }
    );
    
    if (protectedResponse.status === 200) {
      log.success('Protected route access successful');
      log.result(`Response: ${JSON.stringify(protectedResponse.data)}`);
    } else {
      log.error('Protected route access failed');
      log.result(`Response: ${JSON.stringify(protectedResponse.data)}`);
      return false;
    }
    
    // Test without token
    log.info('Accessing protected route without token (should fail)...');
    try {
      await axios.get(`${apiUrl}/api/protected`, { timeout: 5000 });
      log.error('Protected route access without token succeeded (should have failed)');
      return false;
    } catch (error) {
      if (error.response && error.response.status === 401) {
        log.success('Protected route correctly denied access without token');
        return true;
      } else {
        log.error('Unexpected error when accessing protected route without token');
        log.error(`Error: ${error.message}`);
        return false;
      }
    }
  } catch (error) {
    log.error('Protected route test failed');
    log.error(`Error: ${error.message}`);
    
    if (error.response) {
      log.error(`Status: ${error.response.status}`);
      log.error(`Data: ${JSON.stringify(error.response.data)}`);
    }
    
    return false;
  }
}

// Function to check CORS configuration
async function checkCorsConfiguration(apiUrl) {
  log.step('Checking CORS configuration');
  
  try {
    // Make a preflight OPTIONS request
    const corsResponse = await axios({
      method: 'OPTIONS',
      url: `${apiUrl}/api/health`,
      headers: {
        'Origin': 'http://localhost:3000',
        'Access-Control-Request-Method': 'GET',
      },
      timeout: 5000,
    });
    
    const corsHeaders = corsResponse.headers;
    
    if (
      corsHeaders['access-control-allow-origin'] &&
      corsHeaders['access-control-allow-methods'] &&
      corsHeaders['access-control-allow-headers']
    ) {
      log.success('CORS is properly configured');
      log.result(`CORS Headers: ${JSON.stringify(corsHeaders, null, 2)}`);
      return true;
    } else {
      log.warning('CORS may not be properly configured');
      log.result(`CORS Headers: ${JSON.stringify(corsHeaders, null, 2)}`);
      return false;
    }
  } catch (error) {
    log.error('CORS check failed');
    log.error(`Error: ${error.message}`);
    
    if (error.response) {
      log.error(`Status: ${error.response.status}`);
      log.error(`Headers: ${JSON.stringify(error.response.headers)}`);
    }
    
    return false;
  }
}

// Function to provide debugging guidance
function provideDebuggingGuidance(results) {
  log.divider();
  log.step('Debugging Guidance');
  
  if (!results.envVars) {
    log.error('Environment Variables Issues:');
    log.info('1. Create or update your .env file in the project root');
    log.info('2. Make sure all required variables are set');
    log.info('3. Check the Privy dashboard for correct credentials');
    log.info('4. Run the verify-privy-env.js script for detailed checks');
  }
  
  if (!results.apiConnection) {
    log.error('API Connection Issues:');
    log.info('1. Make sure the backend server is running');
    log.info('2. Check that the API_URL is correct');
    log.info('3. Verify network connectivity');
    log.info('4. Check for firewall or proxy issues');
  }
  
  if (!results.privyIntegration) {
    log.error('Privy Integration Issues:');
    log.info('1. Verify Privy credentials in .env file');
    log.info('2. Check that the backend can connect to Privy servers');
    log.info('3. Look for errors in the backend logs');
    log.info('4. Verify that your Privy account is active');
  }
  
  if (!results.tokenFlow) {
    log.error('Token Handling Issues:');
    log.info('1. Check the format of the Privy public key');
    log.info('2. Verify token verification logic in the backend');
    log.info('3. Look for JWT-related errors in the logs');
    log.info('4. Check for clock synchronization issues');
  }
  
  if (!results.protectedRoute) {
    log.error('Protected Route Issues:');
    log.info('1. Verify authentication middleware configuration');
    log.info('2. Check route definitions in the backend');
    log.info('3. Look for authorization-related errors in the logs');
  }
  
  if (!results.corsConfig) {
    log.error('CORS Configuration Issues:');
    log.info('1. Check CORS middleware configuration in the backend');
    log.info('2. Verify allowed origins, methods, and headers');
    log.info('3. Make sure credentials are properly handled');
  }
  
  log.divider();
  log.info('For more detailed debugging:');
  log.info('1. Check backend logs for specific error messages');
  log.info('2. Use browser developer tools to inspect network requests');
  log.info('3. Try the test-auth.js script for end-to-end testing');
  log.info('4. Consult the Privy documentation for API-specific issues');
}

// Main function
async function main() {
  try {
    // Load environment variables
    const envVars = loadEnvVars();
    
    // Display welcome message
    log.divider();
    log.info('Authentication Debugging Tool');
    log.info('This tool will help diagnose authentication issues');
    log.divider();
    
    // Check environment variables
    const envVarsOk = checkEnvVars(envVars);
    
    // Get API URL
    const apiUrl = envVars.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    log.info(`Using API URL: ${apiUrl}`);
    
    // Ask if user wants to proceed
    const proceed = await askQuestion('Continue with debugging? (y/n)');
    if (proceed.toLowerCase() !== 'y') {
      log.info('Debugging cancelled');
      rl.close();
      return;
    }
    
    // Test API connection
    const apiConnectionOk = await testApiConnection(apiUrl);
    
    // Skip remaining tests if API connection fails
    if (!apiConnectionOk) {
      log.error('Cannot proceed with further tests due to API connection failure');
      
      const results = {
        envVars: envVarsOk,
        apiConnection: apiConnectionOk,
        privyIntegration: false,
        tokenFlow: false,
        protectedRoute: false,
        corsConfig: false,
      };
      
      provideDebuggingGuidance(results);
      rl.close();
      return;
    }
    
    // Test Privy integration
    const privyIntegrationOk = await testPrivyIntegration(apiUrl);
    
    // Test token flow
    const tokenFlowResult = await testTokenFlow(apiUrl);
    
    // Get token for protected route test
    let token = null;
    if (tokenFlowResult) {
      try {
        const tokenResponse = await axios.post(
          `${apiUrl}/api/auth/test-token`,
          {
            email: 'debug@example.com',
            walletAddress: '0xDebugWalletAddress',
          },
          { timeout: 5000 }
        );
        token = tokenResponse.data.token;
      } catch (error) {
        log.error('Failed to get token for protected route test');
      }
    }
    
    // Test protected route
    const protectedRouteOk = token ? await testProtectedRoute(apiUrl, token) : false;
    
    // Check CORS configuration
    const corsConfigOk = await checkCorsConfiguration(apiUrl);
    
    // Collect results
    const results = {
      envVars: envVarsOk,
      apiConnection: apiConnectionOk,
      privyIntegration: privyIntegrationOk,
      tokenFlow: tokenFlowResult,
      protectedRoute: protectedRouteOk,
      corsConfig: corsConfigOk,
    };
    
    // Display summary
    log.divider();
    log.step('Debugging Summary');
    log.info(`Environment Variables: ${results.envVars ? '✅' : '❌'}`);
    log.info(`API Connection: ${results.apiConnection ? '✅' : '❌'}`);
    log.info(`Privy Integration: ${results.privyIntegration ? '✅' : '❌'}`);
    log.info(`Token Handling: ${results.tokenFlow ? '✅' : '❌'}`);
    log.info(`Protected Routes: ${results.protectedRoute ? '✅' : '❌'}`);
    log.info(`CORS Configuration: ${results.corsConfig ? '✅' : '❌'}`);
    
    // Provide guidance based on results
    provideDebuggingGuidance(results);
    
    // Close readline interface
    rl.close();
  } catch (error) {
    log.error(`Unexpected error: ${error.message}`);
    rl.close();
  }
}

// Run the main function
main();
