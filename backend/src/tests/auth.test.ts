import { expect } from 'chai';
import sinon from 'sinon';
import { AuthService } from '../services/auth.service';
import { authenticateUser } from '../middleware/auth.middleware';
import { Request, Response, NextFunction } from 'express';

// Mock Privy client
const mockPrivyClient = {
  verifyAuthToken: sinon.stub(),
  getUser: sinon.stub()
};

// Mock environment setup
process.env.PRIVY_PUBLIC_KEY = 'test-public-key';

describe('Authentication System', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;
  
  beforeEach(() => {
    // Reset stubs
    mockPrivyClient.verifyAuthToken.reset();
    mockPrivyClient.getUser.reset();
    
    // Setup request, response, and next function
    req = {
      headers: {
        authorization: 'Bearer test-token'
      }
    };
    
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub().returnsThis()
    };
    
    next = sinon.stub();
  });
  
  describe('AuthService', () => {
    let authService: AuthService;
    
    beforeEach(() => {
      authService = new AuthService();
      // Replace the private client with our mock
      (authService as any).privyClient = mockPrivyClient;
    });
    
    it('should verify a valid token', async () => {
      const mockClaims = { userId: 'test-user-id', appId: 'test-app-id' };
      mockPrivyClient.verifyAuthToken.resolves(mockClaims);
      
      const result = await authService.verifyToken('test-token');
      
      expect(result).to.deep.equal(mockClaims);
      expect(mockPrivyClient.verifyAuthToken.calledOnce).to.be.true;
      expect(mockPrivyClient.verifyAuthToken.firstCall.args[0]).to.equal('test-token');
    });
    
    it('should return null for an invalid token', async () => {
      mockPrivyClient.verifyAuthToken.rejects(new Error('Invalid token'));
      
      const result = await authService.verifyToken('invalid-token');
      
      expect(result).to.be.null;
      expect(mockPrivyClient.verifyAuthToken.calledOnce).to.be.true;
    });
    
    it('should get user details', async () => {
      const mockUser = {
        id: 'test-user-id',
        email: { address: 'test@example.com' },
        wallet: { address: '0x123456789' }
      };
      mockPrivyClient.getUser.resolves(mockUser);
      
      const result = await authService.getUserDetails('test-user-id');
      
      expect(result).to.deep.equal(mockUser);
      expect(mockPrivyClient.getUser.calledOnce).to.be.true;
      expect(mockPrivyClient.getUser.firstCall.args[0]).to.equal('test-user-id');
    });
    
    it('should return null if user details cannot be retrieved', async () => {
      mockPrivyClient.getUser.rejects(new Error('User not found'));
      
      const result = await authService.getUserDetails('invalid-user-id');
      
      expect(result).to.be.null;
      expect(mockPrivyClient.getUser.calledOnce).to.be.true;
    });
  });
  
  describe('authenticateUser middleware', () => {
    // We need to mock the AuthService used in the middleware
    let authServiceStub: sinon.SinonStub;
    
    beforeEach(() => {
      // Create a stub for the AuthService constructor
      authServiceStub = sinon.stub(AuthService.prototype, 'getUserDetails');
    });
    
    afterEach(() => {
      // Restore the stub
      authServiceStub.restore();
    });
    
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
      // Mock the Privy client in the middleware
      const originalPrivyClient = require('../config/privy').privyClient;
      require('../config/privy').privyClient = mockPrivyClient;
      
      const mockClaims = { userId: 'test-user-id', appId: 'test-app-id' };
      const mockUser = {
        id: 'test-user-id',
        email: { address: 'test@example.com' },
        wallet: { address: '0x123456789' }
      };
      
      mockPrivyClient.verifyAuthToken.resolves(mockClaims);
      authServiceStub.resolves(mockUser);
      
      await authenticateUser(req as Request, res as Response, next);
      
      expect(req.user).to.deep.include({
        id: 'test-user-id',
        email: 'test@example.com',
        walletAddress: '0x123456789'
      });
      expect((next as sinon.SinonStub).calledOnce).to.be.true;
      
      // Restore the original Privy client
      require('../config/privy').privyClient = originalPrivyClient;
    });
    
    it('should reject requests with invalid tokens', async () => {
      // Mock the Privy client in the middleware
      const originalPrivyClient = require('../config/privy').privyClient;
      require('../config/privy').privyClient = mockPrivyClient;
      
      mockPrivyClient.verifyAuthToken.rejects(new Error('Invalid token'));
      
      await authenticateUser(req as Request, res as Response, next);
      
      expect((res.status as sinon.SinonStub).calledWith(401)).to.be.true;
      expect((res.json as sinon.SinonStub).calledOnce).to.be.true;
      expect((next as sinon.SinonStub).notCalled).to.be.true;
      
      // Restore the original Privy client
      require('../config/privy').privyClient = originalPrivyClient;
    });
  });
});
