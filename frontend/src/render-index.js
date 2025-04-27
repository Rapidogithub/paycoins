import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import RenderApp from './RenderApp';
import reportWebVitals from './reportWebVitals';

console.log('🚀 Starting RENDER specific version of the app');
console.log('🔄 Using hash router for client-side routing');

// Initialize the app with error boundaries
try {
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(
    <React.StrictMode>
      <RenderApp />
    </React.StrictMode>
  );
} catch (error) {
  console.error('❌ Failed to start the application:', error);
  
  // Show a user-friendly error message
  const rootElement = document.getElementById('root');
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="padding: 20px; background-color: #ffebee; color: #b71c1c; margin: 20px; border-radius: 5px;">
        <h2>Application Error</h2>
        <p>${error.message || 'An unknown error occurred while starting the application.'}</p>
        <button 
          onclick="window.location.reload()" 
          style="background-color: #b71c1c; color: white; border: none; padding: 10px 15px; border-radius: 5px; cursor: pointer;"
        >
          Reload Application
        </button>
      </div>
    `;
  }
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals(); 