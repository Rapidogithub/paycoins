import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from '../utils/axiosConfig';
import { useSpring, animated, config } from 'react-spring';
import setAuthToken from '../utils/setAuthToken';
import { storeToken, storeUser } from '../utils/localStorage';
import LogoLoader from '../components/animation/LogoLoader';

const Login = ({ setUser, setIsAuthenticated }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const [offlineMode, setOfflineMode] = useState(false);

  const { username, password } = formData;

  // Animation for the form container
  const fadeIn = useSpring({
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    config: config.gentle
  });

  // Staggered animations for form elements
  const formTitle = useSpring({
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    delay: 100,
    config: config.gentle
  });

  const formFields = useSpring({
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    delay: 200,
    config: config.gentle
  });

  const formButton = useSpring({
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    delay: 300,
    config: config.gentle
  });

  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Check if we have offline cached users
  const checkOfflineUserExists = (username, password) => {
    try {
      const cachedUsersStr = localStorage.getItem('offlineUsers');
      if (!cachedUsersStr) return false;
      
      const cachedUsers = JSON.parse(cachedUsersStr);
      const user = cachedUsers.find(u => u.username === username);
      
      // Very simple password check - in a real app you'd use hashing
      if (user && user.password === password) {
        return user;
      }
      return false;
    } catch (err) {
      console.error('Error checking offline users:', err);
      return false;
    }
  };

  // Store user for offline login
  const storeOfflineUser = (username, password, userData) => {
    try {
      const cachedUsersStr = localStorage.getItem('offlineUsers');
      let cachedUsers = cachedUsersStr ? JSON.parse(cachedUsersStr) : [];
      
      // Check if user already exists
      const userIndex = cachedUsers.findIndex(u => u.username === username);
      
      const userToStore = {
        username,
        password, // In a real app, store a hash, not the actual password
        userData
      };
      
      if (userIndex >= 0) {
        // Update existing user
        cachedUsers[userIndex] = userToStore;
      } else {
        // Add new user
        cachedUsers.push(userToStore);
      }
      
      localStorage.setItem('offlineUsers', JSON.stringify(cachedUsers));
    } catch (err) {
      console.error('Error storing offline user:', err);
    }
  };

  const onSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    // Validate inputs
    if (!username || !password) {
      setError('Please enter both username and password');
      setLoading(false);
      return;
    }

    try {
      console.log('Attempting to login user:', { username });
      const res = await axios.post('/api/auth', { username, password });
      console.log('Login successful:', res.data);
      
      // Set token to localStorage
      const token = res.data.token;
      storeToken(token);
      
      // Set auth token in axios headers
      setAuthToken(token);
      
      // Load user data
      console.log('Loading user data...');
      const userRes = await axios.get('/api/auth');
      const userData = userRes.data;
      console.log('User data loaded:', userData);
      
      // Store user for offline mode
      storeOfflineUser(username, password, userData);
      
      // Update state
      setUser(userData);
      storeUser(userData);
      setIsAuthenticated(true);
      
      // Show loader before navigating
      setLoading(false);
      setShowLoader(true);
      
      // Navigation happens in the LogoLoader component
    } catch (err) {
      console.error('Login error:', err);
      
      // Try offline login if server is unavailable
      const offlineUser = checkOfflineUserExists(username, password);
      if (offlineUser) {
        setOfflineMode(true);
        console.log('Using offline login');
        
        // Create a mock token
        const mockToken = `offline-token-${Date.now()}`;
        storeToken(mockToken);
        setAuthToken(mockToken);
        
        // Set user data from cache
        setUser(offlineUser.userData);
        storeUser(offlineUser.userData);
        setIsAuthenticated(true);
        
        // Show loader with offline mode notice
        setLoading(false);
        setShowLoader(true);
        return;
      }
      
      // Handle regular login errors
      setLoading(false);
      
      // More detailed error handling
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error response:', err.response.data);
        
        if (err.response.data.errors && err.response.data.errors.length > 0) {
          setError(err.response.data.errors[0].msg);
        } else if (err.response.data.msg) {
          setError(err.response.data.msg);
        } else {
          setError(`Login failed (${err.response.status}): Please try again`);
        }
      } else if (err.request) {
        // The request was made but no response was received
        console.error('No response received:', err.request);
        setError('No response from server. The backend might be starting up or unavailable. Try again or check if you have used this device before to log in offline.');
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Request setup error:', err.message);
        setError('Login failed: ' + err.message);
      }
    }
  };

  // If showing loader, return only the loader component
  if (showLoader) {
    return <LogoLoader redirectPath="/dashboard" offlineMode={offlineMode} />;
  }

  return (
    <animated.div style={fadeIn} className="form-container">
      <animated.div style={formTitle}>
        <h1 className="text-center">
          <i className="fas fa-sign-in-alt"></i> Login
        </h1>
        <p className="text-center">Access your account</p>
      </animated.div>

      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={onSubmit}>
        <animated.div style={formFields}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={username}
              onChange={onChange}
              autoComplete="username"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={onChange}
              autoComplete="current-password"
              minLength="6"
              required
            />
          </div>
        </animated.div>
        
        <animated.div style={formButton}>
          <button 
            type="submit" 
            className="btn btn-primary btn-block"
            disabled={loading}
          >
            {loading ? (
              <span><i className="fas fa-spinner fa-spin"></i> Logging In...</span>
            ) : (
              'Login'
            )}
          </button>
          <p className="text-center my-1">
            Don't have an account? <Link to="/register">Register</Link>
          </p>
        </animated.div>
      </form>
    </animated.div>
  );
};

export default Login; 