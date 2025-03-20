#!/usr/bin/env node

/**
 * Authentication System Monitoring Script
 * 
 * This script monitors the health of the authentication system by:
 * 1. Checking backend health
 * 2. Verifying Privy integration
 * 3. Testing token verification
 * 4. Checking user synchronization
 * 
 * Usage:
 * 1. Make sure the backend server is running
 * 2. Run this script with: node scripts/monitor-auth.js
 * 3. Optionally pass --verbose for detailed output
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Parse command line arguments
const args = process.argv.slice(2);
const verbose = args.includes('--verbose');
const interval = args.includes('--interval') 
  ? parseInt(args[args.indexOf('--interval') + 1], 10) || 60 
  : 60; // Default to 60 seconds

// Configuration
const API_URL = process.env.API_URL || 'http://localhost:3001';
const TEST_EMAIL = 'monitor@example.com';
const TEST_WALLET = '0xMonitorWalletAddress';

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
  verbose: (msg) => verbose && console.log(`${colors.yellow}[VERBOSE]${colors.reset} ${msg}`),
};

// Function to load environment variables
function loadEnvVars() {
  // Try to load from .env file
  const envPath = path.resolve(process.cwd(), '.env');
  let envVars = {};
  
  if (fs.existsSync(envPath)) {
    log.verbose(`Loading environment variables from ${envPath}`);
    envVars = dotenv.parse(fs.readFileSync(envPath));
  }
  
  // Merge with process.env
  return { ...envVars, ...process.env };
}

// Function to check backend health
async function checkBackendHealth() {
  log.step('Checking backend health');
  
  try {
    const response = await axios.get(`${API_URL}/api/health`, { timeout: 5000 });
    
    if (response.status === 200 && response.data.status === 'ok') {
      log.success('Backend is healthy');
      log.verbose(`Response: ${JSON.stringify(response.data)}`);
      return true;
    } else {
      log.error('Backend health check failed');
      log.error(`Status: ${response.status}, Data: ${JSON.stringify(response.data)}`);
      return false;
    }
  } catch (error) {
    log.error('Backend health check failed');
    log.error(`Error: ${error.message}`);
    
    if (error.response) {
      log.verbose(`Status: ${error.response.status}`);
      log.verbose(`Data: ${JSON.stringify(error.response.data)}`);
    }
    
    return false;
  }
}

// Function to verify Privy integration
async function verifyPrivyIntegration() {
  log.step('Verifying Privy integration');
  
  try {
    const response = await axios.get(`${API_URL}/api/auth/privy-status`, { timeout: 5000 });
    
    if (response.status === 200 && response.data.status === 'ok') {
      log.success('Privy integration is working');
      log.verbose(`Response: ${JSON.stringify(response.data)}`);
      return true;
    } else {
      log.error('Privy integration check failed');
      log.error(`Status: ${response.status}, Data: ${JSON.stringify(response.data)}`);
      return false;
    }
  } catch (error) {
    log.error('Privy integration check failed');
    log.error(`Error: ${error.message}`);
    
    if (error.response) {
      log.verbose(`Status: ${error.response.status}`);
      log.verbose(`Data: ${JSON.stringify(error.response.data)}`);
    }
    
    return false;
  }
}

// Function to test token verification
async function testTokenVerification() {
  log.step('Testing token verification');
  
  try {
    // Get a test token
    const tokenResponse = await axios.post(
      `${API_URL}/api/auth/test-token`,
      {
        email: TEST_EMAIL,
        walletAddress: TEST_WALLET,
      },
      { timeout: 5000 }
    );
    
    if (!tokenResponse.data.token) {
      log.error('Failed to get test token');
      log.error(`Response: ${JSON.stringify(tokenResponse.data)}`);
      return false;
    }
    
    const token = tokenResponse.data.token;
    log.verbose(`Test token: ${token.substring(0, 20)}...`);
    
    // Verify the token
    const verifyResponse = await axios.get(
      `${API_URL}/api/auth/verify`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        timeout: 5000,
      }
    );
    
    if (verifyResponse.status === 200 && verifyResponse.data.user) {
      log.success('Token verification is working');
      log.verbose(`User ID: ${verifyResponse.data.user.id}`);
      return true;
    } else {
      log.error('Token verification failed');
      log.error(`Status: ${verifyResponse.status}, Data: ${JSON.stringify(verifyResponse.data)}`);
      return false;
    }
  } catch (error) {
    log.error('Token verification test failed');
    log.error(`Error: ${error.message}`);
    
    if (error.response) {
      log.verbose(`Status: ${error.response.status}`);
      log.verbose(`Data: ${JSON.stringify(error.response.data)}`);
    }
    
    return false;
  }
}

// Function to check user synchronization
async function checkUserSync() {
  log.step('Checking user synchronization');
  
  try {
    // Get a test token
    const tokenResponse = await axios.post(
      `${API_URL}/api/auth/test-token`,
      {
        email: TEST_EMAIL,
        walletAddress: TEST_WALLET,
      },
      { timeout: 5000 }
    );
    
    if (!tokenResponse.data.token) {
      log.error('Failed to get test token for user sync check');
      return false;
    }
    
    const token = tokenResponse.data.token;
    
    // Sync user data
    const syncResponse = await axios.post(
      `${API_URL}/api/users/sync`,
      {
        walletAddress: TEST_WALLET,
        email: TEST_EMAIL,
        metadata: {
          name: 'Monitor User',
          bio: 'This is a test user for monitoring the authentication system',
        },
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        timeout: 5000,
      }
    );
    
    if (syncResponse.status === 200 && syncResponse.data.user) {
      log.success('User synchronization is working');
      log.verbose(`User: ${JSON.stringify(syncResponse.data.user)}`);
      return true;
    } else {
      log.error('User synchronization failed');
      log.error(`Status: ${syncResponse.status}, Data: ${JSON.stringify(syncResponse.data)}`);
      return false;
    }
  } catch (error) {
    log.error('User synchronization check failed');
    log.error(`Error: ${error.message}`);
    
    if (error.response) {
      log.verbose(`Status: ${error.response.status}`);
      log.verbose(`Data: ${JSON.stringify(error.response.data)}`);
    }
    
    return false;
  }
}

// Function to run all checks
async function runChecks() {
  const timestamp = new Date().toISOString();
  log.info(`\n=== Authentication System Health Check: ${timestamp} ===`);
  
  let results = {
    backendHealth: false,
    privyIntegration: false,
    tokenVerification: false,
    userSync: false,
  };
  
  // Run checks
  results.backendHealth = await checkBackendHealth();
  
  if (results.backendHealth) {
    results.privyIntegration = await verifyPrivyIntegration();
    results.tokenVerification = await testTokenVerification();
    results.userSync = await checkUserSync();
  } else {
    log.warning('Skipping remaining checks because backend is not healthy');
  }
  
  // Calculate overall health
  const totalChecks = Object.keys(results).length;
  const passedChecks = Object.values(results).filter(Boolean).length;
  const healthPercentage = Math.round((passedChecks / totalChecks) * 100);
  
  // Display results
  log.info('\n=== Health Check Results ===');
  log.info(`Backend Health: ${results.backendHealth ? '✅' : '❌'}`);
  log.info(`Privy Integration: ${results.privyIntegration ? '✅' : '❌'}`);
  log.info(`Token Verification: ${results.tokenVerification ? '✅' : '❌'}`);
  log.info(`User Synchronization: ${results.userSync ? '✅' : '❌'}`);
  log.info(`\nOverall Health: ${healthPercentage}% (${passedChecks}/${totalChecks} checks passed)`);
  
  // Return results
  return {
    timestamp,
    results,
    healthPercentage,
  };
}

// Function to log results to file
function logResultsToFile(results) {
  const logDir = path.resolve(process.cwd(), 'logs');
  const logFile = path.resolve(logDir, 'auth-monitor.log');
  
  // Create logs directory if it doesn't exist
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  
  // Format log entry
  const logEntry = `[${results.timestamp}] Health: ${results.healthPercentage}%, ` +
    `Backend: ${results.results.backendHealth ? 'OK' : 'FAIL'}, ` +
    `Privy: ${results.results.privyIntegration ? 'OK' : 'FAIL'}, ` +
    `Token: ${results.results.tokenVerification ? 'OK' : 'FAIL'}, ` +
    `Sync: ${results.results.userSync ? 'OK' : 'FAIL'}\n`;
  
  // Append to log file
  fs.appendFileSync(logFile, logEntry);
  log.verbose(`Results logged to ${logFile}`);
}

// Main function for single run
async function main() {
  try {
    // Load environment variables
    loadEnvVars();
    
    // Run checks
    const results = await runChecks();
    
    // Log results to file
    logResultsToFile(results);
    
    // Exit with appropriate code
    const allPassed = Object.values(results.results).every(Boolean);
    process.exit(allPassed ? 0 : 1);
  } catch (error) {
    log.error(`Unexpected error: ${error.message}`);
    process.exit(1);
  }
}

// Function to run checks at regular intervals
async function runMonitor() {
  log.info(`Starting authentication system monitor (interval: ${interval} seconds)`);
  
  // Run immediately
  try {
    const results = await runChecks();
    logResultsToFile(results);
  } catch (error) {
    log.error(`Error in monitor: ${error.message}`);
  }
  
  // Then run at intervals
  setInterval(async () => {
    try {
      const results = await runChecks();
      logResultsToFile(results);
    } catch (error) {
      log.error(`Error in monitor: ${error.message}`);
    }
  }, interval * 1000);
}

// Check if script is run with --monitor flag
if (args.includes('--monitor')) {
  runMonitor();
} else {
  main();
}
