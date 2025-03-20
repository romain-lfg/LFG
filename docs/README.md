# LFG Project Documentation

This directory contains documentation for the LFG project. Below is a list of available guides and documentation.

## Authentication System

- [Authentication README](./authentication-readme.md) - Comprehensive overview of the authentication system
- [Auth Components Guide](./auth-components-guide.md) - Frontend authentication components documentation
- [Frontend Auth Integration](./frontend-auth-integration.md) - Step-by-step guide for frontend authentication integration
- [Privy Auth Implementation Guide](./privy-auth-implementation-guide.md) - Detailed backend authentication implementation guide
- [Auth Testing Guide](./auth-testing-comprehensive-guide.md) - Comprehensive testing guide for authentication
- [Auth Security Checklist](./auth-security-checklist.md) - Security best practices for authentication
- [Auth Troubleshooting](./auth-troubleshooting.md) - Troubleshooting guide for authentication issues

## Environment Configuration

- [Environment Variables Guide](./environment-variables-guide.md) - Overview of environment variables and file structure
- [Vercel Environment Variables](./vercel-environment-variables.md) - How to set up sensitive environment variables in Vercel
- [Supabase Password Instructions](./supabase-password-instructions.md) - Instructions for Supabase password management

## Deployment

- [Deployment Guide](./deployment-guide.md) - How to deploy the application
- [Production Deployment Guide](./production-deployment-guide.md) - Guide for production deployment
- [Vercel Supabase Setup Guide](./vercel-supabase-setup-guide.md) - Guide for setting up Vercel with Supabase

## Testing and Monitoring

- [Testing and Monitoring Guide](./testing-and-monitoring-guide.md) - Guide for testing and monitoring the application
- [User Feedback Guide](./user-feedback-guide.md) - Guide for collecting and processing user feedback

## Getting Started

To get started with the LFG project:

1. Clone the repository
2. Set up environment variables following the [Environment Variables Guide](./environment-variables-guide.md)
3. Install dependencies with `npm install` in both frontend and backend directories
4. Start the development servers with `npm run dev`

For more detailed instructions, refer to the project's main README.md file.










```

# Local Inference Setup

### CUDA Setup

If you have an NVIDIA GPU, you can install CUDA to speed up local inference dramatically.

```
pnpm install
npx --no node-llama-cpp source download --gpu cuda
```

Make sure that you've installed the CUDA Toolkit, including cuDNN and cuBLAS.

### Running locally

By default, the bot will download and use a local model. You can change this by setting the environment variables for the model you want to use.

# Clients

## Discord Bot

For help with setting up your Discord Bot, check out here: https://discordjs.guide/preparations/setting-up-a-bot-application.html

# Development

## Testing

To run the test suite:

```bash
pnpm test           # Run tests once
pnpm test:watch    # Run tests in watch mode
```

For database-specific tests:

```bash
pnpm test:sqlite   # Run tests with SQLite
pnpm test:sqljs    # Run tests with SQL.js
```

Tests are written using Jest and can be found in `src/**/*.test.ts` files. The test environment is configured to:

- Load environment variables from `.env.test`
- Use a 2-minute timeout for long-running tests
- Support ESM modules
- Run tests in sequence (--runInBand)

To create new tests, add a `.test.ts` file adjacent to the code you're testing.

## Docs Updates

Please make sure to verify if the documentation provided is correct. In order to do so, please run the docs service.

```console
docker compose -f docker-compose-docs.yaml up --build
```

The docusaurus server will get started and you can verify it locally at https://localhost:3000/eliza.
