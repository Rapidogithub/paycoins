// This file configures how source maps are handled
// It's used to suppress warnings from dependency packages

// Ignore specific warnings during development
if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'production') {
  // Disable console warnings for sourcemap loading failures
  const originalConsoleWarn = console.warn;
  
  console.warn = function(msg, ...args) {
    // Ignore source map warnings
    if (typeof msg === 'string' && 
        (msg.includes('Failed to parse source map') || 
         msg.includes('SourceMap warning'))) {
      return;
    }
    
    originalConsoleWarn.apply(console, [msg, ...args]);
  };
}

export default function setupSourceMapIgnore() {
  // This function is a no-op, but importing it ensures the code above runs
  return null;
} 