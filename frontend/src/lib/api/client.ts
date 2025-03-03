// Bounty type matching our backend data structure
export interface Bounty {
  title: string;
  description: string;
  requiredSkills: string[];
  estimatedTime: string;
  reward: {
    amount: string;
    token: string;
    chainId: string;
  };
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Create a new bounty
  async createBounty(bounty: Bounty): Promise<void> {
    await this.request('/bounties', {
      method: 'POST',
      body: JSON.stringify(bounty),
    });
  }

  // Get all bounties
  async getBounties(): Promise<Bounty[]> {
    return this.request<Bounty[]>('/bounties');
  }

  // Get bounties matching a user
  async matchBountiesForUser(userId: string): Promise<Bounty[]> {
    return this.request<Bounty[]>(`/bounties/match/${userId}`);
  }

  // Clear all bounties (testing only)
  async clearBounties(): Promise<void> {
    await this.request('/bounties/clear', {
      method: 'POST'
    });
  }
}

export const apiClient = new ApiClient();
