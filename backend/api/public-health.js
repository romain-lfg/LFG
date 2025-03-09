// Public health check endpoint that bypasses all middleware
// This file should be placed directly in the /api directory to be accessible via Vercel

/**
 * Public health check handler
 * 
 * This endpoint returns a simple health check response without going through
 * any middleware or authentication. It's designed to validate if the API
 * is accessible at all.
 */
export default function handler(req, res) {
  // Log the request for debugging
  console.log('Public health check endpoint called');
  console.log('Request headers:', req.headers);
  
  // Return a simple health check response
  return res.status(200).json({
    status: 'ok',
    message: 'Public health check successful',
    timestamp: new Date().toISOString(),
    headers: req.headers,
    method: req.method,
    url: req.url
  });
}
