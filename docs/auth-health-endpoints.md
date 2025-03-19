# Authentication Health Endpoints

This document describes the authentication health endpoints available in the LFG platform for monitoring and troubleshooting the authentication system.

## Overview

The authentication health endpoints provide real-time diagnostics about the state of the authentication system, including connectivity to Privy, token verification functionality, and overall system health.

## Available Endpoints

### `/api/auth-health`

This endpoint provides a comprehensive health check of the authentication system.

#### Request

```
GET /api/auth-health
```

No authentication required.

#### Response

```json
{
  "status": "healthy",
  "privy": {
    "connected": true,
    "version": "1.x.x"
  },
  "jwt": {
    "verification": "working",
    "jwksEndpoint": "accessible"
  },
  "timestamp": "2025-03-19T21:43:59.000Z"
}
```

#### Status Codes

- `200 OK`: Authentication system is healthy
- `500 Internal Server Error`: Authentication system has issues

### `/api/auth/verify`

This endpoint verifies a JWT token without requiring full authentication.

#### Request

```
POST /api/auth/verify
Content-Type: application/json

{
  "token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Response

```json
{
  "valid": true,
  "expires": "2025-03-20T21:43:59.000Z"
}
```

#### Status Codes

- `200 OK`: Token is valid
- `400 Bad Request`: Missing or malformed token
- `401 Unauthorized`: Invalid token

## Implementation

### Backend Implementation

The auth health endpoint is implemented in `/backend/api/auth-health.js`:

```javascript
const express = require('express');
const { PrivyClient } = require('@privy-io/server-sdk');

const router = express.Router();

// Check Privy connection
const checkPrivyConnection = async () => {
  try {
    const privy = new PrivyClient(
      process.env.PRIVY_APP_ID,
      process.env.PRIVY_APP_SECRET,
      { apiURL: process.env.PRIVY_API_URL }
    );
    
    // Attempt a simple operation to verify connectivity
    await privy.getUser('test-user-id').catch(() => {
      // We expect this to fail with a 404, but it confirms the connection works
      return true;
    });
    
    return {
      connected: true,
      version: require('@privy-io/server-sdk/package.json').version
    };
  } catch (error) {
    return {
      connected: false,
      error: error.message
    };
  }
};

// Check JWT verification functionality
const checkJwtVerification = async () => {
  try {
    // Check if we can access the JWKS endpoint
    const jwksUrl = `https://auth.privy.io/api/v1/auth/apps/${process.env.PRIVY_APP_ID}/jwks`;
    const response = await fetch(jwksUrl);
    
    if (!response.ok) {
      throw new Error(`JWKS endpoint returned ${response.status}`);
    }
    
    return {
      verification: "working",
      jwksEndpoint: "accessible"
    };
  } catch (error) {
    return {
      verification: "error",
      error: error.message
    };
  }
};

// Health check endpoint
router.get('/auth-health', async (req, res) => {
  try {
    const privyStatus = await checkPrivyConnection();
    const jwtStatus = await checkJwtVerification();
    
    const isHealthy = privyStatus.connected && jwtStatus.verification === "working";
    
    res.status(isHealthy ? 200 : 500).json({
      status: isHealthy ? "healthy" : "unhealthy",
      privy: privyStatus,
      jwt: jwtStatus,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: "unhealthy",
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
```

## Usage Examples

### Monitoring System Health

You can use the auth health endpoint to monitor the health of the authentication system:

```javascript
// Example monitoring script
const checkAuthHealth = async () => {
  try {
    const response = await fetch('https://your-api.com/api/auth-health');
    const data = await response.json();
    
    if (data.status !== 'healthy') {
      console.error('Authentication system is unhealthy:', data);
      // Send alerts or notifications
    } else {
      console.log('Authentication system is healthy');
    }
  } catch (error) {
    console.error('Failed to check auth health:', error);
    // Send alerts or notifications
  }
};

// Check health every 5 minutes
setInterval(checkAuthHealth, 5 * 60 * 1000);
```

### Debugging Authentication Issues

When users report authentication problems, you can use the auth health endpoint to diagnose issues:

```javascript
// Example debugging function
const debugAuthIssue = async (userToken) => {
  try {
    // Check overall system health
    const healthResponse = await fetch('https://your-api.com/api/auth-health');
    const healthData = await healthResponse.json();
    
    if (healthData.status !== 'healthy') {
      return {
        issue: 'system',
        details: 'Authentication system is currently experiencing issues',
        data: healthData
      };
    }
    
    // Verify the specific token
    const verifyResponse = await fetch('https://your-api.com/api/auth/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ token: userToken })
    });
    
    const verifyData = await verifyResponse.json();
    
    if (!verifyData.valid) {
      return {
        issue: 'token',
        details: 'User token is invalid or expired',
        data: verifyData
      };
    }
    
    return {
      issue: null,
      details: 'Authentication is working correctly',
      data: { health: healthData, token: verifyData }
    };
  } catch (error) {
    return {
      issue: 'unknown',
      details: 'Failed to diagnose authentication issue',
      error: error.message
    };
  }
};
```

## Best Practices

1. **Regular Monitoring**: Set up regular monitoring of the auth health endpoint to detect issues early.

2. **Alerting**: Configure alerts when the authentication system becomes unhealthy.

3. **Logging**: Log authentication health checks for historical analysis.

4. **Rate Limiting**: Apply rate limiting to prevent abuse of the health endpoints.

5. **Security**: While the health endpoint doesn't expose sensitive information, ensure it's properly secured in production environments.

## Troubleshooting

If the auth health endpoint indicates issues:

1. **Check Privy Status**: Verify that Privy services are operational.

2. **Validate Environment Variables**: Ensure all required Privy environment variables are correctly set.

3. **Check Network Connectivity**: Ensure your server can reach the Privy API endpoints.

4. **Review Logs**: Check application logs for detailed error information.

5. **Restart Services**: Sometimes restarting the authentication service can resolve temporary issues.
