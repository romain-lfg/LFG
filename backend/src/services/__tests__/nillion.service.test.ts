import { NillionService } from '../nillion.service.js';
import { logger } from '../../utils/logger';

// Mock the logger
jest.mock('../../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

// Mock the Nillion SDK
const mockNillionSdk = {
  storeData: jest.fn(),
  computeMatch: jest.fn(),
  retrieveData: jest.fn(),
};

jest.mock('nillion-sdk', () => ({
  NillionClient: jest.fn().mockImplementation(() => mockNillionSdk),
}));

describe('NillionService', () => {
  let nillionService: NillionService;
  
  beforeEach(() => {
    jest.clearAllMocks();
    nillionService = new NillionService();
  });

  describe('storeUserData', () => {
    it('should store user data successfully', async () => {
      const userData = {
        id: 'user123',
        wallet_address: '0x1234567890abcdef1234567890abcdef12345678',
        email: 'user@example.com',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        metadata: { name: 'Test User' },
      };

      mockNillionSdk.storeData.mockResolvedValue({ success: true, dataId: 'data123' });

      const result = await nillionService.storeUserData(userData);

      expect(result).toEqual({ success: true, dataId: 'data123' });
      expect(mockNillionSdk.storeData).toHaveBeenCalledWith({
        userId: 'user123',
        data: expect.objectContaining({
          id: 'user123',
          wallet_address: '0x1234567890abcdef1234567890abcdef12345678',
        }),
        type: 'user',
      });
      expect(logger.info).toHaveBeenCalledWith('User data stored in Nillion', { userId: 'user123' });
    });

    it('should handle errors when storing user data', async () => {
      const userData = {
        id: 'user123',
        wallet_address: '0x1234567890abcdef1234567890abcdef12345678',
        email: 'user@example.com',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const error = new Error('Failed to store data');
      mockNillionSdk.storeData.mockRejectedValue(error);

      await expect(nillionService.storeUserData(userData)).rejects.toThrow('Failed to store data');
      expect(logger.error).toHaveBeenCalledWith('Error storing user data in Nillion', {
        userId: 'user123',
        error,
      });
    });
  });

  describe('matchUserWithBounties', () => {
    it('should match user with bounties successfully', async () => {
      const userId = 'user123';

      mockNillionSdk.computeMatch.mockResolvedValue([
        { bountyId: 'bounty1', score: 0.85 },
      ]);

      const result = await nillionService.matchUserWithBounties(userId);

      expect(result).toEqual([
        { bountyId: 'bounty1', score: 0.85 },
      ]);
      expect(mockNillionSdk.computeMatch).toHaveBeenCalledWith(userId);
      expect(logger.info).toHaveBeenCalledWith(`User data stored in Nillion for user ${userId}`);
    });

    it('should handle errors when matching user with bounties', async () => {
      const userId = 'user123';

      const error = new Error('Failed to match user with bounties');
      mockNillionSdk.computeMatch.mockRejectedValue(error);

      await expect(nillionService.matchUserWithBounties(userId)).rejects.toThrow('Failed to match user with bounties');
      expect(logger.error).toHaveBeenCalledWith(`Error matching user ${userId} with bounties:`, error);
    });
  });

  describe('getBountiesByOwner', () => {
    it('should retrieve user bounties successfully', async () => {
      const userId = 'user123';
      const expectedBounties = [
        { id: 'bounty1', title: 'Bounty 1', reward: 100 },
        { id: 'bounty2', title: 'Bounty 2', reward: 200 },
      ];

      mockNillionSdk.retrieveData.mockResolvedValue(expectedBounties);

      const result = await nillionService.getBountiesByOwner(userId);

      expect(result).toEqual(expectedBounties);
      expect(mockNillionSdk.retrieveData).toHaveBeenCalledWith(userId);
      expect(logger.info).toHaveBeenCalledWith(`User data stored in Nillion for user ${userId}`);
    });

    it('should handle errors when retrieving user bounties', async () => {
      const userId = 'user123';

      const error = new Error('Failed to get bounties by owner');
      mockNillionSdk.retrieveData.mockRejectedValue(error);

      await expect(nillionService.getBountiesByOwner(userId)).rejects.toThrow('Failed to get bounties by owner');
      expect(logger.error).toHaveBeenCalledWith(`Error getting bounties for owner ${userId}:`, error);
    });
  });
});
