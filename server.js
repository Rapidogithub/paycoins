const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

// Get port from environment variable (Render sets this) or default to 10000
const PORT = process.env.PORT || 10000;

console.log('Starting PAY server...');
console.log(`Using PORT: ${PORT}`);
console.log(`NODE_ENV: ${process.env.NODE_ENV}`);

// Middleware for parsing JSON
app.use(express.json());

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type, x-auth-token');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  console.log(`${req.method} ${req.url}`);
  next();
});

// Health check endpoint required by Render
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// API endpoints
app.get('/api', (req, res) => {
  res.json({ status: 'ok', message: 'PAY API running' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/users', (req, res) => {
  res.json({ token: 'mock-jwt-token-123456' });
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

// Serve index.html with dynamically replaced API URL
app.get('/', (req, res) => {
  const indexPath = path.join(__dirname, 'public', 'index.html');
  fs.readFile(indexPath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading index.html:', err);
      return res.status(500).send('Error loading application');
    }
    
    // Get the current server URL
    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const host = req.headers.host;
    const serverUrl = `${protocol}://${host}`;
    
    // Replace the hardcoded API_URL with the current server URL
    const updatedHtml = data.replace(
      "const API_URL = 'http://localhost:5002';",
      `const API_URL = '${serverUrl}';`
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
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  
  const indexPath = path.join(__dirname, 'public', 'index.html');
  fs.readFile(indexPath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading index.html:', err);
      return res.status(500).send('Error loading application');
    }
    
    // Get the current server URL
    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const host = req.headers.host;
    const serverUrl = `${protocol}://${host}`;
    
    // Replace the hardcoded API_URL with the current server URL
    const updatedHtml = data.replace(
      "const API_URL = 'http://localhost:5002';",
      `const API_URL = '${serverUrl}';`
    );
    
    res.send(updatedHtml);
  });
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running successfully on port ${PORT}!`);
  console.log(`📡 API URL: http://localhost:${PORT}/api`);
}); 