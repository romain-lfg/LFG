# Authentication Testing Guide

This guide provides comprehensive instructions for testing the Privy authentication system in the LFG application. It covers unit testing, integration testing, and end-to-end testing approaches.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Unit Testing](#unit-testing)
3. [Integration Testing](#integration-testing)
4. [End-to-End Testing](#end-to-end-testing)
5. [Continuous Integration](#continuous-integration)
6. [Troubleshooting](#troubleshooting)

## Prerequisites

Before running the tests, ensure you have the following:

- Node.js (v16+) installed
- All dependencies installed (`npm install`)
- Environment variables properly configured
- Backend server running (for integration and E2E tests)

## Unit Testing

Unit tests verify that individual components and functions work correctly in isolation.

### Running Unit Tests

```bash
# Run all auth-related unit tests
npm run test:unit -- --testPathPattern=auth

# Run specific component tests
npm run test:unit -- --testPathPattern=LoginButton
```

### Testing Authentication Components

We have unit tests for all authentication components:

- `LoginButton.test.tsx`: Tests login functionality and loading states
- `LogoutButton.test.tsx`: Tests logout functionality and loading states
- `UserProfile.test.tsx`: Tests user profile display with different user data
- `ProtectedRoute.test.tsx`: Tests route protection based on authentication state
- `AuthStatus.test.tsx`: Tests conditional rendering based on auth state
- `withAuth.test.tsx`: Tests the higher-order component for page protection

### Testing Authentication Utilities

We also have tests for authentication utility functions:

- `formatWalletAddress.test.ts`: Tests wallet address formatting
- `hasRole.test.ts`: Tests role checking functionality
- `isAdmin.test.ts`: Tests admin role verification
- `getUserDisplayName.test.ts`: Tests user display name retrieval
- `parseJwt.test.ts`: Tests JWT parsing functionality
- `isTokenExpired.test.ts`: Tests token expiration checking

### Mocking Authentication Context

For component tests, we mock the authentication context:

```typescript
// Example of mocking authentication context
jest.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    authenticated: true,
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
      walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
      roles: ['user'],
    },
    login: jest.fn(),
    logout: jest.fn(),
    loading: false,
  }),
}));
```

## Integration Testing

Integration tests verify that different parts of the system work together correctly.

### Running Integration Tests

```bash
# Run all auth-related integration tests
npm run test:integration -- --testPathPattern=auth

# Run the authentication flow test script
node scripts/test-auth.js
```

### Authentication Flow Testing

The `scripts/test-auth.js` script tests the complete authentication flow:

1. Backend health check
2. Test token generation
3. Token verification
4. User data synchronization
5. User profile retrieval
6. Protected route access
7. Logout and token invalidation

### API Testing

We test the authentication API endpoints:

- `POST /api/auth/login`: Tests login functionality
- `POST /api/auth/logout`: Tests logout functionality
- `GET /api/auth/verify`: Tests token verification
- `POST /api/users/sync`: Tests user data synchronization
- `GET /api/users/me`: Tests user profile retrieval
- `GET /api/protected`: Tests protected route access

## End-to-End Testing

End-to-end tests verify that the entire application works correctly from the user's perspective.

### Running E2E Tests

```bash
# Start the application in test mode
npm run dev:test

# In another terminal, run the E2E tests
npm run test:e2e -- --testPathPattern=auth
```

### Authentication E2E Test Scenarios

1. **User Registration and Login**:
   - Navigate to the homepage
   - Click "Get Started"
   - Complete the registration process
   - Verify redirect to dashboard
   - Logout and login again

2. **Protected Route Access**:
   - Attempt to access dashboard without authentication
   - Verify redirect to login page
   - Login and verify access to dashboard

3. **User Profile Management**:
   - Login to the application
   - Navigate to profile page
   - Update profile information
   - Verify changes are saved

4. **Wallet Connection**:
   - Login to the application
   - Connect a wallet
   - Verify wallet address is displayed
   - Disconnect wallet and verify state change

### Using Cypress for E2E Testing

We use Cypress for end-to-end testing:

```typescript
// Example Cypress test for authentication
describe('Authentication', () => {
  it('should redirect to login when accessing protected route', () => {
    cy.visit('/dashboard');
    cy.url().should('include', '/login');
    cy.contains('Please login to continue');
  });

  it('should allow access to dashboard after login', () => {
    cy.login('test@example.com', 'password');
    cy.visit('/dashboard');
    cy.url().should('include', '/dashboard');
    cy.contains('Welcome to your dashboard');
  });
});
```

## Continuous Integration

We run authentication tests as part of our CI/CD pipeline.

### GitHub Actions Workflow

```yaml
name: Authentication Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'
      - name: Install dependencies
        run: npm ci
      - name: Run unit tests
        run: npm run test:unit -- --testPathPattern=auth
      - name: Start backend server
        run: npm run start:backend &
      - name: Wait for backend
        run: sleep 10
      - name: Run integration tests
        run: node scripts/test-auth.js
      - name: Run E2E tests
        run: npm run test:e2e -- --testPathPattern=auth
```

## Troubleshooting

If you encounter issues with authentication tests, try these steps:

### Common Issues and Solutions

1. **Tests failing due to environment variables**:
   - Run `node scripts/verify-privy-env.js` to check environment variables
   - Ensure all required variables are set correctly

2. **Integration tests failing**:
   - Verify the backend server is running
   - Check backend logs for errors
   - Run `node scripts/debug-auth.js` for detailed diagnostics

3. **E2E tests failing**:
   - Check browser console for errors
   - Verify the application is running in test mode
   - Check for network issues or CORS errors

4. **Mock authentication not working**:
   - Verify the mock implementation matches the actual implementation
   - Check for changes in the authentication context

### Debugging Tools

- **Authentication Debugging Script**:
  ```bash
  node scripts/debug-auth.js
  ```

- **Authentication Monitoring Script**:
  ```bash
  node scripts/monitor-auth.js --verbose
  ```

- **Environment Variables Verification**:
  ```bash
  node scripts/verify-privy-env.js
  ```

### Getting Help

If you're still having issues, consult:

1. The [Auth Troubleshooting Guide](./auth-troubleshooting.md)
2. The Privy documentation
3. Open an issue in the project repository

## Best Practices

1. **Always test with fresh tokens**: Don't reuse tokens between tests
2. **Clean up test data**: Remove test users after testing
3. **Test edge cases**: Test with expired tokens, invalid tokens, etc.
4. **Test error handling**: Verify that error messages are displayed correctly
5. **Test loading states**: Verify that loading indicators are displayed during authentication operations
