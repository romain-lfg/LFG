#!/usr/bin/env node

/**
 * Authentication Testing Script with Real Token
 * 
 * This script tests the authentication system with a real Privy token.
 * It verifies that the token can be properly validated by the Privy SDK
 * and then tests the auth-health endpoint with the token.
 * 
 * Usage:
 * node scripts/test-auth-with-token.js [token]
 * 
 * If no token is provided, it will check for a TEST_TOKEN environment variable.
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fetch from 'node-fetch';
import chalk from 'chalk';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file
dotenv.config({ path: join(__dirname, '..', '.env') });

// Configuration
const API_URL = process.env.API_URL || 'https://lfg-backend-api-staging.vercel.app';

/**
 * Test token verification with Privy SDK
 */
const testLocalTokenVerification = async (token) => {
  const privyAppId = process.env.PRIVY_APP_ID;
  const privyAppSecret = process.env.PRIVY_APP_SECRET;
  const privyPublicKey = process.env.PRIVY_PUBLIC_KEY;
  
  if (!privyAppId || !privyAppSecret || !privyPublicKey) {
    console.log(chalk.red('❌ Missing Privy environment variables'));
    console.log(chalk.yellow('Please set PRIVY_APP_ID, PRIVY_APP_SECRET, and PRIVY_PUBLIC_KEY'));
    return false;
  }
  
  console.log(chalk.blue('🔐 Testing local token verification with Privy SDK...'));
  
  try {
    // Import Privy SDK
    const { PrivyClient } = await import('@privy-io/server-auth');
    
    // Initialize Privy client
    const privyClient = new PrivyClient(privyAppId, privyAppSecret);
    
    // Verify token
    console.log(chalk.blue('🔍 Verifying token...'));
    const verifiedClaims = await privyClient.verifyAuthToken(token, privyPublicKey);
    
    console.log(chalk.green('✅ Token verified successfully!'));
    console.log(chalk.blue('📋 Token claims:'));
    console.log(JSON.stringify(verifiedClaims, null, 2));
    
    return true;
  } catch (error) {
    console.log(chalk.red(`❌ Error verifying token: ${error.message}`));
    if (error.stack) {
      console.log(chalk.gray(error.stack));
    }
    return false;
  }
};

/**
 * Test auth-health endpoint with token
 */
const testAuthHealthEndpoint = async (token) => {
  console.log(chalk.blue('\n🔐 Testing auth-health endpoint with token...'));
  console.log(chalk.blue(`🔗 API URL: ${API_URL}`));
  
  try {
    const response = await fetch(`${API_URL}/api/auth-health`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      console.log(chalk.red(`❌ Error: HTTP status ${response.status}`));
      const text = await response.text();
      console.log(chalk.red('Response text:'), text);
      return false;
    }
    
    const data = await response.json();
    
    console.log(chalk.green('✅ Auth health endpoint response:'));
    console.log(JSON.stringify(data, null, 2));
    
    if (data.authentication?.verified) {
      console.log(chalk.green('✅ Token verification successful!'));
      console.log(chalk.blue(`👤 User ID: ${data.authentication.userId}`));
      return true;
    } else {
      console.log(chalk.red('❌ Token verification failed'));
      console.log(chalk.red(`Message: ${data.authentication?.message}`));
      return false;
    }
  } catch (error) {
    console.log(chalk.red(`❌ Error testing auth-health endpoint: ${error.message}`));
    if (error.stack) {
      console.log(chalk.gray(error.stack));
    }
    return false;
  }
};

/**
 * Main function
 */
const main = async () => {
  console.log(chalk.blue('🔐 Authentication Testing Script'));
  console.log(chalk.blue('================================'));
  
  // Get token from command line args or environment variable
  let token = process.argv[2] || process.env.TEST_TOKEN;
  
  if (!token) {
    console.log(chalk.red('❌ No token provided'));
    console.log(chalk.yellow('Please provide a token as a command line argument or set the TEST_TOKEN environment variable'));
    console.log(chalk.yellow('Usage: node scripts/test-auth-with-token.js [token]'));
    process.exit(1);
  }
  
  // Trim token if it has whitespace
  token = token.trim();
  
  console.log(chalk.blue(`🔑 Using token: ${token.substring(0, 10)}...${token.substring(token.length - 5)}`));
  console.log();
  
  // Test local token verification
  const localVerificationSuccess = await testLocalTokenVerification(token);
  
  // Test auth-health endpoint
  const endpointSuccess = await testAuthHealthEndpoint(token);
  
  // Summary
  console.log(chalk.blue('\n📋 Test Summary:'));
  console.log(chalk.blue('================================'));
  console.log(`Local token verification: ${localVerificationSuccess ? chalk.green('✅ Success') : chalk.red('❌ Failed')}`);
  console.log(`Auth-health endpoint test: ${endpointSuccess ? chalk.green('✅ Success') : chalk.red('❌ Failed')}`);
  
  // Exit with appropriate code
  if (localVerificationSuccess && endpointSuccess) {
    console.log(chalk.green('\n🎉 All tests passed! Authentication system is working correctly.'));
    process.exit(0);
  } else {
    console.log(chalk.red('\n❌ Some tests failed. Please check the logs for details.'));
    process.exit(1);
  }
};

// Run the script
main().catch(error => {
  console.error(chalk.red(`❌ Unhandled error: ${error.message}`));
  console.error(error.stack);
  process.exit(1);
});
