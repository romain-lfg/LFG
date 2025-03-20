#!/usr/bin/env node

/**
 * Check Vercel Deployment Protection Script
 * 
 * This script checks if a Vercel deployment has password protection enabled
 * by analyzing the response headers and content.
 * 
 * Usage:
 * node scripts/check-vercel-protection.js
 */

import fetch from 'node-fetch';
import chalk from 'chalk';

// Configuration
const API_URL = process.env.API_URL || 'https://lfg-backend-api-staging.vercel.app';

async function checkVercelProtection() {
  console.log(chalk.blue(`🔍 Checking if ${API_URL} has Vercel password protection enabled...`));
  
  try {
    const response = await fetch(API_URL, {
      method: 'GET',
      headers: {
        'User-Agent': 'Vercel-Protection-Check',
        'Origin': 'https://lfg-frontend-staging.vercel.app'
      }
    });
    
    console.log(chalk.yellow('Response Status:'), response.status);
    console.log(chalk.yellow('Response Headers:'));
    
    // Print all headers
    const headers = response.headers.raw();
    Object.keys(headers).forEach(key => {
      console.log(`  ${chalk.cyan(key)}: ${headers[key]}`);
    });
    
    // Check for Vercel-specific headers
    const isVercelProtected = 
      response.headers.has('x-vercel-protection') || 
      response.status === 401;
    
    // Get the response body
    const body = await response.text();
    
    // Look for specific patterns in the body that indicate Vercel password protection
    const hasVercelAuthForm = 
      body.includes('vercel.com/sso-api') || 
      body.includes('Authentication Required') ||
      body.includes('vercel-user-meta');
    
    console.log(chalk.yellow('Response Body Preview:'), body.substring(0, 200) + '...');
    
    if (isVercelProtected || hasVercelAuthForm) {
      console.log(chalk.red('✘ Vercel password protection appears to be ENABLED'));
      console.log(chalk.red('  This will prevent any API access regardless of your application code'));
      console.log(chalk.yellow('  Solution: Disable password protection in the Vercel project settings'));
    } else {
      console.log(chalk.green('✓ Vercel password protection appears to be DISABLED'));
    }
    
  } catch (error) {
    console.error(chalk.red('Error checking Vercel protection:'), error);
  }
}

// Check environment variables
async function checkEnvironmentVariables() {
  console.log(chalk.blue('\n🔍 Checking environment variables in the deployment...'));
  
  try {
    // Try to access an endpoint that would log environment variables
    const response = await fetch(`${API_URL}/api/debug/env`, {
      method: 'GET',
      headers: {
        'User-Agent': 'Env-Check',
        'Origin': 'https://lfg-frontend-staging.vercel.app'
      }
    });
    
    console.log(chalk.yellow('Response Status:'), response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log(chalk.green('Environment variables available:'));
      console.log(data);
    } else {
      console.log(chalk.red('Could not access environment variables endpoint'));
      console.log(chalk.yellow('  You may need to create a debug endpoint to expose environment variable status'));
    }
  } catch (error) {
    console.error(chalk.red('Error checking environment variables:'), error);
  }
}

// Run the checks
async function runChecks() {
  console.log(chalk.blue('🚀 Starting Vercel deployment diagnostics'));
  console.log(chalk.blue('=============================================='));
  
  await checkVercelProtection();
  await checkEnvironmentVariables();
  
  console.log(chalk.blue('=============================================='));
  console.log(chalk.blue('🏁 Diagnostics completed'));
}

runChecks().catch(console.error);
