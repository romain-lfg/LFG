# Authentication Components Guide

This guide provides a comprehensive overview of the authentication system in the LFG application, including frontend components, hooks, backend services, and implementation details.

## Authentication Architecture

### Overview

The LFG authentication system is built on Privy.io, providing a secure and flexible authentication solution with multiple login methods. The architecture follows a token-based approach with JWT verification and seamless integration with our PostgreSQL database for user management.

### Key Components

1. **Frontend**:
   - Privy SDK integration for authentication UI and wallet management
   - Custom hooks for authentication state management
   - Protected routes with client-side redirection
   - Conditional UI rendering based on authentication status

2. **Backend**:
   - Token verification middleware using Privy's server-side SDK
   - User data synchronization between Privy and PostgreSQL
   - Protected API routes with role-based access control
   - Comprehensive error handling for authentication failures

3. **Data Flow**:
   - User authenticates via Privy (frontend)
   - Authentication token sent to backend for verification
   - User data synchronized with PostgreSQL database
   - Privy User ID links both authentication and data storage systems

## Authentication Flow

1. **User Initiates Authentication**:
   - Via "Get Started" button on homepage
   - Via "Connect" button in navbar

2. **Authentication Methods**:
   - Email
   - Social login (Google, Telegram)
   - Wallet connection
   - Embedded wallet creation for new users

3. **Post-Authentication**:
   - Token stored in client
   - User profile synchronized with backend
   - Access granted to protected routes and features

## Frontend Components

### LoginButton

A button component that handles user login through Privy.

```tsx
import { LoginButton } from '@/components/auth';

// Basic usage
<LoginButton>Connect Wallet</LoginButton>

// With custom styling
<LoginButton className="my-custom-class" variant="secondary">
  Sign In
</LoginButton>
```

### LogoutButton

A button component that handles user logout.

```tsx
import { LogoutButton } from '@/components/auth';

// Basic usage
<LogoutButton>Disconnect</LogoutButton>

// With custom styling
<LogoutButton className="my-custom-class" variant="secondary">
  Sign Out
</LogoutButton>
```

### UserProfile

A component that displays the authenticated user's profile information.

```tsx
import { UserProfile } from '@/components/auth';

// Basic usage (shows name, email, and wallet address)
<UserProfile />

// Only show name and wallet address
<UserProfile showEmail={false} />

// Only show name and email
<UserProfile showWallet={false} />

// With custom styling
<UserProfile className="my-custom-class" />
```

### ProtectedRoute

A component that restricts access to authenticated users.

```tsx
import { ProtectedRoute } from '@/components/auth';

// Basic usage
<ProtectedRoute>
  <div>This content is only visible to authenticated users</div>
</ProtectedRoute>

// With custom fallback URL
<ProtectedRoute fallbackUrl="/login">
  <div>Protected content</div>
</ProtectedRoute>

// With role-based access control
<ProtectedRoute requiredRole="admin" fallbackUrl="/unauthorized">
  <div>Admin-only content</div>
</ProtectedRoute>
```

### AuthStatus

A component that conditionally renders content based on authentication status.

```tsx
import { AuthStatus } from '@/components/auth';

// Basic usage
<AuthStatus
  authenticatedComponent={<div>Logged in content</div>}
  unauthenticatedComponent={<div>Logged out content</div>}
/>

// With custom loading component
<AuthStatus
  authenticatedComponent={<div>Logged in content</div>}
  unauthenticatedComponent={<div>Logged out content</div>}
  loadingComponent={<div>Custom loading...</div>}
/>
```

### withAuth HOC

A higher-order component that handles authentication logic for pages.

```tsx
import { withAuth } from '@/components/auth';

// Protect a page that requires authentication
const DashboardPage = () => {
  return <div>Dashboard content</div>;
};

export default withAuth(DashboardPage, { 
  redirectUnauthenticated: true,
  unauthenticatedRedirectUrl: '/login'
});

// Protect a page that requires admin role
const AdminPage = () => {
  return <div>Admin content</div>;
};

export default withAuth(AdminPage, {
  requiredRole: 'admin',
  unauthenticatedRedirectUrl: '/unauthorized'
});
```

## Hooks

### useAuth

A hook that provides access to authentication state and methods.

```tsx
import { useAuth } from '@/context/AuthContext';

const MyComponent = () => {
  const { 
    isAuthenticated,
    isLoading,
    user,
    userProfile,
    activeWallet,
    login,
    logout,
    syncUserWithBackend,
    fetchUserProfile
  } = useAuth();

  return (
    <div>
      {isAuthenticated ? (
        <div>Welcome, {user?.name}!</div>
      ) : (
        <div>Please log in</div>
      )}
    </div>
  );
};
```

