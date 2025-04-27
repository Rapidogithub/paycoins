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
  },
  countdownTimer: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#0d6efd',
    margin: '10px 0'
  },
  infoBox: {
    backgroundColor: '#cfe2ff',
    color: '#084298',
    padding: '10px',
    borderRadius: '4px',
    marginTop: '15px',
    fontSize: '14px',
    textAlign: 'left'
  }
};

/**
 * Component to handle and display server connection errors with automatic retries
 * Also handles Render cold start delays with helpful messages
 */
const ConnectionErrorHandler = ({ 
  onRetrySuccess, 
  customMessage, 
  maxRetries = 5  // Increased default max retries
}) => {
  const [retrying, setRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [retryProgress, setRetryProgress] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('checking');
  const [countdown, setCountdown] = useState(60);
  const [showColdStartInfo, setShowColdStartInfo] = useState(false);

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
        
        // If we're on the 2nd retry with no success, show cold start info
        if (retryCount >= 1 && !showColdStartInfo) {
          setShowColdStartInfo(true);
          startCountdown();
        }
        
        setTimeout(() => {
          setRetrying(false);
          setRetryProgress(0);
        }, 500);
      }
    } catch (error) {
      setConnectionStatus('error');
      setRetrying(false);
      setRetryProgress(0);
      
      // Show cold start info on error as well
      if (!showColdStartInfo) {
        setShowColdStartInfo(true);
        startCountdown();
      }
    }
  };

  // Countdown timer for Render cold start
  const startCountdown = () => {
    setCountdown(60); // Render typically takes up to 60 seconds for cold start
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  };

  // Auto-retry on mount
  useEffect(() => {
    handleRetry();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-retry up to maxRetries with increasing delay
  useEffect(() => {
    if (connectionStatus === 'failed' && retryCount < maxRetries) {
      // Exponential backoff: 2s, 4s, 8s, 16s, 32s
      const delay = Math.min(Math.pow(2, retryCount + 1) * 1000, 30000);
      
      const timer = setTimeout(() => {
        handleRetry();
      }, delay);
      
      return () => clearTimeout(timer);
    }
  }, [connectionStatus, retryCount, maxRetries]);

  // When countdown reaches 0, trigger another retry
  useEffect(() => {
    if (countdown === 0 && connectionStatus !== 'connected') {
      handleRetry();
    }
  }, [countdown, connectionStatus]);

  // Generate status message
  const getStatusMessage = () => {
    switch (connectionStatus) {
      case 'checking':
        return 'Checking connection to server...';
      case 'connected':
        return 'Connected! Redirecting...';
      case 'failed':
        if (showColdStartInfo) {
          return 'Waiting for Render instance to start up...';
        }
        return retryCount >= maxRetries 
          ? 'Maximum retry attempts reached. Please try again later.'
          : `Connection failed. Retrying automatically... (${retryCount}/${maxRetries})`;
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
      
      {/* Cold start info with countdown */}
      {showColdStartInfo && countdown > 0 && (
        <>
          <div style={styles.countdownTimer}>
            {countdown}s
          </div>
          <div style={styles.infoBox}>
            <p><strong>Render Cold Start Detected</strong></p>
            <p>Free Render instances hibernate when unused and take 30-60 seconds to start.</p>
            <p>Please wait for the countdown - we'll connect automatically once the server is ready.</p>
          </div>
        </>
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