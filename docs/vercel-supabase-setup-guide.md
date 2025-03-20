# Vercel and Supabase Staging Environment Setup Guide

This guide walks you through setting up a staging environment for the LFG platform using Vercel for deployment and Supabase for the database.

## Prerequisites

- [Vercel Account](https://vercel.com/signup)
- [Supabase Account](https://app.supabase.io/signup)
- [GitHub Account](https://github.com/signup)
- [Node.js](https://nodejs.org/) (v16 or later)
- [Vercel CLI](https://vercel.com/docs/cli)
- [Supabase CLI](https://supabase.com/docs/guides/cli)

## 1. Setting Up Supabase

### 1.1 Install the Supabase CLI

```bash
npm install -g supabase
```

### 1.2 Login to Supabase

```bash
supabase login
```

Follow the prompts to authenticate with your Supabase account.

### 1.3 Create a Staging Project

You can use our script to create a staging project:

```bash
# Make the script executable
chmod +x scripts/setup-supabase-staging.js

# Set your Supabase organization ID
export SUPABASE_ORG_ID=your-org-id

# Run the script
node scripts/setup-supabase-staging.js
```

Alternatively, you can create a project manually:

1. Go to [Supabase Dashboard](https://app.supabase.io)
2. Click "New Project"
3. Enter "lfg-staging" as the name
4. Choose your region
5. Set a secure database password
6. Click "Create Project"

### 1.4 Initialize Supabase Locally

```bash
# Initialize Supabase
supabase init

# Link to your remote project
supabase link --project-ref your-project-id
```

### 1.5 Push Database Schema

```bash
# Push your local schema to the remote project
supabase db push
```

## 2. Setting Up Vercel

### 2.1 Install the Vercel CLI

```bash
npm install -g vercel
```

### 2.2 Login to Vercel

```bash
vercel login
```

Follow the prompts to authenticate with your Vercel account.

### 2.3 Set Up Backend Project

```bash
cd backend
vercel
```

During the setup:
- Choose to link to an existing project or create a new one
- Set the project name (e.g., "lfg-backend-staging")
- Set the directory to deploy (./backend)

### 2.4 Set Up Frontend Project

```bash
cd ../frontend
vercel
```

During the setup:
- Choose to link to an existing project or create a new one
- Set the project name (e.g., "lfg-frontend-staging")
- Set the directory to deploy (./frontend)

### 2.5 Configure Environment Variables

#### Backend Environment Variables

In the Vercel dashboard:
1. Go to your backend project
2. Navigate to "Settings" > "Environment Variables"
3. Add the following variables:
   - `DATABASE_URL`: Your Supabase PostgreSQL connection string
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_ANON_KEY`: Your Supabase anonymous key
   - `SUPABASE_SERVICE_KEY`: Your Supabase service role key
   - `PRIVY_APP_ID`: Your Privy application ID
   - `PRIVY_APP_SECRET`: Your Privy application secret
   - `PRIVY_PUBLIC_KEY`: Your Privy public key
   - `NILLION_API_KEY`: Your Nillion API key
   - `NILLION_ENVIRONMENT`: "staging"
   - `NODE_ENV`: "staging"
   - `API_URL`: Your backend API URL (e.g., "https://api-staging.lfg.example.com")
   - `CORS_ORIGIN`: Your frontend URL (e.g., "https://staging.lfg.example.com")
   - `LOG_LEVEL`: "DEBUG"
   - `JWT_SECRET`: A secure random string
   - `JWT_EXPIRATION`: "24h"

#### Frontend Environment Variables

In the Vercel dashboard:
1. Go to your frontend project
2. Navigate to "Settings" > "Environment Variables"
3. Add the following variables:
   - `NEXT_PUBLIC_API_URL`: Your backend API URL
   - `NEXT_PUBLIC_PRIVY_APP_ID`: Your Privy application ID
   - `NEXT_PUBLIC_ENVIRONMENT`: "staging"
   - `NEXT_PUBLIC_ENABLE_NILLION`: "true"
   - `NEXT_PUBLIC_ANALYTICS_ID`: Your analytics ID for staging
   - `NEXT_PUBLIC_LOG_LEVEL`: "debug"

## 3. Setting Up GitHub Actions for CI/CD

### 3.1 Add GitHub Secrets

In your GitHub repository:
1. Go to "Settings" > "Secrets and variables" > "Actions"
2. Add the following secrets:
   - `VERCEL_TOKEN`: Your Vercel API token
   - `VERCEL_ORG_ID`: Your Vercel organization ID
   - `VERCEL_BACKEND_PROJECT_ID`: Your backend project ID
   - `VERCEL_FRONTEND_PROJECT_ID`: Your frontend project ID
   - `SUPABASE_ACCESS_TOKEN`: Your Supabase access token
   - `SUPABASE_PROJECT_ID`: Your Supabase project ID

### 3.2 Create a Staging Branch

```bash
git checkout -b staging
git push -u origin staging
```

### 3.3 Trigger a Deployment

The GitHub Actions workflow will automatically deploy to staging when you push to the staging branch:

```bash
git checkout staging
# Make some changes
git add .
git commit -m "Update for staging deployment"
git push
```

## 4. Custom Domains (Optional)

### 4.1 Configure Custom Domains in Vercel

In the Vercel dashboard:
1. Go to your backend project
2. Navigate to "Settings" > "Domains"
3. Add your custom domain (e.g., "api-staging.lfg.example.com")

Repeat for the frontend project with your frontend domain (e.g., "staging.lfg.example.com").

### 4.2 Configure DNS

Follow Vercel's instructions to configure your DNS settings with your domain provider.

## 5. Testing the Staging Environment

### 5.1 Run End-to-End Tests

```bash
cd tests
TEST_BASE_URL=https://staging.lfg.example.com npm test
```

### 5.2 Manual Testing

1. Visit your staging frontend URL
2. Test the authentication flow
3. Test wallet creation and connection
4. Test Nillion integration
5. Verify all critical features

## 6. Monitoring

### 6.1 Set Up Monitoring

1. Set up logging with a service like Datadog, New Relic, or Grafana
2. Configure alerts for critical issues
3. Set up error tracking with a service like Sentry

### 6.2 Dashboard Setup

Follow the instructions in the [monitoring-dashboard-setup.md](./monitoring-dashboard-setup.md) guide to set up comprehensive monitoring for your staging environment.

## 7. Troubleshooting

### 7.1 Vercel Deployment Issues

- Check the deployment logs in the Vercel dashboard
- Verify that all environment variables are set correctly
- Check for build errors in the GitHub Actions logs

### 7.2 Supabase Issues

- Check the Supabase logs in the Supabase dashboard
- Verify that the database schema is correct
- Check for migration errors in the GitHub Actions logs

### 7.3 Authentication Issues

- Verify that Privy is configured correctly
- Check the authentication logs
- Verify that the JWT secret is set correctly

## 8. Best Practices

### 8.1 Environment Isolation

Keep your staging environment isolated from production:
- Use separate databases
- Use separate API keys
- Use separate domains

### 8.2 Data Management

- Regularly reset staging data to a known state
- Use anonymized production data for testing
- Implement data retention policies

### 8.3 Continuous Improvement

- Regularly update your staging environment
- Implement feedback from testing
- Keep dependencies up to date

## Conclusion

Your staging environment is now set up and ready for testing. You can use this environment to test new features, fix bugs, and ensure that everything works correctly before deploying to production.
