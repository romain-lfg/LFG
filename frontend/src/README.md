# LFG Frontend Architecture

## API Integration Layer

This directory contains the core API integration layer for the LFG (Looking For Group) platform. It's designed to provide a clean and type-safe interface between the frontend and backend services.

### Directory Structure

```
src/
├── types/           # TypeScript interfaces and type definitions
│   ├── bounty.ts    # Bounty-related types
│   ├── vsa.ts       # Virtual Synergy Agent types
│   └── api.ts       # Common API types and error codes
├── services/        # API service layer
│   ├── api.ts       # Base API client
│   ├── config.ts    # API configuration
│   ├── bounty.service.ts  # Bounty-specific API calls
│   └── vsa.service.ts     # VSA-specific API calls
└── mocks/           # Mock data for development
    ├── bounties.ts  # Mock bounty data
    └── vsas.ts      # Mock VSA data
```

### Key Features

1. **Type Safety**
   - Comprehensive TypeScript interfaces for all data structures
   - Strict type checking for API requests and responses
   - Shared types between frontend and backend

2. **Service Layer**
   - Singleton pattern for API clients
   - Centralized error handling
   - Easy-to-use service methods

3. **Mock Data**
   - Realistic mock data for development
   - Matches production data structure
   - Easy to switch between mock and real API

### Usage Example

```typescript
// Using the bounty service
const bountyService = BountyService.getInstance();

// List bounties with pagination
const bounties = await bountyService.listBounties({
  page: 1,
  limit: 10,
  status: 'open',
  skills: ['Solidity']
});

// Create a new bounty
const newBounty = await bountyService.createBounty({
  title: 'Implement Smart Contract',
  description: 'Create an escrow contract',
  reward: {
    amount: '1000000000000000000', // 1 ETH
    token: 'ETH',
    chainId: 11155111 // Sepolia
  },
  // ... other required fields
});
```

### Error Handling

The API layer includes standardized error handling:

```typescript
try {
  const bounty = await bountyService.getBounty('123');
} catch (error) {
  if (error instanceof HTTPError) {
    switch (error.code) {
      case ERROR_CODES.NOT_FOUND:
        console.error('Bounty not found');
        break;
      case ERROR_CODES.UNAUTHORIZED:
        console.error('Please connect your wallet');
        break;
      default:
        console.error('An error occurred:', error.message);
    }
  }
}
```

### Environment Configuration

Required environment variables:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_NETWORK=sepolia
NEXT_PUBLIC_IPFS_GATEWAY=https://ipfs.io/ipfs/
```

### Best Practices

1. **API Calls**
   - Use service methods instead of direct fetch calls
   - Handle errors appropriately
   - Include proper typing for requests and responses

2. **Mock Data**
   - Keep mock data up to date with type changes
   - Use realistic values for testing
   - Document any assumptions in mock data

3. **Type Safety**
   - Don't use `any` types
   - Keep interfaces up to date with backend changes
   - Use strict null checks

4. **Error Handling**
   - Always catch and handle errors appropriately
   - Use standard error codes from `ERROR_CODES`
   - Provide meaningful error messages to users

### Contributing

When adding new features:

1. Update types if needed
2. Add corresponding service methods
3. Update mock data
4. Document changes in this README
5. Add appropriate error handling
