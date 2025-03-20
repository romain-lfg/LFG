import { Request, Response, NextFunction } from 'express';
import { authenticateUser } from '../auth.middleware';
import { PrivyClient } from '@privy-io/server-auth';

// Mock the Privy client
jest.mock('@privy-io/server-auth', () => ({
  PrivyClient: jest.fn().mockImplementation(() => ({
    verifyAuthToken: jest.fn(),
    getUser: jest.fn(),
  })),
}));

// Extend Express Request type to include user information
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        walletAddress?: string;
        email?: string;
        [key: string]: any;
      };
      userId?: string;
    }
  }
}

describe('Auth Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;
  let mockPrivyClient: any;

  beforeEach(() => {
    mockRequest = {
      headers: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    nextFunction = jest.fn();
    mockPrivyClient = new PrivyClient('mock-app-id', 'mock-secret');
  });

  it('should return 401 if no authorization header is present', async () => {
    await authenticateUser(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Unauthorized',
      message: 'No authorization token provided',
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it('should return 401 if authorization header has invalid format', async () => {
    mockRequest.headers = {
      authorization: 'InvalidFormat token123',
    };

    await authenticateUser(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Unauthorized',
      message: 'Invalid authorization header format',
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it('should return 401 if token verification fails', async () => {
    mockRequest.headers = {
      authorization: 'Bearer invalid-token',
    };

    mockPrivyClient.verifyAuthToken.mockRejectedValue(new Error('Invalid token'));

    await authenticateUser(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Unauthorized',
      message: 'Invalid token',
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it('should return 500 if user retrieval fails', async () => {
    mockRequest.headers = {
      authorization: 'Bearer valid-token',
    };

    mockPrivyClient.verifyAuthToken.mockResolvedValue({
      userId: 'user123',
      appId: 'app123',
    });
    mockPrivyClient.getUser.mockRejectedValue(new Error('User not found'));

    await authenticateUser(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Internal Server Error',
      message: 'Failed to retrieve user information',
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it('should attach user to request and call next if authentication is successful', async () => {
    mockRequest.headers = {
      authorization: 'Bearer valid-token',
    };

    const mockUser = {
      id: 'user123',
      email: { address: 'user@example.com', verified: true },
      wallet: { address: '0x1234567890abcdef1234567890abcdef12345678' },
    };

    mockPrivyClient.verifyAuthToken.mockResolvedValue({
      userId: 'user123',
      appId: 'app123',
    });
    mockPrivyClient.getUser.mockResolvedValue(mockUser);

    await authenticateUser(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockRequest.user).toEqual(mockUser);
    expect(mockRequest.userId).toEqual('user123');
    expect(nextFunction).toHaveBeenCalled();
    expect(mockResponse.status).not.toHaveBeenCalled();
    expect(mockResponse.json).not.toHaveBeenCalled();
  });

  it('should handle unexpected errors during authentication', async () => {
    mockRequest.headers = {
      authorization: 'Bearer valid-token',
    };

    mockPrivyClient.verifyAuthToken.mockImplementation(() => {
      throw new Error('Unexpected error');
    });

    await authenticateUser(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Internal Server Error',
      message: 'An unexpected error occurred during authentication',
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });
});
