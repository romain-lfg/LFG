# Authentication System

This directory contains the authentication system for the LFG platform, which uses Privy.io for user authentication and identity management.

## Overview

The authentication system consists of several components:

1. **Middleware**: Authenticates API requests by verifying JWT tokens
2. **Controller**: Handles authentication-related API endpoints
3. **Service**: Provides authentication-related business logic
4. **Routes**: Defines authentication-related API routes

## Key Components

### Auth Middleware

Located in `src/middleware/auth.middleware.ts`, this middleware:

- Extracts JWT tokens from request headers
- Verifies tokens using Privy's server SDK
- Attaches user information to the request object
- Handles authentication errors with appropriate responses

### Auth Controller

Located in `src/controllers/auth.controller.ts`, this controller:

- Handles token verification requests
- Manages user sessions
- Processes logout requests

### Auth Service

Located in `src/services/auth.service.ts`, this service:

- Verifies tokens using Privy's server SDK
- Retrieves user information
- Validates user sessions

### Auth Routes

Located in `src/routes/auth.routes.ts`, these routes:

- Define API endpoints for authentication operations
- Apply middleware for request validation and authentication

## API Endpoints

- `POST /api/auth/verify`: Verifies a token and returns authentication status
- `GET /api/auth/session`: Returns current session information
- `POST /api/auth/logout`: Logs out the current user
- `POST /api/users/sync`: Synchronizes user data with the database
- `GET /api/users/me`: Returns the current user's profile

## Wallet Management

The authentication system integrates with Privy's wallet management features, allowing users to:

1. **Connect Existing Wallets**: Users can connect their existing wallets from various providers
2. **Create Embedded Wallets**: New users can create embedded wallets through Privy
3. **Synchronize Wallet Data**: Wallet addresses are synchronized with our database and Nillion

Wallet operations are handled by the frontend using Privy's React SDK, and the backend stores wallet addresses in the PostgreSQL database.

## Nillion Integration

The authentication system integrates with Nillion for secure data storage and computation:

1. **User Data Synchronization**: User data is synchronized with Nillion when updated
2. **Secure Computation**: Nillion is used for secure computation on sensitive data
3. **Bounty Matching**: Nillion is used to match users with bounties based on their skills and preferences

Nillion integration is handled by the `NillionService` in `src/services/nillion.service.ts` and exposed through API endpoints in `src/routes/nillion.routes.ts`.
- `POST /api/auth/logout`: Handles user logout

## Environment Variables

The authentication system requires the following environment variables:

- `PRIVY_APP_ID`: Your Privy application ID
- `PRIVY_APP_SECRET`: Your Privy application secret
- `PRIVY_PUBLIC_KEY`: Your Privy public verification key

Additional environment variables for Nillion integration:

- `NILLION_API_KEY`: Your Nillion API key
- `NILLION_ENVIRONMENT`: The Nillion environment to use (e.g., 'production', 'development')

For logging configuration:

- `LOG_LEVEL`: The log level to use (ERROR, WARN, INFO, or DEBUG)

## Testing

Run the authentication tests using:

```bash
npm test
```

The tests are located in `src/tests/auth.test.ts` and cover:

- Token verification
- User authentication
- Error handling

## Integration with Frontend

The frontend uses the `useAuth` hook to manage authentication state and interact with these API endpoints. See the frontend documentation for more details on client-side authentication.
