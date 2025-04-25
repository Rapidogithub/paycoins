const express = require('express');
const app = express();

// Logging helper
const log = (msg) => {
  console.log(`[${new Date().toISOString()}] ${msg}`);
};

// Enhanced error logging
const logError = (err, context = '') => {
  console.error(`[${new Date().toISOString()}] ERROR${context ? ' ['+context+']' : ''}: ${err.message}`);
  console.error(err.stack);
  
  // Report to Railway logs in a format that's easy to find
  if (process.env.RAILWAY_ENVIRONMENT) {
    console.error(`RAILWAY_ERROR: ${context} - ${err.message}`);
  }
};

// Log startup information
log('Starting minimal PAY API server...');
log(`Node.js version: ${process.version}`);
log(`Environment: ${process.env.NODE_ENV || 'development'}`);
log(`Railway environment: ${process.env.RAILWAY_ENVIRONMENT || 'not on Railway'}`);

// Optimize for faster startup with proper Railway port handling
const isProduction = process.env.NODE_ENV === 'production';
const isRailway = !!process.env.RAILWAY_ENVIRONMENT;

// IMPORTANT: Railway often uses port 8080 by default
// This is the critical fix for the 504 Bad Gateway error
const PORT = process.env.PORT || (isRailway ? 8080 : 5001);

log(`Using PORT: ${PORT} (Source: ${process.env.PORT ? 'environment variable' : isRailway ? 'Railway default' : 'local default'})`);

// Add SIGTERM handler for Railway graceful shutdown
process.on('SIGTERM', () => {
  log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    log('Server closed');
    process.exit(0);
  });
  
  // Force close after 5 seconds (reduced from 10)
  setTimeout(() => {
    log('Forcing shutdown after timeout');
    process.exit(1);
  }, 5000);
});

// Global error handler for uncaught exceptions
process.on('uncaughtException', (err) => {
  logError(err, 'UNCAUGHT');
  
  // In production, we'll keep the server running despite the error
  if (!isProduction) {
    process.exit(1);
  }
});

// Global error handler for unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logError(new Error(`Unhandled Rejection at: ${promise}, reason: ${reason}`), 'PROMISE');
});

// Parse JSON request bodies
app.use(express.json());

// Enable CORS - optimized to accept all origins in development, specific origins in production
app.use((req, res, next) => {
  // Allow connections from GitHub Pages and localhost
  const allowedOrigins = [
    'https://rapidogithub.github.io',
    'http://localhost:3000'
  ];
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin) || !isProduction) {
    res.header('Access-Control-Allow-Origin', origin || '*');
  } else {
    // If origin not in allowed list but in production, still allow GitHub Pages
    res.header('Access-Control-Allow-Origin', 'https://rapidogithub.github.io');
  }
  
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, x-auth-token, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Request logging middleware - log all incoming requests
app.use((req, res, next) => {
  log(`${req.method} ${req.url} ${isProduction ? 'PROD' : 'DEV'}`);
  next();
});

// Simplified performance middleware - only in production
if (isProduction) {
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      if (duration > 1000) { // Only log slow requests
        log(`SLOW REQUEST: ${req.method} ${req.url} - ${duration}ms`);
      }
    });
    next();
  });
}

// First response - super fast health check
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'PAY API server is running',
    railway: process.env.RAILWAY_ENVIRONMENT ? true : false
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'API health check passed',
    timestamp: new Date().toISOString(),
    railway: process.env.RAILWAY_ENVIRONMENT ? true : false
  });
});

// Special no-sleep endpoint that can be pinged by uptime services
app.get('/api/keepalive', (req, res) => {
  res.status(200).send('OK');
});

// Register a simple mock user endpoint
app.post('/api/users', (req, res) => {
  log('Mock registration endpoint accessed');
  try {
    res.json({
      message: 'User registration mock successful',
      token: 'mock-jwt-token-123456'
    });
  } catch (err) {
    logError(err, 'USERS_API');
    res.status(500).json({ error: 'Registration failed', message: err.message });
  }
});

// Wallet API endpoints - with enhanced error handling
app.get('/api/wallet', (req, res) => {
  log('Wallet endpoint accessed');
  try {
    // Mock wallet data
    res.json({
      balance: 1250.75,
      currency: 'USD',
      walletId: 'wallet_' + Math.random().toString(36).substring(2, 10),
      lastUpdated: new Date().toISOString()
    });
  } catch (err) {
    logError(err, 'WALLET_API');
    res.status(500).json({ 
      error: 'Failed to fetch wallet data', 
      message: 'The wallet service is currently unavailable',
      errorId: Date.now().toString(36)
    });
  }
});

// Transaction API endpoints - with enhanced error handling
app.get('/api/transactions', (req, res) => {
  log('Transactions endpoint accessed');
  try {
    // Mock transaction data
    const transactions = [
      {
        id: 'txn_' + Math.random().toString(36).substring(2, 10),
        amount: 125.50,
        type: 'deposit',
        date: new Date(Date.now() - 86400000).toISOString() // Yesterday
      },
      {
        id: 'txn_' + Math.random().toString(36).substring(2, 10),
        amount: 42.75,
        type: 'payment',
        date: new Date(Date.now() - 172800000).toISOString() // 2 days ago
      }
    ];
    
    res.json(transactions);
  } catch (err) {
    logError(err, 'TRANSACTIONS_API');
    res.status(500).json({ 
      error: 'Failed to fetch transaction data', 
      message: 'The transaction service is currently unavailable',
      errorId: Date.now().toString(36)
    });
  }
});

// API endpoint to check Railway environment
app.get('/api/debug/railway', (req, res) => {
  log('Railway debug endpoint accessed');
  try {
    res.json({
      railway: process.env.RAILWAY_ENVIRONMENT ? true : false,
      railwayEnv: process.env.RAILWAY_ENVIRONMENT,
      railwayService: process.env.RAILWAY_SERVICE_NAME,
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime()
    });
  } catch (err) {
    logError(err, 'RAILWAY_DEBUG');
    res.status(500).json({ error: 'Debug failed', message: err.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  logError(err, `${req.method} ${req.url}`);
  res.status(500).json({
    error: 'Server error',
    message: isProduction ? 'An unexpected error occurred' : err.message,
    errorId: Date.now().toString(36)
  });
});

// Catch-all route for undefined routes
app.use('*', (req, res) => {
  log(`404 Not Found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource does not exist',
    path: req.originalUrl
  });
});

// Start server with optimizations for faster startup
const server = app.listen(PORT, '0.0.0.0', () => {
  log(`Server started successfully on port ${PORT}`);
  log(`Running in ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'} mode`);
  if (isRailway) {
    log('Running on Railway platform - using Railway configuration');
  }
  // Signal that the server is ready
  log('Server ready to accept connections');
}); 