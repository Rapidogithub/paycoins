const http = require('http');

// Simple logging function
const log = (message) => {
  console.log(`[${new Date().toISOString()}] ${message}`);
};

// Log startup information
log('Starting basic PAY API server...');
log(`Node.js version: ${process.version}`);
log(`Environment: ${process.env.NODE_ENV || 'development'}`);

// Create a simple HTTP server
const server = http.createServer((req, res) => {
  // Log the request path
  log(`${req.method} ${req.url}`);
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-auth-token');
  
  // Handle OPTIONS requests for CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }
  
  // Handle different paths
  if (req.url === '/') {
    // Root path - health check
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      status: 'ok', 
      message: 'Server is running',
      timestamp: new Date().toISOString(),
      railway: true
    }));
  } 
  else if (req.url === '/api/health') {
    // Health endpoint
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      status: 'ok', 
      message: 'API health check passed',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      port: process.env.PORT || '8080 (default)'
    }));
  }
  else if (req.url === '/api/users' && req.method === 'POST') {
    // Mock user registration
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      message: 'User registration mock successful',
      token: 'mock-jwt-token-123456'
    }));
  }
  else {
    // Not found
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      status: 'error', 
      message: 'Not found',
      path: req.url
    }));
  }
});

// Get port from environment or default to 8080
const PORT = process.env.PORT || 8080;

// Start the server
server.listen(PORT, '0.0.0.0', () => {
  log(`Server running on port ${PORT}`);
  log(`Using PORT from environment: ${process.env.PORT ? 'Yes' : 'No'}`);
  log(`Health check endpoint: http://localhost:${PORT}/api/health`);
  
  // Log environment variables
  log('Environment variables:');
  log(`  NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
  log(`  PORT: ${process.env.PORT || 'not set'}`);
  log(`  RAILWAY_ENVIRONMENT: ${process.env.RAILWAY_ENVIRONMENT || 'not set'}`);
}); 