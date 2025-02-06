/**
 * Core type definitions for API responses and error handling in the LFG platform.
 */

/**
 * Standard API error response
 */
export interface APIError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

/**
 * Standard error codes used across the platform
 */
export const ERROR_CODES = {
  // Authentication & Authorization
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  
  // Input Validation
  INVALID_INPUT: 'INVALID_INPUT',
  INVALID_ADDRESS: 'INVALID_ADDRESS',
  
  // Resource Errors
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  
  // Blockchain Errors
  CHAIN_ERROR: 'CHAIN_ERROR',
  INSUFFICIENT_FUNDS: 'INSUFFICIENT_FUNDS',
  
  // VSA Specific
  VSA_UNAVAILABLE: 'VSA_UNAVAILABLE',
  VSA_ALREADY_ASSIGNED: 'VSA_ALREADY_ASSIGNED',
  
  // Bounty Specific
  BOUNTY_CLOSED: 'BOUNTY_CLOSED',
  BOUNTY_ALREADY_ASSIGNED: 'BOUNTY_ALREADY_ASSIGNED',
  
  // System Errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
} as const;

/**
 * Pagination parameters for list endpoints
 */
export interface PaginationParams {
  page: number;
  limit: number;
}

/**
 * Standard paginated response
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

/**
 * API response wrapper
 */
export interface APIResponse<T> {
  data: T;
  meta?: {
    timestamp: string;
    version: string;
  };
}
