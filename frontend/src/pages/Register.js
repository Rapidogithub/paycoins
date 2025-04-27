import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../utils/axiosConfig';
import { useSpring, animated, config } from 'react-spring';
import setAuthToken from '../utils/setAuthToken';
import { storeToken, storeUser } from '../utils/localStorage';
import LogoLoader from '../components/animation/LogoLoader';

const Register = ({ setUser, setIsAuthenticated }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    password2: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const navigate = useNavigate();

  const { username, password, password2 } = formData;

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

  const onSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Log the API base URL for debugging
    console.log('Current axios baseURL:', axios.defaults.baseURL);
    console.log('Environment:', process.env.NODE_ENV);
    console.log('API URL from env:', process.env.REACT_APP_API_URL);

    if (password !== password2) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Validate password length
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    // Validate username length
    if (username.length < 3) {
      setError('Username must be at least 3 characters long');
      setLoading(false);
      return;
    }

    try {
      console.log('Attempting to register user:', { username });
      const res = await axios.post('/api/users', { username, password });
      console.log('Registration successful:', res.data);
      
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
      
      // Update state
      setUser(userData);
      storeUser(userData);
      setIsAuthenticated(true);
      
      // Show loader before navigating
      setLoading(false);
      setShowLoader(true);
      
      // Navigation happens in the LogoLoader component
    } catch (err) {
      setLoading(false);
      console.error('Registration error:', err);
      
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
          setError(`Registration failed (${err.response.status}): Please try again`);
        }
      } else if (err.request) {
        // The request was made but no response was received
        console.error('No response received:', err.request);
        setError('No response from server. The backend might be starting up (wait 30-60 seconds) or unavailable.');
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Request setup error:', err.message);
        setError('Registration failed: ' + err.message);
      }
    }
  };

  // If showing loader, return only the loader component
  if (showLoader) {
    return <LogoLoader redirectPath="/dashboard" />;
  }

  return (
    <animated.div style={fadeIn} className="form-container">
      <animated.div style={formTitle}>
        <h1 className="text-center">
          <i className="fas fa-user-plus"></i> Register
        </h1>
        <p className="text-center">Create your account</p>
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
              autoComplete="new-password"
              minLength="6"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password2">Confirm Password</label>
            <input
              type="password"
              id="password2"
              name="password2"
              value={password2}
              onChange={onChange}
              autoComplete="new-password"
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
              <span><i className="fas fa-spinner fa-spin"></i> Creating Account...</span>
            ) : (
              'Create Account'
            )}
          </button>
          <p className="text-center my-1">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </animated.div>
      </form>
    </animated.div>
  );
};

export default Register; 