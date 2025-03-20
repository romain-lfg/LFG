#!/bin/bash

# Script to set up Privy environment variables for local testing
# Usage: source scripts/setup-privy-env.sh

# Check if .env file exists
ENV_FILE=".env"
if [ -f "$ENV_FILE" ]; then
  echo "Loading environment variables from $ENV_FILE..."
  export $(grep -v '^#' $ENV_FILE | xargs)
else
  echo "No .env file found. Creating one with placeholder values..."
  
  # Create .env file with placeholder values
  cat > $ENV_FILE << EOL
# Privy Configuration
PRIVY_APP_ID=cm7eswoga03ez13eq3mwawy9t
PRIVY_APP_SECRET=your_app_secret_here
# Public key must be in SPKI format, with newlines preserved
PRIVY_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----
MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAELO+xvvhCd6M+hSjSfmHzXEYQQVpF
LiB+pXGgvXEF3lWoQmJTKQAQdGhzY7SnhpyEfVOQkxHUJ5BDvzYS4w1FDw==
-----END PUBLIC KEY-----"
EOL
  
  echo "Created $ENV_FILE with placeholder values."
  echo "Please update the values with your actual Privy credentials."
  echo "The public key must be in SPKI format with newlines preserved."
fi

# Display current environment variables
echo "Current Privy environment variables:"
echo "PRIVY_APP_ID: ${PRIVY_APP_ID:-not set}"
echo "PRIVY_APP_SECRET: ${PRIVY_APP_SECRET:-not set}"
echo "PRIVY_PUBLIC_KEY is ${PRIVY_PUBLIC_KEY:+set (not showing for security)}"
echo "PRIVY_PUBLIC_KEY is ${PRIVY_PUBLIC_KEY:-not set}"

# Instructions for updating the .env file
echo ""
echo "To update your Privy credentials:"
echo "1. Edit the .env file in the backend directory"
echo "2. Update the PRIVY_APP_ID, PRIVY_APP_SECRET, and PRIVY_PUBLIC_KEY values"
echo "3. Run 'source scripts/setup-privy-env.sh' again to load the updated values"
echo ""
echo "Note: The public key must be in SPKI format with newlines preserved."
echo "Example format:"
echo '-----BEGIN PUBLIC KEY-----'
echo 'MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAELO+xvvhCd6M+hSjSfmHzXEYQQVpF'
echo 'LiB+pXGgvXEF3lWoQmJTKQAQdGhzY7SnhpyEfVOQkxHUJ5BDvzYS4w1FDw=='
echo '-----END PUBLIC KEY-----'
