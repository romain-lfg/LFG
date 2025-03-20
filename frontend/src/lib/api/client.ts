import { ensureAbsoluteUrl } from '@/utils/url';

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

  private async request<T>(endpoint: string, options: RequestInit = {}, token?: string): Promise<T> {
    // Ensure endpoint starts with /api
    const apiEndpoint = endpoint.startsWith('/api') ? endpoint : `/api${endpoint}`;
    
    // Use the utility function to ensure we have an absolute URL
    const url = ensureAbsoluteUrl(apiEndpoint);
    
    console.log(`API Request: ${url}`, { method: options.method || 'GET' });
    
    // Create headers with proper type definition
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    // Add authorization header if we have a token
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('Added auth token to request', { hasToken: true });
    }

    const response = await fetch(url, { 
      ...options, 
      headers,
      credentials: 'include' // Ensure cookies are sent with cross-origin requests
    });

    if (!response.ok) {
      // Try to get error details from response
      try {
        const errorData = await response.json();
        console.error('API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          url: url,
          errorData
        });
        throw new Error(`API error: ${response.status} ${response.statusText} - ${errorData.message || JSON.stringify(errorData)}`);
      } catch (e) {
        // If we can't parse the error as JSON, just use the status
        console.error('API Error:', {
          status: response.status,
          statusText: response.statusText,
          url: url
        });
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
    }

    return response.json();
  }

  // Create a new bounty
  async createBounty(bounty: Bounty, token?: string): Promise<void> {
    await this.request('/bounties', {
      method: 'POST',
      body: JSON.stringify(bounty),
    }, token);
  }

  // Get all bounties
  async getBounties(token?: string): Promise<Bounty[]> {
    return this.request<Bounty[]>('/bounties', {}, token);
  }

  // Get bounties matching a user
  async matchBountiesForUser(userId: string, token?: string): Promise<Bounty[]> {
    return this.request<Bounty[]>(`/bounties/match/${userId}`, {}, token);
  }

  // Clear all bounties (testing only)
  async clearBounties(token?: string): Promise<void> {
    await this.request('/bounties/clear', {
      method: 'POST'
    }, token);
  }
}

export const apiClient = new ApiClient();
