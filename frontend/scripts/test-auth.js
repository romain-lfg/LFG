#!/usr/bin/env node

/**
 * Authentication Integration Test Script
 * 
 * This script tests the authentication flow between the frontend and backend.
 * It verifies that the Privy authentication is correctly integrated with our backend.
 * 
 * Usage:
 * 1. Make sure the backend server is running
 * 2. Run this script with: node scripts/test-auth.js
 */

const axios = require('axios');
const readline = require('readline');

// Configuration
const API_URL = process.env.API_URL || 'http://localhost:3001';
const TEST_EMAIL = 'test@example.com';
const TEST_WALLET = '0xTestWalletAddress';

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

// Helper functions
const log = {
  info: (msg) => console.log(`${colors.blue}[INFO]${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}[SUCCESS]${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}[ERROR]${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}[WARNING]${colors.reset} ${msg}`),
  step: (msg) => console.log(`\n${colors.cyan}[STEP]${colors.reset} ${msg}`),
  result: (msg) => console.log(`${colors.magenta}[RESULT]${colors.reset} ${msg}`),
};

// Ask for user input
const askForInput = (question) => {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
};

// Main test function
async function runAuthTest() {
  log.info(`Starting authentication integration test against ${API_URL}`);
  log.info('This test will verify the authentication flow between frontend and backend');
  
  try {
    // Step 1: Check if backend is reachable
    log.step('1. Checking backend health');
    try {
      const healthResponse = await axios.get(`${API_URL}/api/health`);
      if (healthResponse.status === 200 && healthResponse.data.status === 'ok') {
        log.success('Backend is healthy and responding');
      } else {
        throw new Error('Backend health check failed');
      }
    } catch (error) {
      log.error('Backend health check failed. Is the backend server running?');
      log.error(`Error: ${error.message}`);
      process.exit(1);
    }
    
    // Step 2: Get a test token
    log.step('2. Getting a test authentication token');
    log.info('In a real scenario, this token would come from Privy after user authentication');
    
    // In a real scenario, this would be a token from Privy
    // For testing, we'll use a special endpoint that generates a test token
    let token;
    try {
      const tokenResponse = await axios.post(`${API_URL}/api/auth/test-token`, {
        email: TEST_EMAIL,
        walletAddress: TEST_WALLET,
      });
      
      token = tokenResponse.data.token;
      log.success('Received test authentication token');
      log.result(`Token: ${token.substring(0, 20)}...`);
    } catch (error) {
      log.error('Failed to get test token');
      log.error(`Error: ${error.message}`);
      
      if (error.response) {
        log.error(`Status: ${error.response.status}`);
        log.error(`Data: ${JSON.stringify(error.response.data)}`);
      }
      
      process.exit(1);
    }
    
    // Step 3: Verify the token with the backend
    log.step('3. Verifying token with backend');
    try {
      const verifyResponse = await axios.get(`${API_URL}/api/auth/verify`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      log.success('Token verification successful');
      log.result(`User ID: ${verifyResponse.data.user.id}`);
    } catch (error) {
      log.error('Token verification failed');
      log.error(`Error: ${error.message}`);
      
      if (error.response) {
        log.error(`Status: ${error.response.status}`);
        log.error(`Data: ${JSON.stringify(error.response.data)}`);
      }
      
      process.exit(1);
    }
    
    // Step 4: Sync user data with backend
    log.step('4. Syncing user data with backend');
    try {
      const syncResponse = await axios.post(
        `${API_URL}/api/users/sync`,
        {
          walletAddress: TEST_WALLET,
          email: TEST_EMAIL,
          metadata: {
            name: 'Test User',
            bio: 'This is a test user for authentication flow testing',
          },
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      
      log.success('User data sync successful');
      log.result(`User: ${JSON.stringify(syncResponse.data.user, null, 2)}`);
    } catch (error) {
      log.error('User data sync failed');
      log.error(`Error: ${error.message}`);
      
      if (error.response) {
        log.error(`Status: ${error.response.status}`);
        log.error(`Data: ${JSON.stringify(error.response.data)}`);
      }
      
      process.exit(1);
    }
    
    // Step 5: Get user profile
    log.step('5. Getting user profile');
    try {
      const profileResponse = await axios.get(`${API_URL}/api/users/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      log.success('User profile retrieval successful');
      log.result(`Profile: ${JSON.stringify(profileResponse.data.user, null, 2)}`);
    } catch (error) {
      log.error('User profile retrieval failed');
      log.error(`Error: ${error.message}`);
      
      if (error.response) {
        log.error(`Status: ${error.response.status}`);
        log.error(`Data: ${JSON.stringify(error.response.data)}`);
      }
      
      process.exit(1);
    }
    
    // Step 6: Test access to protected route
    log.step('6. Testing access to protected route');
    try {
      const protectedResponse = await axios.get(`${API_URL}/api/protected`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      log.success('Access to protected route successful');
      log.result(`Response: ${JSON.stringify(protectedResponse.data, null, 2)}`);
    } catch (error) {
      log.error('Access to protected route failed');
      log.error(`Error: ${error.message}`);
      
      if (error.response) {
        log.error(`Status: ${error.response.status}`);
        log.error(`Data: ${JSON.stringify(error.response.data)}`);
      }
      
      process.exit(1);
    }
    
    // Step 7: Test access without token (should fail)
    log.step('7. Testing access without token (should fail)');
    try {
      await axios.get(`${API_URL}/api/protected`);
      
      log.error('Access without token succeeded, but should have failed');
      process.exit(1);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        log.success('Access without token correctly denied');
        log.result(`Status: ${error.response.status}`);
      } else {
        log.error('Unexpected error when testing access without token');
        log.error(`Error: ${error.message}`);
        
        if (error.response) {
          log.error(`Status: ${error.response.status}`);
          log.error(`Data: ${JSON.stringify(error.response.data)}`);
        }
        
        process.exit(1);
      }
    }
    
    // Final result
    log.info('\n========================================');
    log.success('All authentication tests passed successfully!');
    log.info('The authentication flow between frontend and backend is working correctly.');
    log.info('========================================\n');
    
  } catch (error) {
    log.error('An unexpected error occurred during the test');
    log.error(`Error: ${error.message}`);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Run the test
runAuthTest();
