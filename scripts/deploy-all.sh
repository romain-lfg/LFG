#!/bin/bash

# Exit on error
set -e

echo "Starting LFG platform deployment..."

# Check for required environment files
if [ ! -f ./backend/.env.production ]; then
  echo "Error: backend/.env.production file not found!"
  echo "Please create it from the backend/.env.production.template file."
  exit 1
fi

if [ ! -f ./frontend/.env.production ]; then
  echo "Error: frontend/.env.production file not found!"
  echo "Please create it from the frontend/.env.production.template file."
  exit 1
fi

# Deploy backend
echo "Deploying backend..."
cd backend
bash ./scripts/deploy.sh
cd ..

# Deploy frontend
echo "Deploying frontend..."
cd frontend
bash ./scripts/deploy.sh
cd ..

# Run post-deployment tests
echo "Running post-deployment tests..."
npm run test:e2e

echo "Deployment completed successfully!"
echo "Backend: Running on API server"
echo "Frontend: Deployed to hosting provider"
echo ""
echo "Don't forget to check the monitoring dashboard for any issues!"
