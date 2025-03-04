#!/usr/bin/env node

/**
 * This script sets up a Supabase staging environment
 * It requires the Supabase CLI to be installed
 * npm install -g supabase
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const PROJECT_NAME = 'lfg-staging';
const DB_PASSWORD = 'StrongPassword123!'; // Change this to a secure password
const REGION = 'us-east-1'; // Change to your preferred region
const ORG_ID = process.env.SUPABASE_ORG_ID;

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m'
};

/**
 * Execute a command and return the output
 */
function execute(command, options = {}) {
  try {
    console.log(`${colors.blue}> ${command}${colors.reset}`);
    return execSync(command, { 
      stdio: options.silent ? 'pipe' : 'inherit',
      encoding: 'utf-8',
      ...options
    });
  } catch (error) {
    console.error(`${colors.red}Error executing command: ${command}${colors.reset}`);
    console.error(error.message);
    process.exit(1);
  }
}

/**
 * Check if Supabase CLI is installed
 */
function checkSupabaseCLI() {
  try {
    execute('supabase --version', { silent: true });
    console.log(`${colors.green}✓ Supabase CLI is installed${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}✗ Supabase CLI is not installed${colors.reset}`);
    console.log(`${colors.yellow}Please install it with: npm install -g supabase${colors.reset}`);
    process.exit(1);
  }
}

/**
 * Check if logged in to Supabase
 */
function checkSupabaseLogin() {
  try {
    const output = execute('supabase projects list', { silent: true });
    if (output.includes('Error: You need to be logged in to use this command')) {
      console.error(`${colors.red}✗ Not logged in to Supabase${colors.reset}`);
      console.log(`${colors.yellow}Please login with: supabase login${colors.reset}`);
      process.exit(1);
    }
    console.log(`${colors.green}✓ Logged in to Supabase${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}✗ Error checking Supabase login${colors.reset}`);
    console.log(`${colors.yellow}Please login with: supabase login${colors.reset}`);
    process.exit(1);
  }
}

/**
 * Create a new Supabase project
 */
function createSupabaseProject() {
  try {
    // Check if project already exists
    const projects = execute('supabase projects list --json', { silent: true });
    const projectsJson = JSON.parse(projects);
    
    const existingProject = projectsJson.find(project => project.name === PROJECT_NAME);
    
    if (existingProject) {
      console.log(`${colors.yellow}! Project ${PROJECT_NAME} already exists with ID: ${existingProject.id}${colors.reset}`);
      return existingProject.id;
    }
    
    // Create new project
    console.log(`${colors.blue}Creating Supabase project: ${PROJECT_NAME}${colors.reset}`);
    
    if (!ORG_ID) {
      console.error(`${colors.red}✗ SUPABASE_ORG_ID environment variable is not set${colors.reset}`);
      console.log(`${colors.yellow}Please set it with: export SUPABASE_ORG_ID=your_org_id${colors.reset}`);
      process.exit(1);
    }
    
    const createOutput = execute(
      `supabase projects create "${PROJECT_NAME}" --org-id ${ORG_ID} --region ${REGION} --db-password "${DB_PASSWORD}" --json`,
      { silent: true }
    );
    
    const projectData = JSON.parse(createOutput);
    console.log(`${colors.green}✓ Project created with ID: ${projectData.id}${colors.reset}`);
    
    return projectData.id;
  } catch (error) {
    console.error(`${colors.red}✗ Error creating Supabase project${colors.reset}`);
    console.error(error.message);
    process.exit(1);
  }
}

/**
 * Initialize Supabase locally
 */
function initializeSupabaseLocally(projectId) {
  const supabaseDir = path.join(process.cwd(), 'supabase');
  
  if (fs.existsSync(supabaseDir)) {
    console.log(`${colors.yellow}! Supabase directory already exists${colors.reset}`);
  } else {
    console.log(`${colors.blue}Initializing Supabase locally${colors.reset}`);
    execute('supabase init');
  }
  
  // Link to the remote project
  console.log(`${colors.blue}Linking to remote project${colors.reset}`);
  execute(`supabase link --project-ref ${projectId}`);
  
  console.log(`${colors.green}✓ Supabase initialized and linked to remote project${colors.reset}`);
}

