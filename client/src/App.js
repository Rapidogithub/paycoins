import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import BottomNav from './components/layout/BottomNav';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import TransactionHistory from './pages/TransactionHistory';
import Profile from './pages/Profile';
import SendPage from './pages/SendPage';
import ReceivePage from './pages/ReceivePage';
import ScanPage from './pages/ScanPage';
import PrivateRoute from './components/routing/PrivateRoute';
import ThemeCustomizer from './components/layout/ThemeCustomizer';
import setAuthToken from './utils/setAuthToken';
import { getStoredUser, getStoredToken, storeUser } from './utils/localStorage';
import './App.css';

// Check for token in localStorage and set axios header
if (getStoredToken()) {
  setAuthToken(getStoredToken());
}

function App() {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [showThemeCustomizer, setShowThemeCustomizer] = useState(false);
  const [themeColor, setThemeColor] = useState('green'); // default, green, blue, purple, orange

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

    // Check for theme color preference
    const savedThemeColor = localStorage.getItem('themeColor');
    if (savedThemeColor) {
      setThemeColor(savedThemeColor);
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

    // Apply theme color
    document.documentElement.setAttribute('data-theme', themeColor);

    // Save preferences to localStorage
    localStorage.setItem('darkMode', darkMode);
    localStorage.setItem('themeColor', themeColor);
  }, [darkMode, themeColor]);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Change theme color
  const changeThemeColor = (color) => {
    setThemeColor(color);
  };

  // Toggle theme customizer
  const toggleThemeCustomizer = () => {
    setShowThemeCustomizer(!showThemeCustomizer);
  };

  // Load user data on app load
  useEffect(() => {
    const loadUser = async () => {
      const token = getStoredToken();
      if (token) {
        try {
          // Try to get user from API
          const res = await fetch('/api/auth', {
            headers: {
              'x-auth-token': token
            }
          });
          
          if (res.ok) {
            const data = await res.json();
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
        <Navbar isAuthenticated={isAuthenticated} />
        <div className="container">
          <Routes>
            <Route 
              path="/" 
              element={
                <PrivateRoute isAuthenticated={isAuthenticated} loading={loading}>
                  <Dashboard user={user} />
                </PrivateRoute>
              } 
            />
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
              element={<Login setUser={setUser} setIsAuthenticated={setIsAuthenticated} />} 
            />
            <Route 
              path="/register" 
              element={<Register setUser={setUser} setIsAuthenticated={setIsAuthenticated} />} 
            />
          </Routes>
        </div>
        
        {/* Bottom Navigation */}
        <BottomNav isAuthenticated={isAuthenticated} />
        
        {/* Theme Buttons */}
        <div className="theme-controls">
          {/* Dark Mode Toggle */}
          <button className="dark-mode-toggle" onClick={toggleDarkMode}>
            <i className={`fas ${darkMode ? 'fa-sun' : 'fa-moon'}`}></i>
          </button>
          
          {/* Theme Customizer Toggle */}
          <button className="theme-customizer-toggle" onClick={toggleThemeCustomizer}>
            <i className="fas fa-palette"></i>
          </button>
        </div>
        
        {/* Theme Customizer Panel */}
        {showThemeCustomizer && (
          <ThemeCustomizer 
            themeColor={themeColor} 
            changeThemeColor={changeThemeColor}
            darkMode={darkMode}
            toggleDarkMode={toggleDarkMode}
            onClose={() => setShowThemeCustomizer(false)}
          />
        )}
      </div>
    </Router>
  );
}

export default App; 