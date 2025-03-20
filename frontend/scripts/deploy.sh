#!/bin/bash

# Exit on error
set -e

echo "Starting frontend deployment..."

# Check if .env.production exists
if [ ! -f .env.production ]; then
  echo "Error: .env.production file not found!"
  echo "Please create it from the .env.production.template file."
  exit 1
fi

# Install dependencies
echo "Installing dependencies..."
npm ci

# Run tests
echo "Running tests..."
npm test

# Build the application
echo "Building the application..."
npm run build

# Deploy to hosting provider (example for Vercel)
echo "Deploying to hosting provider..."
npx vercel --prod

echo "Frontend deployment completed successfully!"
