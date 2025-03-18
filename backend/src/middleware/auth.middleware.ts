import { Request, Response, NextFunction } from 'express';
import { PrivyClient } from '@privy-io/server-auth';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get environment variables
const privyAppId = process.env.PRIVY_APP_ID;
const privyAppSecret = process.env.PRIVY_APP_SECRET;
const privyPublicKey = process.env.PRIVY_PUBLIC_KEY;
const nodeEnv = process.env.NODE_ENV || 'development';

// Log environment information with detailed key information
console.log('🔑 Auth middleware: Environment configuration', {
  environment: nodeEnv,
  hasPrivyAppId: !!privyAppId,
  hasPrivyAppSecret: !!privyAppSecret,
  hasPrivyPublicKey: !!privyPublicKey,
  privyPublicKeyLength: privyPublicKey ? privyPublicKey.length : 0,
  privyPublicKeyFirstChars: privyPublicKey ? privyPublicKey.substring(0, 10) + '...' : 'none',
  // Log more environment details
  frontendUrl: process.env.FRONTEND_URL,
  nodeVersion: process.version,
  // Log key format details
  keyFormat: privyPublicKey ? {
    containsHeaders: privyPublicKey.includes('BEGIN') || privyPublicKey.includes('END'),
    containsNewlines: privyPublicKey.includes('\n'),
    isBase64: /^[A-Za-z0-9+/=]+$/.test(privyPublicKey.trim()),
    length: privyPublicKey.length
  } : null
});

// Validate environment variables
if (!privyAppId) {
  console.error('Missing PRIVY_APP_ID environment variable. Please check your .env file.');
  process.exit(1);
}

// Create Privy client
const privyClient = new PrivyClient(
  privyAppId,
  privyAppSecret || ''
);

// Log initialization details
console.log('🔑 Auth middleware: Initializing with config', {
  hasAppId: !!privyAppId,
  hasAppSecret: !!privyAppSecret,
  hasPublicKey: !!privyPublicKey,
  publicKeyLength: privyPublicKey?.length,
  environment: process.env.NODE_ENV
});

// Extend Express Request type to include user information
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        walletAddress?: string;
        email?: string;
        claims?: any;
        [key: string]: any;
      };
    }
  }
}

interface PrivyTokens {
  'privy-token'?: string;
  'privy-session'?: string;
}

/**
 * Parse cookies from request header with detailed logging
 */
const parseCookies = (cookieHeader: string | undefined): PrivyTokens => {
  if (!cookieHeader) {
    console.log('🔑 Auth middleware: No cookies found in request');
    return {};
  }
  
  const cookies = cookieHeader.split(';').reduce((cookies: PrivyTokens, cookie) => {
    const [key, value] = cookie.trim().split('=');
    if (key === 'privy-token' || key === 'privy-session') {
      cookies[key] = value;
      console.log(`🔑 Auth middleware: Found ${key} cookie`, {
        length: value?.length || 0,
        firstChars: value ? value.substring(0, 10) + '...' : 'none'
      });
    }
    return cookies;
  }, {});

  // Log cookie parsing results
  console.log('🔑 Auth middleware: Cookie parsing complete', {
    foundPrivyToken: !!cookies['privy-token'],
    foundPrivySession: !!cookies['privy-session'],
    cookieHeaderLength: cookieHeader.length
  });

  return cookies;
};

/**
 * Middleware to authenticate users using Privy token
 * Simplified implementation based on Privy documentation
 * @param req Express request object
 * @param res Express response object
 * @param next Express next function
 */
