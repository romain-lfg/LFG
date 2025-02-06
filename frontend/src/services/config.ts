/**
 * API configuration and environment variables
 */

export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  NETWORK: process.env.NEXT_PUBLIC_NETWORK || 'sepolia',
  IPFS_GATEWAY: process.env.NEXT_PUBLIC_IPFS_GATEWAY || 'https://ipfs.io/ipfs/',
} as const;

export const API_ENDPOINTS = {
  // Bounty endpoints
  bounties: '/api/v1/bounties',
  bountyById: (id: string) => `/api/v1/bounties/${id}`,
  
  // VSA endpoints
  vsas: '/api/v1/vsas',
  vsaById: (id: string) => `/api/v1/vsas/${id}`,
  vsaByOwner: (address: string) => `/api/v1/vsas/owner/${address}`,
  
  // Match endpoints
  matches: '/api/v1/matches',
  matchById: (id: string) => `/api/v1/matches/${id}`,
  
  // Authentication endpoints
  nonce: (address: string) => `/api/v1/auth/nonce/${address}`,
  verify: '/api/v1/auth/verify',
} as const;
