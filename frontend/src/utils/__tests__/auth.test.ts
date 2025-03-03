import {
  formatWalletAddress,
  hasRole,
  isAdmin,
  getUserDisplayName,
  parseJwt,
  isTokenExpired,
} from '../auth';

describe('Auth Utilities', () => {
  describe('formatWalletAddress', () => {
    it('formats a wallet address correctly', () => {
      const address = '0x1234567890abcdef1234567890abcdef12345678';
      expect(formatWalletAddress(address)).toBe('0x123456...5678');
    });
    
    it('handles addresses without 0x prefix', () => {
      const address = '1234567890abcdef1234567890abcdef12345678';
      expect(formatWalletAddress(address)).toBe('123456...5678');
    });
    
    it('returns empty string for null or undefined address', () => {
      expect(formatWalletAddress('')).toBe('');
      expect(formatWalletAddress(null as any)).toBe('');
      expect(formatWalletAddress(undefined as any)).toBe('');
    });
    
    it('respects custom prefix and suffix lengths', () => {
      const address = '0x1234567890abcdef1234567890abcdef12345678';
      expect(formatWalletAddress(address, 4, 2)).toBe('0x1234...78');
    });
    
    it('returns the original address if it is too short', () => {
      const address = '0x1234';
      expect(formatWalletAddress(address)).toBe('0x1234');
    });
  });
  
  describe('hasRole', () => {
    it('returns true when user has the specified role', () => {
      const userProfile = { metadata: { role: 'admin' } };
      expect(hasRole(userProfile, 'admin')).toBe(true);
    });
    
    it('returns false when user does not have the specified role', () => {
      const userProfile = { metadata: { role: 'user' } };
      expect(hasRole(userProfile, 'admin')).toBe(false);
    });
    
    it('returns false when user profile is null or undefined', () => {
      expect(hasRole(null, 'admin')).toBe(false);
      expect(hasRole(undefined, 'admin')).toBe(false);
    });
    
    it('returns false when user metadata is missing', () => {
      const userProfile = { id: '123' };
      expect(hasRole(userProfile, 'admin')).toBe(false);
    });
    
    it('returns false when role is missing in metadata', () => {
      const userProfile = { metadata: { name: 'Test User' } };
      expect(hasRole(userProfile, 'admin')).toBe(false);
    });
  });
  
  describe('isAdmin', () => {
    it('returns true when user has admin role', () => {
      const userProfile = { metadata: { role: 'admin' } };
      expect(isAdmin(userProfile)).toBe(true);
    });
    
    it('returns false when user does not have admin role', () => {
      const userProfile = { metadata: { role: 'user' } };
      expect(isAdmin(userProfile)).toBe(false);
    });
    
    it('returns false when user profile is null or undefined', () => {
      expect(isAdmin(null)).toBe(false);
      expect(isAdmin(undefined)).toBe(false);
    });
  });
  
  describe('getUserDisplayName', () => {
    it('returns user name when available', () => {
      const user = { name: 'Test User' };
      const wallet = { address: '0x1234' };
      expect(getUserDisplayName(user, wallet)).toBe('Test User');
    });
    
    it('returns email when name is not available', () => {
      const user = { email: { address: 'test@example.com' } };
      const wallet = { address: '0x1234' };
      expect(getUserDisplayName(user, wallet)).toBe('test@example.com');
    });
    
    it('returns formatted wallet address when name and email are not available', () => {
      const user = {};
      const wallet = { address: '0x1234567890abcdef1234567890abcdef12345678' };
      expect(getUserDisplayName(user, wallet)).toBe('0x123456...5678');
    });
    
    it('returns "Anonymous User" when no identifying information is available', () => {
      const user = {};
      const wallet = {};
      expect(getUserDisplayName(user, wallet)).toBe('Anonymous User');
    });
    
    it('returns empty string when user is null or undefined', () => {
      expect(getUserDisplayName(null, {})).toBe('');
      expect(getUserDisplayName(undefined, {})).toBe('');
    });
  });
  
  describe('parseJwt', () => {
    // Create a sample JWT token for testing
    const createToken = (payload: Record<string, any>) => {
      const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
      const encodedPayload = btoa(JSON.stringify(payload));
      const signature = 'fake_signature'; // Not a real signature
      return `${header}.${encodedPayload}.${signature}`;
    };
    
    it('parses a valid JWT token', () => {
      const payload = { sub: '123', name: 'Test User', exp: Math.floor(Date.now() / 1000) + 3600 };
      const token = createToken(payload);
      
      const parsedPayload = parseJwt(token);
      expect(parsedPayload).toEqual(payload);
    });
    
    it('returns null for an invalid token', () => {
      const invalidToken = 'invalid.token.format';
      const parsedPayload = parseJwt(invalidToken);
      expect(parsedPayload).toBeNull();
    });
  });
  
  describe('isTokenExpired', () => {
    // Create a sample JWT token for testing
    const createToken = (expirationTime: number) => {
      const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
      const payload = { exp: expirationTime };
      const encodedPayload = btoa(JSON.stringify(payload));
      const signature = 'fake_signature'; // Not a real signature
      return `${header}.${encodedPayload}.${signature}`;
    };
    
    it('returns true for an expired token', () => {
      // Create a token that expired 1 hour ago
      const expiredTime = Math.floor(Date.now() / 1000) - 3600;
      const expiredToken = createToken(expiredTime);
      
      expect(isTokenExpired(expiredToken)).toBe(true);
    });
    
    it('returns false for a valid token', () => {
      // Create a token that expires in 1 hour
      const validTime = Math.floor(Date.now() / 1000) + 3600;
      const validToken = createToken(validTime);
      
      expect(isTokenExpired(validToken)).toBe(false);
    });
    
    it('returns true for a token without expiration', () => {
      const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
      const payload = { sub: '123' }; // No exp claim
      const encodedPayload = btoa(JSON.stringify(payload));
      const signature = 'fake_signature';
      const tokenWithoutExp = `${header}.${encodedPayload}.${signature}`;
      
      expect(isTokenExpired(tokenWithoutExp)).toBe(true);
    });
    
    it('returns true for an invalid token', () => {
      const invalidToken = 'invalid.token.format';
      expect(isTokenExpired(invalidToken)).toBe(true);
    });
  });
});
