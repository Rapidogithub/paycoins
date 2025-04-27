const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

// Get port from environment variable (Render sets this) or default to 10000
const PORT = process.env.PORT || 10000;
// Get the backend URL from environment variable or use the dynamic one
const BACKEND_URL = process.env.BACKEND_URL || null;

console.log('Starting PAY server...');
console.log(`Using PORT: ${PORT}`);
console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`BACKEND_URL: ${BACKEND_URL || 'dynamic (same as server URL)'}`);

// Track server startup time
const SERVER_START_TIME = Date.now();
let SERVER_READY = false;

// Mark server as ready after 3 seconds (gives time for initialization)
setTimeout(() => {
  SERVER_READY = true;
  console.log(`Server marked as ready after ${(Date.now() - SERVER_START_TIME) / 1000} seconds`);
}, 3000);

// Special endpoint for warming up the server on Render
app.get('/warmup', (req, res) => {
  const uptime = (Date.now() - SERVER_START_TIME) / 1000;
  console.log(`Warm-up request received. Current uptime: ${uptime.toFixed(2)} seconds`);
  
  // The response is immediate, but we'll do background warm-up tasks
  res.json({ 
    message: 'Warm-up initiated',
    uptime: `${uptime.toFixed(2)} seconds`,
    serverReady: SERVER_READY
  });
  
  // Do background warm-up tasks after responding
  setTimeout(() => {
    console.log('Performing background warm-up tasks...');
    // Pre-load any heavy resources, pre-compile templates, etc.
    console.log('Background warm-up completed');
  }, 10);
});

// Middleware for parsing JSON
app.use(express.json());

// Enhanced CORS middleware - allow all origins and authentication headers
app.use((req, res, next) => {
  // Instead of specific origins, allow any origin for testing
  res.header('Access-Control-Allow-Origin', '*');
  
  // Include all necessary headers, especially authorization
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-auth-token');
  
  // Allow more methods
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  
  // Allow credentials (important for auth)
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  console.log(`${req.method} ${req.url}`);
  next();
});

// Health check endpoint required by Render
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Server readiness endpoint
app.get('/api/ready', (req, res) => {
  const uptime = (Date.now() - SERVER_START_TIME) / 1000;
  res.json({ 
    ready: SERVER_READY,
    uptime: `${uptime.toFixed(2)} seconds`,
    message: SERVER_READY ? 'Server is ready' : 'Server is still initializing'
  });
});

// API endpoints
app.get('/api', (req, res) => {
  res.json({ status: 'ok', message: 'PAY API running' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Enhanced user authentication endpoints
app.post('/api/users', (req, res) => {
  console.log('User registration request received:', req.body);
  // More detailed response for user registration
  res.json({ 
    token: 'mock-jwt-token-123456',
    success: true,
    message: 'User registered successfully'
  });
});

// Add explicit login endpoint
app.post('/api/auth', (req, res) => {
  console.log('Login request received:', req.body);
  // Respond with auth token
  res.json({ 
    token: 'mock-jwt-token-123456',
    success: true,
    message: 'Login successful'
  });
});

// Add user authentication verification endpoint
app.get('/api/auth', (req, res) => {
  // Get token from header
  const token = req.header('x-auth-token');
  
  console.log('Auth verification request received, token:', token);
  
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }
  
  // Just verify it exists for this mock version
  res.json({ 
    user: { id: 'user_123', name: 'Test User' },
    success: true
  });
});

app.get('/api/wallet', (req, res) => {
  res.json({
    balance: 1250.75,
    currency: 'USD',
    walletId: 'wallet_demo',
    lastUpdated: new Date().toISOString()
  });
});

app.get('/api/transactions', (req, res) => {
  res.json([
    {
      id: 'txn_demo1',
      amount: 125.50,
      type: 'deposit',
      date: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: 'txn_demo2',
      amount: 42.75,
      type: 'payment',
      date: new Date(Date.now() - 172800000).toISOString()
    }
  ]);
});

// Serve loading.html as the initial entry point
app.get('/loading', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'loading.html'));
});

// Serve api-test.html for testing
app.get('/api-test', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'api-test.html'));
});

// Serve index.html with dynamically replaced API URL
app.get('/', (req, res) => {
  const indexPath = path.join(__dirname, 'public', 'index.html');
  fs.readFile(indexPath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading index.html:', err);
      return res.status(500).send('Error loading application');
    }
    
    // Get the API URL - use environment variable if set, otherwise use dynamic server URL
    let apiUrl;
    if (BACKEND_URL) {
      apiUrl = BACKEND_URL;
    } else {
      const protocol = req.headers['x-forwarded-proto'] || req.protocol;
      const host = req.headers.host;
      apiUrl = `${protocol}://${host}`;
    }
    
    console.log(`Using API URL: ${apiUrl}`);
    
    // Replace the hardcoded API_URL with the determined API URL
    const updatedHtml = data.replace(
      "const API_URL = 'http://localhost:5002';",
      `const API_URL = 'https://pay-backend-iu9e.onrender.com';`
    );
    
    res.send(updatedHtml);
  });
});

// Serve static files from the public directory (except index.html which we handle above)
app.use(express.static(path.join(__dirname, 'public'), {
  index: false // Don't serve index.html automatically
}));

// For other routes, serve the modified index.html as well for client-side routing
app.get('*', (req, res) => {
  // Skip API routes
  if (req.path.startsWith('/api/') || req.path === '/loading' || req.path === '/api-test') {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  
  const indexPath = path.join(__dirname, 'public', 'index.html');
  fs.readFile(indexPath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading index.html:', err);
      return res.status(500).send('Error loading application');
    }
    
    // Get the API URL - use environment variable if set, otherwise use dynamic server URL
    let apiUrl;
    if (BACKEND_URL) {
      apiUrl = BACKEND_URL;
    } else {
      const protocol = req.headers['x-forwarded-proto'] || req.protocol;
      const host = req.headers.host;
      apiUrl = `${protocol}://${host}`;
    }
    
    // Replace the hardcoded API_URL with the determined API URL
    const updatedHtml = data.replace(
      "const API_URL = 'http://localhost:5002';",
      `const API_URL = 'https://pay-backend-iu9e.onrender.com';`
    );
    
    res.send(updatedHtml);
  });
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running successfully on port ${PORT}!`);
  console.log(`📡 API URL: http://localhost:${PORT}/api`);
  console.log(`💻 Loading Page: http://localhost:${PORT}/loading`);
  console.log(`🧪 API Test Page: http://localhost:${PORT}/api-test`);
}); 