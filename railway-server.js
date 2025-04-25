const express = require('express');
const app = express();

// Simple logging helper
console.log('Starting simplified Railway server...');
console.log(`Node.js version: ${process.version}`);
console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);

// Get port from Railway or use fallback
const PORT = process.env.PORT || 8080;
console.log(`Using PORT: ${PORT}`);

// Basic middleware
app.use(express.json());

// Enable CORS for all origins
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Root endpoint
app.get('/', (req, res) => {
  res.send('Railway server running');
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Health check passed',
    timestamp: new Date().toISOString()
  });
});

// Basic API endpoint
app.get('/api/wallet', (req, res) => {
  res.json({
    balance: 1250.75,
    currency: 'USD',
    walletId: 'demo_wallet',
    lastUpdated: new Date().toISOString()
  });
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
}); 