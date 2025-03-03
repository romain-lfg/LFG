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

// In-memory user database for testing
const users = {};

// Mock token generation
const generateMockToken = (userId) => {
  return `mock-token-for-${userId}`;
};

// Mock authentication middleware
const authenticateUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid token format' });
  }
  
  const token = authHeader.split(' ')[1];
  
  // For testing, we'll check if the token matches our mock token format
  const tokenParts = token.split('-for-');
  if (tokenParts.length !== 2 || tokenParts[0] !== 'mock-token') {
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
  
  const userId = tokenParts[1];
  
  if (!users[userId]) {
    return res.status(401).json({ error: 'Unauthorized: User not found' });
  }
  
  req.user = {
    id: userId,
    walletAddress: users[userId].walletAddress,
    email: users[userId].email
  };
  
  next();
};

// Routes

// Simulate Privy login
app.post('/api/auth/login', (req, res) => {
  const { email, walletAddress } = req.body;
  
  if (!email && !walletAddress) {
    return res.status(400).json({ error: 'Email or wallet address is required' });
  }
  
  // Generate a unique user ID
  const userId = `user-${Date.now()}`;
  
  // Store user data
  users[userId] = {
    id: userId,
    email: email || null,
    walletAddress: walletAddress || null,
    createdAt: new Date().toISOString()
  };
  
  // Generate a mock token
  const token = generateMockToken(userId);
  
  res.json({
    message: 'Login successful',
    user: users[userId],
    token
  });
});

// User sync endpoint
app.post('/api/users/sync', authenticateUser, (req, res) => {
  const { walletAddress, email, metadata } = req.body;
  
  // Update user data
  users[req.user.id] = {
    ...users[req.user.id],
    walletAddress: walletAddress || users[req.user.id].walletAddress,
    email: email || users[req.user.id].email,
    metadata: metadata || users[req.user.id].metadata || {},
    updatedAt: new Date().toISOString()
  };
  
  res.json({
    message: 'User data synced successfully',
    user: users[req.user.id]
  });
});

// Get user profile
app.get('/api/users/profile', authenticateUser, (req, res) => {
  res.json({
    message: 'User profile retrieved successfully',
    user: users[req.user.id]
  });
});

// Update user profile
app.put('/api/users/profile', authenticateUser, (req, res) => {
  const { walletAddress, email, metadata } = req.body;
  
  // Update user data
  users[req.user.id] = {
    ...users[req.user.id],
    walletAddress: walletAddress || users[req.user.id].walletAddress,
    email: email || users[req.user.id].email,
    metadata: metadata ? { ...users[req.user.id].metadata, ...metadata } : users[req.user.id].metadata,
    updatedAt: new Date().toISOString()
  };
  
  res.json({
    message: 'User profile updated successfully',
    user: users[req.user.id]
  });
});

// List all users (for testing only)
app.get('/api/admin/users', (req, res) => {
  res.json({
    message: 'Users retrieved successfully',
    users
  });
});

// Start server
const port = 3004;
app.listen(port, () => {
  console.log(`Test auth flow server running on port ${port}`);
  console.log(`Test routes:`);
  console.log(`- POST http://localhost:${port}/api/auth/login`);
  console.log(`- POST http://localhost:${port}/api/users/sync`);
  console.log(`- GET http://localhost:${port}/api/users/profile`);
  console.log(`- PUT http://localhost:${port}/api/users/profile`);
  console.log(`- GET http://localhost:${port}/api/admin/users`);
  console.log(`\nExample usage:`);
  console.log(`1. Login: curl -X POST -H "Content-Type: application/json" -d '{"email":"test@example.com", "walletAddress":"0x123456789abcdef"}' http://localhost:${port}/api/auth/login`);
  console.log(`2. Use the token from the login response in subsequent requests:`);
  console.log(`   curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:${port}/api/users/profile`);
});
