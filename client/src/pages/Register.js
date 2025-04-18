import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import setAuthToken from '../utils/setAuthToken';
import { storeToken, storeUser } from '../utils/localStorage';

const Register = ({ setUser, setIsAuthenticated }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    password2: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const { username, password, password2 } = formData;

  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async e => {
    e.preventDefault();
    setError('');

    if (password !== password2) {
      setError('Passwords do not match');
      return;
    }

    try {
      const res = await axios.post('/api/users', { username, password });
      
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
          : 'Registration failed, please try again'
      );
    }
  };

  return (
    <div className="form-container">
      <h1 className="text-center">
        <i className="fas fa-user-plus"></i> Register
      </h1>
      <p className="text-center">Create your account</p>

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
            minLength="6"
            required
          />
        </div>
        <button type="submit" className="btn btn-primary btn-block">
          Create Account
        </button>
      </form>
      <p className="text-center my-1">
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
};

export default Register; 