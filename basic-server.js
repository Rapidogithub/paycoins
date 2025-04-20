const http = require('http');

// Create a simple HTTP server
const server = http.createServer((req, res) => {
  // Log the request path
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  
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
      message: 'Server is running' 
    }));
  } 
  else if (req.url === '/api/health') {
    // Health endpoint
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      status: 'ok', 
      timestamp: new Date().toISOString() 
    }));
  }
  else if (req.url === '/api/users' && req.method === 'POST') {
    // Mock user registration
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      message: 'User registration successful',
      token: 'mock-token-123456'
    }));
  }
  else {
    // Not found
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      status: 'error', 
      message: 'Not found'
    }));
  }
});

// Get port from environment or default to 8080
const PORT = process.env.PORT || 8080;

// Start the server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Using environment port: ${process.env.PORT ? 'Yes' : 'No'}`);
}); 