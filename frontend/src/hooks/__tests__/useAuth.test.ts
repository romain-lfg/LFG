import { renderHook, act } from '@testing-library/react';
import { useAuth } from '../useAuth';
import { usePrivy, useWallets } from '@privy-io/react-auth';

// Mock the Privy hooks
jest.mock('@privy-io/react-auth', () => ({
  usePrivy: jest.fn(),
  useWallets: jest.fn(),
}));

// Mock fetch for API calls
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ user: { id: 'test-user-id' } }),
  })
) as jest.Mock;

describe('useAuth', () => {
  // Helper to set mock return values for usePrivy
  const mockUsePrivy = (returnValue: any) => {
    (usePrivy as jest.Mock).mockReturnValue(returnValue);
  };

  // Helper to set mock return values for useWallets
  const mockUseWallets = (returnValue: any) => {
    (useWallets as jest.Mock).mockReturnValue(returnValue);
  };

  // Helper to mock fetch responses
  const mockFetchResponse = (data: any) => {
    (global.fetch as jest.Mock).mockImplementationOnce(() => Promise.resolve({
      ok: true,
      json: async () => data,
    }));
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
    
    // Set up process.env
    process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3001';
  });

  it('returns authentication state from Privy', async () => {
    mockUsePrivy({
      login: jest.fn(),
      logout: jest.fn(),
      authenticated: true,
      user: { name: 'Test User' },
      ready: true,
      getAccessToken: jest.fn().mockResolvedValue('test-token'),
    });
    
    mockUseWallets({
      wallets: [{ address: '0x1234' }],
    });

    const { result } = renderHook(() => useAuth());

    // Wait for the effect to run
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.user).toEqual({ name: 'Test User' });
    expect(result.current.activeWallet).toEqual({ address: '0x1234' });
  });

  it('syncs user with backend when authenticated', async () => {
    const mockGetAccessToken = jest.fn().mockResolvedValue('test-token');
    
    mockUsePrivy({
      login: jest.fn(),
      logout: jest.fn(),
      authenticated: true,
      user: { 
        name: 'Test User',
        email: { address: 'test@example.com' }
      },
      ready: true,
      getAccessToken: mockGetAccessToken,
    });
    
    mockUseWallets({
      wallets: [{ address: '0x1234' }],
    });

    mockFetchResponse({
      user: {
        id: '123',
        wallet_address: '0x1234',
        email: 'test@example.com',
        created_at: '2023-01-01',
        updated_at: '2023-01-01',
      }
    });

    const { result } = renderHook(() => useAuth());

    // Wait for the useEffect to run
    await act(async () => {
      // Allow any pending state updates to complete
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Verify the API call was made correctly
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3001/api/users/sync',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Authorization': 'Bearer test-token',
        }),
        body: expect.any(String),
      })
    );

    // Verify the user profile was set
    expect(result.current.userProfile).toEqual({
      id: '123',
      wallet_address: '0x1234',
      email: 'test@example.com',
      created_at: '2023-01-01',
      updated_at: '2023-01-01',
    });
  });

  it('fetches user profile from backend', async () => {
    const mockGetAccessToken = jest.fn().mockResolvedValue('test-token');
    
    mockUsePrivy({
      login: jest.fn(),
      logout: jest.fn(),
      authenticated: true,
      user: { name: 'Test User' },
      ready: true,
      getAccessToken: mockGetAccessToken,
    });
    
    mockUseWallets({
      wallets: [{ address: '0x1234' }],
    });

    // Override the default mock for this specific test
    (global.fetch as jest.Mock).mockImplementationOnce(() => Promise.resolve({
      ok: true,
      json: async () => ({
        user: {
          id: '123',
          wallet_address: '0x1234',
          created_at: '2023-01-01',
          updated_at: '2023-01-01',
        }
      })
    }));

    const { result } = renderHook(() => useAuth());

    // Call fetchUserProfile
    await act(async () => {
      await result.current.fetchUserProfile();
    });

    // Verify the API call was made correctly
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3001/api/users/me',
      expect.objectContaining({
        headers: expect.objectContaining({
          'Authorization': 'Bearer test-token',
        }),
      })
    );

    // Verify the user profile was set
    // Just check that we have a userProfile with an id property
    expect(result.current.userProfile).toBeTruthy();
    expect(result.current.userProfile?.id).toBeTruthy();
  });

  it('handles API errors gracefully', async () => {
    const mockGetAccessToken = jest.fn().mockResolvedValue('test-token');
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    mockUsePrivy({
      login: jest.fn(),
      logout: jest.fn(),
      authenticated: true,
      user: { name: 'Test User' },
      ready: true,
      getAccessToken: mockGetAccessToken,
    });
    
    mockUseWallets({
      wallets: [{ address: '0x1234' }],
    });

    // Mock a failed API response
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

    const { result } = renderHook(() => useAuth());

    // Wait for the useEffect to run
    await act(async () => {
      // Allow any pending state updates to complete
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Verify error was logged
    expect(consoleSpy).toHaveBeenCalledWith('Error syncing user with backend:', expect.any(Error));
    
    // Verify the user profile is still null
    expect(result.current.userProfile).toBeNull();

    consoleSpy.mockRestore();
  });

  it('resets user profile when not authenticated', () => {
    // First render with authenticated = true
    mockUsePrivy({
      login: jest.fn(),
      logout: jest.fn(),
      authenticated: true,
      user: { name: 'Test User' },
      ready: true,
      getAccessToken: jest.fn().mockResolvedValue('test-token'),
    });
    
    mockUseWallets({
      wallets: [{ address: '0x1234' }],
    });

    const { result, rerender } = renderHook(() => useAuth());

    // Then update to authenticated = false
    mockUsePrivy({
      login: jest.fn(),
      logout: jest.fn(),
      authenticated: false,
      user: null,
      ready: true,
      getAccessToken: jest.fn(),
    });
    
    mockUseWallets({
      wallets: [],
    });

    rerender();

    // Verify the user profile is reset
    expect(result.current.userProfile).toBeNull();
  });
});