### useAuthRedirect

A hook that handles authentication-based redirects.

```tsx
import { useAuthRedirect } from '@/hooks/useAuthRedirect';

// In a login page component
const LoginPage = () => {
  // Redirect authenticated users to dashboard
  useAuthRedirect({
    redirectAuthenticated: true,
    authenticatedRedirectUrl: '/dashboard'
  });

  return <div>Login form</div>;
};

// In a protected page component
const DashboardPage = () => {
  // Redirect unauthenticated users to login
  useAuthRedirect({
    redirectUnauthenticated: true,
    unauthenticatedRedirectUrl: '/login'
  });

  return <div>Dashboard content</div>;
};

// In an admin page component
const AdminPage = () => {
  // Redirect users without admin role
  useAuthRedirect({
    requiredRole: 'admin',
    unauthenticatedRedirectUrl: '/unauthorized'
  });

  return <div>Admin content</div>;
};
```

## Utilities

### formatWalletAddress

Formats a wallet address for display by truncating the middle part.

```tsx
import { formatWalletAddress } from '@/components/auth';

// Returns "0x1234...5678"
const displayAddress = formatWalletAddress("0x1234567890abcdef1234567890abcdef12345678");
```

### hasRole

Checks if a user has a specific role.

```tsx
import { hasRole } from '@/components/auth';

const isUserAdmin = hasRole(userProfile, 'admin');
```

### isAdmin

Checks if a user has admin role.

```tsx
import { isAdmin } from '@/components/auth';

const userIsAdmin = isAdmin(userProfile);
```

### getUserDisplayName

Gets user's display name from their profile, falling back to email or wallet address if name is not available.

```tsx
import { getUserDisplayName } from '@/components/auth';

const displayName = getUserDisplayName(user, activeWallet);
```

### parseJwt

Parses a JWT token and returns the payload.

```tsx
import { parseJwt } from '@/components/auth';

const tokenPayload = parseJwt(token);
```

## Backend Implementation

### Authentication Middleware

The backend uses Express middleware to authenticate API requests:

```typescript
// Usage in routes
import { authenticateUser } from '../middleware/auth.middleware.js';

router.post('/protected-endpoint', authenticateUser, controller.method);
```

The middleware:
1. Extracts the JWT token from the Authorization header
2. Verifies the token using Privy's server SDK
3. Attaches the user information to the request object
4. Returns appropriate error responses for invalid tokens

### Authentication Routes

The backend provides several authentication-related endpoints:

- `POST /api/auth/verify`: Verifies a token and returns authentication status
- `GET /api/auth/session`: Returns current session information
- `POST /api/auth/logout`: Handles user logout (client-side token clearing)

### User Synchronization

When a user authenticates, their data is synchronized with our PostgreSQL database:

- `POST /api/users/sync`: Creates or updates user records
- `GET /api/users/me`: Retrieves the current user's profile

## Testing

The authentication system includes comprehensive tests:

### Frontend Tests

- Unit tests for authentication hooks (`useAuth`, `usePrivyAuth`)
- Component tests for authentication UI components
- Integration tests for the complete authentication flow

### Backend Tests

- Unit tests for authentication middleware
- API tests for authentication endpoints
- Integration tests for user synchronization

## Security Considerations

- Tokens are short-lived and verified on each request
- Sensitive user data is never stored in local storage
- API endpoints are protected with appropriate middleware
- Error messages are designed to not leak sensitive information
- Role-based access control is implemented for protected resources

## Additional Utilities

### isTokenExpired

Checks if a JWT token is expired.

```tsx
import { isTokenExpired } from '@/components/auth';

const expired = isTokenExpired(token);
```

## Testing

All authentication components and utilities have comprehensive test coverage. To run the tests:

```bash
npm test -- --testPathPattern=components/auth
npm test -- --testPathPattern=hooks/useAuth
npm test -- --testPathPattern=utils/auth
```

## Integration with Backend

The authentication system integrates with the backend through the following endpoints:

- `POST /api/users/sync` - Synchronizes user data with the backend
- `GET /api/users/me` - Retrieves the authenticated user's profile
- `GET /api/auth/verify` - Verifies the authentication token

For more information on the backend authentication implementation, see the [Privy Auth Implementation Guide](/docs/privy-auth-implementation-guide.md).
