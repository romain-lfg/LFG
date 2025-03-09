#!/bin/bash

# Script to deploy both backend and frontend to Vercel staging environment

echo "🚀 Starting deployment to staging environment..."

# Set environment variables
export NEXT_PUBLIC_PRIVY_APP_ID=cm7eswoga03ez13eq3mwawy9t
export NEXT_PUBLIC_API_URL=https://lfg-backend-api-staging.vercel.app
export NEXT_PUBLIC_ENVIRONMENT=staging
export NEXT_PUBLIC_NETWORK=sepolia
export NEXT_PUBLIC_IPFS_GATEWAY=https://ipfs.io/ipfs/
export NEXT_PUBLIC_LOG_LEVEL=debug
export NEXT_PUBLIC_ENABLE_NILLION=true
export NEXT_PUBLIC_NILLION_SECRET_KEY=a786abe58f933e190d01d05b467838abb1e391007a674d8a3aef106e15a0bf5a
export NEXT_PUBLIC_NILLION_ORG_DID=did:nil:testnet:nillion1vn49zpzgpagey80lp4xzzefaz09kufr5e6zq8c
export NEXT_PUBLIC_WALLET_CONNECT_ID=8033d34007027d7a02bf8a456b78ead7
export NEXT_PUBLIC_INFURA_ID=a5b1de7915c24fe29281523170968482

# 1. Deploy backend
echo "📡 Deploying backend API..."
cd "$(dirname "$0")/../backend" || exit 1

# Link to Vercel project if not already linked
if [ ! -d ".vercel" ]; then
  echo "Linking backend to Vercel project..."
  vercel link --scope LFG --project lfg-backend-api-staging
fi

# Set environment variables for backend
vercel env add PRIVY_APP_ID cm7eswoga03ez13eq3mwawy9t
vercel env add PRIVY_APP_SECRET y5miw6ijtgC7xCvu92PLX4DqLSp15xmch461wd5peCv5VQdBj4T4iRKBk1xu8nWUfbqEuUtBPSxMeFSq2bS2z5898
vercel env add PRIVY_PUBLIC_KEY MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEFbhynZNwYYvvUUujdyPi+bUqoOfOl+Jy9aRQZZ95LvSkOI2p9+mkcm6vR8UD3iKLz3JiP3Y+bONIRWyDzxKKVA==
vercel env add FRONTEND_URL https://lfg-frontend-staging-jrb35j1s4-lfg-5fd382da.vercel.app
vercel env add CORS_ORIGIN https://lfg-frontend-staging-jrb35j1s4-lfg-5fd382da.vercel.app

# Deploy backend
vercel deploy --prod

# 2. Deploy frontend
echo "🖥️ Deploying frontend..."
cd "$(dirname "$0")/../frontend" || exit 1

# Link to Vercel project if not already linked
if [ ! -d ".vercel" ]; then
  echo "Linking frontend to Vercel project..."
  vercel link --scope LFG --project lfg-frontend-staging
fi

# Set environment variables for frontend
vercel env add NEXT_PUBLIC_PRIVY_APP_ID $NEXT_PUBLIC_PRIVY_APP_ID
vercel env add NEXT_PUBLIC_API_URL $NEXT_PUBLIC_API_URL
vercel env add NEXT_PUBLIC_ENVIRONMENT $NEXT_PUBLIC_ENVIRONMENT
vercel env add NEXT_PUBLIC_NETWORK $NEXT_PUBLIC_NETWORK
vercel env add NEXT_PUBLIC_IPFS_GATEWAY $NEXT_PUBLIC_IPFS_GATEWAY
vercel env add NEXT_PUBLIC_LOG_LEVEL $NEXT_PUBLIC_LOG_LEVEL
vercel env add NEXT_PUBLIC_ENABLE_NILLION $NEXT_PUBLIC_ENABLE_NILLION
vercel env add NEXT_PUBLIC_NILLION_SECRET_KEY $NEXT_PUBLIC_NILLION_SECRET_KEY
vercel env add NEXT_PUBLIC_NILLION_ORG_DID $NEXT_PUBLIC_NILLION_ORG_DID
vercel env add NEXT_PUBLIC_WALLET_CONNECT_ID $NEXT_PUBLIC_WALLET_CONNECT_ID
vercel env add NEXT_PUBLIC_INFURA_ID $NEXT_PUBLIC_INFURA_ID

# Deploy frontend with special build settings to skip static generation
vercel deploy --prod \
  --build-env NEXT_PUBLIC_SKIP_AUTH_DURING_BUILD=true \
  --build-env NEXT_PUBLIC_STATIC_EXPORT=true

echo "✅ Deployment to staging environment completed!"
echo "Backend URL: https://lfg-backend-api-staging.vercel.app"
echo "Frontend URL: https://lfg-frontend-staging.vercel.app"
