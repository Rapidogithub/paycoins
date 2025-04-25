// This file is intentionally simple to help Railway's health checking system
console.log('Railway Healthcheck Loaded');

const http = require('http');

http.createServer((req, res) => {
  console.log('Health check received');
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('OK');
}).listen(process.env.PORT || 8080);

console.log(`Healthcheck server running on port ${process.env.PORT || 8080}`); 