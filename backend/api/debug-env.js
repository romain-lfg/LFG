// Debug endpoint to check environment variables
// This file should be placed in the /api directory to be accessible via Vercel

import { createHandler } from '../src/utils/api-handler.js';

/**
 * Environment variable debug handler
 * 
 * This endpoint returns a sanitized list of environment variables to help debug deployment issues.
 * It only returns the presence and first few characters of sensitive variables, not their full values.
 */
export default createHandler(async (req, res) => {
  console.log('Debug environment variables endpoint called');
  
  // List of critical environment variables to check
  const criticalVars = [
    'PRIVY_APP_ID',
    'PRIVY_APP_SECRET',
    'PRIVY_PUBLIC_KEY',
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'NODE_ENV',
    'PORT',
    'FRONTEND_URL',
    'JWT_SECRET'
  ];
  
  // Create a sanitized response object
  const envStatus = {};
  
  criticalVars.forEach(varName => {
    const value = process.env[varName];
    
    if (!value) {
      envStatus[varName] = {
        present: false,
        message: 'Missing'
      };
    } else {
      // For sensitive variables, only show the first few characters
      const isSensitive = varName.includes('SECRET') || 
                         varName.includes('KEY') || 
                         varName.includes('PASSWORD');
      
      if (isSensitive) {
        envStatus[varName] = {
          present: true,
          preview: `${value.substring(0, 4)}...${value.substring(value.length - 4)}`,
          length: value.length,
          message: 'Present (sensitive value)'
        };
      } else {
        envStatus[varName] = {
          present: true,
          value: varName.includes('PUBLIC') ? value : `${value.substring(0, 10)}...`,
          length: value.length,
          message: 'Present'
        };
      }
    }
  });
  
  // Add some system information
  envStatus._system = {
    timestamp: new Date().toISOString(),
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
    memoryUsage: process.memoryUsage(),
    env: process.env.NODE_ENV
  };
  
  // Return the sanitized environment status
  return res.status(200).json({
    status: 'ok',
    message: 'Environment variables status',
    env: envStatus
  });
});
