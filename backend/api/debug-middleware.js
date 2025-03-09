// Debug endpoint to check middleware execution
// This file should be placed in the /api directory to be accessible via Vercel

import { createHandler } from '../src/utils/api-handler.js';

/**
 * Middleware debug handler
 * 
 * This endpoint logs the execution of middleware and returns information
 * about the request to help diagnose middleware issues.
 */
export default createHandler(async (req, res) => {
  console.log('Debug middleware endpoint called');
  
  // Capture request information
  const requestInfo = {
    method: req.method,
    url: req.url,
    path: req.path,
    query: req.query,
    headers: req.headers,
    body: req.body,
    ip: req.ip,
    timestamp: new Date().toISOString()
  };
  
  // Capture authentication information
  const authInfo = {
    hasUser: !!req.user,
    userId: req.user?.id,
    isAuthenticated: req.isAuthenticated?.() || false,
    authHeader: req.headers.authorization ? 
      `${req.headers.authorization.substring(0, 15)}...` : 
      'Not provided'
  };
  
  // Log detailed information for debugging
  console.log('Request details:', JSON.stringify(requestInfo, null, 2));
  console.log('Auth details:', JSON.stringify(authInfo, null, 2));
  
  // Return the middleware execution status
  return res.status(200).json({
    status: 'ok',
    message: 'Middleware execution status',
    request: requestInfo,
    auth: authInfo
  });
});
