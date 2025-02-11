const { execSync } = require('child_process');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
};

function execCommand(command, errorMessage) {
  try {
    execSync(command, { stdio: 'inherit' });
  } catch (error) {
    console.error(`${colors.red}${colors.bright}Error: ${errorMessage}${colors.reset}`);
    process.exit(1);
  }
}

console.log(`${colors.cyan}${colors.bright}Starting build process...${colors.reset}\n`);

// Clean dist directory
console.log(`${colors.cyan}Cleaning dist directory...${colors.reset}`);
execCommand('rm -rf dist', 'Failed to clean dist directory');

// Install dependencies
console.log(`\n${colors.cyan}Installing dependencies...${colors.reset}`);
execCommand('pnpm install', 'Failed to install dependencies');

// Run type check
console.log(`\n${colors.cyan}Running type check...${colors.reset}`);
execCommand('tsc --noEmit', 'Type check failed');

// Run tests
console.log(`\n${colors.cyan}Running tests...${colors.reset}`);
execCommand('pnpm test', 'Tests failed');

// Build TypeScript
console.log(`\n${colors.cyan}Building TypeScript...${colors.reset}`);
execCommand('tsc', 'TypeScript build failed');

console.log(`\n${colors.green}${colors.bright}Build completed successfully!${colors.reset}`);
