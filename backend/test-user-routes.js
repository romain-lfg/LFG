import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.test file
dotenv.config({ path: join(__dirname, '.env.test') });

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Mock authentication middleware for testing
const authenticateUser = async (req, res, next) => {
  // For testing, we'll simulate an authenticated user
  req.user = {
    id: 'test-user-id',
    walletAddress: '0x123456789abcdef',
    email: 'test@example.com'
  };
  next();
};

// Test routes
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API is working!',
    env: {
      privyAppId: process.env.PRIVY_APP_ID ? 'Set' : 'Not set',
      privyAppSecret: process.env.PRIVY_APP_SECRET ? 'Set' : 'Not set',
      privyPublicKey: process.env.PRIVY_PUBLIC_KEY ? 'Set' : 'Not set',
      supabaseUrl: process.env.SUPABASE_URL ? 'Set' : 'Not set',
      supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Not set'
    }
  });
});

// Test authentication route
app.get('/api/auth/test', authenticateUser, (req, res) => {
  res.json({
    message: 'Authentication successful',
    user: req.user
  });
});

// Test user sync route
app.post('/api/users/sync', authenticateUser, (req, res) => {
  const { walletAddress, email, metadata } = req.body;
  
  // Simulate user sync
  const userData = {
    id: req.user.id,
    walletAddress: walletAddress || req.user.walletAddress,
    email: email || req.user.email,
    metadata: metadata || {}
  };
  
  res.json({
    message: 'User data synced successfully',
    user: userData
  });
});

// Test user profile route
app.get('/api/users/profile', authenticateUser, (req, res) => {
  res.json({
    message: 'User profile retrieved successfully',
    user: req.user
  });
});

// Start server
const port = 3003;
app.listen(port, () => {
  console.log(`Test server running on port ${port}`);
  console.log(`Test routes:`);
  console.log(`- GET http://localhost:${port}/api/test`);
  console.log(`- GET http://localhost:${port}/api/auth/test`);
  console.log(`- POST http://localhost:${port}/api/users/sync`);
  console.log(`- GET http://localhost:${port}/api/users/profile`);
});
