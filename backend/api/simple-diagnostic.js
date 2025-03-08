// Simple diagnostic endpoint with no external dependencies
export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle OPTIONS requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    // Basic environment check
    const envCheck = {
      NODE_ENV: process.env.NODE_ENV || 'not set',
      VERCEL: process.env.VERCEL || 'not set',
      VERCEL_ENV: process.env.VERCEL_ENV || 'not set',
      VERCEL_REGION: process.env.VERCEL_REGION || 'not set'
    };
    
    // Basic runtime info
    const runtimeInfo = {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch
    };
    
    // Return diagnostic information
    return res.status(200).json({
      status: 'ok',
      message: 'Simple diagnostic endpoint is working',
      timestamp: new Date().toISOString(),
      environment: envCheck,
      runtime: runtimeInfo
    });
  } catch (error) {
    console.error('Simple diagnostic error:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
}
