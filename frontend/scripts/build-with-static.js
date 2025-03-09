const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const dashboardDir = path.join(__dirname, '..', 'app', 'dashboard');
const filesToRename = [
  { path: path.join(dashboardDir, 'page.tsx'), backup: path.join(dashboardDir, 'page.tsx.bak') },
  { path: path.join(dashboardDir, 'profile', 'page.tsx'), backup: path.join(dashboardDir, 'profile', 'page.tsx.bak') },
  { path: path.join(dashboardDir, 'layout.tsx'), backup: path.join(dashboardDir, 'layout.tsx.bak') },
];

// Backup original files and replace with static versions
console.log('Backing up original files and replacing with static versions...');
filesToRename.forEach(file => {
  if (fs.existsSync(file.path)) {
    // Backup original file
    fs.copyFileSync(file.path, file.backup);
    
    // Replace with static version
    const staticPath = file.path.replace('.tsx', '.static.tsx');
    if (fs.existsSync(staticPath)) {
      const staticContent = fs.readFileSync(staticPath, 'utf8');
      fs.writeFileSync(file.path, staticContent);
    } else {
      console.warn(`Static version not found: ${staticPath}`);
    }
  } else {
    console.warn(`Original file not found: ${file.path}`);
  }
});

try {
  // Run the Next.js build command
  console.log('Building Next.js application...');
  execSync('next build', { stdio: 'inherit' });
  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
} finally {
  // Restore original files
  console.log('Restoring original files...');
  filesToRename.forEach(file => {
    if (fs.existsSync(file.backup)) {
      fs.copyFileSync(file.backup, file.path);
      fs.unlinkSync(file.backup);
    }
  });
}
