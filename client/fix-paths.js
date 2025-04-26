const fs = require('fs');
const path = require('path');

// Function to recursively process files in a directory
function processDirectory(dir, renameFiles = true) {
  // Read all items in the directory
  const items = fs.readdirSync(dir);
  
  // Process each item
  for (const item of items) {
    const itemPath = path.join(dir, item);
    const stats = fs.statSync(itemPath);
    
    // If it's a directory, process it recursively
    if (stats.isDirectory()) {
      processDirectory(itemPath, renameFiles);
      continue;
    }
    
    // Skip non-JavaScript/CSS files
    if (!item.endsWith('.js') && !item.endsWith('.css') && !item.endsWith('.map')) {
      continue;
    }
    
    // If the filename is very long, shorten it
    if (renameFiles && item.length > 30) {
      // Create a shorter name (first 8 chars + hash + extension)
      const ext = path.extname(item);
      const base = path.basename(item, ext);
      const hash = Math.random().toString(36).substring(2, 8);
      const newName = `${base.substring(0, 8)}_${hash}${ext}`;
      const newPath = path.join(dir, newName);
      
      // Rename the file
      fs.renameSync(itemPath, newPath);
      console.log(`Renamed ${item} to ${newName}`);
    }
  }
}

// Main execution
console.log('Starting path fix...');

// Process the build directory
const buildDir = path.join(__dirname, 'build');
if (fs.existsSync(buildDir)) {
  console.log(`Processing ${buildDir}...`);
  processDirectory(buildDir);
  console.log('Path fix completed!');
} else {
  console.error(`Build directory ${buildDir} does not exist!`);
} 