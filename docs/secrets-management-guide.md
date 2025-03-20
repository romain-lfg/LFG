# Secrets Management Guide

## Overview

This guide outlines best practices for managing secrets and sensitive information in the LFG project. Proper secrets management is crucial for maintaining security, especially when dealing with authentication tokens, API keys, and user data.

## Key Principles

1. **Never commit secrets to version control**
2. **Use environment variables for configuration**
3. **Separate development, staging, and production environments**
4. **Rotate secrets regularly**
5. **Limit access to production secrets**

## Environment Files

The project uses `.env` files for environment-specific configuration:

- `.env.example` - Template with placeholder values (safe to commit)
- `.env.development` - Local development configuration (DO NOT commit)
- `.env.staging` - Staging environment configuration (DO NOT commit)
- `.env.production` - Production environment configuration (DO NOT commit)

## Required Environment Variables

### Backend

```
# Server Configuration
NODE_ENV=production|staging|development
PORT=3001
FRONTEND_URL=https://your-frontend-url.vercel.app

# Logging
LOG_LEVEL=info|debug|error

# Supabase Configuration
SUPABASE_URL=https://your-supabase-project-url.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Privy Configuration
PRIVY_APP_ID=your-privy-app-id
PRIVY_APP_SECRET=your-privy-app-secret
PRIVY_PUBLIC_KEY=your-privy-public-key
```

### Frontend

```
# Environment
NEXT_PUBLIC_ENVIRONMENT=production|staging|development
NEXT_PUBLIC_API_URL=https://your-backend-api-url.vercel.app
NEXT_PUBLIC_LOG_LEVEL=info|debug|error

# Feature Flags
NEXT_PUBLIC_ENABLE_NILLION=true|false

# Network Configuration
NEXT_PUBLIC_NETWORK=sepolia|mainnet
NEXT_PUBLIC_IPFS_GATEWAY=https://ipfs.io/ipfs/
```

## Deployment Secrets

For Vercel deployments, secrets should be configured through the Vercel dashboard rather than committed to the repository. This includes:

1. Environment variables for both frontend and backend
2. API keys and service credentials
3. Database connection strings

## Handling Secrets in Code

1. **Access environment variables** through a centralized configuration module
2. **Log securely** - Never log full secrets, only log prefixes if needed for debugging
3. **Validate environment variables** at startup to ensure all required variables are present

## Security Measures

1. **Gitignore**: All `.env` files (except `.env.example`) are added to `.gitignore`
2. **Secret Rotation**: Rotate secrets regularly, especially after team member departures
3. **Access Control**: Limit access to production secrets to essential team members only
4. **Monitoring**: Monitor for unauthorized access or unusual activity

## If Secrets Are Accidentally Committed

If secrets are accidentally committed to the repository:

1. **Immediately rotate the exposed secrets**
2. Run the `scripts/remove-sensitive-files.sh` script to remove secrets from git history
3. Force push the changes to the repository
4. Notify all team members to update their local repositories

## Tools and Resources

- [Vercel Environment Variables](https://vercel.com/docs/environment-variables)
- [Supabase Security Best Practices](https://supabase.com/docs/guides/auth/managing-user-data)
- [Privy Security Documentation](https://docs.privy.io/guide/security)
