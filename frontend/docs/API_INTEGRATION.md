# API Integration Guide

## Current Status
- Backend API implemented with Express
- Simple API key authentication
- Nillion SDK integration with development fallback
- Frontend API client ready for use

## Integration Phases

## Using the API Client

We've implemented a simple API client that handles all backend communication. Here's how to use it:

```typescript
import { apiClient } from '../lib/api/client';

// Get all bounties
const bounties = await apiClient.getBounties();

// Create a new bounty
await apiClient.createBounty({
  title: 'New Bounty',
  description: 'Description...',
  // ... other bounty fields
});

// Match bounties for a user
const matches = await apiClient.matchBountiesForUser('userId');

// Match bounties for an owner
const ownerBounties = await apiClient.matchBountiesForOwner('ownerId');
```

### Error Handling

The API client automatically handles errors and provides meaningful error messages:

```typescript
try {
  const bounties = await apiClient.getBounties();
} catch (error) {
  console.error('Failed to fetch bounties:', error.message);
}
```

## Environment Setup

1. **Required Environment Variables**
   ```env
   # API Configuration
   NEXT_PUBLIC_API_URL=http://localhost:3001  # Backend API URL
   NEXT_PUBLIC_API_KEY=your-api-key          # API key for authentication

   # Optional Configuration
   NEXT_PUBLIC_ENVIRONMENT=development       # or production
   ```

2. **Environment Branches**
   - `development` - Points to staging API
   - `staging` - For QA and testing
   - `production` - Live environment

### Phase 3: API Integration
1. **Authentication Integration**
   - Implement wallet connection
   - Handle user sessions
   - Manage authentication state

2. **Data Integration**
   - Replace mock data with API calls
   - Implement error handling
   - Add loading states
   - Setup retry mechanisms

3. **Feature Flag Updates**
   - Gradually enable features as endpoints become available
   - Maintain fallback to mock data when needed

### Phase 4: Testing & Validation
1. **Integration Testing**
   - API endpoint connectivity
   - Error handling scenarios
   - Data validation
   - Performance testing

2. **End-to-End Testing**
   - User flows
   - Cross-browser testing
   - Mobile responsiveness

### Phase 5: Monitoring & Maintenance
1. **Monitoring Setup**
   - API response times
   - Error rates
   - User interactions

2. **Documentation**
   - API usage examples
   - Common issues and solutions
   - Deployment procedures

## Available API Endpoints

### Public Endpoints
```typescript
GET /health                 // Health check
GET /api-docs               // Swagger UI
GET /api-docs.json          // OpenAPI specification
```

### Protected Bounty Endpoints
All these endpoints require the `X-API-Key` header:

```typescript
// List bounties with filtering
GET /api/bounties
  ?page=1              // Optional: Page number
  &pageSize=10         // Optional: Items per page
  &status=open         // Optional: Filter by status
  &skills=solidity,web3 // Optional: Filter by skills

// Create new bounty
POST /api/bounties

// Match bounties for user
GET /api/bounties/match/user/:userId

// Match bounties for owner
GET /api/bounties/match/owner/:userId
```

The API client handles authentication automatically when configured with an API key.

## Data Schemas

## Data Types

### Bounty
```typescript
interface Bounty {
  id: string;
  title: string;
  description: string;
  longDescription?: string;
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  requiredSkills: string[];
  estimatedTime: string;
  datePosted: string;
  dueDate: string;
  reward: {
    amount: string;
    token: string;
    chainId: string;
  };
  ownerId?: string;      // ID of bounty creator
  assignedTo?: string;   // ID of assigned user
}
```

### API Response
```typescript
interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}
```

### VSA
```typescript
interface VSA {
  id: string;
  title: string;
  description: string;
  skills: string[];
  category: string;
  status: 'available' | 'engaged' | 'unavailable';
  creator: {
    address: string;
    name?: string;
  };
  createdAt: string;
  updatedAt: string;
}
```

## Development Workflow

1. **Local Development**
   - Backend runs on `http://localhost:3001`
   - API documentation available at `http://localhost:3001/api-docs`
   - Set `NEXT_PUBLIC_API_KEY` to `default-dev-key` for development

2. **Testing**
   - Backend includes test suite with Jest
   - API endpoints can be tested via Swagger UI
   - Use the health check endpoint to verify API status

3. **Debugging**
   - Check browser console for API client errors
   - Backend logs available in terminal
   - Swagger UI provides request/response inspection

4. **Production Deployment**
   - Update environment variables in Vercel
   - Ensure API key is properly set
   - Verify CORS configuration matches frontend URL

## Security Notes

1. **API Key**
   - Keep your API key secure
   - Don't commit it to version control
   - Use environment variables

2. **CORS**
   - Backend only accepts requests from configured frontend URL
   - Set `FRONTEND_URL` in backend environment

3. **Error Handling**
   - Don't expose sensitive information in error messages
   - Log errors appropriately
   - Return user-friendly error messages
