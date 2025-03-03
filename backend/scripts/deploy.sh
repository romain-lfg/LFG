#!/bin/bash

# Exit on error
set -e

echo "Starting backend deployment..."

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

# Check for database migrations
echo "Checking for database migrations..."
npm run db:migrate

# Start the application with PM2
echo "Starting the application with PM2..."
pm2 delete lfg-backend || true
pm2 start dist/api/app.js --name lfg-backend

echo "Backend deployment completed successfully!"
