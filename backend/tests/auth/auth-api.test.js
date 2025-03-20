const request = require('supertest');
const express = require('express');
const { jest: jestGlobal } = require('@jest/globals');
const jwt = require('jsonwebtoken');

// Mock dependencies
jest.mock('@privy-io/server-auth', () => ({
  PrivyClient: jest.fn().mockImplementation(() => ({
    verifyAuthToken: jest.fn(),
  })),
}));

jest.mock('../../db/supabase', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
    insert: jest.fn().mockReturnThis(),
    upsert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    match: jest.fn().mockReturnThis(),
    data: null,
    error: null,
  },
}));

// Import the auth middleware and routes
const authMiddleware = require('../../middleware/auth');
const authRoutes = require('../../routes/auth');
const { supabase } = require('../../db/supabase');

// Create a test Express app
const app = express();
app.use(express.json());
app.use('/auth', authRoutes);

describe('Authentication API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /auth/verify', () => {
    it('should verify a valid token and return user data', async () => {
      // Mock the Privy token verification
      const mockPrivyClient = require('@privy-io/server-auth').PrivyClient;
      mockPrivyClient.mockImplementation(() => ({
        verifyAuthToken: jest.fn().mockResolvedValue({
          userId: 'privy-user-123',
          wallet: {
            address: '0x1234567890abcdef1234567890abcdef12345678',
          },
        }),
      }));

      // Mock the database response for existing user
      supabase.single.mockResolvedValue({
        data: {
          id: 'db-user-123',
          privy_id: 'privy-user-123',
          wallet_address: '0x1234567890abcdef1234567890abcdef12345678',
          role: 'user',
          created_at: '2023-01-01T00:00:00Z',
        },
        error: null,
      });

      // Make the request
      const response = await request(app)
        .post('/auth/verify')
        .send({ token: 'valid-token' });

      // Assertions
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('verified', true);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('id', 'db-user-123');
      expect(response.body.user).toHaveProperty('privyId', 'privy-user-123');
      expect(response.body.user).toHaveProperty('walletAddress', '0x1234567890abcdef1234567890abcdef12345678');
      expect(response.body.user).toHaveProperty('role', 'user');
    });

    it('should create a new user if not found in database', async () => {
      // Mock the Privy token verification
      const mockPrivyClient = require('@privy-io/server-auth').PrivyClient;
      mockPrivyClient.mockImplementation(() => ({
        verifyAuthToken: jest.fn().mockResolvedValue({
          userId: 'privy-new-user',
          wallet: {
            address: '0xabcdef1234567890abcdef1234567890abcdef12',
          },
        }),
      }));

      // Mock the database response for user not found
      supabase.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'No rows found' },
      });

      // Mock the insert response
      supabase.insert.mockReturnValue({
        data: {
          id: 'new-db-user-456',
          privy_id: 'privy-new-user',
          wallet_address: '0xabcdef1234567890abcdef1234567890abcdef12',
          role: 'user',
          created_at: '2023-01-02T00:00:00Z',
        },
        error: null,
      });

      // Make the request
      const response = await request(app)
        .post('/auth/verify')
        .send({ token: 'new-user-token' });

      // Assertions
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('verified', true);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('privyId', 'privy-new-user');
      expect(supabase.insert).toHaveBeenCalled();
    });

    it('should handle invalid tokens', async () => {
      // Mock the Privy token verification failure
      const mockPrivyClient = require('@privy-io/server-auth').PrivyClient;
      mockPrivyClient.mockImplementation(() => ({
        verifyAuthToken: jest.fn().mockRejectedValue(new Error('Invalid token')),
      }));

      // Make the request
      const response = await request(app)
        .post('/auth/verify')
        .send({ token: 'invalid-token' });

      // Assertions
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('verified', false);
      expect(response.body).toHaveProperty('error');
    });

    it('should handle missing token', async () => {
      // Make the request without a token
      const response = await request(app)
        .post('/auth/verify')
        .send({});

      // Assertions
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Token is required');
    });
  });

  describe('GET /auth/user/:id', () => {
    it('should return user data for a valid user ID', async () => {
      // Mock the auth middleware to pass through
      app.use((req, res, next) => {
        req.user = { id: 'authenticated-user-id' };
        next();
      });

      // Mock the database response
      supabase.single.mockResolvedValue({
        data: {
          id: 'user-123',
          privy_id: 'privy-user-123',
          wallet_address: '0x1234567890abcdef1234567890abcdef12345678',
          role: 'user',
          created_at: '2023-01-01T00:00:00Z',
          metadata: { name: 'Test User' },
        },
        error: null,
      });

      // Make the request
      const response = await request(app)
        .get('/auth/user/user-123');

      // Assertions
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', 'user-123');
      expect(response.body).toHaveProperty('privyId', 'privy-user-123');
      expect(response.body).toHaveProperty('walletAddress', '0x1234567890abcdef1234567890abcdef12345678');
      expect(response.body).toHaveProperty('metadata');
    });

    it('should handle user not found', async () => {
      // Mock the auth middleware to pass through
      app.use((req, res, next) => {
        req.user = { id: 'authenticated-user-id' };
        next();
      });

      // Mock the database response for user not found
      supabase.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'No rows found' },
      });

      // Make the request
      const response = await request(app)
        .get('/auth/user/non-existent-user');

      // Assertions
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'User not found');
    });
  });

  describe('PUT /auth/user/:id', () => {
    it('should update user data for a valid user ID', async () => {
      // Mock the auth middleware to pass through
      app.use((req, res, next) => {
        req.user = { id: 'user-123' }; // Same as the user being updated
        next();
      });

      // Mock the database response
      supabase.update.mockReturnValue({
        data: {
          id: 'user-123',
          privy_id: 'privy-user-123',
          wallet_address: '0x1234567890abcdef1234567890abcdef12345678',
          role: 'user',
          metadata: { name: 'Updated User', bio: 'New bio' },
        },
        error: null,
      });

      // Make the request
      const response = await request(app)
        .put('/auth/user/user-123')
        .send({
          metadata: {
            name: 'Updated User',
            bio: 'New bio',
          },
        });

      // Assertions
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', 'user-123');
      expect(response.body).toHaveProperty('metadata');
      expect(response.body.metadata).toHaveProperty('name', 'Updated User');
      expect(response.body.metadata).toHaveProperty('bio', 'New bio');
    });

    it('should prevent updating another user\'s data', async () => {
      // Mock the auth middleware to pass through with different user
      app.use((req, res, next) => {
        req.user = { id: 'different-user-id' }; // Different from the user being updated
        next();
      });

      // Make the request
      const response = await request(app)
        .put('/auth/user/user-123')
        .send({
          metadata: {
            name: 'Hacked User',
          },
        });

      // Assertions
      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error', 'Unauthorized');
    });

    it('should handle database errors during update', async () => {
      // Mock the auth middleware to pass through
      app.use((req, res, next) => {
        req.user = { id: 'user-123' };
        next();
      });

      // Mock the database error
      supabase.update.mockReturnValue({
        data: null,
        error: { message: 'Database error' },
      });

      // Make the request
      const response = await request(app)
        .put('/auth/user/user-123')
        .send({
          metadata: {
            name: 'Updated User',
          },
        });

      // Assertions
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Auth Middleware', () => {
    it('should authorize requests with valid tokens', async () => {
      // Create a test route with the auth middleware
      const testApp = express();
      testApp.use(express.json());
      testApp.use(authMiddleware);
      testApp.get('/protected', (req, res) => {
        res.status(200).json({ message: 'Access granted', user: req.user });
      });

      // Mock the Privy token verification
      const mockPrivyClient = require('@privy-io/server-auth').PrivyClient;
      mockPrivyClient.mockImplementation(() => ({
        verifyAuthToken: jest.fn().mockResolvedValue({
          userId: 'privy-user-123',
        }),
      }));

      // Mock the database response
      supabase.single.mockResolvedValue({
        data: {
          id: 'db-user-123',
          privy_id: 'privy-user-123',
          role: 'user',
        },
        error: null,
      });

      // Make the request with a valid token
      const response = await request(testApp)
        .get('/protected')
        .set('Authorization', 'Bearer valid-token');

      // Assertions
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Access granted');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('id', 'db-user-123');
    });

    it('should reject requests without tokens', async () => {
      // Create a test route with the auth middleware
      const testApp = express();
      testApp.use(express.json());
      testApp.use(authMiddleware);
      testApp.get('/protected', (req, res) => {
        res.status(200).json({ message: 'Access granted' });
      });

      // Make the request without a token
      const response = await request(testApp)
        .get('/protected');

      // Assertions
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'No token provided');
    });

    it('should reject requests with invalid tokens', async () => {
      // Create a test route with the auth middleware
      const testApp = express();
      testApp.use(express.json());
      testApp.use(authMiddleware);
      testApp.get('/protected', (req, res) => {
        res.status(200).json({ message: 'Access granted' });
      });

      // Mock the Privy token verification failure
      const mockPrivyClient = require('@privy-io/server-auth').PrivyClient;
      mockPrivyClient.mockImplementation(() => ({
        verifyAuthToken: jest.fn().mockRejectedValue(new Error('Invalid token')),
      }));

      // Make the request with an invalid token
      const response = await request(testApp)
        .get('/protected')
        .set('Authorization', 'Bearer invalid-token');

      // Assertions
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Invalid token');
    });
  });
});
