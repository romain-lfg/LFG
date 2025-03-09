# Setting Up GitHub Secrets for CI/CD

This guide explains how to set up the GitHub Secrets required for the CI/CD workflow.

## Why Use GitHub Secrets?

GitHub Secrets provide a secure way to store sensitive information like API tokens, passwords, and other credentials. These secrets are:

1. Encrypted at rest
2. Not exposed in logs
3. Not accessible to pull requests from forks
4. Only available to authorized users

## Required Secrets

The following secrets need to be set up in your GitHub repository:

### Vercel Deployment Secrets

| Secret Name | Description |
|-------------|-------------|
| VERCEL_TOKEN | Your Vercel API token |
| VERCEL_ORG_ID | Your Vercel organization ID |
| VERCEL_BACKEND_PROJECT_ID | The project ID for your backend on Vercel |
| VERCEL_FRONTEND_PROJECT_ID | The project ID for your frontend on Vercel |

### Backend Environment Secrets

| Secret Name | Description |
|-------------|-------------|
| PRIVY_APP_ID | Your Privy application ID |
| PRIVY_APP_SECRET | Your Privy application secret |
| PRIVY_PUBLIC_KEY | Your Privy public verification key |
| SUPABASE_SERVICE_ROLE_KEY | Your Supabase service role key |
| NILLION_API_KEY | Your Nillion API key |
| JWT_SECRET | A secure random string for JWT signing |

### Frontend Environment Secrets

| Secret Name | Description |
|-------------|-------------|
| NEXT_PUBLIC_PRIVY_APP_ID | Your Privy application ID |
| NEXT_PUBLIC_NILLION_SECRET_KEY | Your Nillion secret key |
| NEXT_PUBLIC_NILLION_ORG_DID | Your Nillion organization DID |

## How to Set Up GitHub Secrets

1. Go to your GitHub repository
2. Click on "Settings" > "Secrets and variables" > "Actions"
3. Click on "New repository secret"
4. Enter the name and value for each secret
5. Click "Add secret"

## Getting the Required Values

### Vercel Secrets

1. **VERCEL_TOKEN**:
   - Go to your [Vercel account settings](https://vercel.com/account/tokens)
   - Create a new token with appropriate permissions
   - Copy the token value

2. **VERCEL_ORG_ID**:
   - Run `vercel whoami` to get your organization ID

3. **VERCEL_BACKEND_PROJECT_ID** and **VERCEL_FRONTEND_PROJECT_ID**:
   - Go to your project settings in Vercel
   - The project ID is in the URL or in the project settings

### Privy Secrets

1. Log in to your [Privy dashboard](https://console.privy.io/)
2. Go to your application settings
3. Copy the App ID, App Secret, and Public Key

### Supabase Secrets

1. Log in to your [Supabase dashboard](https://app.supabase.io/)
2. Go to your project settings
3. Under "API", find and copy the service role key

### Nillion Secrets

1. Log in to your Nillion dashboard
2. Go to your application settings
3. Copy the API key, Secret Key, and Organization DID

### JWT Secret

Generate a secure random string for JWT signing:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Verifying Your Secrets

After setting up all secrets, you can verify they're correctly configured by:

1. Pushing a commit to your staging branch
2. Checking the GitHub Actions tab to see if the workflow runs successfully
3. Verifying that the deployment completes without errors

## Troubleshooting

If you encounter issues with GitHub Secrets:

1. Check that the secret names match exactly what the workflow expects
2. Verify the values are correct and properly formatted
3. Ensure you have the necessary permissions to create secrets
4. Check the workflow logs for any errors related to missing or invalid secrets
