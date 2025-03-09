# Privy Implementation Guide

This guide provides a comprehensive overview of the Privy implementation in the LFG application, including setup, configuration, and usage.

## Overview

LFG uses Privy.io for authentication and wallet management. Privy provides a secure and flexible authentication solution with multiple login methods, including email, social login, and wallet connection. It also provides wallet management features, allowing users to create embedded wallets or connect existing wallets.

## Setup and Configuration

### Frontend Setup

1. **Install Dependencies**:
   ```bash
   npm install @privy-io/react-auth
   ```

2. **Configure Privy Provider**:
   ```tsx
   // src/providers/PrivyProvider.tsx
   import { PrivyProvider } from '@privy-io/react-auth';
   import { useRouter } from 'next/router';

   export const AppPrivyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
     const router = useRouter();

     return (
       <PrivyProvider
         appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
         onSuccess={() => router.push('/dashboard')}
         config={{
           loginMethods: ['email', 'google', 'wallet'],
           appearance: {
             theme: 'light',
             accentColor: '#6366F1',
             logo: '/logo.svg',
           },
         }}
       >
         {children}
       </PrivyProvider>
     );
   };
   ```

3. **Wrap Application with Privy Provider**:
   ```tsx
   // src/pages/_app.tsx
   import { AppPrivyProvider } from '../providers/PrivyProvider';

   function MyApp({ Component, pageProps }) {
     return (
       <AppPrivyProvider>
         <Component {...pageProps} />
       </AppPrivyProvider>
     );
   }

   export default MyApp;
   ```

### Backend Setup

1. **Install Dependencies**:
   ```bash
   npm install @privy-io/server-auth
   ```

2. **Configure Privy Client**:
   ```typescript
   // src/services/auth.service.ts
   import { PrivyClient } from '@privy-io/server-auth';

   export class AuthService {
     private privyClient: PrivyClient;

     constructor() {
       this.privyClient = new PrivyClient(
         process.env.PRIVY_APP_ID!,
         process.env.PRIVY_APP_SECRET!
       );
     }

     // Service methods...
   }
   ```

3. **Create Authentication Middleware**:
   ```typescript
   // src/middleware/auth.middleware.ts
   import { Request, Response, NextFunction } from 'express';
   import { PrivyClient } from '@privy-io/server-auth';

   export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
     try {
       // Check for authorization header
       const authHeader = req.headers.authorization;
       if (!authHeader) {
         return res.status(401).json({
           error: 'Unauthorized',
           message: 'No authorization token provided',
         });
       }

       // Extract token
       const parts = authHeader.split(' ');
       if (parts.length !== 2 || parts[0] !== 'Bearer') {
         return res.status(401).json({
           error: 'Unauthorized',
           message: 'Invalid authorization header format',
         });
       }
       const token = parts[1];

       // Verify token
       const privyClient = new PrivyClient(
         process.env.PRIVY_APP_ID!,
         process.env.PRIVY_APP_SECRET!
       );
       const verifiedClaims = await privyClient.verifyAuthToken(token, process.env.PRIVY_PUBLIC_KEY!);

       // Get user from Privy
       const user = await privyClient.getUser(verifiedClaims.userId);

       // Attach user to request
       req.user = user;
       req.userId = verifiedClaims.userId;

       next();
     } catch (error: any) {
       if (error.message.includes('token')) {
         return res.status(401).json({
           error: 'Unauthorized',
           message: error.message,
         });
       }
       return res.status(500).json({
         error: 'Internal Server Error',
         message: 'An unexpected error occurred during authentication',
       });
     }
   };
   ```

## Usage

### Authentication

1. **Login Button**:
   ```tsx
   import { usePrivy } from '@privy-io/react-auth';

   const LoginButton = () => {
     const { login } = usePrivy();

     return (
       <button
         onClick={login}
         className="btn btn-primary"
       >
         Sign In
       </button>
     );
   };
   ```

2. **Logout Button**:
   ```tsx
   import { usePrivy } from '@privy-io/react-auth';

   const LogoutButton = () => {
     const { logout } = usePrivy();

     return (
       <button
         onClick={logout}
         className="btn btn-secondary"
       >
         Sign Out
       </button>
     );
   };
   ```

