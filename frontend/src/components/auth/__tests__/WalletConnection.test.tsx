import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { WalletConnection } from '../WalletConnection';
import { usePrivy } from '@privy-io/react-auth';

// Mock the Privy hook
jest.mock('@privy-io/react-auth', () => ({
  usePrivy: jest.fn(),
}));

describe('WalletConnection Component', () => {
  const mockCreateWallet = jest.fn();
  const mockLinkWallet = jest.fn();
  const mockOnComplete = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementation
    (usePrivy as jest.Mock).mockReturnValue({
      user: {
        linkedAccounts: [],
      },
      createWallet: mockCreateWallet,
      linkWallet: mockLinkWallet,
    });
  });

  it('renders the wallet management UI correctly', () => {
    render(<WalletConnection onComplete={mockOnComplete} />);
    
    expect(screen.getByText('Wallet Management')).toBeInTheDocument();
    expect(screen.getByText('Connect an existing wallet or create a new embedded wallet to use with LFG.')).toBeInTheDocument();
    expect(screen.getByText('Connect Existing Wallet')).toBeInTheDocument();
    expect(screen.getByText('Create New Wallet')).toBeInTheDocument();
  });

  it('displays connected wallets when available', () => {
    (usePrivy as jest.Mock).mockReturnValue({
      user: {
        linkedAccounts: [
          { type: 'wallet', address: '0x1234567890abcdef1234567890abcdef12345678' },
        ],
      },
      createWallet: mockCreateWallet,
      linkWallet: mockLinkWallet,
    });
    
    render(<WalletConnection onComplete={mockOnComplete} />);
    
    expect(screen.getByText('Connected Wallets')).toBeInTheDocument();
    expect(screen.getByText('0x1234...5678')).toBeInTheDocument();
  });

  it('shows loading state when creating a wallet', async () => {
    mockCreateWallet.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    render(<WalletConnection onComplete={mockOnComplete} />);
    
    fireEvent.click(screen.getByText('Create New Wallet'));
    
    expect(await screen.findByText('Processing wallet operation...')).toBeInTheDocument();
  });

  it('shows success message after creating a wallet', async () => {
    mockCreateWallet.mockResolvedValue(undefined);
    
    render(<WalletConnection onComplete={mockOnComplete} />);
    
    fireEvent.click(screen.getByText('Create New Wallet'));
    
    expect(await screen.findByText('Your wallet has been created successfully!')).toBeInTheDocument();
    
    // Wait for the onComplete callback to be called
    await waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalledTimes(1);
    }, { timeout: 3000 });
  });

  it('shows error message when wallet creation fails', async () => {
    mockCreateWallet.mockRejectedValue(new Error('Failed to create wallet'));
    
    render(<WalletConnection onComplete={mockOnComplete} />);
    
    fireEvent.click(screen.getByText('Create New Wallet'));
    
    expect(await screen.findByText('Failed to create wallet. Please try again.')).toBeInTheDocument();
    expect(screen.getByText('Try Again')).toBeInTheDocument();
  });

  it('calls linkWallet when connecting an existing wallet', async () => {
    render(<WalletConnection onComplete={mockOnComplete} />);
    
    fireEvent.click(screen.getByText('Connect Existing Wallet'));
    
    expect(mockLinkWallet).toHaveBeenCalledTimes(1);
  });
});
