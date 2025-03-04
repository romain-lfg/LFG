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

# Deploy backend
echo "Deploying backend to staging..."
cd backend
cp .env.staging .env
npm run build
# Replace with your actual staging deployment command
# Example: rsync -avz --exclude node_modules --exclude .git . user@staging-server:/path/to/backend
echo "Backend built successfully. Ready for deployment to staging server."
cd ..

# Deploy frontend
echo "Deploying frontend to staging..."
cd frontend
cp .env.staging .env
npm run build
# Replace with your actual staging deployment command
# Example: rsync -avz --exclude node_modules --exclude .git .next user@staging-server:/path/to/frontend
echo "Frontend built successfully. Ready for deployment to staging server."
cd ..

# Run end-to-end tests
echo "Running end-to-end tests against staging..."
cd tests
# Uncomment when ready to run tests against staging
# TEST_BASE_URL=https://staging.lfg.example.com npm test
echo "Note: End-to-end tests commented out. Uncomment in script when ready to run."
cd ..

echo "Staging deployment preparation completed successfully!"
echo "Next steps:"
echo "1. Configure your actual deployment commands in this script"
echo "2. Make the script executable with: chmod +x scripts/deploy-staging.sh"
echo "3. Run the script with: ./scripts/deploy-staging.sh"
