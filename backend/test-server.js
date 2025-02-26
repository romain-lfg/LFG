/**
 * Simple Test Server for Authentication Testing
 * 
 * This server provides basic endpoints to test the authentication flow.
 * It includes:
 * - Health check endpoint
 * - User profile endpoint (protected)
 * - User sync endpoint (protected)
 * - Admin users endpoint (protected with role)
 * 
 * Usage:
 * node test-server.js
 */

import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

// Create Express app
const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());

// Mock database
const users = new Map();

// Mock authentication middleware
const authenticateUser = (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify token (using a mock secret for testing)
    const secret = 'test-secret';
    const decoded = jwt.verify(token, secret);
    
    // Check if token is expired
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < now) {
      return res.status(401).json({ error: 'Unauthorized: Token expired' });
    }
    
    // Add user to request object
    req.user = {
      id: decoded.userId,
      role: decoded.role || 'user',
    };
    
    next();
  } catch (error) {
    console.error('Authentication error:', error.message);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

// Role-based access control middleware
const hasRole = (role) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized: User not authenticated' });
  }
  
  if (req.user.role !== role) {
    return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
  }
  
  next();
};

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// User profile endpoint (protected)
app.get('/api/users/profile', authenticateUser, (req, res) => {
  const userId = req.user.id;
  const user = users.get(userId) || { id: userId };
  
  res.status(200).json({ user });
});

// User sync endpoint (protected)
app.post('/api/users/sync', authenticateUser, (req, res) => {
  const userId = req.user.id;
  const { walletAddress, email, metadata } = req.body;
  
  // Create or update user
  const user = {
    id: userId,
    walletAddress,
    email,
    metadata,
    updatedAt: new Date().toISOString(),
  };
  
  users.set(userId, user);
  
  res.status(200).json({ user });
});

// Admin users endpoint (protected with role)
app.get('/api/admin/users', authenticateUser, hasRole('admin'), (req, res) => {
  const userList = Array.from(users.values());
  res.status(200).json({ users: userList });
});

// Start server
app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`User profile: http://localhost:${PORT}/api/users/profile (protected)`);
  console.log(`User sync: http://localhost:${PORT}/api/users/sync (protected)`);
  console.log(`Admin users: http://localhost:${PORT}/api/admin/users (protected with role)`);
});
