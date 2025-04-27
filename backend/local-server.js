const express = require('express');
const app = express();
const net = require('net');
const path = require('path');

console.log('Starting PAY local server...');

// Ports to try in order
const PORTS_TO_TRY = [5002, 5003, 5004, 5005, 3000, 8080];

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

// Function to check if a port is in use
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    
    server.once('error', () => {
      resolve(false); // Port is not available
    });
    
    server.once('listening', () => {
      // Close the server and resolve true (port is available)
      server.close(() => {
        resolve(true);
      });
    });
    
    server.listen(port, 'localhost');
  });
}

// Function to find an available port
async function findAvailablePort() {
  for (const port of PORTS_TO_TRY) {
    console.log(`Trying port ${port}...`);
    if (await isPortAvailable(port)) {
      return port;
    } else {
      console.log(`Port ${port} is in use, trying next port...`);
    }
  }
  
  throw new Error('All ports are in use. Please close some applications and try again.');
}

// Start the server on an available port
async function startServer() {
  try {
    const port = await findAvailablePort();
    
    app.listen(port, 'localhost', () => {
      console.log(`\n✅ Server running successfully!`);
      console.log(`\n📱 FRONTEND UI: http://localhost:${port}`);
      console.log(`\n📡 API URL: http://localhost:${port}/api`);
      console.log(`\n📋 API Endpoints:`);
      console.log(`   - GET  /api           (Status check)`);
      console.log(`   - GET  /api/health    (Health check)`);
      console.log(`   - GET  /api/wallet    (Wallet information)`);
      console.log(`   - GET  /api/transactions (Transaction list)`);
      console.log(`   - POST /api/users     (User registration)`);
      console.log(`\n📌 Press Ctrl+C to stop the server`);
    });
  } catch (error) {
    console.error(`\n❌ ${error.message}`);
    process.exit(1);
  }
}

// Start the server
startServer(); 