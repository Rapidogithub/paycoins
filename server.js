const express = require('express');
const path = require('path');
const app = express();

// Get port from environment variable (Render sets this) or default to 10000
const PORT = process.env.PORT || 10000;

console.log('Starting PAY server...');
console.log(`Using PORT: ${PORT}`);
console.log(`NODE_ENV: ${process.env.NODE_ENV}`);

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Basic middleware
app.use(express.json());
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

// Serve static files for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running successfully on port ${PORT}!`);
  console.log(`📡 API URL: http://localhost:${PORT}/api`);
}); 