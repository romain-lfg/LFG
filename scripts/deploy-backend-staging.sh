#!/bin/bash

# Script to deploy backend to Vercel staging environment

echo "🚀 Deploying backend to Vercel staging..."

# Navigate to backend directory
cd "$(dirname "$0")/../backend" || exit 1

# Deploy with environment variables
vercel --prod --scope lfg-5fd382da \
  -e PRIVY_APP_ID=cm7eswoga03ez13eq3mwawy9t \
  -e PRIVY_PUBLIC_KEY="MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAyoYfgDwOOl7QlUYsYnLdvJMEgWgHxkqn/8/X4DGr8KKNlKA/BoSHJJU+TrLSexRjP0xYvYjbMFGKFGQQEJdBOZVUd/7D8rUFvjYVzh8bHxVl4SDN6yGVY4a4BizZlJBvBFKw+P6kZhW+dKvPWHfQCK3YNJeqIV9hYBRw6ZLejNHOLVzyYBTo5/bqzDzEnGUwkpNBLrO7h/5/NiBJ2ik5vgQmqjZdIIJXUvyQBOKnOjMnHNVR8YIpBF2f/pf9lf8/kvUGKMNFgzFkQQM3WCCnGUAqbE6TcJQCqNou6xLNQqMgByCBpGI1JeLVDcxnF/9MWLgUJsV2tUALcXyqVcNaQg0lJQIDAQAB" \
  -e PRIVY_APP_SECRET_KEY="sk_privy_m4hnwfbvkwsqtbsxnf7zcg5zcbwqvpzj6mz5kpnrjdqxfqhzm7ry7a6vdmk" \
  -e SUPABASE_URL=https://eqfhcqbgjqvlmxbpqvvl.supabase.co \
  -e SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxZmhjcWJnanF2bG14YnBxdnZsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcwOTY1OTMzOSwiZXhwIjoyMDI1MjM1MzM5fQ.aBFnYZYM-kKmQz4EQI6xj7QlR-Qjk_kcEwZ7FDLiVE0 \
  -e NILLION_SECRET_KEY=a786abe58f933e190d01d05b467838abb1e391007a674d8a3aef106e15a0bf5a \
  -e NILLION_ORG_DID=did:nil:testnet:nillion1vn49zpzgpagey80lp4xzzefaz09kufr5e6zq8c \
  -e LOG_LEVEL=debug \
  -e NODE_ENV=staging

echo "✅ Backend deployment completed!"
