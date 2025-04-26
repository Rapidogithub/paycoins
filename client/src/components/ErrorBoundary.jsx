import React, { Component } from 'react';
import ConnectionErrorHandler from './ConnectionErrorHandler';

/**
 * Error Boundary component that catches errors from API calls
 * and displays the ConnectionErrorHandler component
 */
class ErrorBoundary extends Component {
  state = {
    hasError: false,
    isApiError: false,
    error: null
  };

  static getDerivedStateFromError(error) {
    // Check if this is an API connection error
    const isApiError = 
      error.message?.includes('Network Error') ||
      error.message?.includes('timeout') ||
      error.message?.includes('failed with status code 5') ||
      error.isRailwayError;
    
    return {
      hasError: true,
      isApiError,
      error
    };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to the console
    console.error('Error caught by boundary:', error);
    console.error('Component stack:', errorInfo.componentStack);
  }

  handleRetrySuccess = () => {
    // Reset the error state when connection is restored
    this.setState({ hasError: false, isApiError: false, error: null });
  };

  render() {
    // If there's an error and it's an API error, show the connection handler
    if (this.state.hasError && this.state.isApiError) {
      return (
        <ConnectionErrorHandler
          onRetrySuccess={this.handleRetrySuccess}
          customMessage={
            this.state.error?.isRailwayError ? 
              this.state.error.message : 
              undefined
          }
        />
      );
    }

    // For other errors, show a generic error message or pass to a parent error handler
    if (this.state.hasError) {
      // If the parent provided an error fallback, use it
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      // Otherwise show a simple error message
      return (
        <div style={{ 
          padding: '20px', 
          textAlign: 'center',
          maxWidth: '500px',
          margin: '40px auto',
          backgroundColor: '#f8d7da',
          color: '#721c24',
          borderRadius: '8px',
          border: '1px solid #f5c6cb'
        }}>
          <h2>Something went wrong</h2>
          <p>Sorry, an unexpected error has occurred.</p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              marginTop: '15px'
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    // If no error, render children normally
    return this.props.children;
  }
}

export default ErrorBoundary; 