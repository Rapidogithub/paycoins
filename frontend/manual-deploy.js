/**
 * A manual deployment script for GitHub Pages
 * This script avoids the ENAMETOOLONG issue by using a different approach
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const buildDir = path.join(__dirname, 'build');
const deployDir = path.join(__dirname, '.deploy-temp');
const GITHUB_REPO = 'https://github.com/Rapidogithub/paycoins.git';

console.log('Starting manual GitHub Pages deployment...');

// Step 1: Ensure build directory exists
if (!fs.existsSync(buildDir)) {
  console.error('Error: Build directory not found!');
  console.error('Please run "npm run build" first.');
  process.exit(1);
}

// Step 2: Remove existing deploy directory if it exists
console.log('Preparing deployment directory...');
if (fs.existsSync(deployDir)) {
  console.log('Removing existing deployment directory...');
  fs.rmSync(deployDir, { recursive: true, force: true });
}

// Step 3: Create fresh deployment directory
fs.mkdirSync(deployDir, { recursive: true });

// Step 4: Copy essential files from build to deploy directory
console.log('Copying build files to deployment directory...');
try {
  // Copy index.html (required)
  fs.copyFileSync(
    path.join(buildDir, 'index.html'),
    path.join(deployDir, 'index.html')
  );
  
  // Create static directory
  fs.mkdirSync(path.join(deployDir, 'static'), { recursive: true });
  
  // Copy essential directories (with shortened names if needed)
  const staticJsDir = path.join(buildDir, 'static', 'js');
  const staticCssDir = path.join(buildDir, 'static', 'css');
  
  if (fs.existsSync(staticJsDir)) {
    fs.mkdirSync(path.join(deployDir, 'static', 'js'), { recursive: true });
    const jsFiles = fs.readdirSync(staticJsDir);
    
    // Copy with shortened names for long files
    jsFiles.forEach(file => {
      const srcPath = path.join(staticJsDir, file);
      
      // Use a shorter filename for long filenames
      let destFilename = file;
      if (file.length > 30) {
        const ext = path.extname(file);
        const hash = file.slice(-10, -ext.length); // Get hash part from end
        destFilename = `main-${hash}${ext}`;
      }
      
      fs.copyFileSync(srcPath, path.join(deployDir, 'static', 'js', destFilename));
      console.log(`Copied ${file} to static/js/${destFilename}`);
    });
  }
  
  if (fs.existsSync(staticCssDir)) {
    fs.mkdirSync(path.join(deployDir, 'static', 'css'), { recursive: true });
    const cssFiles = fs.readdirSync(staticCssDir);
    
    cssFiles.forEach(file => {
      const srcPath = path.join(staticCssDir, file);
      
      // Use a shorter filename for long filenames
      let destFilename = file;
      if (file.length > 30) {
        const ext = path.extname(file);
        const hash = file.slice(-10, -ext.length); // Get hash part from end
        destFilename = `main-${hash}${ext}`;
      }
      
      fs.copyFileSync(srcPath, path.join(deployDir, 'static', 'css', destFilename));
      console.log(`Copied ${file} to static/css/${destFilename}`);
    });
  }
  
  // Copy favicon and other root files
  ['favicon.ico', 'manifest.json', 'robots.txt'].forEach(file => {
    const srcPath = path.join(buildDir, file);
    if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, path.join(deployDir, file));
      console.log(`Copied ${file}`);
    }
  });
  
} catch (err) {
  console.error('Error copying build files:', err);
  process.exit(1);
}

// Step 5: Initialize git in the deploy directory
console.log('Initializing git repository...');
try {
  // These git command execute in a separate shell, so we need to set longpaths there too
  execSync('git init', { cwd: deployDir });
  execSync('git config core.longpaths true', { cwd: deployDir });
  execSync('git config core.autocrlf false', { cwd: deployDir });
  execSync('git add .', { cwd: deployDir });
  execSync('git commit -m "Deploy to GitHub Pages"', { cwd: deployDir });
  
  // Step 6: Push to gh-pages branch (force)
  console.log('Pushing to GitHub Pages...');
  execSync(`git push -f ${GITHUB_REPO} master:gh-pages`, { 
    cwd: deployDir,
    stdio: 'inherit' // Show the output from git push
  });
  
  console.log('Deployment complete! Your app should be available at:');
  console.log('https://rapidogithub.github.io/paycoins/');
} catch (err) {
  console.error('Error in git operations:', err.message);
  console.log('');
  console.log('Note: You might need to set your GitHub credentials first.');
  console.log('Try running these commands first:');
  console.log('  git config --global user.email "your-email@example.com"');
  console.log('  git config --global user.name "Your Name"');
  process.exit(1);
} 