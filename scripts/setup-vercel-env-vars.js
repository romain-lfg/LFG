#!/usr/bin/env node

/**
 * This script helps set up environment variables in Vercel
 * It requires the Vercel CLI to be installed and authenticated
 * 
 * Usage:
 *   node setup-vercel-env-vars.js frontend
 *   node setup-vercel-env-vars.js backend
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Project names in Vercel
const PROJECTS = {
  frontend: 'lfg-frontend-staging',
  backend: 'lfg-backend-api-staging'
};

// Function to prompt for input
const prompt = (question) => new Promise((resolve) => {
  rl.question(question, (answer) => resolve(answer));
});

// Function to set environment variables in Vercel
const setVercelEnvVar = (project, key, value) => {
  try {
    console.log(`Setting ${key} for ${project}...`);
    execSync(`vercel env add ${key} ${project}`, {
      input: Buffer.from(value + '\n'),
      stdio: ['pipe', 'inherit', 'inherit']
    });
    return true;
  } catch (error) {
    console.error(`Error setting ${key}: ${error.message}`);
    return false;
  }
};

// Main function
async function main() {
  const projectType = process.argv[2];
  
  if (!projectType || !PROJECTS[projectType]) {
    console.error('Please specify a valid project type: frontend or backend');
    process.exit(1);
  }
  
  const projectName = PROJECTS[projectType];
  console.log(`Setting up environment variables for ${projectName}`);
  
  // Define the environment variables to set based on project type
  let envVars = [];
  
  if (projectType === 'frontend') {
    envVars = [
      'NEXT_PUBLIC_PRIVY_APP_ID',
      'NEXT_PUBLIC_NILLION_SECRET_KEY',
      'NEXT_PUBLIC_NILLION_ORG_DID'
    ];
  } else if (projectType === 'backend') {
    envVars = [
      'PRIVY_APP_ID',
      'PRIVY_APP_SECRET',
      'PRIVY_PUBLIC_KEY',
      'SUPABASE_SERVICE_ROLE_KEY',
      'NILLION_API_KEY',
      'JWT_SECRET'
    ];
  }
  
  // Prompt for each environment variable
  for (const envVar of envVars) {
    const value = await prompt(`Enter value for ${envVar}: `);
    if (value) {
      const success = setVercelEnvVar(projectName, envVar, value);
      if (!success) {
        console.log(`Failed to set ${envVar}. You may need to set it manually.`);
      }
    } else {
      console.log(`Skipping ${envVar}`);
    }
  }
  
  console.log(`\nEnvironment variables setup completed for ${projectName}`);
  console.log('Remember to redeploy your project for the changes to take effect:');
  console.log(`vercel --prod --cwd ${projectType}`);
  
  rl.close();
}

main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
