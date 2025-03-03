# Staging Deployment Guide

This guide outlines the steps to deploy the LFG platform to a staging environment and verify its functionality before production deployment.

## Prerequisites

- Access to the staging environment
- Environment variables for the staging environment
- SSH access to the staging servers

## Deployment Steps

### 1. Prepare Environment Files

1. Create backend environment file:
   ```bash
   cp backend/.env.production.template backend/.env.staging
   ```

2. Edit `backend/.env.staging` with the appropriate values for the staging environment:
   ```
   NODE_ENV=staging
   PORT=3001
   DATABASE_URL=postgresql://username:password@staging-db-host:5432/lfg_staging
   PRIVY_APP_ID=your_staging_privy_app_id
   PRIVY_APP_SECRET=your_staging_privy_app_secret
   PRIVY_PUBLIC_KEY=your_staging_privy_public_key
   JWT_SECRET=your_staging_jwt_secret
   LOG_LEVEL=debug
   ```

3. Create frontend environment file:
   ```bash
   cp frontend/.env.production.template frontend/.env.staging
   ```

4. Edit `frontend/.env.staging` with the appropriate values for the staging environment:
   ```
   NEXT_PUBLIC_API_URL=https://staging-api.lfg.example.com
   NEXT_PUBLIC_PRIVY_APP_ID=your_staging_privy_app_id
   NEXT_PUBLIC_ENVIRONMENT=staging
   ```

### 2. Deploy to Staging

1. Create a staging deployment script:

```bash
#!/bin/bash

# Exit on error
set -e

echo "Starting LFG platform staging deployment..."

# Check for required environment files
if [ ! -f ./backend/.env.staging ]; then
  echo "Error: backend/.env.staging file not found!"
  exit 1
fi

if [ ! -f ./frontend/.env.staging ]; then
  echo "Error: frontend/.env.staging file not found!"
  exit 1
fi

# Deploy backend
echo "Deploying backend to staging..."
cd backend
cp .env.staging .env
npm run build
rsync -avz --exclude node_modules --exclude .git . user@staging-server:/path/to/backend
ssh user@staging-server "cd /path/to/backend && npm install && pm2 restart lfg-backend"
cd ..

# Deploy frontend
echo "Deploying frontend to staging..."
cd frontend
cp .env.staging .env
npm run build
rsync -avz --exclude node_modules --exclude .git .next user@staging-server:/path/to/frontend
ssh user@staging-server "cd /path/to/frontend && npm install && pm2 restart lfg-frontend"
cd ..

echo "Staging deployment completed successfully!"
echo "Backend: https://staging-api.lfg.example.com"
echo "Frontend: https://staging.lfg.example.com"
```

2. Make the script executable and run it:
   ```bash
   chmod +x scripts/deploy-staging.sh
   ./scripts/deploy-staging.sh
   ```

### 3. Run End-to-End Tests Against Staging

1. Configure the Playwright tests to run against the staging environment:

```typescript
// tests/playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  use: {
    baseURL: process.env.TEST_BASE_URL || 'https://staging.lfg.example.com',
    headless: true,
  },
  testDir: './e2e',
  reporter: 'html',
});
```

2. Run the end-to-end tests:
   ```bash
   cd tests
   TEST_BASE_URL=https://staging.lfg.example.com npm test
   ```

3. Verify the test results and fix any issues found.

### 4. Manual Verification

1. Verify the authentication flow:
   - Register a new user
   - Login with the registered user
   - Connect a wallet
   - Access protected routes
   - Logout

2. Verify the Nillion integration:
   - Store user data in Nillion
   - Retrieve user data from Nillion
   - Match bounties with users

3. Verify error handling:
   - Test with invalid credentials
   - Test with invalid tokens
   - Test with network errors

## Monitoring

1. Set up monitoring for the staging environment:
   - Configure logging to a centralized logging service
   - Set up alerts for critical errors
   - Monitor API response times and error rates

2. Review the logs and metrics to ensure everything is working as expected.

## Rollback Plan

In case of issues with the staging deployment, have a rollback plan ready:

1. Keep a backup of the previous version
2. Document the steps to restore the previous version
3. Test the rollback procedure to ensure it works

## Next Steps

Once the staging deployment is verified and all tests pass, proceed to the production deployment using the production deployment guide.
