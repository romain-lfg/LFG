# LFG Authentication System

This document provides a comprehensive overview of the LFG authentication system, including its architecture, implementation details, and usage guidelines.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Backend Implementation](#backend-implementation)
- [Frontend Integration](#frontend-integration)
- [User Flow](#user-flow)
- [Security Considerations](#security-considerations)
- [Testing](#testing)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [References](#references)

## Overview

The LFG authentication system uses Privy.io for authentication, providing a seamless experience with multiple login methods, including email, social login, and wallet connection. The system is designed to be secure, scalable, and easy to integrate with the rest of the application.

### Key Features

- **Multiple Login Methods**: Support for email, social login (Google, Telegram), wallet connection, and embedded wallet creation.
- **Token-Based Authentication**: Secure JWT-based authentication with proper verification.
- **User Data Synchronization**: Automatic synchronization of user data between Privy and Supabase.
- **Role-Based Access Control**: Granular access control based on user roles.
- **Secure Token Handling**: Proper token verification and expiration handling.

## Architecture

The authentication system consists of the following components:

1. **Privy Authentication Service**: Handles user authentication and token generation.
2. **Backend Authentication Middleware**: Verifies tokens and enforces access control.
3. **User Management Service**: Synchronizes user data between Privy and Supabase.
4. **Frontend Authentication Context**: Manages authentication state and provides authentication hooks.

### Authentication Flow

1. User initiates login through the frontend.
2. Privy handles the authentication process and returns a token.
3. Frontend stores the token and includes it in API requests.
4. Backend verifies the token using the Privy public key.
5. If the token is valid, the user is authenticated and can access protected resources.

## Backend Implementation

### Authentication Middleware

The authentication middleware is responsible for verifying tokens and enforcing access control. It consists of the following components:

1. **authenticateUser**: Verifies the token and adds user information to the request object.
2. **isAuthenticated**: Ensures that the user is authenticated.
3. **hasRole**: Ensures that the user has the required role.

```typescript
// Example usage in routes
router.get('/profile', authenticateUser, isAuthenticated, userController.getProfile);
router.get('/admin/users', authenticateUser, hasRole('admin'), adminController.getUsers);
```

### User Management

The user management service is responsible for synchronizing user data between Privy and Supabase. It provides the following functionality:

1. **syncUser**: Creates or updates user data in Supabase based on Privy data.
2. **getUser**: Retrieves user data from Supabase.
3. **updateUser**: Updates user data in Supabase.

```typescript
// Example usage in controllers
async syncUser(req: Request, res: Response) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Unauthorized: User not authenticated' });
    }

    const userData = {
      id: req.user.id,
      walletAddress: req.body.walletAddress,
      email: req.body.email,
      metadata: req.body.metadata || {},
    };

    const user = await userService.syncUser(userData);
    return res.status(200).json({ user });
  } catch (error) {
    console.error('Error syncing user:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
```

## Frontend Integration

### Authentication Context

The frontend uses an authentication context to manage authentication state and provide authentication hooks. It provides the following functionality:

1. **isAuthenticated**: Indicates whether the user is authenticated.
2. **user**: Contains user information.
3. **login**: Initiates the login process.
4. **logout**: Logs the user out.
5. **syncUserData**: Synchronizes user data with the backend.

```tsx
// Example usage in components
import { useAuth } from '../context/AuthContext';

const ProfilePage: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  
  if (!isAuthenticated) {
    return <div>Please log in to view your profile.</div>;
  }
  
  return (
    <div>
      <h1>Profile</h1>
      <p>ID: {user.id}</p>
      {user.email && <p>Email: {user.email}</p>}
      {user.walletAddress && <p>Wallet: {user.walletAddress}</p>}
      <button onClick={logout}>Logout</button>
    </div>
  );
};
```

### Protected Routes

The frontend uses protected routes to restrict access to authenticated users. It provides the following functionality:

1. **ProtectedRoute**: A component that redirects unauthenticated users to the login page.

```tsx
// Example usage in pages
import { ProtectedRoute } from '../components/ProtectedRoute';

const DashboardPage: React.FC = () => {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
};
```

## User Flow

### Public Access

Non-authenticated users can access:
- Home page
- Bounty board (read-only)

### Authentication Entry Points

Users can authenticate through:
- "Get Started" button on the homepage
- "Connect" button in the navbar

### Post-Authentication Access

Authenticated users can access:
- Dashboard with personal stats and activity
- Agent chat for profile updates and bounty matching
- Bounty creation and application
- Wallet operations for bounty management

## Security Considerations

### Token Security

- JWT tokens are verified using the Privy public key.
- Tokens have a reasonable expiration time.
- Tokens are stored securely in the frontend.
- Tokens are only transmitted over HTTPS.

### API Security

- All API endpoints are served over HTTPS.
- CORS is configured to only allow requests from trusted domains.
- Rate limiting is implemented for authentication endpoints.
- Input validation is performed on all user inputs.
- Error handling returns generic error messages that don't leak sensitive information.

### User Data Security

- Sensitive user data is not exposed in API responses.
- User data is protected in transit and at rest.
- User data is only used for authorized purposes.

## Testing

### Backend Testing

The backend includes tests for:
- Authentication middleware
- User management service
- API endpoints

To run the backend tests:

```bash
cd backend
npm test
```

### Authentication Flow Testing

The authentication flow can be tested using the provided test script:

```bash
cd backend
node test/auth-flow-test.js
```

### Frontend Testing

The frontend includes tests for:
- Authentication context
- Protected routes
- User components

To run the frontend tests:

```bash
cd frontend
npm test
```

## Deployment

### Environment Variables

The following environment variables are required for the authentication system:

#### Backend

```
# Privy Configuration
PRIVY_APP_ID=your-privy-app-id
PRIVY_APP_SECRET=your-privy-app-secret
PRIVY_PUBLIC_KEY=your-privy-public-key

# Supabase Configuration
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Server Configuration
NODE_ENV=production
PORT=3001
FRONTEND_URL=your-frontend-url
```

#### Frontend

```
NEXT_PUBLIC_API_URL=your-backend-url
NEXT_PUBLIC_PRIVY_APP_ID=your-privy-app-id
```

### Deployment Process

For detailed deployment instructions, see the [Deployment Guide](./deployment-guide.md).

## Troubleshooting

For common issues and their solutions, see the [Troubleshooting Guide](./auth-troubleshooting.md).

### Common Issues

- **Token Verification Failures**: Check the Privy public key and token format.
- **Missing User Information**: Ensure that user data is being synced correctly.
- **CORS Issues**: Check the CORS configuration and frontend URL.
- **Authentication State Not Persisting**: Check the Privy configuration for persistence.

## References

- [Privy Documentation](https://docs.privy.io/)
- [Supabase Documentation](https://supabase.com/docs)
- [JWT Documentation](https://jwt.io/introduction)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)

## Additional Resources

- [Authentication Security Checklist](./auth-security-checklist.md)
- [Production Readiness Checklist](./production-readiness-checklist.md)
- [Frontend Authentication Integration Guide](./frontend-auth-integration.md)
