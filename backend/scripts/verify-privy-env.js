#!/usr/bin/env node

/**
 * Privy Environment Variable Verification Script
 * 
 * This script checks if all required Privy environment variables are set
 * and provides guidance on how to set them if they are missing.
 * 
 * Usage:
 * node scripts/verify-privy-env.js
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import chalk from 'chalk';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file
dotenv.config({ path: join(__dirname, '..', '.env') });

// Define required Privy environment variables
const requiredPrivyVars = [
  {
    name: 'PRIVY_APP_ID',
    description: 'Your Privy application ID',
    example: 'clwxyz123456',
  },
  {
    name: 'PRIVY_APP_SECRET',
    description: 'Your Privy application secret',
    example: 'sk_privy_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  },
  {
    name: 'PRIVY_PUBLIC_KEY',
    description: 'Your Privy public verification key',
    example: '-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...\n-----END PUBLIC KEY-----',
  },
];

// Define required Supabase environment variables
const requiredSupabaseVars = [
  {
    name: 'SUPABASE_URL',
    description: 'Your Supabase project URL',
    example: 'https://abcdefghijklmnopqrst.supabase.co',
  },
  {
    name: 'SUPABASE_SERVICE_ROLE_KEY',
    description: 'Your Supabase service role key',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  },
];

// Define other required environment variables
const requiredOtherVars = [
  {
    name: 'NODE_ENV',
    description: 'Node environment (development, production, test)',
    example: 'development',
  },
  {
    name: 'PORT',
    description: 'Port for the server to listen on',
    example: '3001',
  },
  {
    name: 'FRONTEND_URL',
    description: 'URL of the frontend application for CORS',
    example: 'http://localhost:3000',
  },
];

// All required environment variables
const allRequiredVars = [
  ...requiredPrivyVars,
  ...requiredSupabaseVars,
  ...requiredOtherVars,
];

// Check if environment variables are set
const checkEnvVars = () => {
  console.log(chalk.blue('🔍 Checking Privy environment variables...'));
  console.log();
  
  let missingVars = [];
  
  // Check Privy variables
  console.log(chalk.blue('Privy Configuration:'));
  requiredPrivyVars.forEach(variable => {
    const value = process.env[variable.name];
    if (!value) {
      console.log(chalk.red(`❌ ${variable.name}: Not set`));
      missingVars.push(variable);
    } else {
      // For sensitive values, only show the first few characters
      const displayValue = variable.name.includes('SECRET') || variable.name.includes('KEY')
        ? `${value.substring(0, 8)}...`
        : value;
      console.log(chalk.green(`✅ ${variable.name}: ${displayValue}`));
    }
  });
  
  console.log();
  
  // Check Supabase variables
  console.log(chalk.blue('Supabase Configuration:'));
  requiredSupabaseVars.forEach(variable => {
    const value = process.env[variable.name];
    if (!value) {
      console.log(chalk.red(`❌ ${variable.name}: Not set`));
      missingVars.push(variable);
    } else {
      // For sensitive values, only show the first few characters
      const displayValue = variable.name.includes('KEY')
        ? `${value.substring(0, 8)}...`
        : value;
      console.log(chalk.green(`✅ ${variable.name}: ${displayValue}`));
    }
  });
  
  console.log();
  
  // Check other variables
  console.log(chalk.blue('Other Configuration:'));
  requiredOtherVars.forEach(variable => {
    const value = process.env[variable.name];
    if (!value) {
      console.log(chalk.red(`❌ ${variable.name}: Not set`));
      missingVars.push(variable);
    } else {
      console.log(chalk.green(`✅ ${variable.name}: ${value}`));
    }
  });
  
  console.log();
  
  return missingVars;
};

// Generate .env template
const generateEnvTemplate = (missingVars) => {
  if (missingVars.length === 0) {
    return;
  }
  
  console.log(chalk.blue('📝 Generating .env template for missing variables...'));
  console.log();
  
  let template = '';
  
  missingVars.forEach(variable => {
    template += `# ${variable.description}\n${variable.name}=${variable.example}\n\n`;
  });
  
  // Write template to .env.template file
  const templatePath = join(__dirname, '..', '.env.template');
  fs.writeFileSync(templatePath, template);
  
  console.log(chalk.green(`✅ Template written to ${templatePath}`));
  console.log(chalk.yellow(`⚠️  Please fill in the missing values and copy them to your .env file`));
  console.log();
};

// Test Privy token verification
const testPrivyTokenVerification = async () => {
  const privyAppId = process.env.PRIVY_APP_ID;
  const privyAppSecret = process.env.PRIVY_APP_SECRET;
  const privyPublicKey = process.env.PRIVY_PUBLIC_KEY;
  const testToken = process.env.TEST_TOKEN;
  
  if (!privyAppId || !privyAppSecret || !privyPublicKey) {
    console.log(chalk.yellow('⚠️  Skipping Privy token verification test due to missing environment variables'));
    return;
  }
  
  console.log(chalk.blue('🔐 Testing Privy token verification...'));
  console.log();
  
  try {
    // Import Privy SDK dynamically to avoid errors if it's not installed
    const { PrivyClient } = await import('@privy-io/server-auth');
    
    // Initialize Privy client
    const privyClient = new PrivyClient(privyAppId, privyAppSecret);
    
    console.log(chalk.green('✅ Successfully initialized Privy client'));
    
    // If a test token is available, try to verify it
    if (testToken) {
      console.log(chalk.blue('🔑 Test token found. Attempting to verify...'));
      try {
        const verifiedClaims = await privyClient.verifyAuthToken(testToken, privyPublicKey);
        console.log(chalk.green('✅ Token verification successful!'));
        console.log(chalk.blue('📋 Token claims:'));
        console.log(JSON.stringify(verifiedClaims, null, 2));
      } catch (tokenError) {
        console.log(chalk.red(`❌ Token verification failed: ${tokenError.message}`));
        console.log(chalk.yellow('⚠️  Your token may be expired or invalid'));
      }
    } else {
      console.log(chalk.yellow('⚠️  No test token found in environment variables'));
      console.log(chalk.yellow('⚠️  To fully verify your Privy credentials, set the TEST_TOKEN environment variable'));
      console.log(chalk.yellow('⚠️  You can extract a token using the instructions in scripts/extract-token-instructions.md'));
    }
    
    console.log();
  } catch (error) {
    console.log(chalk.red(`❌ Error initializing Privy client: ${error.message}`));
    console.log();
  }
};

// Test Supabase connection
const testSupabaseConnection = async () => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.log(chalk.yellow('⚠️  Skipping Supabase connection test due to missing environment variables'));
    return;
  }
  
  console.log(chalk.blue('🔌 Testing Supabase connection...'));
  console.log();
  
  try {
    // Import Supabase SDK dynamically to avoid errors if it's not installed
    const { createClient } = await import('@supabase/supabase-js');
    
    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Test connection with a simple query
    const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true });
    
    if (error) {
      throw error;
    }
    
    console.log(chalk.green('✅ Successfully connected to Supabase'));
    console.log();
  } catch (error) {
    console.log(chalk.red(`❌ Error connecting to Supabase: ${error.message}`));
    console.log();
  }
};

// Main function
const main = async () => {
  console.log(chalk.blue('🔒 Privy Environment Variable Verification'));
  console.log(chalk.blue('=========================================='));
  console.log();
  
  // Check environment variables
  const missingVars = checkEnvVars();
  
  // Generate template if there are missing variables
  if (missingVars.length > 0) {
    generateEnvTemplate(missingVars);
    
    console.log(chalk.red(`❌ ${missingVars.length} environment variables are missing`));
    console.log(chalk.yellow(`⚠️  Please set the missing environment variables before proceeding`));
    console.log();
  } else {
    console.log(chalk.green('✅ All required environment variables are set'));
    console.log();
    
    // Test Privy token verification
    await testPrivyTokenVerification();
    
    // Test Supabase connection
    await testSupabaseConnection();
    
    console.log(chalk.green('✅ Environment verification completed successfully'));
  }
};

// Run the script
main().catch(error => {
  console.error(chalk.red(`❌ Unhandled error: ${error.message}`));
  console.error(error.stack);
  process.exit(1);
});
