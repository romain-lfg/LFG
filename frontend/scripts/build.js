const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Ensure environment variables are properly set
const ensureEnvVars = () => {
  // Explicitly set NEXT_PUBLIC_SKIP_AUTH_DURING_BUILD to true for the build process
  process.env.NEXT_PUBLIC_SKIP_AUTH_DURING_BUILD = 'true';
  console.log('Environment setup: NEXT_PUBLIC_SKIP_AUTH_DURING_BUILD =', process.env.NEXT_PUBLIC_SKIP_AUTH_DURING_BUILD);
};

// Temporarily rename dashboard directory to skip building it
const dashboardDir = path.join(__dirname, '..', 'app', 'dashboard');
const dashboardBackupDir = path.join(__dirname, '..', 'app', '_dashboard_backup');

// Check if dashboard directory exists
if (fs.existsSync(dashboardDir)) {
  console.log('Temporarily renaming dashboard directory to skip static generation...');
  fs.renameSync(dashboardDir, dashboardBackupDir);
}

try {
  // Ensure environment variables are set correctly
  ensureEnvVars();
  
  // Run the Next.js build command with explicit environment variable
  console.log('Building Next.js application...');
  execSync('NEXT_PUBLIC_SKIP_AUTH_DURING_BUILD=true next build', { 
    stdio: 'inherit',
    env: { ...process.env, NEXT_PUBLIC_SKIP_AUTH_DURING_BUILD: 'true' }
  });
  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
} finally {
  // Restore the dashboard directory
  if (fs.existsSync(dashboardBackupDir)) {
    console.log('Restoring dashboard directory...');
    fs.renameSync(dashboardBackupDir, dashboardDir);
  }
}
