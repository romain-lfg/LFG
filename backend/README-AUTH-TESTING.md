# LFG Authentication Testing Guide

This guide provides instructions for testing the Privy authentication system integration in the LFG platform.

## Prerequisites

- Node.js installed
- Backend and frontend code cloned
- Required environment variables set

## Testing the Backend Authentication

### 1. Basic API Test

Run the basic API test server to verify that environment variables are loaded correctly:

```bash
cd backend
node test-auth.js
```

Then test the API endpoint:

```bash
curl http://localhost:3002/api/test
```

### 2. User Routes Test

Run the user routes test server to verify that the user-related endpoints are working:

```bash
cd backend
node test-user-routes.js
```

Test the endpoints:

```bash
# Test API status
curl http://localhost:3003/api/test

# Test authenticated endpoint
curl http://localhost:3003/api/auth/test

# Test user sync endpoint
curl -X POST -H "Content-Type: application/json" -d '{"walletAddress":"0xnewaddress", "email":"new@example.com", "metadata":{"name":"Test User"}}' http://localhost:3003/api/users/sync

# Test user profile endpoint
curl http://localhost:3003/api/users/profile
```

### 3. Complete Authentication Flow Test

Run the complete authentication flow test server:

```bash
cd backend
node test-auth-flow.js
```

Test the complete flow:

```bash
# Login
curl -X POST -H "Content-Type: application/json" -d '{"email":"test@example.com", "walletAddress":"0x123456789abcdef"}' http://localhost:3004/api/auth/login

# Use the token from the login response to access protected routes
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3004/api/users/profile

# Update user profile
curl -X PUT -H "Content-Type: application/json" -H "Authorization: Bearer YOUR_TOKEN" -d '{"metadata":{"name":"Test User", "bio":"A test user for the LFG platform"}}' http://localhost:3004/api/users/profile

# Sync user data
curl -X POST -H "Content-Type: application/json" -H "Authorization: Bearer YOUR_TOKEN" -d '{"walletAddress":"0xnewaddress", "metadata":{"skills":["JavaScript", "TypeScript", "React"]}}' http://localhost:3004/api/users/sync

# View all users (admin endpoint)
curl http://localhost:3004/api/admin/users
```

## Testing the Frontend Authentication

### 1. Run the Frontend Test Server

```bash
cd frontend
node test-server.js
```

### 2. Open the Test Page in Your Browser

Open [http://localhost:3000/test-auth.html](http://localhost:3000/test-auth.html) in your browser.

The test page provides two ways to test the authentication:

- **Automated Test**: Click the "Run Authentication Test" button to run the complete authentication flow automatically.
- **Manual Testing**: Use the form inputs and buttons to test each step of the authentication flow manually.

### 3. Frontend Integration Test Script

You can also use the test script in your frontend code:

```javascript
import testAuthIntegration from './test-auth-integration';

// Run the test
testAuthIntegration().then(result => {
  console.log('Test result:', result);
});
```

## Environment Variables

Make sure the following environment variables are set in your `.env.test` file:

```
# Server Configuration
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000

# Supabase Configuration
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-supabase-key

# Privy Configuration
PRIVY_APP_ID=your-privy-app-id
PRIVY_APP_SECRET=your-privy-app-secret
PRIVY_PUBLIC_KEY=your-privy-public-key
```

## Troubleshooting

### Common Issues

1. **Missing Environment Variables**: Make sure all required environment variables are set in your `.env.test` file.
2. **CORS Errors**: If you encounter CORS errors, make sure the CORS middleware is correctly configured in your Express app.
3. **Token Verification Errors**: Verify that the Privy public key is correctly set and that the token verification is using the correct parameters.

### Debugging Tips

- Use `console.log` statements to debug your code.
- Check the network tab in your browser's developer tools to see the requests and responses.
- Verify that the token is being correctly passed in the Authorization header.

## Next Steps

After successfully testing the authentication system, you can:

1. Integrate the authentication system with your main application.
2. Add more user-related endpoints as needed.
3. Implement role-based access control for different user types.
4. Add more comprehensive error handling and validation.
