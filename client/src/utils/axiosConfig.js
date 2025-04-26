import axios from 'axios';

// Determine the base URL based on the environment
const isDevelopment = process.env.NODE_ENV === 'development';
const isGitHubPages = window.location.hostname.includes('github.io');

// For GitHub Pages deployment, we need to set the correct base URL
let baseURL = '';

// More detailed configuration based on environment
if (!isDevelopment && isGitHubPages) {
  // We're on GitHub Pages in production
  baseURL = process.env.REACT_APP_API_URL || '';
  console.log('Running on GitHub Pages - setting base URL to:', baseURL);
  
  if (!baseURL) {
    console.warn('WARNING: No REACT_APP_API_URL provided for GitHub Pages! API calls will likely fail.');
  }
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
  timeout: 15000 // 15 seconds for Railway cold starts
});

// Track server state
let serverStatus = {
  isAwake: false,
  checkInProgress: false,
  retries: 0,
  maxRetries: 3
};

// Function to check server status
const checkServer = async () => {
  if (serverStatus.checkInProgress) return;
  
  try {
    serverStatus.checkInProgress = true;
    console.log('Checking server status...');
    
    // Use direct axios call to avoid interceptors
    const response = await axios.get(`${baseURL}/api/health`, { 
      timeout: 5000 
    });
    
    if (response.status === 200) {
      console.log('Server is awake and responding.');
      serverStatus.isAwake = true;
      serverStatus.retries = 0;
      return true;
    }
  } catch (error) {
    console.warn('Server health check failed:', error.message);
    serverStatus.isAwake = false;
  } finally {
    serverStatus.checkInProgress = false;
  }
  
  return false;
};

// Initial server check on app load
if (baseURL) {
  setTimeout(() => {
    checkServer();
  }, 1000);
}

// Add request interceptor to handle API paths for GitHub Pages
api.interceptors.request.use(
  async config => {
    // If we're on GitHub Pages but trying to access a relative API path
    if (baseURL && config.url.startsWith('/api/')) {
      config.url = `${baseURL}${config.url}`;
    }
    
    // For wallet and transaction endpoints, check server first
    if (
      (config.url.includes('/wallet') || config.url.includes('/transactions')) &&
      !serverStatus.isAwake
    ) {
      console.log('Critical endpoint requested. Checking server status first...');
      await checkServer();
    }
    
    return config;
  },
  error => Promise.reject(error)
);

// Add response interceptor with retry for Railway errors
api.interceptors.response.use(
  response => {
    // If we got a successful response, server is awake
    serverStatus.isAwake = true;
    return response;
  },
  async error => {
    const originalRequest = error.config;
    
    // Don't retry already retried requests
    if (originalRequest._retry) {
      return Promise.reject(error);
    }
    
    // Handle specific wallet/transaction Railway errors
    if (
      (originalRequest.url.includes('/wallet') || 
       originalRequest.url.includes('/transactions')) &&
      (!error.response || error.response.status >= 500) &&
      serverStatus.retries < serverStatus.maxRetries
    ) {
      console.log(`Railway API error with ${originalRequest.url}. Attempting retry...`);
      
      // Mark as retried to prevent infinite loop
      originalRequest._retry = true;
      serverStatus.retries++;
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Check server health
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