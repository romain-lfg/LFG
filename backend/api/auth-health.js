// Standalone authentication health check endpoint that doesn't depend on Nillion
import { PrivyClient } from '@privy-io/server-auth';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get environment variables
const privyAppId = process.env.PRIVY_APP_ID;
const privyAppSecret = process.env.PRIVY_APP_SECRET;
const privyPublicKey = process.env.PRIVY_PUBLIC_KEY;

// Create Privy client
const privyClient = new PrivyClient(
  privyAppId,
  privyAppSecret || ''
);

export default async function handler(req, res) {
  // Set CORS headers to allow requests from any origin
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle OPTIONS requests for CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Log request information
  console.log('🔍 Auth health check request received', {
    method: req.method,
    url: req.url,
    headers: req.headers,
    hasAuthHeader: !!req.headers.authorization
  });
  
  try {
    // Check if Privy environment variables are set
    const envCheck = {
      hasPrivyAppId: !!privyAppId,
      hasPrivyAppSecret: !!privyAppSecret,
      hasPrivyPublicKey: !!privyPublicKey,
      publicKeyFormat: privyPublicKey ? {
        length: privyPublicKey.length,
        startsWithHeader: privyPublicKey.includes('-----BEGIN PUBLIC KEY-----'),
        endsWithFooter: privyPublicKey.includes('-----END PUBLIC KEY-----'),
        containsNewlines: privyPublicKey.includes('\n'),
        preview: privyPublicKey.substring(0, 20) + '...' + privyPublicKey.substring(privyPublicKey.length - 20)
      } : 'not available'
    };
    
    console.log('🔑 Privy environment check:', envCheck);
    
    // Check if authorization header exists
    const authHeader = req.headers.authorization;
    let tokenVerification = { verified: false, message: 'No token provided' };
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      
      try {
        // Attempt to verify the token
        console.log('🔑 Attempting to verify token with Privy');
        
        // Format the public key correctly if it's not already in the right format
        let formattedPublicKey = privyPublicKey || '';
        
        // Ensure the key has the correct header and footer
        if (!formattedPublicKey.includes('-----BEGIN PUBLIC KEY-----')) {
          formattedPublicKey = '-----BEGIN PUBLIC KEY-----\n' + formattedPublicKey;
        }
        if (!formattedPublicKey.includes('-----END PUBLIC KEY-----')) {
          formattedPublicKey = formattedPublicKey + '\n-----END PUBLIC KEY-----';
        }
        
        // Ensure there are newlines after the header and before the footer
        formattedPublicKey = formattedPublicKey.replace('-----BEGIN PUBLIC KEY-----', '-----BEGIN PUBLIC KEY-----\n');
        formattedPublicKey = formattedPublicKey.replace('-----END PUBLIC KEY-----', '\n-----END PUBLIC KEY-----');
        
        // Add newlines every 64 characters in the base64 part if they're not already there
        const headerIndex = formattedPublicKey.indexOf('-----BEGIN PUBLIC KEY-----\n');
        const footerIndex = formattedPublicKey.indexOf('\n-----END PUBLIC KEY-----');
        
        if (headerIndex !== -1 && footerIndex !== -1) {
          const base64Part = formattedPublicKey.substring(headerIndex + 28, footerIndex);
          
          // If the base64 part doesn't have newlines, add them every 64 characters
          if (!base64Part.includes('\n')) {
            let formattedBase64 = '';
            for (let i = 0; i < base64Part.length; i += 64) {
              formattedBase64 += base64Part.substring(i, Math.min(i + 64, base64Part.length)) + '\n';
            }
            
            formattedPublicKey = '-----BEGIN PUBLIC KEY-----\n' + formattedBase64 + '-----END PUBLIC KEY-----';
          }
        }
        
        console.log('🔑 Using formatted public key for verification');
        
        // Verify the token with the formatted public key
        const verifiedClaims = await privyClient.verifyAuthToken(token, formattedPublicKey);
        
        tokenVerification = {
          verified: true,
          userId: verifiedClaims.userId,
          message: 'Token verified successfully'
        };
        
        console.log('✅ Token verification successful:', {
          userId: verifiedClaims.userId
        });
      } catch (error) {
        console.error('❌ Token verification failed:', error);
        tokenVerification = {
          verified: false,
          message: `Token verification failed: ${error.message}`
        };
      }
    }
    
    // Return health check response
    return res.status(200).json({
      status: 'ok',
      message: 'Authentication service is running',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      privyEnvironment: envCheck,
      authentication: tokenVerification,
      // Include some environment variables for debugging (excluding sensitive ones)
      env: {
        NODE_ENV: process.env.NODE_ENV,
        VERCEL: process.env.VERCEL,
        VERCEL_ENV: process.env.VERCEL_ENV,
        VERCEL_URL: process.env.VERCEL_URL,
        VERCEL_REGION: process.env.VERCEL_REGION
      }
    });
  } catch (error) {
    console.error('❌ Auth health check error:', error);
    return res.status(500).json({
      status: 'error',
      message: `Authentication service error: ${error.message}`,
      timestamp: new Date().toISOString()
    });
  }
}
