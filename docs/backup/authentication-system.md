# LFG Authentication System Documentation

## Overview

The LFG platform uses Privy.io as the primary authentication service for all user onboarding. This document provides a comprehensive guide to the authentication system implementation, including the backend middleware, frontend integration, and user data flow.

## Architecture

The authentication system follows a token-based architecture with the following components:

1. **Privy.io Authentication Service**:
   - Handles user authentication via multiple methods (email, social login, wallet connection)
   - Provides JWT tokens for authenticated users
   - Manages wallet connections and creation

2. **Backend Authentication Middleware**:
   - Verifies Privy JWT tokens
   - Adds user information to request objects
   - Provides role-based access control

3. **User Data Synchronization**:
   - Syncs user data between Privy and PostgreSQL database
   - Maintains consistent user state across the platform

4. **Frontend Authentication Context**:
   - Manages authentication state in the frontend
   - Provides protected routes and conditional UI rendering

## Backend Implementation

### Authentication Middleware

The authentication middleware is implemented in `src/middleware/auth.middleware.ts` and provides the following functions:

#### `authenticateUser`

Verifies the Privy JWT token and adds user information to the request object.

```typescript
export const authenticateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Get authorization header
    const authHeader = req.headers.authorization;
    
    // Check if authorization header exists and has the correct format
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Unauthorized: Missing or invalid token format' });
      return;
    }
    
    // Extract token from header
    const token = authHeader.split(' ')[1];
    
    // Verify token
    try {
      const verifiedClaims = await privyClient.verifyAuthToken(token, privyPublicKey);
      
      // Add user information to request object
      req.user = {
        id: verifiedClaims.userId,
        // Additional user information can be added here
      };
      
      next();
    } catch (error) {
      console.error('Token verification error:', error);
      res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Internal server error during authentication' });
  }
};
```

#### `isAuthenticated`

Checks if the user is authenticated.

```typescript
export const isAuthenticated = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized: User not authenticated' });
    return;
  }
  
  next();
};
```

#### `hasRole`

Checks if the user has the required role.

```typescript
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
```

### User Routes

User routes are implemented in `src/routes/user.routes.ts` and provide endpoints for user data synchronization and profile management.

#### User Sync Endpoint

```typescript
router.post('/sync', authenticateUser, userController.syncUser);
```

#### User Profile Endpoint

```typescript
router.get('/profile', authenticateUser, userController.getUserProfile);
```

### User Controller

The user controller is implemented in `src/controllers/user.controller.ts` and handles user-related operations.

#### Sync User

```typescript
export const syncUser = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user.id) {
      res.status(401).json({ error: 'Unauthorized: User not authenticated' });
      return;
    }
    
    const { walletAddress, email, metadata } = req.body;
    
    const userData = {
      id: req.user.id,
      walletAddress,
      email,
      metadata
    };
    
    const syncedUser = await userService.syncUser(userData);
    
    res.json({
      message: 'User data synced successfully',
      user: syncedUser
    });
  } catch (error) {
    console.error('Error syncing user data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
```

## Frontend Implementation

### Authentication Context

The authentication context is implemented in `src/context/AuthContext.tsx` and provides global authentication state management.

```typescript
export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  login: () => Promise.resolve(),
  logout: () => Promise.resolve(),
});

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  
  // Authentication logic
  
  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### Protected Routes

Protected routes are implemented using a `ProtectedRoute` component that redirects unauthenticated users to the login page.

```typescript
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);
  
  return isAuthenticated ? <>{children}</> : null;
};
```

## User Journey

### Public Access (Non-Authenticated Users)

- Can view: Home page, Bounty board (read-only)
- Cannot access: Dashboard, Agent chat, Create/Apply for bounties
- Primary CTA: "Get Started" button for authentication

### Authentication Flow

- Entry points:
  * Primary: "Get Started" button on homepage
  * Secondary: "Connect" button in navbar
- Methods supported:
  * Email
  * Social login (Google, Telegram)
  * Wallet connection
  * Embedded wallet creation for new users

### Post-Authentication Access

- Full access to:
  * Dashboard with personal stats and activity
  * Agent chat for profile updates and bounty matching
  * Bounty creation and application
  * Wallet operations for bounty management

## Data Flow

1. User authenticates via Privy
2. Frontend receives authentication token
3. Token is included in API requests to backend
4. Backend verifies token and retrieves user information
5. User data is synced with PostgreSQL database
6. Frontend receives user data and updates UI accordingly

## Environment Variables

The following environment variables are required for the authentication system:

```
# Privy Configuration
PRIVY_APP_ID=your-privy-app-id
PRIVY_APP_SECRET=your-privy-app-secret
PRIVY_PUBLIC_KEY=your-privy-public-key

# Supabase Configuration
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-supabase-key
```

## Testing

Refer to the `README-AUTH-TESTING.md` file for detailed instructions on testing the authentication system.

## Security Considerations

1. **Token Storage**: Authentication tokens should be stored securely in the frontend, preferably in memory or secure storage.
2. **HTTPS**: All API requests should be made over HTTPS to prevent token interception.
3. **Token Expiration**: Tokens should have a reasonable expiration time to limit the impact of token theft.
4. **Error Handling**: Authentication errors should be handled gracefully without exposing sensitive information.
5. **Rate Limiting**: API endpoints should be rate-limited to prevent brute force attacks.

## Troubleshooting

### Common Issues

1. **Token Verification Errors**: Ensure that the Privy public key is correctly set and that the token verification is using the correct parameters.
2. **CORS Errors**: Make sure the CORS middleware is correctly configured in your Express app.
3. **Missing Environment Variables**: Verify that all required environment variables are set.

### Debugging Tips

- Check the network tab in your browser's developer tools to see the requests and responses.
- Use `console.log` statements to debug your code.
- Verify that the token is being correctly passed in the Authorization header.

## Future Improvements

1. **Refresh Tokens**: Implement refresh tokens for longer sessions without compromising security.
2. **Multi-Factor Authentication**: Add support for multi-factor authentication for enhanced security.
3. **Session Management**: Implement session management for better control over user sessions.
4. **Audit Logging**: Add audit logging for authentication events for security monitoring.
5. **User Permissions**: Implement a more granular permission system for fine-grained access control.
