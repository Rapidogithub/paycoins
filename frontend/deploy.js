const ghpages = require('gh-pages');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

// Make sure Git is properly configured for long paths
try {
  console.log('Configuring Git for long paths...');
  execSync('git config --global core.longpaths true');
  execSync('git config --global core.autocrlf false');
  execSync('git config --global core.quotepath false');
  console.log('Git configuration successful');
} catch (err) {
  console.warn('Warning: Failed to configure Git:', err.message);
}

// Configuration options with increased buffer size and force option
const options = {
  // Use a much larger buffer size to handle long paths
  maxBuffer: 1024 * 1024 * 1024, // 1GB buffer
  
  // Force pushing to overwrite history issues
  force: true,
  
  // Disable pattern matching that can cause ENAMETOOLONG
  nodetect: true,
  
  // Only deploy essential files
  pattern: [
    'index.html',
    'favicon.ico',
    'manifest.json',
    'robots.txt',
    'static/**/*.*'  // Use /** for deep paths
  ],
  
  // Add a message
  message: 'Deploy PayCoins App to GitHub Pages [skip ci]',
  
  // Show progress
  silent: false,
  
  // Log progress
  logger: function(message) {
    console.log('[Deploy]', message);
  }
};

// The build directory to deploy
const buildDir = path.join(__dirname, 'build');

console.log('Starting deployment process...');
console.log('Deploying from:', buildDir);

// Check that build directory exists
if (!fs.existsSync(buildDir)) {
  console.error('Build directory not found! Please run npm run build first.');
  process.exit(1);
}

// Deploy with our custom configuration
ghpages.publish(buildDir, options, function(err) {
  if (err) {
    console.error('Deployment error:', err);
    console.log('Trying fallback deployment method...');
    
    try {
      // Fallback approach using direct git commands
      const tempDir = path.join(__dirname, '.gh-pages-temp');
      
      // Create temp directory
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      
      // Copy only essential files
      console.log('Copying essential files to temporary directory...');
      fs.copyFileSync(
        path.join(buildDir, 'index.html'), 
        path.join(tempDir, 'index.html')
      );
      
      // Execute git commands directly
      console.log('Initializing git repository...');
      execSync('git init', { cwd: tempDir });
      execSync('git add index.html', { cwd: tempDir });
      execSync('git commit -m "Deploy essential files"', { cwd: tempDir });
      execSync('git push --force origin master:gh-pages', { cwd: tempDir });
      
      console.log('Fallback deployment completed!');
    } catch (fallbackErr) {
      console.error('Fallback deployment failed:', fallbackErr);
      process.exit(1);
    }
  } else {
    console.log('Deployment complete! Your app is now published.');
  }
}); 