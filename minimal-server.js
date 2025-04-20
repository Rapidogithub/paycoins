const express = require('express');
const app = express();

// Log memory usage for debugging Railway deployment issues
const logMemoryUsage = () => {
  const memoryUsage = process.memoryUsage();
  console.log('Memory usage:');
  console.log(`  RSS: ${Math.round(memoryUsage.rss / 1024 / 1024)} MB`);
  console.log(`  Heap Total: ${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`);
  console.log(`  Heap Used: ${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`);
  console.log(`  External: ${Math.round(memoryUsage.external / 1024 / 1024)} MB`);
};

// Log startup information
console.log('Starting minimal PAY API server...');
console.log(`Node.js version: ${process.version}`);
console.log(`Environment: ${process.env.NODE_ENV}`);
logMemoryUsage();

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

// Root level health check endpoint
app.get('/', (req, res) => {
  console.log('Root endpoint accessed');
  res.json({
    status: 'ok',
    message: 'Minimal PAY API server is running',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  console.log('Health check endpoint accessed');
  logMemoryUsage();
  res.json({
    status: 'ok',
    message: 'API health check passed',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    uptime: `${process.uptime()} seconds`
  });
});

// Environment variables endpoint
app.get('/api/env', (req, res) => {
  // Only show non-sensitive env vars
  res.json({
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    // Don't send JWT_SECRET
    JWT_SECRET: process.env.JWT_SECRET ? '[REDACTED]' : 'Not set',
    railway: !!process.env.RAILWAY_ENVIRONMENT
  });
});

// Register a simple mock user endpoint
app.post('/api/users', (req, res) => {
  console.log('Mock registration endpoint accessed');
  res.json({
    message: 'User registration mock successful',
    token: 'mock-jwt-token-123456'
  });
});

// Use Railway's PORT environment variable or fall back to 5001
const PORT = process.env.PORT || 5001;

// Start the server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Minimal server started on port ${PORT}`);
  console.log(`Health check endpoint: http://localhost:${PORT}/api/health`);
  logMemoryUsage();
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  logMemoryUsage();
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  logMemoryUsage();
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
}); 