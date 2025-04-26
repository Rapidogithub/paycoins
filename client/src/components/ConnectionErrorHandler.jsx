import React, { useState, useEffect } from 'react';
import { checkApiStatus } from '../utils/axiosConfig';

// Styling for the component
const styles = {
  container: {
    padding: '20px',
    backgroundColor: '#f8f9fa',
    border: '1px solid #dee2e6',
    borderRadius: '8px',
    maxWidth: '500px',
    margin: '40px auto',
    textAlign: 'center',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
  },
  heading: {
    color: '#dc3545',
    fontSize: '20px',
    marginBottom: '15px'
  },
  message: {
    fontSize: '16px',
    lineHeight: '1.5',
    color: '#343a40',
    marginBottom: '20px'
  },
  button: {
    backgroundColor: '#0d6efd',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    transition: 'background-color 0.3s'
  },
  buttonHover: {
    backgroundColor: '#0b5ed7'
  },
  status: {
    fontSize: '14px',
    color: '#6c757d',
    marginTop: '15px'
  },
  progress: {
    height: '4px',
    backgroundColor: '#e9ecef',
    borderRadius: '4px',
    margin: '15px 0',
    overflow: 'hidden'
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#0d6efd',
    transition: 'width 0.3s ease'
  }
};

/**
 * Component to handle and display server connection errors with automatic retries
 */
const ConnectionErrorHandler = ({ 
  onRetrySuccess, 
  customMessage, 
  maxRetries = 3 
}) => {
  const [retrying, setRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [retryProgress, setRetryProgress] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');

  // Function to handle retry button click
  const handleRetry = async () => {
    setRetrying(true);
    setRetryCount(prev => prev + 1);
    setConnectionStatus('checking');
    
    try {
      // Start progress animation
      setRetryProgress(0);
      const progressInterval = setInterval(() => {
        setRetryProgress(prev => Math.min(prev + 2, 95));
      }, 100);
      
      // Try to connect to the server
      const success = await checkApiStatus();
      
      // Clear the progress animation
      clearInterval(progressInterval);
      setRetryProgress(100);
      
      if (success) {
        setConnectionStatus('connected');
        // Wait for progress bar to finish
        setTimeout(() => {
          if (onRetrySuccess) onRetrySuccess();
        }, 500);
      } else {
        setConnectionStatus('failed');
        setTimeout(() => {
          setRetrying(false);
          setRetryProgress(0);
        }, 500);
      }
    } catch (error) {
      setConnectionStatus('error');
      setRetrying(false);
      setRetryProgress(0);
    }
  };

  // Auto-retry on mount
  useEffect(() => {
    handleRetry();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-retry up to maxRetries
  useEffect(() => {
    if (connectionStatus === 'failed' && retryCount < maxRetries) {
      const timer = setTimeout(() => {
        handleRetry();
      }, 3000); // Wait 3 seconds between auto-retries
      
      return () => clearTimeout(timer);
    }
  }, [connectionStatus, retryCount, maxRetries]);

  // Generate status message
  const getStatusMessage = () => {
    switch (connectionStatus) {
      case 'checking':
        return 'Checking connection to server...';
      case 'connected':
        return 'Connected! Redirecting...';
      case 'failed':
        return retryCount >= maxRetries 
          ? 'Maximum retry attempts reached. Please try again later.'
          : `Connection failed. Retrying automatically in 3 seconds... (${retryCount}/${maxRetries})`;
      case 'error':
        return 'An error occurred during connection attempt.';
      default:
        return 'Not connected to server.';
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Connection Error</h2>
      
      <p style={styles.message}>
        {customMessage || 'Cannot connect to the PAY server. This happens when:'}
      </p>
      
      {!customMessage && (
        <ul style={{ textAlign: 'left', marginBottom: '20px' }}>
          <li>The server is starting up (wait 30-60 seconds)</li>
          <li>Your internet connection is down</li>
          <li>The server is temporarily unavailable</li>
        </ul>
      )}
      
      {/* Progress bar for retry */}
      {retrying && (
        <div style={styles.progress}>
          <div 
            style={{ 
              ...styles.progressBar, 
              width: `${retryProgress}%`
            }} 
          />
        </div>
      )}
      
      {/* Retry button */}
      {(!retrying && retryCount >= maxRetries) && (
        <button 
          style={{ 
            ...styles.button, 
            ...(hovered ? styles.buttonHover : {}) 
          }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onClick={handleRetry}
          disabled={retrying}
        >
          Retry Connection
        </button>
      )}
      
      {/* Status message */}
      <p style={styles.status}>
        {getStatusMessage()}
      </p>
    </div>
  );
};

export default ConnectionErrorHandler; 