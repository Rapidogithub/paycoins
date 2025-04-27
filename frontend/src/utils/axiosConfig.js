import axios from 'axios';

// Determine the base URL based on the environment
const isDevelopment = process.env.NODE_ENV === 'development';
const isGitHubPages = window.location.hostname.includes('github.io');

// For GitHub Pages deployment, we need to set the correct base URL
let baseURL = '';

// More detailed configuration based on environment
if (!isDevelopment && isGitHubPages) {
  // We're on GitHub Pages in production
  baseURL = process.env.REACT_APP_API_URL || 'https://pay-backend-iu9e.onrender.com';
  console.log('Running on GitHub Pages - setting base URL to:', baseURL);
} else if (isDevelopment) {
  // In development, use the proxy defined in package.json
  console.log('Running in development mode - using proxy for API calls');
} else {
  // Other production environment (not GitHub Pages)
  console.log('Running in production (not GitHub Pages) - using relative paths');
}

// Configure axios defaults with better timeout for Railway
const api = axios.create({
  baseURL: baseURL,
  timeout: 20000 // Increased timeout to 20 seconds for Render cold starts
});

// Track server state
let serverStatus = {
  isAwake: false,
  checkInProgress: false,
  retries: 0,
  maxRetries: 5, // Increased retries
  lastCheck: 0
};

// Function to check server status with improved error handling
const checkServer = async () => {
  // Prevent multiple checks within 2 seconds
  const now = Date.now();
  if (serverStatus.checkInProgress || (now - serverStatus.lastCheck < 2000)) {
    return serverStatus.isAwake;
  }
  
  try {
    serverStatus.checkInProgress = true;
    serverStatus.lastCheck = now;
    console.log('Checking server status...');
    
    // Use direct axios call to avoid interceptors
    const response = await axios.get(`${baseURL}/api/health`, { 
      timeout: 8000 // Increased timeout for health check
    });
    
    if (response.status === 200) {
      console.log('Server is awake and responding.');
      serverStatus.isAwake = true;
      serverStatus.retries = 0;
      return true;
    }
  } catch (error) {
    const errorMsg = error.response 
      ? `Status: ${error.response.status}` 
      : `Network error: ${error.message}`;
    console.warn(`Server health check failed: ${errorMsg}`);
    
    // Only consider not awake if we've had multiple failures
    if (serverStatus.retries >= 2) {
      serverStatus.isAwake = false;
    }
    
    // Display more helpful message for users
    if (error.code === 'ECONNABORTED') {
      console.warn('Request timed out. Render instance may be starting up from cold state (can take 30-60 seconds)');
    }
  } finally {
    serverStatus.checkInProgress = false;
  }
  
  return serverStatus.isAwake;
};

// Initial server check on app load with retry
setTimeout(() => {
  const checkWithRetry = async () => {
    const isAwake = await checkServer();
    
    // If not awake, try again after a delay
    if (!isAwake && serverStatus.retries < 3) {
      serverStatus.retries++;
      // Exponential backoff: 2s, 4s, 8s
      const delay = Math.pow(2, serverStatus.retries) * 1000;
      console.log(`Server not responding. Retrying in ${delay/1000}s... (attempt ${serverStatus.retries}/3)`);
      
      setTimeout(checkWithRetry, delay);
    }
  };
  
  checkWithRetry();
}, 1000);

// Add request interceptor to handle API paths for GitHub Pages
api.interceptors.request.use(
  async config => {
    // Ensure all API requests have the correct base URL when on GitHub Pages
    if (isGitHubPages && config.url.startsWith('/api/')) {
      config.url = `${baseURL}${config.url}`;
    }
    
    // For critical endpoints, check server first if not already known to be awake
    if (
      (config.url.includes('/wallet') || 
       config.url.includes('/transactions') || 
       config.url.includes('/auth')) &&
      !serverStatus.isAwake
    ) {
      console.log('Critical endpoint requested. Checking server status first...');
      await checkServer();
    }
    
    return config;
  },
  error => Promise.reject(error)
);

// Response interceptor with improved retry for Render cold starts
api.interceptors.response.use(
  response => {
    // If we got a successful response, server is awake
    serverStatus.isAwake = true;
    return response;
  },
  async error => {
    const originalRequest = error.config;
    
    // Don't retry already retried requests to prevent infinite loops
    if (originalRequest._retry || serverStatus.retries >= serverStatus.maxRetries) {
      return Promise.reject(error);
    }
    
    // Retry for network errors or server errors (500+)
    const shouldRetry = !error.response || error.response.status >= 500 || error.code === 'ECONNABORTED';
    
    if (shouldRetry) {
      console.log(`API request failed. ${error.message}. Attempting retry...`);
      
      // Mark as retried to prevent double retries
      originalRequest._retry = true;
      serverStatus.retries++;
      
      // Exponential backoff wait with jitter
      const delay = Math.min(Math.pow(2, serverStatus.retries) * 1000, 8000) + Math.random() * 1000;
      console.log(`Retrying in ${Math.round(delay/1000)}s (attempt ${serverStatus.retries}/${serverStatus.maxRetries})`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Check server health before retry
      await checkServer();
      
      // Retry the request
      return api(originalRequest);
    }
    
    // Log detailed error information
    console.error('API request failed:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data
    });
    
    return Promise.reject(error);
  }
);

// Export the API status check function
export const checkApiStatus = checkServer;

// Export the configured axios instance
export default api; 