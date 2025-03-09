# Environment Variables Guide

This document outlines how environment variables are organized in the LFG project.

## File Structure

We maintain a clean and consistent environment file structure across both frontend and backend:

1. `.env.example` - Documentation of all available environment variables
2. `.env.development` - Variables for local development (can be copied from .env.example)
3. `.env.staging` - Variables for the staging environment
4. `.env.production.template` - Template for production variables (should be filled and renamed to .env.production)

**Note:** For CI/CD deployments, environment variables are set directly in GitHub Secrets and Vercel environment variables rather than using these files.

## Frontend Environment Variables

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| NEXT_PUBLIC_API_URL | URL for the backend API | Yes | http://localhost:3001 |
| NEXT_PUBLIC_ENVIRONMENT | Current environment | Yes | development |
| NEXT_PUBLIC_PRIVY_APP_ID | Privy App ID | Yes | your-privy-app-id |
| NEXT_PUBLIC_ENABLE_NILLION | Enable Nillion integration | Yes | true |
| NEXT_PUBLIC_NILLION_SECRET_KEY | Nillion Secret Key | If Nillion enabled | your-secret-key |
| NEXT_PUBLIC_NILLION_ORG_DID | Nillion Organization DID | If Nillion enabled | your-org-did |
| NEXT_PUBLIC_NETWORK | Blockchain network | Yes | sepolia |
| NEXT_PUBLIC_IPFS_GATEWAY | IPFS Gateway URL | Yes | https://ipfs.io/ipfs/ |
| NEXT_PUBLIC_LOG_LEVEL | Logging level | No | debug |
| NEXT_PUBLIC_ANALYTICS_ID | Analytics ID | No | your-analytics-id |

## Backend Environment Variables

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| NODE_ENV | Node environment | Yes | development |
| PORT | Server port | Yes | 3001 |
| FRONTEND_URL | URL of the frontend | Yes | http://localhost:3000 |
| LOG_LEVEL | Logging level | Yes | debug |
| CORS_ORIGIN | CORS allowed origin | Yes | http://localhost:3000 |
| PRIVY_APP_ID | Privy App ID | Yes | your-privy-app-id |
| PRIVY_APP_SECRET | Privy App Secret | Yes | your-privy-app-secret |
| PRIVY_PUBLIC_KEY | Privy Public Key | Yes | your-privy-public-key |
| SUPABASE_URL | Supabase URL | Yes | https://your-project.supabase.co |
| SUPABASE_SERVICE_ROLE_KEY | Supabase Service Role Key | Yes | your-service-role-key |
| NILLION_API_KEY | Nillion API Key | If Nillion enabled | your-nillion-api-key |
| NILLION_ENVIRONMENT | Nillion Environment | If Nillion enabled | development |
| DATABASE_URL | Database connection URL | No | postgres://user:pass@host:port/db |

## Setting Up Environment Variables

### Local Development

1. Copy `.env.example` to `.env.development` in both frontend and backend directories
2. Fill in the required values for local development

### Staging Environment

1. Use the `.env.staging` files in both frontend and backend directories
2. Update the values to point to your staging resources

### Production Environment

1. Copy `.env.production.template` to `.env.production` in both directories
2. Fill in the production values
3. Keep these files secure and never commit them to version control

## Vercel and Supabase Integration

When deploying to Vercel, environment variables should be set in the Vercel project settings rather than relying on the .env files. Similarly, Supabase connection details should be securely stored in environment variables.

## Additional Documentation

For more detailed information on setting up environment variables, refer to:

1. [Vercel Environment Variables Guide](/docs/vercel-environment-variables.md) - How to set up sensitive environment variables in Vercel
2. [GitHub Secrets Guide](/docs/github-secrets-guide.md) - How to set up GitHub Secrets for CI/CD
