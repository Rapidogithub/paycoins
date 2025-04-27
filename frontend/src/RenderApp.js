import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import BottomNav from './components/layout/BottomNav';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Welcome from './pages/Welcome';
import TransactionHistory from './pages/TransactionHistory';
import Profile from './pages/Profile';
import SendPage from './pages/SendPage';
import ReceivePage from './pages/ReceivePage';
import ScanPage from './pages/ScanPage';
import PrivateRoute from './components/routing/PrivateRoute';
import ConnectionManager from './components/layout/ConnectionManager';
import setAuthToken from './utils/setAuthToken';
import { getStoredUser, getStoredToken, storeUser } from './utils/localStorage';
import { checkApiStatus } from './utils/axiosConfig';
import './styles/theme.css';
import './App.css';
import debugTheme from './utils/debugTheme';
import axios from './utils/axiosConfig';

// Check for token in localStorage and set axios header
if (getStoredToken()) {
  setAuthToken(getStoredToken());
}

// Warmup component to redirect to the warmup.html page
const WarmupRedirect = () => {
  useEffect(() => {
    // Try a quick API check first
    const quickCheck = async () => {
      try {
        const isAwake = await checkApiStatus();
        if (!isAwake) {
          // If server isn't awake, redirect to warmup page
          window.location.href = '/warmup.html';
        } else {
          // If server is already awake, redirect to home
          window.location.href = '/#/';
        }
      } catch (err) {
        // On any error, redirect to warmup page
        window.location.href = '/warmup.html';
      }
    };
    
    quickCheck();
  }, []);
  
  return (
    <div className="warmup-redirect">
      <h2>Checking server status...</h2>
      <p>Redirecting to appropriate page...</p>
    </div>
  );
};

// This is a special version of the App component for Render
// It uses HashRouter instead of BrowserRouter to avoid routing issues
function RenderApp() {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [renderError, setRenderError] = useState(null);

  // Debug info for Render deployment
  useEffect(() => {
    console.log('RenderApp mounted');
    console.log('Environment:', process.env.NODE_ENV);
    console.log('API URL:', process.env.REACT_APP_API_URL);
    console.log('PUBLIC_URL:', process.env.PUBLIC_URL);
    
    // Global error handling
    const errorHandler = (error) => {
      console.error('Caught in global handler:', error);
      setRenderError(error.message || 'Unknown application error');
    };
    
    window.addEventListener('error', errorHandler);
    return () => window.removeEventListener('error', errorHandler);
  }, []);

  // Load theme preferences from localStorage
  useEffect(() => {
    try {
      // Check for dark mode preference
      const savedDarkMode = localStorage.getItem('darkMode');
      if (savedDarkMode !== null) {
        setDarkMode(savedDarkMode === 'true');
      } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        // Use system preference if no saved preference
        setDarkMode(true);
      }
    } catch (err) {
      console.error('Error loading theme preferences:', err);
    }
  }, []);

  // Apply theme changes to document
  useEffect(() => {
    try {
      // Apply dark mode class to body
      if (darkMode) {
        document.body.classList.add('dark-mode');
      } else {
        document.body.classList.remove('dark-mode');
      }

      // Save preference to localStorage
      localStorage.setItem('darkMode', darkMode);
    } catch (err) {
      console.error('Error applying theme:', err);
    }
  }, [darkMode]);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Load user data on app load
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = getStoredToken();
        if (token) {
          try {
            // Try to get user from API
            const res = await axios.get('/api/auth', {
              headers: {
                'x-auth-token': token
              }
            });
            
            if (res.status === 200) {
              const data = res.data;
              setUser(data);
              storeUser(data); // Store user in localStorage
              setIsAuthenticated(true);
            } else {
              // If API fails, try to get from localStorage
              const storedUser = getStoredUser();
              if (storedUser) {
                setUser(storedUser);
                setIsAuthenticated(true);
              }
            }
          } catch (err) {
            console.error('Error loading user:', err);
            
            // Try to get from localStorage as fallback
            const storedUser = getStoredUser();
            if (storedUser) {
              setUser(storedUser);
              setIsAuthenticated(true);
            }
          }
        }
      } catch (err) {
        console.error('Error in loadUser:', err);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // If there's a render error, show it
  if (renderError) {
    return (
      <div style={{ 
        padding: '20px', 
        backgroundColor: '#ffebee', 
        color: '#b71c1c',
        margin: '20px',
        borderRadius: '5px'
      }}>
        <h2>Application Error</h2>
        <p>{renderError}</p>
        <button 
          onClick={() => window.location.reload()} 
          style={{
            backgroundColor: '#b71c1c',
            color: 'white',
            border: 'none',
            padding: '10px 15px',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Reload Application
        </button>
      </div>
    );
  }

  return (
    <HashRouter>
      <div className={`App ${darkMode ? 'dark-mode' : ''}`}>
        <ConnectionManager>
          <Navbar isAuthenticated={isAuthenticated} />
          <div className="container">
            <Routes>
              {/* Warmup route for handling Render cold starts */}
              <Route path="/warmup" element={<WarmupRedirect />} />
              
              {/* Root path - always show Welcome page first */}
              <Route 
                path="/"
                element={
                  isAuthenticated ? 
                  <Navigate to="/dashboard" replace /> : 
                  <Welcome />
                }
              />

              {/* Dashboard route - needs authentication */}
              <Route 
                path="/dashboard" 
                element={
                  <PrivateRoute isAuthenticated={isAuthenticated} loading={loading}>
                    <Dashboard user={user} />
                  </PrivateRoute>
                }
              />
              
              {/* Rest of the routes */}
              <Route 
                path="/history" 
                element={
                  <PrivateRoute isAuthenticated={isAuthenticated} loading={loading}>
                    <TransactionHistory />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <PrivateRoute isAuthenticated={isAuthenticated} loading={loading}>
                    <Profile />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/send" 
                element={
                  <PrivateRoute isAuthenticated={isAuthenticated} loading={loading}>
                    <SendPage />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/receive" 
                element={
                  <PrivateRoute isAuthenticated={isAuthenticated} loading={loading}>
                    <ReceivePage />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/scan" 
                element={
                  <PrivateRoute isAuthenticated={isAuthenticated} loading={loading}>
                    <ScanPage />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/login" 
                element={
                  isAuthenticated ? 
                  <Navigate to="/dashboard" /> : 
                  <Login setUser={setUser} setIsAuthenticated={setIsAuthenticated} />
                } 
              />
              <Route 
                path="/register" 
                element={
                  isAuthenticated ? 
                  <Navigate to="/dashboard" /> : 
                  <Register setUser={setUser} setIsAuthenticated={setIsAuthenticated} />
                } 
              />

              {/* Catch-all route */}
              <Route path="*" element={
                <div style={{
                  padding: '20px',
                  textAlign: 'center'
                }}>
                  <h2>Page Not Found</h2>
                  <p>The page you're looking for doesn't exist or has been moved.</p>
                  <button 
                    onClick={() => window.location.hash = '/'} 
                    style={{
                      backgroundColor: '#1565c0',
                      color: 'white',
                      border: 'none',
                      padding: '10px 15px',
                      borderRadius: '5px',
                      cursor: 'pointer'
                    }}
                  >
                    Go Home
                  </button>
                </div>
              } />
            </Routes>
          </div>
          {isAuthenticated && <BottomNav toggleDarkMode={toggleDarkMode} darkMode={darkMode} />}
        </ConnectionManager>
      </div>
    </HashRouter>
  );
}

export default RenderApp; 