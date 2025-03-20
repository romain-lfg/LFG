# LFG Deployment Guide

This guide provides instructions for deploying the LFG platform to production, with a focus on the authentication system.

## Prerequisites

- Node.js >= 16.x
- npm >= 8.x
- Access to Privy.io console
- Access to Supabase project
- Vercel account (for frontend deployment)

## Environment Setup

### Backend Environment Variables

1. Create a `.env` file in the backend directory based on the `.env.production.sample` file:

```bash
cp .env.production.sample .env
```

2. Update the environment variables with your production values:

```
# Server Configuration
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://your-production-frontend-url.com

# Supabase Configuration
SUPABASE_URL=https://your-supabase-project-url.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Privy Configuration
PRIVY_APP_ID=your-privy-app-id
PRIVY_APP_SECRET=your-privy-app-secret
PRIVY_PUBLIC_KEY=your-privy-public-key
```

3. Verify your environment variables:

```bash
node scripts/verify-env.js
```

### Frontend Environment Variables

1. Create a `.env.production` file in the frontend directory:

```
NEXT_PUBLIC_API_URL=https://your-production-backend-url.com
NEXT_PUBLIC_PRIVY_APP_ID=your-privy-app-id
```

## Backend Deployment

### Option 1: Deploy to Vercel

1. Install the Vercel CLI:

```bash
npm install -g vercel
```

2. Login to Vercel:

```bash
vercel login
```

3. Deploy the backend:

```bash
cd backend
vercel --prod
```

4. Configure environment variables in the Vercel dashboard.

### Option 2: Deploy to a VPS

1. Install PM2:

```bash
npm install -g pm2
```

2. Build the backend:

```bash
cd backend
npm run build
```

3. Start the server with PM2:

```bash
pm2 start dist/api/app.js --name lfg-backend
```

4. Configure PM2 to start on system boot:

```bash
pm2 startup
pm2 save
```

## Frontend Deployment

### Deploy to Vercel

1. Install the Vercel CLI (if not already installed):

```bash
npm install -g vercel
```

2. Login to Vercel:

```bash
vercel login
```

3. Deploy the frontend:

```bash
cd frontend
vercel --prod
```

4. Configure environment variables in the Vercel dashboard.

## Database Setup

### Supabase Setup

1. Create the necessary tables in Supabase:

```sql
-- Users table
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  wallet_address TEXT,
  email TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on wallet_address
CREATE INDEX idx_users_wallet_address ON users(wallet_address);

-- Create index on email
CREATE INDEX idx_users_email ON users(email);
```

2. Set up Row Level Security (RLS) policies:

```sql
-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policy for service role
CREATE POLICY "Service role can do all" ON users
  USING (true)
  WITH CHECK (true);
```

## Authentication Configuration

### Privy Configuration

1. Log in to the Privy console.
2. Configure the redirect URLs:
   - Add your production frontend URL as an allowed redirect URL.
3. Configure the webhook URL:
   - Add your production backend URL + `/api/webhooks/privy` as the webhook URL.
4. Copy the App ID, App Secret, and Public Key to your environment variables.

## Post-Deployment Verification

### Verify Backend

1. Test the API health endpoint:

```bash
curl https://your-production-backend-url.com/api/health
```

2. Test the authentication flow:

```bash
# This should return a 401 Unauthorized
curl https://your-production-backend-url.com/api/users/profile
```

### Verify Frontend

1. Open your production frontend URL in a browser.
2. Try to access the dashboard without logging in (should redirect to login).
3. Log in using Privy.
4. Verify that you can access the dashboard after logging in.

## Monitoring and Logging

### Backend Monitoring

1. Set up logging with Winston:

```bash
npm install winston
```

2. Configure Winston in your backend code.

### Error Tracking

1. Set up Sentry for error tracking:

```bash
npm install @sentry/node
```

2. Configure Sentry in your backend code.

## Security Considerations

1. **HTTPS**: Ensure that both frontend and backend are served over HTTPS.
2. **CORS**: Configure CORS to only allow requests from your frontend domain.
3. **Rate Limiting**: Implement rate limiting for authentication endpoints.
4. **Input Validation**: Validate all user inputs to prevent injection attacks.
5. **Audit Logging**: Log all authentication events for security monitoring.

## Troubleshooting

### Common Issues

1. **CORS Errors**: Check that the `FRONTEND_URL` environment variable is correctly set.
2. **Authentication Failures**: Verify that the Privy environment variables are correct.
3. **Database Connection Issues**: Check the Supabase URL and service role key.

### Debugging

1. Check the server logs:

```bash
# If using PM2
pm2 logs lfg-backend
```

2. Test the authentication flow using the test scripts:

```bash
cd backend
node test-auth-flow.js
```

## Maintenance

### Updating Dependencies

Regularly update dependencies to ensure security:

```bash
npm audit
npm update
```

### Backing Up Data

Regularly backup your Supabase database:

1. Use the Supabase dashboard to create backups.
2. Set up automated backups using the Supabase API.

## Conclusion

Following this deployment guide will help you successfully deploy the LFG platform to production with a secure authentication system. If you encounter any issues, refer to the troubleshooting section or contact the development team.
