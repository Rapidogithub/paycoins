import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import './setupSourceMapIgnore'; // Import source map ignoring setup
import './utils/axiosConfig'; // Import axios configuration

// Set a loading state in sessionStorage
// This helps track if the app is being freshly loaded or navigated within
window.onload = function() {
  // If this is a fresh page load, clear any existing auth session storage
  // and make sure we go through the welcome flow
  if (!sessionStorage.getItem('app_initialized')) {
    sessionStorage.setItem('app_initialized', 'true');
    const pathname = window.location.pathname;
    // If user is directly accessing a specific route, store it for post-welcome redirect
    if (pathname !== '/' && pathname !== '/paycoins/' && pathname !== '/paycoins') {
      sessionStorage.setItem('redirect_after_welcome', pathname);
    }
    // Force navigation to root to see welcome screen
    if (window.location.pathname !== '/' && 
        window.location.pathname !== '/paycoins/' && 
        window.location.pathname !== '/paycoins') {
      const basePath = window.location.pathname.includes('/paycoins') ? '/paycoins/' : '/';
      window.history.replaceState(null, null, basePath);
    }
  }
};

// Add error handling to catch React render errors
try {
  console.log('Starting to render the React application...');
  const rootElement = document.getElementById('root');
  
  if (rootElement) {
    console.log('Root element found, creating React root...');
    const root = ReactDOM.createRoot(rootElement);
    
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log('React application rendered successfully');
  } else {
    console.error('Root element not found in the DOM. This could indicate an issue with the HTML or that JavaScript is not executing properly.');
    // Create a fallback element to show something on the page
    const body = document.querySelector('body');
    if (body) {
      const errorDiv = document.createElement('div');
      errorDiv.innerHTML = `
        <div style="padding: 20px; text-align: center; font-family: Arial, sans-serif;">
          <h1>PAY Application Error</h1>
          <p>The application could not load properly. Please check the browser console for more details.</p>
        </div>
      `;
      body.appendChild(errorDiv);
    }
  }
} catch (error) {
  console.error('Error rendering React application:', error);
  // Try to display error on page
  const body = document.querySelector('body');
  if (body) {
    const errorDiv = document.createElement('div');
    errorDiv.innerHTML = `
      <div style="padding: 20px; text-align: center; font-family: Arial, sans-serif;">
        <h1>PAY Application Error</h1>
        <p>Error: ${error.message}</p>
        <p>Please check the browser console for more details.</p>
      </div>
    `;
    body.appendChild(errorDiv);
  }
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals(); 