3. **Protected Routes**:
   ```tsx
   import { usePrivy } from '@privy-io/react-auth';
   import { useRouter } from 'next/router';
   import { useEffect } from 'react';

   const ProtectedRoute = ({ children }) => {
     const { isAuthenticated, isLoading } = usePrivy();
     const router = useRouter();

     useEffect(() => {
       if (!isLoading && !isAuthenticated) {
         router.push('/login');
       }
     }, [isAuthenticated, isLoading, router]);

     if (isLoading) {
       return <div>Loading...</div>;
     }

     return isAuthenticated ? children : null;
   };
   ```

### Wallet Management

1. **Connect Wallet**:
   ```tsx
   import { usePrivy } from '@privy-io/react-auth';

   const ConnectWalletButton = () => {
     const { linkWallet } = usePrivy();

     return (
       <button
         onClick={linkWallet}
         className="btn btn-primary"
       >
         Connect Wallet
       </button>
     );
   };
   ```

2. **Create Wallet**:
   ```tsx
   import { usePrivy } from '@privy-io/react-auth';

   const CreateWalletButton = () => {
     const { createWallet } = usePrivy();

     return (
       <button
         onClick={createWallet}
         className="btn btn-primary"
       >
         Create Wallet
       </button>
     );
   };
   ```

3. **Get Connected Wallets**:
   ```tsx
   import { usePrivy } from '@privy-io/react-auth';

   const WalletList = () => {
     const { user } = usePrivy();
     const connectedWallets = user?.linkedAccounts?.filter(account => account.type === 'wallet') || [];

     return (
       <div>
         <h2>Connected Wallets</h2>
         <ul>
           {connectedWallets.map((wallet: any) => (
             <li key={wallet.address}>
               {wallet.address}
             </li>
           ))}
         </ul>
       </div>
     );
   };
   ```

## API Reference

### Frontend

1. **usePrivy Hook**:
   - `isAuthenticated`: Boolean indicating if the user is authenticated
   - `isLoading`: Boolean indicating if authentication state is loading
   - `user`: User object containing user information
   - `login`: Function to initiate login flow
   - `logout`: Function to log out the user
   - `createWallet`: Function to create an embedded wallet
   - `linkWallet`: Function to connect an existing wallet

### Backend

1. **PrivyClient**:
   - `verifyAuthToken(token, publicKey)`: Verify a JWT token
   - `getUser(userId)`: Get user information from Privy
   - `createUser(params)`: Create a new user in Privy
   - `updateUser(userId, params)`: Update user information in Privy

## Environment Variables

### Frontend

- `NEXT_PUBLIC_PRIVY_APP_ID`: Privy application ID

### Backend

- `PRIVY_APP_ID`: Privy application ID
- `PRIVY_APP_SECRET`: Privy application secret
- `PRIVY_PUBLIC_KEY`: Privy public key for token verification

## Testing

See the [Testing and Monitoring Guide](./testing-and-monitoring-guide.md) for information about testing the Privy implementation.

## Monitoring

See the [Testing and Monitoring Guide](./testing-and-monitoring-guide.md) for information about monitoring the Privy implementation.

## Troubleshooting

### Common Issues

1. **Token Verification Fails**:
   - Check that the `PRIVY_PUBLIC_KEY` environment variable is set correctly
   - Check that the token is being passed correctly in the Authorization header
   - Check that the token has not expired

2. **Wallet Connection Fails**:
   - Check that the wallet provider is available
   - Check that the user has the required browser extension installed
   - Check for browser console errors

3. **User Data Synchronization Issues**:
   - Check that the Privy API is accessible
   - Check that the `PRIVY_APP_ID` and `PRIVY_APP_SECRET` environment variables are set correctly
   - Check for network errors in the browser console or server logs

### Debugging

1. **Enable Debug Logging**:
   ```typescript
   // Frontend
   localStorage.setItem('privy:debug', 'true');

   // Backend
   process.env.DEBUG = 'privy:*';
   ```

2. **Check Browser Console**:
   - Look for errors or warnings related to Privy
   - Check network requests to the Privy API

3. **Check Server Logs**:
   - Look for errors or warnings related to Privy
   - Check for token verification failures
   - Check for user data synchronization issues
