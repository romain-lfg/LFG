#!/bin/bash

# Script to remove sensitive files from git history
# This script will:
# 1. Create a backup of the current .env files
# 2. Remove sensitive files from git history
# 3. Restore the .env files from backup

# Create a backup directory
mkdir -p .env_backup

# Backup all .env files
echo "Creating backup of environment files..."
find . -name "*.env*" -not -path "*/node_modules/*" -not -path "*/.git/*" -exec cp --parents {} .env_backup \;

# Remove sensitive files from git history
echo "Removing sensitive files from git history..."
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch \
  backend/.env backend/.env.development backend/.env.staging \
  frontend/.env frontend/.env.development frontend/.env.staging \
  scripts/derive-keys.js \
  .env" \
  --prune-empty --tag-name-filter cat -- --all

# Restore .env files from backup
echo "Restoring environment files from backup..."
cp -r .env_backup/* .

# Clean up
echo "Cleaning up..."
rm -rf .env_backup

echo "Done! The sensitive files have been removed from git history."
echo "You should now force push these changes to overwrite the remote repository:"
echo "git push origin --force"
echo ""
echo "IMPORTANT: All collaborators will need to clone the repository again after this operation."
