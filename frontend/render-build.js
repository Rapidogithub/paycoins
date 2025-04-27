const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Starting Render-specific build process');

// Set environment for Render
process.env.PUBLIC_URL = '';  // Empty string instead of '/' to avoid double slashes
process.env.REACT_APP_API_URL = 'https://pay-backend-iu9e.onrender.com';
process.env.GENERATE_SOURCEMAP = 'false';

try {
  // First, create a backup of the original index.js
  const indexJsPath = path.join(__dirname, 'src', 'index.js');
  const indexJsBackupPath = path.join(__dirname, 'src', 'index.js.backup');
  const renderIndexJsPath = path.join(__dirname, 'src', 'render-index.js');
  
  console.log('📄 Creating backup of index.js and replacing with Render version...');
  
  // Only create backup if it doesn't exist
  if (fs.existsSync(indexJsPath) && !fs.existsSync(indexJsBackupPath)) {
    fs.copyFileSync(indexJsPath, indexJsBackupPath);
  }
  
  // Use the Render-specific index.js if it exists
  if (fs.existsSync(renderIndexJsPath)) {
    const renderIndex = fs.readFileSync(renderIndexJsPath, 'utf8');
    fs.writeFileSync(indexJsPath, renderIndex);
  }
  
  // Run the build command
  console.log('📦 Building the React application...');
  execSync('react-scripts build', { 
    stdio: 'inherit',
    env: {
      ...process.env,
      PUBLIC_URL: '',
      REACT_APP_API_URL: 'https://pay-backend-iu9e.onrender.com',
      GENERATE_SOURCEMAP: 'false'
    }
  });
  
  // Restore the original index.js
  console.log('📄 Restoring original index.js...');
  if (fs.existsSync(indexJsBackupPath)) {
    fs.copyFileSync(indexJsBackupPath, indexJsPath);
    fs.unlinkSync(indexJsBackupPath);
  }
  
  // Copy render-index.html to index.html if it exists
  const renderIndexPath = path.join(__dirname, 'public', 'render-index.html');
  const buildIndexPath = path.join(__dirname, 'build', 'index.html');
  
  if (fs.existsSync(renderIndexPath)) {
    console.log('📄 Replacing index.html with Render-specific version...');
    const renderIndex = fs.readFileSync(renderIndexPath, 'utf8');
    fs.writeFileSync(buildIndexPath, renderIndex);
  }
  
  // Create _redirects file for client-side routing
  console.log('🔄 Creating _redirects file for client-side routing...');
  fs.writeFileSync(
    path.join(__dirname, 'build', '_redirects'),
    '/* /index.html 200'
  );
  
  // Create a special version of the manifest.json for Render
  console.log('📝 Creating Render-specific manifest.json...');
  const manifestPath = path.join(__dirname, 'build', 'manifest.json');
  if (fs.existsSync(manifestPath)) {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    
    // Update the manifest
    manifest.start_url = './';
    manifest.scope = './';
    
    // Update file paths to use relative paths
    if (manifest.icons) {
      manifest.icons.forEach(icon => {
        if (icon.src && icon.src.startsWith('/')) {
          icon.src = '.' + icon.src;
        }
      });
    }
    
    // Write the updated manifest
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  }
  
  // Ensure assets are referenced correctly by modifying the index.html
  console.log('🔧 Ensuring asset paths are correct...');
  if (fs.existsSync(buildIndexPath)) {
    let indexHtml = fs.readFileSync(buildIndexPath, 'utf8');
    
    // Fix asset paths if needed
    indexHtml = indexHtml.replace(/href="\/static\//g, 'href="./static/');
    indexHtml = indexHtml.replace(/src="\/static\//g, 'src="./static/');
    indexHtml = indexHtml.replace(/href="\/manifest/g, 'href="./manifest');
    indexHtml = indexHtml.replace(/href="\/favicon/g, 'href="./favicon');
    
    fs.writeFileSync(buildIndexPath, indexHtml);
  }
  
  console.log('✅ Render build completed successfully!');
} catch (error) {
  console.error('❌ Build failed:', error);
  process.exit(1);
} 