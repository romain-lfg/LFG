# LFG Backend API

This is the backend API service for the LFG (Looking For Group) platform. It provides a simple interface to interact with the Nillion secure data storage service.

## Overview

The backend is designed to be as simple as possible, directly utilizing Nillion's functions for bounty management. It uses Express.js with TypeScript and provides straightforward endpoints for bounty operations.

## Project Structure

```
src/
└── app.ts    # Main application file with all endpoints and Nillion integration
```

## API Endpoints

### Bounties

#### POST /bounties
Create a new bounty.

```bash
curl -X POST http://localhost:3001/bounties -H 'Content-Type: application/json' -d '{
  "title": "Example Bounty",
  "description": "Description here",
  "reward": 1000,
  "requirements": ["skill1", "skill2"]
}'
```

#### GET /bounties
List all bounties.

```bash
curl http://localhost:3001/bounties
```

#### GET /bounties/match/:userId
Get bounties that match a specific user.

```bash
curl http://localhost:3001/bounties/match/user123
```

#### POST /bounties/clear
Clear all bounties (testing endpoint).

```bash
curl -X POST http://localhost:3001/bounties/clear
```

## Setup and Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run development server:
   ```bash
   npm run dev
   ```

The server will start on port 3001 by default.

## Environment Variables

- `PORT` - Server port (default: 3001)

## Dependencies

- Express.js - Web framework
- CORS - Cross-origin resource sharing
- TypeScript - Type safety
- Nillion SDK - Secure data storage
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
