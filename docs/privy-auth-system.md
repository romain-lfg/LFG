# LFG Authentication System with Privy

## Overview

The LFG platform uses Privy.io as its authentication provider, offering a versatile and secure authentication system that supports multiple login methods while ensuring every user has a connected wallet.

## Architecture

### Core Components

1. **Authentication Provider: Privy.io**
   - Supports multiple login methods:
     - Email
     - Social logins (Google, Telegram, Discord)
     - Wallet connection
     - Embedded wallet creation
   - Every user must have a wallet (either created or connected)
   - Primary authentication service for all user onboarding

2. **Backend Implementation**
   - **Middleware** (`auth.middleware.ts`): 
     - Verifies JWT tokens using Privy's JWKS endpoint
     - Extracts user information from token claims
     - Attaches user data to request objects
   
   - **Controller** (`auth.controller.ts`): 
     - Handles auth-related API endpoints
     - Manages token verification, session retrieval, and logout
   
   - **Service** (`auth.service.ts`): 
     - Provides authentication business logic
     - Handles user details retrieval and processing
     - Manages token extraction and verification
   
   - **Routes** (`auth.routes.ts`): 
     - Defines authentication API endpoints:
       - `/health`: Check authentication system status
       - `/verify`: Verify token validity
       - `/session`: Get current user session
       - `/logout`: End user session

3. **Frontend Implementation**
   - **AuthContext**: 
     - Global state management for authentication
     - Properly handles SSR (Server-Side Rendering)
   
   - **useAuth Hook**: 
     - Manages authentication state
     - Handles wallet connections
     - Provides authentication methods to components
   
   - **Protected Routes**: 
     - Client-side redirection for unauthenticated users
     - Conditional rendering based on auth state
   
   - **Build Process**:
     - Uses `NEXT_PUBLIC_SKIP_AUTH_DURING_BUILD` environment variable to handle authentication during the build process

## Authentication Flow

1. **User Registration/Login**
   - User initiates authentication via "Get Started" button or "Connect" in navbar
   - Privy modal opens with login options
   - User authenticates using preferred method
   - If no wallet is connected, user is prompted to connect or create one
   - Privy generates JWT token upon successful authentication

2. **Token Handling**
   - JWT token is stored securely
   - Token contains user information including:
     - User ID in `sub` field (format: `did:privy:<userId>`)
     - Linked accounts information
     - Wallet addresses

3. **API Authentication**
   - JWT token is included in API requests as Bearer token
   - Backend middleware extracts and verifies token
   - User information is attached to request for authorized endpoints

4. **Session Management**
   - Privy SDK handles token refresh automatically
   - Logout invalidates the current session

## User Access Control

1. **Public Access**
   - Home page
   - Bounty board (read-only)

2. **Authentication Entry Points**
   - "Get Started" button on homepage
   - "Connect" button in navbar

3. **Post-Authentication Access**
   - Dashboard
   - Agent chat
   - Bounty creation and management
   - Profile management

## Implementation Details

### Backend Token Verification

```typescript
// Extract token from authorization header
const extractTokenFromHeader = (req: Request): string | null => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  
  const match = authHeader.match(/^Bearer\s+(.*)$/i);
  return match ? match[1] : null;
};

// Verify token using Privy SDK
const verifyToken = async (token: string): Promise<ExtendedAuthTokenClaims> => {
  try {
    const privy = new PrivyClient(
      process.env.PRIVY_APP_ID!,
      process.env.PRIVY_APP_SECRET!,
      { apiURL: process.env.PRIVY_API_URL }
    );
    
    const claims = await privy.verifyAuthToken(token);
    return claims;
  } catch (error) {
    console.error('Token verification failed:', error);
    throw new Error('Token verification failed');
  }
};
```

### User Object Creation

```typescript
// Create user object from token claims
const createUserFromClaims = (claims: ExtendedAuthTokenClaims): User => {
  // Extract user ID from sub field (format: did:privy:userId)
  const userId = claims.sub.split(':').pop() || '';
  
  // Get linked accounts
  const linkedAccounts = claims.linked_accounts || [];
  
  // Find email account
  const emailAccount = linkedAccounts.find(account => account.type === 'email');
  const email = emailAccount ? emailAccount.email : null;
  
  // Find wallet accounts
  const walletAccounts = linkedAccounts.filter(account => account.type === 'wallet');
  const walletAddresses = walletAccounts.map(account => account.address);
  
  return {
    id: userId,
    email,
    walletAddresses,
    // Add other user properties as needed
  };
};
```

### Frontend Integration

```typescript
// Privy Provider setup in _app.tsx or layout.tsx
import { PrivyProviderBase } from '@privy-io/react-auth';

const App = ({ Component, pageProps }) => {
  return (
    <PrivyProviderBase
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ''}
      config={{
        loginMethods: ['email', 'google', 'discord', 'telegram', 'wallet'],
        appearance: {
          theme: 'dark',
          accentColor: '#6366F1', // Indigo color
          logo: '/logo.svg',
        },
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
        },
      }}
    >
      <AuthProvider>
        <Component {...pageProps} />
      </AuthProvider>
    </PrivyProviderBase>
  );
};
```

## Environment Variables

### Backend Variables

```
PRIVY_APP_ID=your-privy-app-id
PRIVY_APP_SECRET=your-privy-app-secret
PRIVY_PUBLIC_KEY=your-privy-public-key
PRIVY_API_URL=https://auth.privy.io/api (optional, defaults to production)
```

### Frontend Variables

```
NEXT_PUBLIC_PRIVY_APP_ID=your-privy-app-id
NEXT_PUBLIC_SKIP_AUTH_DURING_BUILD=true
```

## Security Considerations

1. **Token Security**
   - JWT tokens are verified using Privy's JWKS endpoint
   - Automatic key rotation is handled by Privy
   - Tokens have appropriate expiration times

2. **User Data Protection**
   - Sensitive user data is not stored in the token
   - Email addresses and wallet information are handled securely

3. **Error Handling**
   - Comprehensive error handling for token verification
   - Detailed logging for debugging (in development)
   - Type-safe error handling

## Troubleshooting

For common authentication issues and their solutions, refer to the [Authentication Troubleshooting Guide](/docs/auth-troubleshooting.md).

## Recent Fixes and Improvements

The authentication system has been recently improved with:

1. **JWT Structure Handling**
   - Updated the `ExtendedAuthTokenClaims` interface to match Privy's JWT structure
   - Correctly extracting the user ID from the `sub` field (format: `did:privy:<userId>`)
   - Added backward compatibility fields for existing code

2. **User Object Creation**
   - Enhanced extraction of user data from linked accounts
   - Added better fallback mechanisms in the handler
   - Fixed the "Unauthorized - no user object" error during user synchronization

3. **Code Optimization**
   - Removed excessive logging
   - Made the code more concise and maintainable
   - Added proper documentation

## Future Enhancements

1. **Multi-chain Support**
   - Support for additional blockchain networks
   - Cross-chain authentication

2. **Enhanced User Profiles**
   - More detailed user profiles linked to wallet addresses
   - Reputation system integration

3. **Advanced Security Features**
   - Additional security measures for high-value transactions
   - Optional multi-factor authentication
