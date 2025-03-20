// Export all auth components
export { default as LoginButton } from './LoginButton';
export { default as LogoutButton } from './LogoutButton';
export { default as UserProfile } from './UserProfile';
export { default as ProtectedRoute } from './ProtectedRoute';
export { default as AuthStatus } from './AuthStatus';
export { withAuth } from './withAuth';
export type { WithAuthOptions } from './withAuth';

// Export new auth components
export { AuthLoading } from './AuthLoading';
export { AuthError } from './AuthError';
export { AuthSuccess } from './AuthSuccess';
export { WalletConnection } from './WalletConnection';
export { ProfileCard } from './ProfileCard';

// Re-export auth utilities
export {
  formatWalletAddress,
  hasRole,
  isAdmin,
  getUserDisplayName,
  parseJwt,
  isTokenExpired,
} from '@/utils/auth';
