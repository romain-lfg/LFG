// Diagnostic endpoint to help identify authentication issues
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables
dotenv.config();

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle OPTIONS requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    // 1. Check environment variables
    const envVars = {
      NODE_ENV: process.env.NODE_ENV || 'not set',
      PRIVY_APP_ID: process.env.PRIVY_APP_ID ? 'set' : 'not set',
      PRIVY_APP_SECRET: process.env.PRIVY_APP_SECRET ? 'set' : 'not set',
      PRIVY_PUBLIC_KEY: process.env.PRIVY_PUBLIC_KEY ? 'set' : 'not set',
      // Supabase environment variables
      SUPABASE_URL: process.env.SUPABASE_URL || 'not set',
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? `set (${process.env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 10)}...)` : 'not set',
      // Add other relevant environment variables
      VERCEL: process.env.VERCEL || 'not set',
      VERCEL_ENV: process.env.VERCEL_ENV || 'not set',
      VERCEL_URL: process.env.VERCEL_URL || 'not set',
      VERCEL_REGION: process.env.VERCEL_REGION || 'not set'
    };
    
    // 2. Check module resolution
    let moduleResolution = {
      status: 'checking'
    };
    
    try {
      // Try to import Privy SDK
      const privyImport = await import('@privy-io/server-auth');
      moduleResolution.privy = {
        status: 'success',
        version: privyImport.version || 'unknown'
      };
    } catch (error) {
      moduleResolution.privy = {
        status: 'error',
        message: error.message
      };
    }
    
    // 3. Check file system access (for debugging purposes)
    let fileSystemCheck = {
      status: 'checking'
    };
    
    try {
      // List the current directory
      const currentDir = process.cwd();
      fileSystemCheck = {
        status: 'success',
        currentDirectory: currentDir,
        files: fs.readdirSync(currentDir).slice(0, 10) // Limit to first 10 files
      };
    } catch (error) {
      fileSystemCheck = {
        status: 'error',
        message: error.message
      };
    }
    
    // 4. Check Node.js version and runtime info
    const runtimeInfo = {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      memoryUsage: process.memoryUsage()
    };
    
    // Return diagnostic information
    return res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: envVars,
      moduleResolution,
      fileSystemCheck,
      runtimeInfo,
      headers: req.headers
    });
  } catch (error) {
    console.error('Diagnostic endpoint error:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message,
      stack: process.env.NODE_ENV === 'production' ? 'hidden' : error.stack
    });
  }
}
