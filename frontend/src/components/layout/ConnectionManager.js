import React, { useState, useEffect, useCallback } from 'react';
import ApiErrorBanner from './ApiErrorBanner';
import { checkApiStatus } from '../../utils/axiosConfig';
import ConnectionErrorHandler from '../ConnectionErrorHandler';

/**
 * Component that manages API connectivity with progressive loading and offline capabilities
 * Wraps the application and handles connection attempts to the backend
 */
const ConnectionManager = ({ children }) => {
  const [isConnecting, setIsConnecting] = useState(true);
  const [apiError, setApiError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [showFullApp, setShowFullApp] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [showErrorHandler, setShowErrorHandler] = useState(false);
  const [coldStartDetected, setColdStartDetected] = useState(false);
  
  // Function to check if the API is available using our improved axiosConfig check
  const checkApiConnection = useCallback(async () => {
    try {
      console.log('Testing API connectivity...');
      
      const success = await checkApiStatus();
      
      if (success) {
        console.log('API connection successful');
        setApiError(false);
        setIsConnecting(false);
        setConnectionStatus('connected');
        return true;
      } else {
        console.warn('API returned error status');
        throw new Error(`API unavailable`);
      }
    } catch (err) {
      console.warn('API connectivity test failed:', err.message);
      
      // Check if this might be a cold start situation
      if (retryCount >= 1 && !coldStartDetected) {
        setColdStartDetected(true);
        console.log('Cold start situation detected. Will show specific UI.');
      }
      
      setApiError(true);
      setConnectionStatus('error');
      return false;
    }
  }, [retryCount, coldStartDetected]);

  // Function to connect with automatic retries
  const connectWithRetry = useCallback(async (manualRetry = false) => {
    // Reset states when manually retrying
    if (manualRetry) {
      setApiError(false);
      setIsConnecting(true);
      setRetryCount(0);
      setConnectionStatus('connecting');
    }
    
    const success = await checkApiConnection();
    
    if (!success) {
      const maxRetries = 4;
      const nextRetryCount = manualRetry ? 0 : retryCount + 1;
      
      if (nextRetryCount < maxRetries) {
        setRetryCount(nextRetryCount);
        // Exponential backoff: 2s, 4s, 8s, 16s
        const delay = 2000 * Math.pow(2, nextRetryCount);
        console.log(`Retrying connection in ${delay/1000} seconds... (Attempt ${nextRetryCount + 1}/${maxRetries})`);
        
        setTimeout(() => {
          connectWithRetry(false);
        }, delay);
      } else {
        // Max retries reached - show dedicated error handler
        setIsConnecting(false);
        setApiError(true);
        setConnectionStatus('failed');
        setShowErrorHandler(true);
        console.error('Max connection retries reached. Showing error handler.');
      }
    }
  }, [checkApiConnection, retryCount]);
  
  // Effect to show the full app after a short delay, even if still connecting
  useEffect(() => {
    // After 3 seconds, show the app regardless of connection status
    // Unless we're in a cold start situation
    const timer = setTimeout(() => {
      if (!coldStartDetected) {
        setShowFullApp(true);
      }
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [coldStartDetected]);
  
  // Initial connection attempt on component mount
  useEffect(() => {
    connectWithRetry();
    
    // Optional: Setup a ping to keep server alive (every 10 minutes)
    const keepAlivePing = setInterval(() => {
      if (!apiError) {
        console.log('Sending keep-alive ping to prevent server hibernation');
        checkApiConnection();
      }
    }, 10 * 60 * 1000); // 10 minutes
    
    return () => clearInterval(keepAlivePing);
  }, [connectWithRetry, checkApiConnection, apiError]);

  // Handle successful connection after error
  const handleSuccessfulConnection = () => {
    setApiError(false);
    setIsConnecting(false);
    setConnectionStatus('connected');
    setShowErrorHandler(false);
    setShowFullApp(true);
  };

  // If error handler is showing, render it
  if (showErrorHandler) {
    return (
      <ConnectionErrorHandler
        onRetrySuccess={handleSuccessfulConnection}
        maxRetries={8} // Higher retries for cold start
      />
    );
  }

  // If cold start detected but not showing error handler yet, show countdown UI
  if (coldStartDetected && !showFullApp) {
    return (
      <div className="connection-manager-loading">
        <div className="loading-container">
          <h2>Warming Up PAY Server</h2>
          <p>Free Render instances hibernate when not in use</p>
          <p>The server is starting up, this can take 30-60 seconds</p>
          <div className="loading-spinner"></div>
          <div className="render-note" style={{ marginTop: '20px', padding: '10px', backgroundColor: '#cfe2ff', borderRadius: '4px', color: '#084298' }}>
            <p><strong>Tip:</strong> The server goes to sleep after 15 minutes of inactivity</p>
            <p>First request after sleep always takes longer - please be patient</p>
          </div>
          <button 
            onClick={() => setShowFullApp(true)} 
            className="btn btn-secondary mt-3"
          >
            Continue without waiting
          </button>
        </div>
      </div>
    );
  }

  // Render app with warning banner if showing full app but still connecting
  if (showFullApp) {
    return (
      <>
        {(isConnecting || apiError) && (
          <div className="connection-banner">
            <div className="connection-status">
              {isConnecting ? (
                <>
                  <i className="fas fa-sync fa-spin"></i> 
                  <span>Connecting to server in background...</span>
                </>
              ) : (
                <>
                  <i className="fas fa-exclamation-triangle"></i>
                  <span>Server connection issues</span>
                  <button 
                    onClick={() => connectWithRetry(true)}
                    className="btn-small"
                  >
                    Retry
                  </button>
                </>
              )}
            </div>
          </div>
        )}
        {children}
      </>
    );
  }

  // Show loading spinner while initial connecting
  return (
    <div className="connection-manager-loading">
      <div className="loading-container">
        <h2>Connecting to PAY Server...</h2>
        <p>The server may be starting up (30-60 seconds)</p>
        <div className="loading-spinner"></div>
        <p className="loading-message">
          {retryCount > 0 ? `Retry attempt ${retryCount}/4...` : 'Initial connection attempt...'}
        </p>
        <button 
          onClick={() => setShowFullApp(true)} 
          className="btn btn-secondary mt-3"
        >
          Continue without waiting
        </button>
      </div>
    </div>
  );
};

export default ConnectionManager; 