# LFG Authentication System

## Overview

The LFG platform uses Privy.io for authentication, providing a secure and flexible authentication system that supports multiple login methods including email, social login (Google, Telegram), wallet connection, and embedded wallet creation for new users.

This README provides a comprehensive guide to the authentication system, including architecture, implementation details, testing procedures, and deployment considerations.

## Table of Contents

1. [Architecture](#architecture)
2. [Implementation](#implementation)
3. [User Flow](#user-flow)
4. [Testing](#testing)
5. [Deployment](#deployment)
6. [Monitoring](#monitoring)
7. [Troubleshooting](#troubleshooting)

## Architecture

### Components

1. **Privy.io**: Primary authentication service
   - Handles user authentication and wallet management
   - Provides JWT tokens for authenticated sessions
   - Supports multiple login methods

2. **Supabase PostgreSQL**: User data storage
   - Stores user metadata and relationships
   - Synchronized with Privy user data

3. **Nillion**: On-chain storage for sensitive data
   - Integrated with Privy for secure data handling

### Data Flow

```
Privy (Authentication) → PostgreSQL (User Management) → Nillion (Sensitive Data)
```

### Key Features

- **Token-based Authentication**: JWT tokens verified on the backend
- **Role-based Access Control**: Different user roles have different access levels
- **User Data Synchronization**: User data synced between Privy and Supabase
- **Wallet Management**: Every user has a wallet (created or connected)

## Implementation

### Backend Implementation

The backend implementation consists of the following components:

1. **Authentication Middleware**: Verifies JWT tokens and adds user data to requests
   - Located in `/backend/src/middleware/auth.middleware.ts`
   - Uses Privy SDK for token verification

2. **User Service**: Handles user data synchronization with Supabase
   - Located in `/backend/src/services/user.service.ts`
   - Syncs user data between Privy and Supabase

3. **Protected Routes**: Routes that require authentication
   - Located in `/backend/src/routes/user.routes.ts`
   - Uses authentication middleware for protection

4. **Role-based Middleware**: Controls access based on user roles
   - Part of the authentication middleware
   - Restricts access to certain routes based on user roles

### Frontend Implementation

The frontend implementation consists of the following components:

1. **Authentication Context**: Manages authentication state
   - Provides global access to authentication state
   - Handles login, logout, and token management

2. **Protected Routes**: Routes that require authentication
   - Redirects unauthenticated users to login page
   - Conditionally renders content based on authentication state

3. **User Interface Components**: UI components for authentication
   - Login buttons and forms
   - User profile display
   - Conditional rendering based on authentication state

## User Flow

### Public Access (Non-Authenticated Users)

- Can view: Home page, Bounty board (read-only)
- Cannot access: Dashboard, Agent chat, Create/Apply for bounties
- Primary CTA: "Get Started" button for authentication

### Authentication Flow

- Entry points:
  - Primary: "Get Started" button on homepage
  - Secondary: "Connect" button in navbar
- Methods supported:
  - Email
  - Social login (Google, Telegram)
  - Wallet connection
  - Embedded wallet creation for new users

### Post-Authentication Access

- Full access to:
  - Dashboard with personal stats and activity
  - Agent chat for profile updates and bounty matching
  - Bounty creation and application
  - Wallet operations for bounty management

### Data Flow on Authentication

1. User authenticates via Privy
2. Backend syncs user data with PostgreSQL
3. User ID links interactions across systems
4. Wallet address stored for bounty operations

## Testing

### Test Scripts

1. **Authentication Flow Test**: Tests the complete authentication flow
   - Located in `/backend/test/auth-flow-test.js`
   - Tests token verification, user data synchronization, protected route access, and role-based access control

2. **User Routes Test**: Tests the user-related API endpoints
   - Located in `/backend/test-user-routes.js`
   - Tests user profile retrieval and user data synchronization

3. **Monitoring Script**: Monitors the authentication system in production
   - Located in `/backend/scripts/monitor-auth.js`
   - Monitors API health, authentication endpoints, and authentication failures

### Running Tests

```bash
# Run authentication flow test
cd backend
node test/auth-flow-test.js

# Run user routes test
cd backend
node test-user-routes.js

# Run monitoring script
cd backend
node scripts/monitor-auth.js
```

### Environment Verification

Use the environment verification script to ensure all required environment variables are set:

```bash
cd backend
node scripts/verify-privy-env.js
```

## Deployment

### Environment Variables

Required environment variables for deployment:

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
FRONTEND_URL=https://your-frontend-url.com
```

### Deployment Steps

1. Set up environment variables in your production environment
2. Build the TypeScript code
   ```bash
   cd backend
   npm run build
   ```
3. Start the server
   ```bash
   npm run start
   ```

### Production Considerations

- Use HTTPS for all communication
- Set appropriate CORS headers
- Implement rate limiting for authentication endpoints
- Set up monitoring and alerting

## Monitoring

Use the monitoring script to monitor the authentication system in production:

```bash
cd backend
node scripts/monitor-auth.js
```

This script checks:
- API health
- Authentication endpoints
- Authentication failures
- Suspicious activity

### Alerting

The monitoring script can be configured to send alerts for authentication failures:

- Set `ALERT_THRESHOLD` to the number of failures before alerting
- Set `CHECK_INTERVAL` to the interval between checks
- Set `LOG_FILE` to the path for the log file

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

## Documentation

Additional documentation is available in the following files:

- [Authentication System Architecture](/docs/authentication-system.md)
- [Deployment Guide](/docs/deployment-guide.md)
- [Frontend Authentication Integration](/docs/frontend-auth-integration.md)
- [Authentication Security Checklist](/docs/auth-security-checklist.md)
- [Authentication Troubleshooting Guide](/docs/auth-troubleshooting.md)
- [Production Readiness Checklist](/docs/production-readiness-checklist.md)
- [Privy Authentication Implementation Guide](/docs/privy-auth-implementation-guide.md)
- [Privy Authentication Final Checklist](/docs/privy-auth-final-checklist.md)

## Support

For support with the authentication system, please contact the development team.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
