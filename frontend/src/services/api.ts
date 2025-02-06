/**
 * Core API service for making HTTP requests to the backend
 */

import { API_CONFIG } from './config';
import { APIError, APIResponse } from '../types/api';

export class HTTPError extends Error {
  constructor(public status: number, public code: string, message: string) {
    super(message);
    this.name = 'HTTPError';
  }
}

/**
 * Base API client with error handling and response parsing
 */
export class APIClient {
  private static instance: APIClient;
  private baseUrl: string;

  private constructor() {
    this.baseUrl = API_CONFIG.BASE_URL;
  }

  static getInstance(): APIClient {
    if (!APIClient.instance) {
      APIClient.instance = new APIClient();
    }
    return APIClient.instance;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.json();
      throw new HTTPError(
        response.status,
        error.code || 'UNKNOWN_ERROR',
        error.message || 'An unknown error occurred'
      );
    }

    const data = await response.json();
    return data.data;
  }

  async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    const url = new URL(this.baseUrl + endpoint);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    const response = await fetch(url.toString(), {
      headers: {
        'Accept': 'application/json',
        // Authorization will be added here when auth is implemented
      },
    });

    return this.handleResponse<T>(response);
  }

  async post<T>(endpoint: string, body: any): Promise<T> {
    const response = await fetch(this.baseUrl + endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        // Authorization will be added here when auth is implemented
      },
      body: JSON.stringify(body),
    });

    return this.handleResponse<T>(response);
  }

  async put<T>(endpoint: string, body: any): Promise<T> {
    const response = await fetch(this.baseUrl + endpoint, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(body),
    });

    return this.handleResponse<T>(response);
  }

  async delete<T>(endpoint: string): Promise<T> {
    const response = await fetch(this.baseUrl + endpoint, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
      },
    });

    return this.handleResponse<T>(response);
  }
}
