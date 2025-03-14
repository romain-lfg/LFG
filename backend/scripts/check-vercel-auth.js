#!/usr/bin/env node

/**
 * Check Vercel Team Authentication Script
 * 
 * This script checks if a Vercel deployment has team authentication enabled
 * by analyzing the response headers and content.
 */

import fetch from 'node-fetch';
import chalk from 'chalk';

// Configuration
const API_URL = process.env.API_URL || 'https://lfg-backend-api-staging.vercel.app';

async function checkVercelTeamAuth() {
  console.log(chalk.blue(`🔍 Checking if ${API_URL} has Vercel team authentication enabled...`));
  
  try {
    const response = await fetch(API_URL, {
      method: 'GET',
      headers: {
        'User-Agent': 'Vercel-Auth-Check',
        'Origin': 'https://lfg-frontend-staging.vercel.app'
      }
    });
    
    console.log(chalk.yellow('Response Status:'), response.status);
    
    // Get the response body
    const body = await response.text();
    
    // Check for Vercel SSO API references
    const hasVercelSsoApi = body.includes('vercel.com/sso-api');
    const hasVercelUserMeta = body.includes('vercel-user-meta');
    const hasAuthRequired = body.includes('Authentication Required');
    
    console.log(chalk.yellow('Contains Vercel SSO API reference:'), hasVercelSsoApi ? 'Yes' : 'No');
    console.log(chalk.yellow('Contains Vercel User Meta reference:'), hasVercelUserMeta ? 'Yes' : 'No');
    console.log(chalk.yellow('Contains "Authentication Required":'), hasAuthRequired ? 'Yes' : 'No');
    
    if (hasVercelSsoApi || hasVercelUserMeta || hasAuthRequired) {
      console.log(chalk.red('✘ Vercel team authentication appears to be ENABLED'));
      console.log(chalk.red('  This will prevent any API access regardless of your application code'));
      console.log(chalk.yellow('  Solution: Disable team authentication in the Vercel project settings'));
      
      // Extract the SSO URL if present
      const ssoUrlMatch = body.match(/https:\/\/vercel\.com\/sso-api\?url=[^"]+/);
      if (ssoUrlMatch) {
        console.log(chalk.yellow('  SSO URL:'), ssoUrlMatch[0]);
      }
    } else {
      console.log(chalk.green('✓ Vercel team authentication appears to be DISABLED'));
    }
    
  } catch (error) {
    console.error(chalk.red('Error checking Vercel authentication:'), error);
  }
}

// Run the check
checkVercelTeamAuth().catch(console.error);
