# Comprehensive Authentication Testing Guide

This document provides a comprehensive guide to testing the authentication system in the LFG application. It covers all aspects of authentication testing, from unit tests to integration tests, and provides guidance on how to run and maintain these tests.

## Table of Contents

1. [Authentication Test Coverage](#authentication-test-coverage)
2. [Unit Tests](#unit-tests)
3. [Integration Tests](#integration-tests)
4. [API Tests](#api-tests)
5. [End-to-End Tests](#end-to-end-tests)
6. [Running Tests](#running-tests)
7. [Maintaining Tests](#maintaining-tests)
8. [Test Fixtures](#test-fixtures)
9. [Mocking Strategies](#mocking-strategies)
10. [Troubleshooting](#troubleshooting)

## Authentication Test Coverage

Our authentication testing strategy ensures comprehensive coverage of all authentication components and flows:

### Frontend Components
- **Auth Components**: LoginButton, LogoutButton, UserProfile, AuthStatus
- **Higher-Order Components**: withAuth HOC
- **Protected Routes**: ProtectedRoute component
- **Context Providers**: AuthProvider, useAuth hook

### Backend Components
- **API Endpoints**: /auth/verify, /auth/user/:id
- **Middleware**: Authentication middleware
- **Database Integration**: User creation, retrieval, and updates

### Authentication Flows
- **Login Flow**: From unauthenticated to authenticated state
- **Logout Flow**: From authenticated to unauthenticated state
- **Token Verification**: Validation of JWT tokens
- **Role-Based Access Control**: Admin vs. regular user access
- **Wallet Integration**: Handling of connected wallets

## Unit Tests

Unit tests focus on testing individual components and functions in isolation.

### Component Tests

We have unit tests for all authentication-related components:

1. **Auth Components Tests** (`auth-components.test.tsx`):
   - Tests for LoginButton, LogoutButton, UserProfile, and AuthStatus components
   - Verifies conditional rendering based on authentication state
   - Tests component interactions (clicks, etc.)

2. **Protected Route Tests** (`protected-route.test.tsx`):
   - Tests for the ProtectedRoute component
   - Verifies redirection for unauthenticated users
   - Tests role-based access control

3. **withAuth HOC Tests** (`withAuth.test.tsx`):
   - Tests for the withAuth higher-order component
   - Verifies proper wrapping of components
   - Tests authentication state handling

4. **Loading Spinner Tests** (`LoadingSpinner.test.tsx`):
   - Tests for the loading indicator used during authentication state changes
   - Verifies different sizes and colors

### Hook Tests

1. **Auth Context Tests** (`AuthContext.test.tsx`):
   - Tests for the AuthProvider and useAuth hook
   - Verifies context initialization and state management
   - Tests error handling when used outside provider

2. **Auth Redirect Tests** (`useAuthRedirect.test.ts`):
   - Tests for the useAuthRedirect hook
   - Verifies redirection logic based on authentication state and roles

3. **Privy Auth Tests** (`usePrivyAuth.test.tsx`):
   - Tests for the Privy authentication integration
   - Verifies token handling and user synchronization

### Utility Tests

1. **Auth Utilities Tests** (`auth.test.ts`):
   - Tests for utility functions like formatWalletAddress, hasRole, isAdmin
   - Verifies JWT parsing and token expiration checking

## Integration Tests

Integration tests verify that different components work together correctly.

1. **Authentication Flow Tests** (`auth-flow.test.tsx`):
   - Tests the complete authentication flow from login to logout
   - Verifies state transitions and component interactions
   - Tests role-based content rendering
   - Tests wallet connection status handling

## API Tests

API tests verify that the backend authentication endpoints work correctly.

1. **Auth API Tests** (`auth-api.test.js`):
   - Tests for the /auth/verify endpoint
   - Tests for the /auth/user/:id endpoint
   - Tests for the authentication middleware
   - Verifies token validation and user data handling
   - Tests error handling for invalid tokens and missing data

## End-to-End Tests

End-to-end tests verify the complete user journey through the application.

*Note: These tests would typically be implemented using tools like Cypress or Playwright. The implementation details are outside the scope of this document.*

Scenarios to test:
1. User registration and login
2. Protected page access
3. Role-based access control
4. Wallet connection and management
5. Session persistence and expiration

## Running Tests

To run the authentication tests:

### Frontend Tests

```bash
# Run all tests
cd frontend
npm test

# Run specific test file
npm test -- src/components/auth/__tests__/auth-components.test.tsx

# Run tests with coverage
npm test -- --coverage
```

### Backend Tests

```bash
# Run all tests
cd backend
npm test

# Run specific test file
npm test -- tests/auth/auth-api.test.js
```

## Maintaining Tests

Guidelines for maintaining authentication tests:

1. **Test Coverage**: Aim for >90% code coverage for authentication components.
2. **Test Independence**: Each test should be independent and not rely on the state from other tests.
3. **Mock External Services**: Always mock external services like Privy API calls.
4. **Update Tests with Code Changes**: When changing authentication logic, update the corresponding tests.
5. **Test Edge Cases**: Include tests for error conditions and edge cases.

## Test Fixtures

Common test fixtures used in authentication tests:

1. **Mock Users**:
   - Regular user: `{ id: 'user-123', metadata: { role: 'user' } }`
   - Admin user: `{ id: 'admin-123', metadata: { role: 'admin' } }`

2. **Mock Tokens**:
   - Valid token: Generated with appropriate claims and expiration
   - Expired token: Token with past expiration time
   - Invalid token: Malformed token string

3. **Mock Wallets**:
   - Connected wallet: `{ address: '0x1234567890abcdef1234567890abcdef12345678' }`
   - No wallet: `null`

## Mocking Strategies

Strategies for mocking authentication dependencies:

1. **Privy SDK**:
   - Mock the `usePrivy` hook to return controlled authentication states
   - Mock the `PrivyClient` for backend tests

2. **Next.js Router**:
   - Mock the `useRouter` hook to verify redirections

3. **Axios/Fetch**:
   - Mock API calls to test error handling and response processing

4. **Database**:
   - Mock Supabase client for database operations

## Troubleshooting

Common issues and solutions when working with authentication tests:

1. **Test Environment Variables**:
   - Ensure all required environment variables are set in the test environment
   - Use a `.env.test` file for test-specific variables

2. **Mocking Issues**:
   - Verify that all external dependencies are properly mocked
   - Check that mock implementations match the expected interface

3. **Asynchronous Testing**:
   - Use `act()` for state updates in React component tests
   - Use `waitFor()` to wait for asynchronous operations to complete

4. **JWT Testing**:
   - Use a library like `jsonwebtoken` to create valid test tokens
   - Mock the token verification process in tests

5. **Test Isolation**:
   - Reset mocks between tests with `jest.clearAllMocks()`
   - Avoid shared state between tests

---

By following this comprehensive testing guide, we ensure that our authentication system is robust, secure, and functions correctly across all parts of the application.
