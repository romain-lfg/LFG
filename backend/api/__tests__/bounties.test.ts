import { testRequest, mockBounty } from './setup';
import * as nillion from '../lib/nillion';

jest.mock('../lib/nillion');

describe('Bounty API Endpoints', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('POST /api/bounties', () => {
    it('should create a bounty successfully', async () => {
      const createBountySpy = jest.spyOn(nillion, 'createBounty')
        .mockResolvedValueOnce(undefined);

      const response = await testRequest
        .post('/api/bounties')
        .send(mockBounty)
        .expect(201);

      expect(response.body).toEqual({
        status: 'success',
        message: 'Bounty created successfully',
      });
      expect(createBountySpy).toHaveBeenCalledWith(expect.objectContaining(mockBounty));
    });

    it('should return validation error for invalid bounty data', async () => {
      const invalidBounty = { ...mockBounty, reward: {} };

      const response = await testRequest
        .post('/api/bounties')
        .send(invalidBounty)
        .expect(400);

      expect(response.body.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /api/bounties', () => {
    it('should return paginated bounties', async () => {
      const mockBounties = Array(15).fill(null).map((_, i) => ({
        ...mockBounty,
        id: `${i}`,
        status: 'open' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));

      jest.spyOn(nillion, 'getBountyList')
        .mockResolvedValueOnce(mockBounties);

      const response = await testRequest
        .get('/api/bounties?page=1&pageSize=10')
        .expect(200);

      expect(response.body.data.items).toHaveLength(10);
      expect(response.body.data.total).toBe(15);
      expect(response.body.data.hasMore).toBe(true);
    });

    it('should filter bounties by status', async () => {
      const mockBounties = [
        { ...mockBounty, id: '1', status: 'open' as const },
        { ...mockBounty, id: '2', status: 'completed' as const },
      ];

      jest.spyOn(nillion, 'getBountyList')
        .mockResolvedValueOnce(mockBounties);

      const response = await testRequest
        .get('/api/bounties?status=open')
        .expect(200);

      expect(response.body.data.items).toHaveLength(1);
      expect(response.body.data.items[0].status).toBe('open');
    });
  });

  describe('GET /api/bounties/match/user/:userId', () => {
    it('should return matching bounties for user', async () => {
      const userId = '123';
      const mockMatches = [
        { ...mockBounty, id: '1', status: 'open' as const },
      ];

      jest.spyOn(nillion, 'matchBountiesUser')
        .mockResolvedValueOnce(mockMatches);

      const response = await testRequest
        .get(`/api/bounties/match/user/${userId}`)
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.status).toBe('success');
    });

    it('should handle no matches found', async () => {
      const userId = '123';
      
      jest.spyOn(nillion, 'matchBountiesUser')
        .mockResolvedValueOnce([]);

      const response = await testRequest
        .get(`/api/bounties/match/user/${userId}`)
        .expect(200);

      expect(response.body.data).toHaveLength(0);
    });
  });
});
