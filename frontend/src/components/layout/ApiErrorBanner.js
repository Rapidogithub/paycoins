import React from 'react';

/**
 * Banner component to show when API connection fails
 */
const ApiErrorBanner = ({ retryFunction }) => {
  return (
    <div className="api-error-banner">
      <div className="api-error-content">
        <h3><i className="fas fa-exclamation-triangle"></i> Connection Error</h3>
        <p>Cannot connect to the PAY server. This happens when:</p>
        <ul>
          <li>The server is starting up (wait 30-60 seconds)</li>
          <li>Your internet connection is down</li>
          <li>The server is temporarily unavailable</li>
        </ul>
        {retryFunction && (
          <button 
            className="btn btn-primary" 
            onClick={retryFunction}
          >
            <i className="fas fa-sync-alt"></i> Retry Connection
          </button>
        )}
        <p className="small-text">
          If problem persists, please try again later.
        </p>
      </div>
    </div>
  );
};

export default ApiErrorBanner; 