import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './BottomNav.css';

const BottomNav = ({ isAuthenticated }) => {
  const location = useLocation();
  
  if (!isAuthenticated) {
    return null; // Don't show bottom nav for non-authenticated users
  }

  return (
    <div className="bottom-nav">
      <Link to="/dashboard" className={`bottom-nav-item ${location.pathname === '/dashboard' ? 'active' : ''}`}>
        <div className="bottom-nav-icon">
          <i className="fas fa-home"></i>
        </div>
        <span className="bottom-nav-text">Home</span>
      </Link>
      
      <Link to="/history" className={`bottom-nav-item ${location.pathname === '/history' ? 'active' : ''}`}>
        <div className="bottom-nav-icon">
          <i className="fas fa-history"></i>
        </div>
        <span className="bottom-nav-text">History</span>
      </Link>
      
      <div className="bottom-nav-item bottom-nav-main">
        <Link to="/scan" className="bottom-nav-scan-button">
          <i className="fas fa-qrcode"></i>
        </Link>
        <span className="bottom-nav-text">Scan</span>
      </div>
      
      <Link to="/send" className={`bottom-nav-item ${location.pathname === '/send' ? 'active' : ''}`}>
        <div className="bottom-nav-icon">
          <i className="fas fa-paper-plane"></i>
        </div>
        <span className="bottom-nav-text">Send</span>
      </Link>
      
      <Link to="/profile" className={`bottom-nav-item ${location.pathname === '/profile' ? 'active' : ''}`}>
        <div className="bottom-nav-icon">
          <i className="fas fa-user"></i>
        </div>
        <span className="bottom-nav-text">Profile</span>
      </Link>
    </div>
  );
};

export default BottomNav; 