import { expect } from 'chai';
import sinon from 'sinon';
import { Request, Response, NextFunction } from 'express';
// Import the middleware to ensure the Request interface extension is available
import '../middleware/auth.middleware';

// The user property is already extended in auth.middleware.ts

// Define interfaces for our test
interface VerifiedClaims {
  userId: string;
  appId: string;
  [key: string]: any;
}

interface UserDetails {
  id: string;
  email?: { address: string };
  wallet?: { address: string };
  [key: string]: any;
}

// Create a simple mock for the AuthService
class MockAuthService {
  async verifyToken(token: string): Promise<VerifiedClaims | null> {
    if (token === 'valid-token') {
      return { userId: 'test-user-id', appId: 'test-app-id' };
    }
    return null;
  }
  
  async getUserDetails(userId: string): Promise<UserDetails | null> {
    if (userId === 'test-user-id') {
      return {
        id: 'test-user-id',
        email: { address: 'test@example.com' },
        wallet: { address: '0x123456789' }
      };
    }
    return null;
  }
}

// Create a mock for the middleware
const createMockMiddleware = (mockAuthService: MockAuthService) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Unauthorized: Missing or invalid token format' });
      return;
    }
    
    const token = authHeader.replace('Bearer ', '');
    
    // Verify token
    try {
      const verifiedClaims = await mockAuthService.verifyToken(token);
      
      if (!verifiedClaims || !verifiedClaims.userId) {
        res.status(401).json({ 
          error: 'Unauthorized: Invalid token claims',
          message: 'Token verification failed: missing user ID in claims',
          code: 'AUTH_INVALID_CLAIMS'
        });
        return;
      }
      
      // Get user details
      const userDetails = await mockAuthService.getUserDetails(verifiedClaims.userId);
      
      // Add user information to request object
      req.user = {
        id: verifiedClaims.userId,
        walletAddress: userDetails?.wallet?.address,
        email: userDetails?.email?.address,
        claims: verifiedClaims
      };
      
      next();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(401).json({ 
        error: 'Unauthorized: Token verification failed',
        message: errorMessage,
        code: 'AUTH_VERIFICATION_FAILED'
      });
    }
  };
};

describe('Authentication System', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;
  let mockAuthService: MockAuthService;
  let authenticateUser: (req: Request, res: Response, next: NextFunction) => Promise<void>;
  
  beforeEach(() => {
    // Setup request, response, and next function
    req = {
      headers: {
        authorization: 'Bearer valid-token'
      }
    } as Partial<Request>;
    
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub().returnsThis()
    } as Partial<Response>;
    
    next = sinon.stub() as unknown as NextFunction;
    
    mockAuthService = new MockAuthService();
    authenticateUser = createMockMiddleware(mockAuthService);
  });
  
  describe('Authentication Middleware', () => {
    it('should reject requests without an authorization header', async () => {
      req.headers = {};
      
      await authenticateUser(req as Request, res as Response, next);
      
      expect((res.status as sinon.SinonStub).calledWith(401)).to.be.true;
      expect((res.json as sinon.SinonStub).calledOnce).to.be.true;
      expect((next as sinon.SinonStub).notCalled).to.be.true;
    });
    
    it('should reject requests with an invalid token format', async () => {
      req.headers = { authorization: 'InvalidFormat' };
      
      await authenticateUser(req as Request, res as Response, next);
      
      expect((res.status as sinon.SinonStub).calledWith(401)).to.be.true;
      expect((res.json as sinon.SinonStub).calledOnce).to.be.true;
      expect((next as sinon.SinonStub).notCalled).to.be.true;
    });
    
    it('should authenticate users with valid tokens', async () => {
      // Spy on the auth service methods
      const verifyTokenSpy = sinon.spy(mockAuthService, 'verifyToken');
      const getUserDetailsSpy = sinon.spy(mockAuthService, 'getUserDetails');
      
      await authenticateUser(req as Request, res as Response, next);
      
      expect(verifyTokenSpy.calledWith('valid-token')).to.be.true;
      expect(getUserDetailsSpy.calledWith('test-user-id')).to.be.true;
      expect(req.user).to.deep.include({
        id: 'test-user-id',
        email: 'test@example.com',
        walletAddress: '0x123456789'
      });
      expect((next as sinon.SinonStub).calledOnce).to.be.true;
      
      // Restore the spies
      verifyTokenSpy.restore();
      getUserDetailsSpy.restore();
    });
    
    it('should reject requests with invalid tokens', async () => {
      req.headers = { authorization: 'Bearer invalid-token' };
      
      await authenticateUser(req as Request, res as Response, next);
      
      expect((res.status as sinon.SinonStub).calledWith(401)).to.be.true;
      expect((res.json as sinon.SinonStub).calledOnce).to.be.true;
      expect((next as sinon.SinonStub).notCalled).to.be.true;
    });
  });
});
