# Privy Authentication Implementation Guide

## Overview

This guide provides a comprehensive overview of the Privy authentication system implementation for the LFG platform. It covers the backend and frontend integration, testing procedures, and deployment considerations.

## Table of Contents

1. [Architecture](#architecture)
2. [Backend Implementation](#backend-implementation)
3. [Frontend Integration](#frontend-integration)
4. [Testing](#testing)
5. [Deployment](#deployment)
6. [Monitoring](#monitoring)
7. [Troubleshooting](#troubleshooting)

## Architecture

The authentication system uses Privy.io as the primary authentication service, with user data synchronized to Supabase PostgreSQL database. The architecture follows these principles:

- **Token-based authentication**: JWT tokens are verified on the backend
- **Role-based access control**: Different user roles have different access levels
- **User data synchronization**: User data is synced between Privy and Supabase
- **Secure token handling**: Tokens are securely verified and managed

### Key Components

1. **Authentication Middleware**: Verifies JWT tokens and adds user data to requests
2. **User Service**: Handles user data synchronization with Supabase
3. **Protected Routes**: Routes that require authentication
4. **Role-based Middleware**: Controls access based on user roles

## Backend Implementation

### Prerequisites

- Node.js (v16+)
- Express.js
- Privy SDK
- Supabase SDK

### Environment Variables

```
# Privy Configuration
PRIVY_APP_ID=your-privy-app-id
PRIVY_APP_SECRET=your-privy-app-secret
PRIVY_PUBLIC_KEY=your-privy-public-key

# Supabase Configuration
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Server Configuration
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000
```

### Authentication Middleware

The authentication middleware verifies the JWT token from the request headers and adds the user data to the request object:

```typescript
import { Request, Response, NextFunction } from 'express';
import { PrivyClient } from '@privy-io/server-auth';

// Initialize Privy client
const privyClient = new PrivyClient(
  process.env.PRIVY_APP_ID!,
  process.env.PRIVY_APP_SECRET
);

export const authenticateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify token
    const verifiedClaims = await privyClient.verifyAuthToken(
      token,
      process.env.PRIVY_PUBLIC_KEY!
    );
    
    // Add user to request object
    req.user = {
      id: verifiedClaims.userId,
      role: verifiedClaims.role || 'user',
    };
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};
```

### Role-based Access Control

The role-based middleware restricts access to certain routes based on user roles:

```typescript
export const hasRole = (role: string) => (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized: User not authenticated' });
  }
  
  if (req.user.role !== role) {
    return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
  }
  
  next();
};
```

### User Service

The user service handles user data synchronization with Supabase:

```typescript
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export class UserService {
  async syncUser(userId: string, userData: any) {
    // Check if user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (existingUser) {
      // Update existing user
      const { data, error } = await supabase
        .from('users')
        .update(userData)
        .eq('id', userId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } else {
      // Create new user
      const { data, error } = await supabase
        .from('users')
        .insert({ id: userId, ...userData })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    }
  }
  
  async getUserById(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return data;
  }
}
```

### Protected Routes

Example of protected routes implementation:

```typescript
import express from 'express';
import { authenticateUser, hasRole } from '../middleware/auth.middleware';
import { UserController } from '../controllers/user.controller';

const router = express.Router();
const userController = new UserController();

// Public routes
router.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

// Protected routes
router.get('/profile', authenticateUser, userController.getProfile);
router.post('/sync', authenticateUser, userController.syncUser);

// Admin routes
router.get('/admin/users', authenticateUser, hasRole('admin'), userController.getAllUsers);

export default router;
```

## Frontend Integration

### Prerequisites

- React.js
- Privy React SDK

### Installation

```bash
npm install @privy-io/react-auth
```

### Authentication Context

Create an authentication context to manage authentication state:

```jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const { user, authenticated, login, logout, getAccessToken } = usePrivy();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const syncUser = async () => {
      if (authenticated && user) {
        try {
          const token = await getAccessToken();
          
          // Set token in API service
          api.setToken(token);
          
          // Sync user data with backend
          const response = await api.post('/users/sync', {
            walletAddress: user.wallet?.address,
            email: user.email?.address,
            metadata: {
              name: user.name,
            },
          });
          
          setUserData(response.data.user);
        } catch (error) {
          console.error('Error syncing user:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setUserData(null);
        setLoading(false);
      }
    };
    
    syncUser();
  }, [authenticated, user, getAccessToken]);

  return (
    <AuthContext.Provider
      value={{
        user: userData,
        loading,
        login,
        logout,
        isAuthenticated: authenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
```

### Protected Route Component

Create a protected route component to restrict access to authenticated users:

```jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return children;
};
```

### API Service

Create an API service to handle authenticated requests:

```jsx
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

class ApiService {
  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
    });
    
    this.token = null;
  }
  
  setToken(token) {
    this.token = token;
    this.api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
  
  clearToken() {
    this.token = null;
    delete this.api.defaults.headers.common['Authorization'];
  }
  
  async get(url, config = {}) {
    return this.api.get(url, config);
  }
  
  async post(url, data, config = {}) {
    return this.api.post(url, data, config);
  }
  
  async put(url, data, config = {}) {
    return this.api.put(url, data, config);
  }
  
  async delete(url, config = {}) {
    return this.api.delete(url, config);
  }
}

export default new ApiService();
```

### Usage in Components

Example usage in a component:

```jsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

export const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/users/profile');
        setData(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  return (
    <div>
      <h1>Welcome, {user.name || 'User'}</h1>
      <p>Email: {user.email}</p>
      <p>Wallet: {user.walletAddress}</p>
      {/* Display other data */}
    </div>
  );
};
```

## Testing

### Backend Testing

Use the provided test scripts to verify the authentication system:

1. **Authentication Tests**: Tests the authentication middleware and service
   ```bash
   cd backend && npm test
   ```

The tests verify the following functionality:

- Token extraction and validation from request headers
- User authentication with valid tokens
- Proper error handling for missing or invalid tokens
- User details retrieval after successful authentication

### Frontend Testing

1. **Authentication Context Test**: Test the authentication context with React Testing Library
2. **Protected Route Test**: Test the protected route component
3. **API Service Test**: Test the API service with mock responses

## Deployment

### Backend Deployment

1. Set up environment variables in your production environment
2. Build the TypeScript code
   ```bash
   npm run build
   ```
3. Start the server
   ```bash
   npm run start
   ```

### Frontend Deployment

1. Set up environment variables in your production environment
2. Build the React application
   ```bash
   npm run build
   ```
3. Deploy the built files to your hosting service

## Monitoring

Use the provided monitoring script to monitor the authentication system in production:

```bash
node scripts/monitor-auth.js
```

This script checks:
- API health
- Authentication endpoints
- Authentication failures
- Suspicious activity

## Troubleshooting

### Common Issues

1. **Token Verification Fails**
   - Check that the `PRIVY_PUBLIC_KEY` is correctly set
   - Ensure the token is being passed correctly in the Authorization header
   - Verify that the token is not expired

2. **User Data Synchronization Issues**
   - Check Supabase connection settings
   - Verify that the user table has the correct schema
   - Check for database permission issues

3. **Role-based Access Control Issues**
   - Ensure that user roles are correctly set in the token
   - Verify that the role-based middleware is correctly implemented
   - Check for typos in role names

### Debugging

1. Enable debug logging in the authentication middleware
2. Use the monitoring script to check for authentication failures
3. Check the server logs for error messages

## Conclusion

This guide provides a comprehensive overview of the Privy authentication system implementation. By following these guidelines, you can successfully implement and maintain a secure authentication system for your application.

For more information, refer to the following resources:
- [Privy Documentation](https://docs.privy.io/)
- [Supabase Documentation](https://supabase.io/docs)
- [Express.js Documentation](https://expressjs.com/)
- [React.js Documentation](https://reactjs.org/docs/getting-started.html)
