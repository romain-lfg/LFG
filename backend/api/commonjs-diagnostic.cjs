// CommonJS-style diagnostic endpoint
module.exports = function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle OPTIONS requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    // Test CommonJS imports
    let privyTest = { status: 'not attempted' };
    
    try {
      // Try to require Privy SDK
      const PrivyClient = require('@privy-io/server-auth').PrivyClient;
      privyTest = {
        status: 'success',
        message: 'Privy SDK successfully imported using CommonJS require'
      };
    } catch (error) {
      privyTest = {
        status: 'error',
        message: error.message
      };
    }
    
    // Basic environment check
    const envCheck = {
      NODE_ENV: process.env.NODE_ENV || 'not set',
      PRIVY_APP_ID: process.env.PRIVY_APP_ID ? 'set' : 'not set',
      PRIVY_APP_SECRET: process.env.PRIVY_APP_SECRET ? 'set' : 'not set',
      PRIVY_PUBLIC_KEY: process.env.PRIVY_PUBLIC_KEY ? 'set' : 'not set',
      VERCEL: process.env.VERCEL || 'not set'
    };
    
    // Return diagnostic information
    return res.status(200).json({
      status: 'ok',
      message: 'CommonJS diagnostic endpoint is working',
      timestamp: new Date().toISOString(),
      moduleFormat: 'CommonJS',
      privyTest,
      environment: envCheck
    });
  } catch (error) {
    console.error('CommonJS diagnostic error:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
}
