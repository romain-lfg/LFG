# Setting Up Sensitive Environment Variables in Vercel

This guide explains how to set up sensitive environment variables in Vercel for both the frontend and backend projects.

## Why Use Vercel's Environment Variables UI?

Sensitive information such as API keys, secrets, and tokens should never be committed to your repository. Instead, they should be set through Vercel's Environment Variables UI, which:

1. Keeps sensitive data out of your codebase
2. Allows for different values across environments (development, preview, production)
3. Encrypts the values at rest
4. Restricts access to team members with appropriate permissions

## Frontend Environment Variables

For the frontend project (`lfg-frontend-staging`), you need to set the following sensitive environment variables:

| Variable | Description |
|----------|-------------|
| NEXT_PUBLIC_PRIVY_APP_ID | Your Privy application ID |
| NEXT_PUBLIC_NILLION_SECRET_KEY | Your Nillion secret key |
| NEXT_PUBLIC_NILLION_ORG_DID | Your Nillion organization DID |

## Backend Environment Variables

For the backend project (`lfg-backend-api-staging`), you need to set the following sensitive environment variables:

| Variable | Description |
|----------|-------------|
| PRIVY_APP_ID | Your Privy application ID |
| PRIVY_APP_SECRET | Your Privy application secret |
| PRIVY_PUBLIC_KEY | Your Privy public verification key |
| SUPABASE_SERVICE_ROLE_KEY | Your Supabase service role key |
| NILLION_API_KEY | Your Nillion API key |
| JWT_SECRET | A secure random string for JWT signing |

## Steps to Set Environment Variables in Vercel

1. Log in to your [Vercel dashboard](https://vercel.com/dashboard)
2. Select your project (`lfg-frontend-staging` or `lfg-backend-api-staging`)
3. Go to "Settings" > "Environment Variables"
4. Add each variable with its corresponding value
5. Select the environments where the variable should be available (Development, Preview, Production)
6. Click "Save"

## Verifying Environment Variables

After setting up the environment variables, you can verify they're correctly configured by:

1. Redeploying your project
2. Checking the logs for any environment-related errors
3. Testing functionality that depends on these variables

## Important Notes

- Variables prefixed with `NEXT_PUBLIC_` in Next.js projects will be exposed to the browser. Only use this prefix for variables that are safe to expose to clients.
- For the backend, all environment variables are kept server-side and are not exposed to clients.
- When updating environment variables, your project will need to be redeployed for the changes to take effect.
- Consider using Vercel's "Preview" environment feature to test environment variables before deploying to production.

## Troubleshooting

If you encounter issues with environment variables:

1. Check that the variable names match exactly what your code expects
2. Verify the values are correct and properly formatted
3. Ensure the variables are set for the correct environments
4. Check the deployment logs for any errors related to missing environment variables
