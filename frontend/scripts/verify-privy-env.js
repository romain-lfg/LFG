#!/usr/bin/env node

/**
 * Privy Environment Variables Verification Script
 * 
 * This script verifies that all required Privy environment variables are set
 * and properly formatted before running the application.
 * 
 * Usage:
 * 1. Run this script with: node scripts/verify-privy-env.js
 * 2. The script will check for the presence and format of all required variables
 * 3. If any issues are found, it will display helpful error messages
 */

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

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
};

// Required environment variables for Privy
const requiredVars = [
  {
    name: 'NEXT_PUBLIC_PRIVY_APP_ID',
    description: 'The Privy application ID',
    format: /^[a-zA-Z0-9-]+$/,
    formatDescription: 'alphanumeric characters and hyphens',
    example: 'clq1234abcd',
  },
  {
    name: 'PRIVY_APP_SECRET',
    description: 'The Privy application secret',
    format: /^[a-zA-Z0-9-_]+$/,
    formatDescription: 'alphanumeric characters, hyphens, and underscores',
    example: 'sk_privy_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  },
  {
    name: 'PRIVY_PUBLIC_KEY',
    description: 'The Privy public verification key',
    format: /^-----BEGIN PUBLIC KEY-----[\s\S]+-----END PUBLIC KEY-----$/,
    formatDescription: 'PEM-encoded public key',
    example: '-----BEGIN PUBLIC KEY-----\nMIIB...\n-----END PUBLIC KEY-----',
  },
];

// Optional environment variables
const optionalVars = [
  {
    name: 'NEXT_PUBLIC_PRIVY_AUTH_URL',
    description: 'Custom Privy authentication URL (optional)',
    format: /^https:\/\/[a-zA-Z0-9-_.]+\.[a-zA-Z0-9-_.]+/,
    formatDescription: 'valid HTTPS URL',
    example: 'https://auth.privy.io',
  },
];

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
    log.info('Checking for environment variables in process.env');
  }
  
  // Merge with process.env
  return { ...envVars, ...process.env };
}

// Function to verify environment variables
function verifyEnvVars(envVars) {
  log.step('Verifying required Privy environment variables');
  
  let hasErrors = false;
  let missingVars = [];
  let invalidVars = [];
  
  // Check required variables
  for (const varConfig of requiredVars) {
    const value = envVars[varConfig.name];
    
    if (!value) {
      missingVars.push(varConfig);
      hasErrors = true;
      continue;
    }
    
    if (varConfig.format && !varConfig.format.test(value)) {
      invalidVars.push({
        ...varConfig,
        value,
      });
      hasErrors = true;
    } else {
      log.success(`✓ ${varConfig.name} is properly set`);
    }
  }
  
  // Check optional variables if they are set
  for (const varConfig of optionalVars) {
    const value = envVars[varConfig.name];
    
    if (value) {
      if (varConfig.format && !varConfig.format.test(value)) {
        invalidVars.push({
          ...varConfig,
          value,
        });
        hasErrors = true;
      } else {
        log.success(`✓ ${varConfig.name} is properly set (optional)`);
      }
    } else {
      log.info(`ℹ ${varConfig.name} is not set (optional)`);
    }
  }
  
  // Display errors if any
  if (missingVars.length > 0) {
    log.error('\nMissing required environment variables:');
    for (const varConfig of missingVars) {
      log.error(`  - ${varConfig.name}: ${varConfig.description}`);
      log.error(`    Example: ${varConfig.example}`);
    }
  }
  
  if (invalidVars.length > 0) {
    log.error('\nInvalid environment variables:');
    for (const varConfig of invalidVars) {
      log.error(`  - ${varConfig.name}: Invalid format`);
      log.error(`    Expected format: ${varConfig.formatDescription}`);
      log.error(`    Current value: ${varConfig.value}`);
      log.error(`    Example: ${varConfig.example}`);
    }
  }
  
  return !hasErrors;
}

// Function to provide guidance on fixing issues
function provideGuidance() {
  log.step('How to fix environment variable issues:');
  
  log.info('1. Create or update your .env file in the project root directory');
  log.info('2. Add the missing or fix the invalid environment variables');
  log.info('3. Make sure the values match the expected formats');
  log.info('4. Run this script again to verify the changes');
  
  log.info('\nYou can find your Privy credentials in the Privy dashboard:');
  log.info('https://console.privy.io/');
  
  log.info('\nExample .env file:');
  log.info('```');
  log.info('NEXT_PUBLIC_PRIVY_APP_ID=clq1234abcd');
  log.info('PRIVY_APP_SECRET=sk_privy_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
  log.info('PRIVY_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\\nMIIB...\\n-----END PUBLIC KEY-----"');
  log.info('```');
  
  log.info('\nNote: Make sure to add your .env file to .gitignore to keep your credentials secure.');
}

// Main function
function main() {
  log.info('Starting Privy environment variables verification');
  
  const envVars = loadEnvVars();
  const isValid = verifyEnvVars(envVars);
  
  if (isValid) {
    log.success('\nAll required Privy environment variables are properly set!');
    log.info('You can now run the application with Privy authentication enabled.');
    process.exit(0);
  } else {
    log.error('\nSome Privy environment variables are missing or invalid.');
    provideGuidance();
    process.exit(1);
  }
}

// Run the main function
main();
