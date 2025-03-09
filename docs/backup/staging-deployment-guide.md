# Staging Deployment Guide

This guide outlines the steps to deploy the LFG platform to a Vercel staging environment and verify its functionality before production deployment.

## Prerequisites

- Vercel account with access to the LFG projects
- Vercel CLI installed (`npm install -g vercel`)
- GitHub repository access
- Required environment variables for the staging environment

## Deployment Steps

### 1. Prepare Environment Files

1. Ensure backend environment file is properly configured:
   ```bash
   # Check if the file exists
   cat backend/.env.staging
   ```

2. The `backend/.env.staging` file should contain the following values:
   ```
   # Server Configuration
   NODE_ENV=staging
   PORT=8080
   FRONTEND_URL=https://lfg-frontend-staging-3vhlp0568-lfg-5fd382da.vercel.app
   CORS_ORIGIN=https://lfg-frontend-staging-3vhlp0568-lfg-5fd382da.vercel.app
   
   # Logging
   LOG_LEVEL=debug
   
   # Privy Authentication
   PRIVY_APP_ID=your-privy-app-id
   PRIVY_APP_SECRET=your-privy-app-secret
   PRIVY_PUBLIC_KEY=your-privy-public-key
   
   # Supabase Configuration
   SUPABASE_URL=https://kkkwputcwjkuzniuuehq.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
   
   # Nillion Integration
   NILLION_API_KEY=your-nillion-api-key
   NILLION_ENVIRONMENT=staging
   ```

3. Ensure frontend environment file is properly configured:
   ```bash
   # Check if the file exists
   cat frontend/.env.staging
   ```

4. The `frontend/.env.staging` file should contain the following values:
   ```
   # Environment
   NEXT_PUBLIC_ENVIRONMENT=staging
   
   # API Configuration
   NEXT_PUBLIC_API_URL=https://lfg-backend-api-staging-dscimds2r-lfg-5fd382da.vercel.app
   
   # Privy Configuration
   NEXT_PUBLIC_PRIVY_APP_ID=your-privy-app-id
   
   # Feature Flags
   NEXT_PUBLIC_ENABLE_NILLION=true
   
   # Nillion Configuration
   NEXT_PUBLIC_NILLION_SECRET_KEY=your-staging-secret-key
   NEXT_PUBLIC_NILLION_ORG_DID=your-staging-org-did
   
   # Network Configuration
   NEXT_PUBLIC_NETWORK=sepolia
   NEXT_PUBLIC_IPFS_GATEWAY=https://ipfs.io/ipfs/
   
   # Logging
   NEXT_PUBLIC_LOG_LEVEL=debug
   ```

### 2. Deploy to Staging

1. We've prepared a staging deployment script that uses Vercel for deployment:

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

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
  echo "Vercel CLI not found. Installing..."
  npm install -g vercel
fi

# Deploy backend to Vercel
echo "Deploying backend to Vercel staging..."
cd backend
cp .env.staging .env
vercel pull --yes --environment=preview
vercel build
vercel deploy --prebuilt --scope lfg-5fd382da
cd ..

# Deploy frontend to Vercel
echo "Deploying frontend to Vercel staging..."
cd frontend
cp .env.staging .env
vercel pull --yes --environment=preview
vercel build
vercel deploy --prebuilt --scope lfg-5fd382da
cd ..

echo "Staging deployment completed successfully!"
echo "Backend URL: https://lfg-backend-api-staging-dscimds2r-lfg-5fd382da.vercel.app"
echo "Frontend URL: https://lfg-frontend-staging-3vhlp0568-lfg-5fd382da.vercel.app"
```

2. Make the script executable and run it:
   ```bash
   chmod +x scripts/deploy-staging.sh
   ./scripts/deploy-staging.sh
   ```

3. Alternatively, you can deploy directly from the GitHub repository:
   - Go to the Vercel dashboard: https://vercel.com/dashboard
   - Select the LFG backend and frontend projects
   - Deploy from the staging branch

### 3. Run End-to-End Tests Against Staging

1. Configure the Playwright tests to run against the staging environment:

```typescript
// tests/playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: process.env.TEST_BASE_URL || 'https://lfg-frontend-staging-3vhlp0568-lfg-5fd382da.vercel.app',
    headless: true,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
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