export const authenticateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Always allow OPTIONS requests to pass through for CORS preflight
    if (req.method === 'OPTIONS') {
      return next();
    }

    // Parse cookies from request
    const cookies = parseCookies(req.headers.cookie);
    
    // First try to get token from privy-token cookie
    let token = cookies['privy-token'];

    // If no cookie token, try Authorization header as fallback
    if (!token) {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        // Check for privy-session cookie - if present, user might need session refresh
        if (cookies['privy-session']) {
          console.log('🔑 Auth middleware: Found privy-session cookie, session needs refresh');
          res.status(401).json({ 
            error: 'Session expired', 
            code: 'SESSION_EXPIRED',
            message: 'Your session has expired. Please refresh your authentication.'
          });
          return;
        }
        
        console.warn('🔑 Auth middleware: No valid authentication found');
        res.status(401).json({ error: 'Unauthorized: Missing or invalid token format' });
        return;
      }
      
      token = authHeader.split(' ')[1];
    }
    
    if (!token || token.trim() === '') {
      console.warn('🔑 Auth middleware: Empty token');
      res.status(401).json({ error: 'Unauthorized: Empty token' });
      return;
    }
    
    // Log token details (safely)
    console.log('🔑 Auth middleware: Token details', { 
      tokenLength: token.length,
      tokenFirstChars: token.substring(0, 10) + '...'
    });

    // Verify token using Privy SDK
    try {
      console.log('🔑 Auth middleware: Verifying token with Privy');
      
      // According to Privy docs, we can pass the verification key directly to avoid an API call
      let verifiedClaims;
      
      if (privyPublicKey) {
        // Decode and log token parts for debugging
        const [headerB64, payloadB64, signatureB64] = token.split('.');
        const header = JSON.parse(Buffer.from(headerB64, 'base64').toString());
        const payload = JSON.parse(Buffer.from(payloadB64, 'base64').toString());
        
        // Log verification attempt with all relevant details
        console.log('🔑 Auth middleware: Token verification attempt', {
          // Token info
          tokenLength: token.length,
          tokenParts: {
            header: headerB64.length,
            payload: payloadB64.length,
            signature: signatureB64.length
          },
          // Header info
          algorithm: header.alg,
          keyId: header.kid,
          tokenType: header.typ,
          // Payload info (safe fields only)
          issuer: payload.iss,
          audience: payload.aud,
          expiration: new Date(payload.exp * 1000).toISOString(),
          issuedAt: new Date(payload.iat * 1000).toISOString(),
          subject: payload.sub,
          // Public key info
          publicKeyLength: privyPublicKey.length,
          publicKeyFirstChars: privyPublicKey.substring(0, 10) + '...',
          // Environment info
          environment: process.env.NODE_ENV,
          appId: process.env.PRIVY_APP_ID
        });
        
        try {
          // Verify the token matches our app ID
          if (payload.aud !== process.env.PRIVY_APP_ID) {
            throw new Error(`Invalid audience: ${payload.aud}, expected: ${process.env.PRIVY_APP_ID}`);
          }
          
          // Verify token hasn't expired
          const now = Math.floor(Date.now() / 1000);
          if (payload.exp && payload.exp < now) {
            throw new Error(`Token expired at ${new Date(payload.exp * 1000).toISOString()}`);
          }
          
          // Verify token with the public key
          try {
            // Ensure the key is properly formatted for ES256
            let formattedKey = privyPublicKey.trim();
            
            // Log key format details (safely)
            console.log('🔑 Auth middleware: Key format check', {
              originalLength: privyPublicKey.length,
              trimmedLength: formattedKey.length,
              containsPEM: formattedKey.includes('BEGIN') || formattedKey.includes('END'),
              containsNewlines: formattedKey.includes('\n'),
              // Show first few chars safely
              keyStart: formattedKey.substring(0, 10) + '...'
            });
            
            verifiedClaims = await privyClient.verifyAuthToken(token, formattedKey);
            console.log('🔑 Auth middleware: Token verification successful', {
              userId: verifiedClaims.userId,
              appId: verifiedClaims.appId,
              verifiedAt: new Date().toISOString()
            });
          } catch (verifyError: any) {
            // If verification fails, try with base64 decoding/encoding
            try {
              console.log('🔑 Auth middleware: First attempt failed, trying with re-encoded key');
              // Decode and re-encode to ensure proper base64 format
              const keyBuffer = Buffer.from(privyPublicKey, 'base64');
              const reEncodedKey = keyBuffer.toString('base64');
              verifiedClaims = await privyClient.verifyAuthToken(token, reEncodedKey);
            } catch (retryError) {
              throw verifyError; // If retry fails, throw original error
            }
          }
        } catch (verifyError: any) {
          // Create a detailed error response
          const errorDetails = {
            message: verifyError.message,
            name: verifyError.name,
            code: verifyError.code || 'VERIFICATION_FAILED',
            tokenIssuer: payload.iss,
            tokenAudience: payload.aud,
            expectedAudience: process.env.PRIVY_APP_ID,
            // Include key verification details
            keyLength: privyPublicKey.length,
            keyFormat: privyPublicKey.includes('BEGIN') ? 'PEM' : 'Raw',
            // Include timing information
            currentTime: new Date().toISOString(),
            tokenExpiration: new Date(payload.exp * 1000).toISOString(),
            tokenIssuedAt: new Date(payload.iat * 1000).toISOString()
          };
          
          console.error('🔑 Auth middleware: Token verification failed', errorDetails);
          
          res.status(401).json({ 
            error: 'Unauthorized: Token verification failed',
            details: errorDetails
          });
          return;
        }
      } else {
        console.log('🔑 Auth middleware: No public key provided, letting SDK fetch it');
        verifiedClaims = await privyClient.verifyAuthToken(token);
      }
      
      // Log the verified claims (without sensitive data)
      console.log('🔑 Auth middleware: Token verification successful', {
        hasUserId: !!verifiedClaims?.userId,
        hasAppId: !!verifiedClaims?.appId,
        claimsKeys: verifiedClaims ? Object.keys(verifiedClaims) : []
      });
      
      // Verify that we have a valid user ID
      if (!verifiedClaims || !verifiedClaims.userId) {
        console.warn('🔑 Auth middleware: Invalid token claims - missing user ID');
        res.status(401).json({ error: 'Unauthorized: Invalid token claims' });
        return;
      }
      
      interface PrivyAccount {
        type: string;
        address?: string;
      }

      // Create a simple user object with essential information
      // Note: We need to cast verifiedClaims to access custom properties not in the standard AuthTokenClaims type
      const claims = verifiedClaims as any;
      
      // Log token verification details
      console.log('🔑 Auth middleware: Processing verified claims', {
        userId: verifiedClaims.userId,
        appId: verifiedClaims.appId,
        hasLinkedAccounts: !!claims.linkedAccounts,
        linkedAccountTypes: claims.linkedAccounts?.map((acc: any) => acc.type)
      });
      
      // Extract user information safely
      let walletAddress: string | undefined;
      let email: string | undefined;
      
      // Try to extract wallet address and email from the claims
      try {
        if (claims.linkedAccounts && Array.isArray(claims.linkedAccounts)) {
          const walletAccount = claims.linkedAccounts.find(
            (account: PrivyAccount) => account.type === 'wallet'
          );
          const emailAccount = claims.linkedAccounts.find(
            (account: PrivyAccount) => account.type === 'email'
          );
          
          walletAddress = walletAccount?.address;
          email = emailAccount?.address;
          
          console.log('🔑 Auth middleware: Extracted user details', {
            hasWallet: !!walletAddress,
            hasEmail: !!email,
            walletType: walletAccount?.type
          });
        }
      } catch (err) {
        console.error('🔑 Auth middleware: Error extracting user details from claims', err);
      }
      
      // Set the privy-token cookie if it wasn't present
      const cookies = parseCookies(req.headers.cookie);
      if (!cookies['privy-token']) {
        res.setHeader('Set-Cookie', [
          `privy-token=${token}; Path=/; HttpOnly; SameSite=Strict; Secure`,
        ]);
      }
      
      // Create the complete user object with all information
      req.user = {
        id: verifiedClaims.userId,
        walletAddress,
        email,
        claims: verifiedClaims
      };
      
      console.log('🔑 Auth middleware: Authentication successful', {
        userId: req.user.id,
        hasWalletAddress: !!req.user.walletAddress,
        hasEmail: !!req.user.email
      });

      next();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('🔑 Auth middleware: Token verification error:', errorMessage);
      
      // Log detailed error information for debugging
      console.log('🔑 Auth middleware: Token verification error details', { 
        errorName: error instanceof Error ? error.name : 'Unknown',
        errorMessage,
        errorStack: error instanceof Error ? error.stack : 'No stack trace',
        environment: nodeEnv,
        tokenLength: token.length,
        appId: privyAppId,
        publicKeyAvailable: !!privyPublicKey,
        publicKeyLength: privyPublicKey ? privyPublicKey.length : 0
      });
      
      // Provide specific error messages based on the error type
      if (error instanceof Error && errorMessage.includes('expired')) {
        res.status(401).json({ error: 'Unauthorized: Token expired' });
      } else if (error instanceof Error && errorMessage.includes('signature')) {
        res.status(401).json({ error: 'Unauthorized: Invalid token signature' });
      } else {
        res.status(401).json({ error: 'Unauthorized: Invalid token' });
      }
    }
  } catch (error: unknown) {
    console.error('🔑 Auth middleware: Authentication error:', error);
    res.status(500).json({ error: 'Internal server error during authentication' });
  }
};

/**
 * Middleware to check if user is authenticated
 * @param req Express request object
 * @param res Express response object
 * @param next Express next function
 */
export const isAuthenticated = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized: User not authenticated' });
    return;
  }
  
  next();
};

/**
 * Middleware to check if user has required role
 * @param role Required role
 * @returns Middleware function
 */
export const hasRole = (role: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized: User not authenticated' });
      return;
    }
    
    if (!req.user.roles || !req.user.roles.includes(role)) {
      res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
      return;
    }
    
    next();
  };
};
