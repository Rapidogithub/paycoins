import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import setAuthToken from '../utils/setAuthToken';
import { storeToken, storeUser } from '../utils/localStorage';

const Login = ({ setUser, setIsAuthenticated }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const { username, password } = formData;

  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async e => {
    e.preventDefault();
    setError('');

    try {
      const res = await axios.post('/api/auth', { username, password });
      
      // Set token to localStorage
      const token = res.data.token;
      storeToken(token);
      
      // Set auth token in axios headers
      setAuthToken(token);
      
      // Load user data
      const userRes = await axios.get('/api/auth');
      const userData = userRes.data;
      
      // Update state
      setUser(userData);
      storeUser(userData);
      setIsAuthenticated(true);
      
      // Redirect to dashboard
      navigate('/');
    } catch (err) {
      setError(
        err.response && err.response.data.errors
          ? err.response.data.errors[0].msg
          : 'Login failed, please check your credentials'
      );
    }
  };

  return (
    <div className="form-container">
      <h1 className="text-center">
        <i className="fas fa-sign-in-alt"></i> Login
      </h1>
      <p className="text-center">Sign in to your account</p>

      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            value={username}
            onChange={onChange}
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
            required
          />
        </div>
        <button type="submit" className="btn btn-primary btn-block">
          Login
        </button>
      </form>
      <p className="text-center my-1">
        Don't have an account? <Link to="/register">Register</Link>
      </p>
    </div>
  );
};

export default Login; 