# LFG Backend API

This is the backend API service for the LFG (Looking For Group) platform. It serves as a middleware between the frontend application and the Nillion secure data storage service.

## Features

- Simple API key authentication for endpoints
- Nillion SDK integration with development fallback
- Request validation using Zod schemas
- Centralized error handling
- Structured logging with Winston
- Pagination and filtering for bounty listings
- Complete TypeScript support
- Unit tests with Jest
- Interactive API documentation with Swagger/OpenAPI

## Architecture

```
src/
├── config/          # Environment and app configuration
│   ├── nillion.ts   # Nillion SDK configuration
│   └── swagger.ts   # API documentation config
├── types/           # TypeScript type definitions
├── services/        # Business logic and external service integration
│   └── nillion/     # Nillion service integration
├── controllers/     # Request handlers
├── routes/          # API route definitions
├── middleware/      # Express middleware
│   ├── apiKey.ts    # API key authentication
│   └── validate.ts  # Request validation
├── utils/           # Shared utilities
└── errors/          # Error handling

```

## Nillion Integration

The backend provides a flexible integration with Nillion that can operate in two modes:

### Production Mode
When properly configured with Nillion credentials, the backend uses the Nillion SDK for secure data storage and computation:

```typescript
const client = new SecretVaultWrapper({
  nodes: nillionConfig.nodes,
  credentials: nillionConfig.orgCredentials,
  schemaId: SCHEMA_IDS.BOUNTY
});
```

### Development Mode
When Nillion credentials are not configured, the backend automatically falls back to an in-memory implementation for easy development and testing:

```typescript
// In-memory storage fallback
let bounties: Bounty[] = [];
```

### Available Functions

The backend provides these Nillion-powered functions:

- `createBounty(data)`: Create a new bounty (stored in Nillion or memory)
- `getBountyList()`: Retrieve all bounties
- `matchBountiesUser(userId)`: Match bounties for a user using secure computation
- `matchBountiesOwner(userId)`: Match bounties for an owner

## API Endpoints

### Bounties

#### GET /api/bounties
List all bounties with filtering and pagination.

Query Parameters:
- `page` (optional): Page number (default: 1)
- `pageSize` (optional): Items per page (default: 10)
- `status` (optional): Filter by status ('open', 'in_progress', 'completed', 'cancelled')
- `skills` (optional): Filter by required skills (comma-separated)

Response:
```json
{
  "status": "success",
  "data": {
    "items": [...],
    "total": 100,
    "page": 1,
    "pageSize": 10,
    "hasMore": true
  }
}
```

#### POST /api/bounties
Create a new bounty.

Request Body:
```json
{
  "title": "string",
  "description": "string",
  "reward": {
    "amount": "string",
    "token": "string",
    "chainId": "number"
  },
  "requirements": {
    "skills": ["string"],
    "estimatedTimeInHours": "string",
    "deadline": "YYYY-MM-DD"
  },
  "creator": {
    "address": "string",
    "name": "string" // optional
  }
}
```

#### GET /api/bounties/match/user/:userId
Get matching bounties for a user.

#### GET /api/bounties/match/owner/:userId
Get matching bounties for an owner.

## Authentication

The API uses a simple API key authentication scheme. Include the API key in all requests using the `X-API-Key` header:

```bash
curl -H "X-API-Key: your-api-key" http://localhost:3001/api/bounties
```

### Public Endpoints
- GET /health
- GET /api-docs
- GET /api-docs.json

### Protected Endpoints
All `/api/*` endpoints require the `X-API-Key` header.

## API Documentation

The API documentation is available through Swagger UI when the server is running:

- **Development**: http://localhost:3001/api-docs
- **Production**: https://api.lfg.example.com/api-docs

The documentation includes:
- Detailed endpoint descriptions
- Request/response schemas
- Example payloads
- Try-it-out functionality

You can also access the raw OpenAPI specification at `/api-docs.json`.

## Setup and Development

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env
   ```

3. Run development server:
   ```bash
   pnpm dev
   ```

4. Run tests:
   ```bash
   pnpm test
   ```

## Environment Variables

### Required Variables
- `API_KEY` - Key for authenticating API requests
- `FRONTEND_URL` - Frontend application URL for CORS

### Nillion Configuration
- `NILLION_ORG_ID` - Your Nillion organization ID
- `NILLION_API_KEY` - Your Nillion API key

### Optional Variables
- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment (development/production)
- `LOG_LEVEL` - Winston logger level (default: info)

## Error Handling

The API uses a centralized error handling system with custom `AppError` class. All errors are logged and returned in a consistent format:

```json
{
  "status": "error",
  "code": "ERROR_CODE",
  "message": "Human readable message",
  "data": {} // Optional additional data
}
```

## Testing

Tests are written using Jest and follow this structure:
- Unit tests for services
- Integration tests for API endpoints
- E2E tests for critical flows

## Deployment

The API is deployed on Vercel. Follow these steps to deploy:

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Configure environment variables on Vercel:
   - Go to your project settings in Vercel dashboard
   - Add the environment variables from `.env.example`
   - Ensure `FRONTEND_URL` points to your frontend deployment

4. Deploy:
   ```bash
   vercel
   ```

   For production deployment:
   ```bash
   vercel --prod
   ```

### Build Process

The build process (`scripts/build.js`) includes:
1. Cleaning the dist directory
2. Installing dependencies
3. Type checking
4. Running tests
5. Building TypeScript

This ensures that only working code is deployed to production.

### Vercel Configuration

The `vercel.json` file configures:
- Build settings
- Route handling
- Environment variables

Make sure to update the `FRONTEND_URL` in your Vercel project settings to match your frontend deployment URL.
