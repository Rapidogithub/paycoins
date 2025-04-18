import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './BottomNav.css';

const BottomNav = ({ isAuthenticated }) => {
  const location = useLocation();
  
  if (!isAuthenticated) {
    return null; // Don't show bottom nav for unauthenticated users
  }

  // Check if the current path is a main navigation path or a sub-path
  const isHomePath = location.pathname === '/';
  const isHistoryPath = location.pathname === '/history';
  const isProfilePath = location.pathname === '/profile';
  
  // For sub-paths, highlight the parent section
  const isSendPath = location.pathname === '/send';
  const isReceivePath = location.pathname === '/receive';
  
  // Determine active classes
  const homeActive = isHomePath || isSendPath || isReceivePath ? 'active' : '';
  const historyActive = isHistoryPath ? 'active' : '';
  const profileActive = isProfilePath ? 'active' : '';

  return (
    <nav className="bottom-nav">
      <Link 
        to="/" 
        className={`bottom-nav-item ${homeActive}`}
      >
        <i className="fas fa-home"></i>
        <span>Home</span>
      </Link>
      
      <Link 
        to="/history" 
        className={`bottom-nav-item ${historyActive}`}
      >
        <i className="fas fa-history"></i>
        <span>History</span>
      </Link>
      
      <Link 
        to="/profile" 
        className={`bottom-nav-item ${profileActive}`}
      >
        <i className="fas fa-user"></i>
        <span>Profile</span>
      </Link>
    </nav>
  );
};

export default BottomNav; 