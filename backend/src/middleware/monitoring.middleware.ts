import { Request, Response, NextFunction } from 'express';
import { monitoring } from '../utils/monitoring';

/**
 * Middleware to track API requests for monitoring purposes
 */
export const monitoringMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  // Record start time
  const startTime = Date.now();
  
  // Store the original end method
  const originalEnd = res.end;
  
  // Override the end method to capture response data
  res.end = function(chunk?: any, encoding?: any, callback?: any): any {
    // Calculate request duration
    const duration = Date.now() - startTime;
    
    // Track the request
    monitoring.trackApiRequest(
      req.method,
      req.path,
      res.statusCode,
      duration
    );
    
    // Call the original end method
    return originalEnd.call(this, chunk, encoding, callback);
  };
  
  next();
};
