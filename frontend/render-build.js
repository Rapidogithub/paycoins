const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Starting Render-specific build process');

// Set environment for Render
process.env.PUBLIC_URL = '/';
process.env.REACT_APP_API_URL = 'https://pay-backend-iu9e.onrender.com';

try {
  // Run the build command
  console.log('📦 Building the React application...');
  execSync('cross-env PUBLIC_URL=/ REACT_APP_API_URL=https://pay-backend-iu9e.onrender.com react-scripts build', { 
    stdio: 'inherit'
  });
  
  // Copy render-index.html to index.html if it exists
  const renderIndexPath = path.join(__dirname, 'public', 'render-index.html');
  const buildIndexPath = path.join(__dirname, 'build', 'index.html');
  
  if (fs.existsSync(renderIndexPath)) {
    console.log('📄 Replacing index.html with Render-specific version...');
    const renderIndex = fs.readFileSync(renderIndexPath, 'utf8');
    fs.writeFileSync(buildIndexPath, renderIndex);
  }
  
  console.log('✅ Render build completed successfully!');
} catch (error) {
  console.error('❌ Build failed:', error);
  process.exit(1);
} 