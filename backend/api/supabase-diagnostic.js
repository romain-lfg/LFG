// Supabase diagnostic endpoint
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

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
    // Check Supabase environment variables
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    // Mask the key for security while still showing if it's set
    const supabaseKeyStatus = supabaseKey 
      ? `set (${supabaseKey.substring(0, 10)}...)` 
      : 'not set';
    
    // Test Supabase connection
    let connectionTest = { status: 'not_tested' };
    
    if (supabaseUrl && supabaseKey) {
      try {
        console.log('Testing Supabase connection...');
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        // Try a simple query to test the connection
        const { data, error } = await supabase.from('users').select('count').limit(1);
        
        if (error) {
          connectionTest = { 
            status: 'error', 
            message: error.message,
            code: error.code,
            details: error.details
          };
        } else {
          connectionTest = { 
            status: 'success', 
            message: 'Successfully connected to Supabase',
            data: data
          };
        }
      } catch (testError) {
        connectionTest = { 
          status: 'exception', 
          message: testError.message || 'Unknown error',
          stack: testError.stack
        };
      }
    }

    // Return diagnostic information
    return res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      supabaseConfig: {
        url: supabaseUrl,
        serviceRoleKey: supabaseKeyStatus
      },
      connectionTest,
      environment: process.env.NODE_ENV,
      // Include all environment variables (with sensitive ones masked)
      allEnvVars: {
        NODE_ENV: process.env.NODE_ENV || 'not set',
        SUPABASE_URL: process.env.SUPABASE_URL || 'not set',
        SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'set (masked)' : 'not set',
        PRIVY_APP_ID: process.env.PRIVY_APP_ID ? 'set' : 'not set',
        PRIVY_APP_SECRET: process.env.PRIVY_APP_SECRET ? 'set' : 'not set',
        PRIVY_PUBLIC_KEY: process.env.PRIVY_PUBLIC_KEY ? 'set' : 'not set',
        VERCEL: process.env.VERCEL || 'not set',
        VERCEL_ENV: process.env.VERCEL_ENV || 'not set',
        VERCEL_URL: process.env.VERCEL_URL || 'not set',
        VERCEL_REGION: process.env.VERCEL_REGION || 'not set'
      }
    });
  } catch (error) {
    console.error('Supabase diagnostic error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to run Supabase diagnostic',
      error: error instanceof Error ? error.message : String(error)
    });
  }
}
