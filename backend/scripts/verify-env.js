#!/usr/bin/env node

/**
 * Environment Variable Verification Script
 * 
 * This script checks if all required environment variables are set
 * and provides guidance on how to set them if they are missing.
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

// Define required environment variables by category
const requiredEnvVars = {
  server: [
    { name: 'NODE_ENV', description: 'Node environment (development, production, test)' },
    { name: 'PORT', description: 'Port for the server to listen on', defaultValue: '3001' },
    { name: 'FRONTEND_URL', description: 'URL of the frontend application for CORS' },
  ],
  privy: [
    { name: 'PRIVY_APP_ID', description: 'Privy application ID from your Privy console' },
    { name: 'PRIVY_APP_SECRET', description: 'Privy application secret from your Privy console' },
    { name: 'PRIVY_PUBLIC_KEY', description: 'Privy public key for token verification' },
  ],
  supabase: [
    { name: 'SUPABASE_URL', description: 'Supabase project URL' },
    { name: 'SUPABASE_SERVICE_ROLE_KEY', description: 'Supabase service role key for database access' },
  ],
};

// Check if environment variables are set
const checkEnvVars = () => {
  let missingVars = [];
  let warnings = [];
  
  // Check each category
  Object.entries(requiredEnvVars).forEach(([category, vars]) => {
    console.log(chalk.bold(`\nChecking ${category.toUpperCase()} environment variables:`));
    
    vars.forEach(({ name, description, defaultValue }) => {
      const value = process.env[name];
      
      if (!value) {
        if (defaultValue) {
          console.log(chalk.yellow(`⚠️  ${name}: Not set (will use default: ${defaultValue})`));
          warnings.push({ name, description, defaultValue });
        } else {
          console.log(chalk.red(`❌ ${name}: Not set`));
          missingVars.push({ name, description });
        }
      } else {
        // Mask sensitive values
        const isSensitive = name.includes('SECRET') || name.includes('KEY');
        const displayValue = isSensitive 
          ? `${value.substring(0, 4)}...${value.substring(value.length - 4)}`
          : value;
        
        console.log(chalk.green(`✅ ${name}: ${displayValue}`));
      }
    });
  });
  
  return { missingVars, warnings };
};

// Generate .env template
const generateEnvTemplate = () => {
  let template = '# Environment Variables\n';
  template += '# Generated on ' + new Date().toISOString() + '\n\n';
  
  Object.entries(requiredEnvVars).forEach(([category, vars]) => {
    template += `# ${category.charAt(0).toUpperCase() + category.slice(1)} Configuration\n`;
    
    vars.forEach(({ name, description, defaultValue }) => {
      template += `# ${description}\n`;
      template += `${name}=${defaultValue || ''}\n`;
    });
    
    template += '\n';
  });
  
  return template;
};

// Main function
const main = () => {
  console.log(chalk.bold('🔍 Verifying environment variables...'));
  
  const { missingVars, warnings } = checkEnvVars();
  
  if (missingVars.length === 0 && warnings.length === 0) {
    console.log(chalk.bold.green('\n✅ All environment variables are set correctly!'));
  } else {
    console.log(chalk.bold.yellow('\n⚠️ Some environment variables need attention:'));
    
    if (missingVars.length > 0) {
      console.log(chalk.bold.red('\nMissing environment variables:'));
      missingVars.forEach(({ name, description }) => {
        console.log(chalk.red(`  - ${name}: ${description}`));
      });
    }
    
    if (warnings.length > 0) {
      console.log(chalk.bold.yellow('\nWarnings:'));
      warnings.forEach(({ name, description, defaultValue }) => {
        console.log(chalk.yellow(`  - ${name}: ${description} (using default: ${defaultValue})`));
      });
    }
    
    // Generate .env.template file
    const template = generateEnvTemplate();
    const templatePath = join(__dirname, '..', '.env.template');
    
    fs.writeFileSync(templatePath, template);
    
    console.log(chalk.bold('\n📝 Next steps:'));
    console.log(`1. An .env.template file has been generated at ${templatePath}`);
    console.log('2. Copy this file to .env and fill in the missing values');
    console.log('3. Run this script again to verify your environment variables');
    
    process.exit(1);
  }
};

// Run the script
main();
