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

# Run end-to-end tests
echo "Running end-to-end tests against staging..."
cd tests
# Uncomment when ready to run tests against staging
# TEST_BASE_URL=https://lfg-frontend-staging-3vhlp0568-lfg-5fd382da.vercel.app npm test
echo "Note: End-to-end tests commented out. Uncomment in script when ready to run."
cd ..

echo "Staging deployment completed successfully!"
echo "Backend URL: https://lfg-backend-api-staging-dscimds2r-lfg-5fd382da.vercel.app"
echo "Frontend URL: https://lfg-frontend-staging-3vhlp0568-lfg-5fd382da.vercel.app"
