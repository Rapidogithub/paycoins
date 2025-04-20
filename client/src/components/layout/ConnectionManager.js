import React, { useState, useEffect, useCallback } from 'react';
import ApiErrorBanner from './ApiErrorBanner';

/**
 * Component that manages API connectivity with automatic retries
 * Wraps the application and handles connection attempts to the backend
 */
const ConnectionManager = ({ children }) => {
  const [isConnecting, setIsConnecting] = useState(true);
  const [apiError, setApiError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  
  // Function to check if the API is available
  const checkApiConnection = useCallback(async () => {
    try {
      const apiUrl = process.env.NODE_ENV === 'production' && process.env.REACT_APP_API_URL
        ? `${process.env.REACT_APP_API_URL}/api/health`
        : '/api/health';
      
      console.log('Testing API connectivity to:', apiUrl);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch(apiUrl, { 
        method: 'GET',
        mode: 'cors',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        console.log('API connection successful');
        setApiError(false);
        setIsConnecting(false);
        return true;
      } else {
        console.warn('API returned error status:', response.status);
        throw new Error(`API returned ${response.status}`);
      }
    } catch (err) {
      console.warn('API connectivity test failed:', err.message);
      setApiError(true);
      return false;
    }
  }, []);

  // Function to connect with automatic retries
  const connectWithRetry = useCallback(async (manualRetry = false) => {
    // Reset states when manually retrying
    if (manualRetry) {
      setApiError(false);
      setIsConnecting(true);
      setRetryCount(0);
    }
    
    const success = await checkApiConnection();
    
    if (!success) {
      const maxRetries = 3;
      const nextRetryCount = manualRetry ? 0 : retryCount + 1;
      
      if (nextRetryCount < maxRetries) {
        setRetryCount(nextRetryCount);
        // Exponential backoff: 5s, 10s, 20s
        const delay = 5000 * Math.pow(2, nextRetryCount);
        console.log(`Retrying connection in ${delay/1000} seconds... (Attempt ${nextRetryCount + 1}/${maxRetries})`);
        
        setTimeout(() => {
          connectWithRetry(false);
        }, delay);
      } else {
        // Max retries reached
        setIsConnecting(false);
        setApiError(true);
        console.error('Max connection retries reached. Showing error banner.');
      }
    }
  }, [checkApiConnection, retryCount]);
  
  // Initial connection attempt on component mount
  useEffect(() => {
    connectWithRetry();
    
    // Optional: Setup a ping to keep server alive (use carefully)
    const keepAlivePing = setInterval(() => {
      if (!apiError) {
        console.log('Sending keep-alive ping to prevent server sleep');
        checkApiConnection();
      }
    }, 14 * 60 * 1000); // 14 minutes
    
    return () => clearInterval(keepAlivePing);
  }, [connectWithRetry, checkApiConnection, apiError]);

  // Show loading spinner while connecting
  if (isConnecting) {
    return (
      <div className="connection-manager-loading">
        <div className="loading-container">
          <h2>Connecting to PAY Server...</h2>
          <p>The server may be starting up (30-60 seconds)</p>
          <div className="loading-spinner"></div>
          <p className="loading-message">
            {retryCount > 0 ? `Retry attempt ${retryCount}/3...` : 'Initial connection attempt...'}
          </p>
        </div>
      </div>
    );
  }

  // Show error banner if API is not available after retries
  if (apiError) {
    return <ApiErrorBanner retryFunction={() => connectWithRetry(true)} />;
  }

  // Render children when connected
  return children;
};

export default ConnectionManager; 