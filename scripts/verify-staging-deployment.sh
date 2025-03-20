#!/bin/bash

# Simple script to verify the Privy integration in staging

# Define URLs (update these with your actual staging URLs)
BACKEND_URL="https://lfg-backend-api-staging-89gizfkl8-lfg-5fd382da.vercel.app"
FRONTEND_URL="https://lfg-frontend-staging-jrb35j1s4-lfg-5fd382da.vercel.app"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🔍 Verifying LFG Staging Deployment"
echo "================================"

# Check backend health
echo -n "Checking backend health... "
backend_status=$(curl -s -o /dev/null -w "%{http_code}" $BACKEND_URL/health)
if [ "$backend_status" -eq "200" ]; then
  echo -e "${GREEN}OK${NC} (Status: $backend_status)"
else
  echo -e "${RED}FAILED${NC} (Status: $backend_status)"
fi

# Check frontend
echo -n "Checking frontend... "
frontend_status=$(curl -s -o /dev/null -w "%{http_code}" $FRONTEND_URL)
if [ "$frontend_status" -eq "200" ]; then
  echo -e "${GREEN}OK${NC} (Status: $frontend_status)"
else
  echo -e "${RED}FAILED${NC} (Status: $frontend_status)"
fi

echo 
echo "🔐 Privy Authentication Verification"
echo "--------------------------------"
echo -e "${YELLOW}Manual steps to verify Privy integration:${NC}"
echo "1. Visit $FRONTEND_URL"
echo "2. Click 'Get Started' or 'Connect' button"
echo "3. Verify the Privy auth modal appears"
echo "4. Try to authenticate with email or wallet"
echo "5. After login, check that you can access protected routes"

echo 

# Check dashboard page
echo -n "Checking dashboard page... "
dashboard_status=$(curl -s -o /dev/null -w "%{http_code}" $FRONTEND_URL/dashboard)
if [ "$dashboard_status" -eq "200" ]; then
  echo -e "${GREEN}OK${NC} (Status: $dashboard_status)"
else
  echo -e "${RED}FAILED${NC} (Status: $dashboard_status)"
fi

# Check profile page
echo -n "Checking profile page... "
profile_status=$(curl -s -o /dev/null -w "%{http_code}" $FRONTEND_URL/dashboard/profile)
if [ "$profile_status" -eq "200" ]; then
  echo -e "${GREEN}OK${NC} (Status: $profile_status)"
else
  echo -e "${RED}FAILED${NC} (Status: $profile_status)"
fi

echo 
echo "✅ Next Steps:"
echo "1. If authentication works in staging, you're ready for production"
echo "2. Check Vercel logs if you encounter any issues"
echo "3. Verify that the dashboard pages load correctly after authentication"