/**
 * Generate database types
 */
function generateDatabaseTypes() {
  console.log(`${colors.blue}Generating database types${colors.reset}`);
  execute('supabase gen types typescript --local > ./backend/src/types/supabase.ts');
  console.log(`${colors.green}✓ Database types generated${colors.reset}`);
}

/**
 * Create .env file for staging
 */
function createEnvFile(projectId) {
  console.log(`${colors.blue}Creating .env file for staging${colors.reset}`);
  
  // Get project details
  const projectDetails = execute(`supabase projects show --project-ref ${projectId} --json`, { silent: true });
  const details = JSON.parse(projectDetails);
  
  // Get API keys
  const apiKeys = execute(`supabase projects api-keys --project-ref ${projectId} --json`, { silent: true });
  const keys = JSON.parse(apiKeys);
  
  const anonKey = keys.find(key => key.name === 'anon key')?.api_key;
  const serviceKey = keys.find(key => key.name === 'service_role key')?.api_key;
  
  if (!anonKey || !serviceKey) {
    console.error(`${colors.red}✗ Could not find API keys${colors.reset}`);
    process.exit(1);
  }
  
  // Create .env.staging file
  const envContent = `# Supabase Configuration
DATABASE_URL=${details.db_host}
SUPABASE_URL=https://${projectId}.supabase.co
SUPABASE_ANON_KEY=${anonKey}
SUPABASE_SERVICE_KEY=${serviceKey}

# Privy Authentication
PRIVY_APP_ID=your-privy-app-id
PRIVY_APP_SECRET=your-privy-app-secret
PRIVY_PUBLIC_KEY=your-privy-public-key

# Nillion Integration
NILLION_API_KEY=your-nillion-api-key
NILLION_ENVIRONMENT=staging

# Server Configuration
PORT=8080
NODE_ENV=staging
API_URL=https://api-staging.lfg.example.com
CORS_ORIGIN=https://staging.lfg.example.com

# Logging
LOG_LEVEL=DEBUG

# Security
JWT_SECRET=your-staging-jwt-secret
JWT_EXPIRATION=24h
`;

  fs.writeFileSync(path.join(process.cwd(), 'backend', '.env.staging'), envContent);
  console.log(`${colors.green}✓ .env.staging file created${colors.reset}`);
}

/**
 * Main function
 */
async function main() {
  console.log(`${colors.blue}=== Setting up Supabase Staging Environment ===${colors.reset}`);
  
  // Check prerequisites
  checkSupabaseCLI();
  checkSupabaseLogin();
  
  // Create project
  const projectId = createSupabaseProject();
  
  // Initialize locally
  initializeSupabaseLocally(projectId);
  
  // Generate types
  generateDatabaseTypes();
  
  // Create env file
  createEnvFile(projectId);
  
  console.log(`\n${colors.green}=== Supabase Staging Environment Setup Complete ===${colors.reset}`);
  console.log(`${colors.green}Project URL: https://${projectId}.supabase.co${colors.reset}`);
  console.log(`${colors.green}Database URL: postgres://postgres:${DB_PASSWORD}@db.${projectId}.supabase.co:5432/postgres${colors.reset}`);
  console.log(`\n${colors.yellow}Next steps:${colors.reset}`);
  console.log(`${colors.yellow}1. Update the .env.staging file with your Privy and Nillion credentials${colors.reset}`);
  console.log(`${colors.yellow}2. Run migrations: supabase db push${colors.reset}`);
  console.log(`${colors.yellow}3. Deploy your backend to Vercel or another hosting provider${colors.reset}`);
}

main().catch(error => {
  console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
  process.exit(1);
});
