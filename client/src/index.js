import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

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