#!/bin/bash

# Simple script to set up Privy credentials in Vercel for staging environment

echo "🔑 Setting up LFG Staging Environment"
echo "=================================="

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
  echo "Installing Vercel CLI..."
  npm install -g vercel
fi

# Check if user is logged in to Vercel
vercel whoami &> /dev/null || (echo "Please login to Vercel:" && vercel login)

# Define projects
BACKEND_PROJECT="lfg-backend-api-staging"
FRONTEND_PROJECT="lfg-frontend-staging"

# Set up Privy credentials for backend
echo "
💻 Setting up Backend Privy credentials..."

# Check if backend .env.staging exists
if [ ! -f ./backend/.env.staging ]; then
  echo "Error: backend/.env.staging file not found!"
  exit 1
fi

# Read Privy credentials from backend .env.staging
PRIVY_APP_ID=$(grep PRIVY_APP_ID ./backend/.env.staging | cut -d= -f2)
PRIVY_APP_SECRET=$(grep PRIVY_APP_SECRET ./backend/.env.staging | cut -d= -f2)
PRIVY_PUBLIC_KEY=$(grep PRIVY_PUBLIC_KEY ./backend/.env.staging | cut -d= -f2)

# Set environment variables in Vercel
echo "Setting PRIVY_APP_ID..."
echo "$PRIVY_APP_ID" | vercel env add PRIVY_APP_ID production $BACKEND_PROJECT

echo "Setting PRIVY_APP_SECRET..."
echo "$PRIVY_APP_SECRET" | vercel env add PRIVY_APP_SECRET production $BACKEND_PROJECT

echo "Setting PRIVY_PUBLIC_KEY..."
echo "$PRIVY_PUBLIC_KEY" | vercel env add PRIVY_PUBLIC_KEY production $BACKEND_PROJECT

# Set up Privy credentials for frontend
echo "
📺 Setting up Frontend Privy credentials..."

# Set special build environment variable
echo "Setting NEXT_PUBLIC_SKIP_AUTH_DURING_BUILD..."
echo "true" | vercel env add NEXT_PUBLIC_SKIP_AUTH_DURING_BUILD production $FRONTEND_PROJECT

# Check if frontend .env.staging exists
if [ ! -f ./frontend/.env.staging ]; then
  echo "Error: frontend/.env.staging file not found!"
  exit 1
fi

# Read Privy credentials from frontend .env.staging
NEXT_PUBLIC_PRIVY_APP_ID=$(grep NEXT_PUBLIC_PRIVY_APP_ID ./frontend/.env.staging | cut -d= -f2)

# Set environment variables in Vercel
echo "Setting NEXT_PUBLIC_PRIVY_APP_ID..."
echo "$NEXT_PUBLIC_PRIVY_APP_ID" | vercel env add NEXT_PUBLIC_PRIVY_APP_ID production $FRONTEND_PROJECT

echo "
✅ Setup completed!"
echo "Next steps:"
echo "1. Push to the 'staging' branch to trigger deployment"
echo "2. Or run 'vercel --prod' in backend and frontend directories"
echo "3. Run the verify-staging-deployment.sh script to check deployment"
