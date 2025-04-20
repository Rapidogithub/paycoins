const express = require('express');
const app = express();

// Logging helper
const log = (msg) => {
  console.log(`[${new Date().toISOString()}] ${msg}`);
};

// Log startup information
log('Starting minimal PAY API server...');
log(`Node.js version: ${process.version}`);
log(`Environment: ${process.env.NODE_ENV || 'development'}`);
log(`PORT environment variable: ${process.env.PORT || 'not set (will use default)'}`);

// Add SIGTERM handler for Railway graceful shutdown
process.on('SIGTERM', () => {
  log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    log('Server closed');
    process.exit(0);
  });
  
  // Force close after 10 seconds
  setTimeout(() => {
    log('Forcing shutdown after timeout');
    process.exit(1);
  }, 10000);
});

// Enable CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, x-auth-token');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Performance middleware - add response times
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    log(`${req.method} ${req.url} - ${duration}ms`);
  });
  next();
});

// Root level health check endpoint - respond immediately
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Minimal PAY API server is running',
    environment: process.env.NODE_ENV || 'development',
    port: process.env.PORT || '5001 (default)',
    railway: process.env.RAILWAY_ENVIRONMENT ? true : false
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'API health check passed',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    port: process.env.PORT || '5001 (default)',
    railway: process.env.RAILWAY_ENVIRONMENT ? true : false
  });
});

// Register a simple mock user endpoint
app.post('/api/users', (req, res) => {
  log('Mock registration endpoint accessed');
  res.json({
    message: 'User registration mock successful',
    token: 'mock-jwt-token-123456'
  });
});

// Use Railway's PORT environment variable or fall back to 5001
const PORT = process.env.PORT || 5001;

// Optimize server startup by removing the artificial delay
const server = app.listen(PORT, '0.0.0.0', () => {
  log(`Minimal server started on port ${PORT}`);
  log(`Using PORT from environment: ${process.env.PORT ? 'Yes' : 'No'}`);
  if (process.env.PORT) {
    log(`PORT value from environment: ${process.env.PORT}`);
  }
  
  // Signal that the server is ready
  log('Server is ready to accept connections');
}); 