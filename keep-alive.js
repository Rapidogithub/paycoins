const fetch = require('node-fetch');

// Replace with your actual Render URL
const RENDER_URL = process.env.RENDER_URL || 'https://your-app-name.onrender.com';

// Ping the health endpoint every 5 minutes
const PING_INTERVAL = 5 * 60 * 1000; // 5 minutes in milliseconds

async function pingServer() {
  try {
    console.log(`Pinging ${RENDER_URL}/health at ${new Date().toISOString()}`);
    const response = await fetch(`${RENDER_URL}/health`);
    const text = await response.text();
    console.log(`Response: ${response.status} ${text}`);
  } catch (error) {
    console.error(`Error pinging server: ${error.message}`);
  }
}

// Run initial ping
pingServer();

// Set up interval for regular pinging
setInterval(pingServer, PING_INTERVAL);

console.log(`Keep-alive service started. Pinging ${RENDER_URL} every ${PING_INTERVAL / 60000} minutes.`); 