import { Bounty } from '../nillion/client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

if (!API_KEY) {
  console.warn('API_KEY is not set in environment variables');
}

interface ApiClientConfig {
  baseUrl?: string;
  apiKey?: string;
}

class ApiClient {
  private baseUrl: string;
  private apiKey: string;

  constructor(config: ApiClientConfig = {}) {
    this.baseUrl = config.baseUrl || API_URL;
    this.apiKey = config.apiKey || API_KEY || '';
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      'X-API-Key': this.apiKey,
      ...options.headers,
    };

    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'An error occurred' }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Bounty endpoints
  async createBounty(bounty: Bounty): Promise<void> {
    await this.request('/api/bounties', {
      method: 'POST',
      body: JSON.stringify(bounty),
    });
  }

  async getBounties(): Promise<Bounty[]> {
    return this.request<Bounty[]>('/api/bounties');
  }

  async matchBountiesForUser(userId: string): Promise<Bounty[]> {
    return this.request<Bounty[]>(`/api/bounties/match/user/${userId}`);
  }

  async matchBountiesForOwner(userId: string): Promise<Bounty[]> {
    return this.request<Bounty[]>(`/api/bounties/match/owner/${userId}`);
  }
}

export const apiClient = new ApiClient();
