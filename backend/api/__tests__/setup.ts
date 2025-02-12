import { Express } from 'express';
import request from 'supertest';
import { app } from '../app.js';
import { Server } from 'http';

process.env.NODE_ENV = 'test';

let server: Server;

beforeAll((done) => {
  server = app.listen(0, () => done());
});

afterAll((done) => {
  server.close(done);
});

export const testApp = app;
export const testRequest = request(testApp);

export const mockBounty = {
  id: '1',
  title: 'Test Bounty',
  description: 'Test Description',
  reward: {
    amount: '1000',
    token: 'ETH',
    chainId: 1,
  },
  requirements: {
    skills: ['typescript'],
    estimatedTimeInHours: '10',
    deadline: '2024-12-31T00:00:00Z',
  },
  creator: {
    address: '0x123',
    name: 'Test Creator',
  },
  status: 'open' as const,
  createdAt: '2024-02-10T00:00:00Z',
  updatedAt: '2024-02-10T00:00:00Z',
};
