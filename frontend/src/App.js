import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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

// For GitHub Pages - get the basename from the homepage in package.json
const getBasename = () => {
  // Extract from package.json or use default
  const homepage = process.env.PUBLIC_URL || '';
  // If homepage includes github.io, parse the path
  if (homepage.includes('github.io')) {
    return homepage.split('/').slice(3).join('/');
  }
  return '';
};

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
          window.location.href = '/';
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

function App() {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  // Load theme preferences from localStorage
  useEffect(() => {
    // Check for dark mode preference
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode !== null) {
      setDarkMode(savedDarkMode === 'true');
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      // Use system preference if no saved preference
      setDarkMode(true);
    }
  }, []);

  // Apply theme changes to document
  useEffect(() => {
    // Apply dark mode class to body
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }

    // Save preference to localStorage
    localStorage.setItem('darkMode', darkMode);
    
    // Debug theme variables in development mode
    if (process.env.NODE_ENV === 'development') {
      debugTheme();
    }
  }, [darkMode]);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Load user data on app load
  useEffect(() => {
    const loadUser = async () => {
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
      setLoading(false);
    };

    loadUser();
  }, []);

  return (
    <Router>
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
            </Routes>
          </div>
          {isAuthenticated && <BottomNav toggleDarkMode={toggleDarkMode} darkMode={darkMode} />}
        </ConnectionManager>
      </div>
    </Router>
  );
}

export default App; 