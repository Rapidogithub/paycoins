import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ isAuthenticated }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const userMenuRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setShowMobileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setShowMobileMenu(false);
  }, [location]);

  const handleLogout = async () => {
    try {
      // Remove token from localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Redirect to login page
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  };

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  // Home path is special case - don't show text label for cleaner interface
  const isHomePage = location.pathname === '/';

  const authLinks = (
    <>
      <li className="nav-item">
        <Link to="/" className={`nav-link ${isHomePage ? 'active' : ''}`}>
          <i className="fas fa-home"></i>
          {!isHomePage && <span className="nav-label">Home</span>}
        </Link>
      </li>
      <li className="nav-item nav-item-desktop">
        <Link to="/send" className={`nav-link icon-only ${location.pathname === '/send' ? 'active' : ''}`}>
          <i className="fas fa-paper-plane"></i>
        </Link>
      </li>
      <li className="nav-item nav-item-desktop">
        <Link to="/receive" className={`nav-link icon-only ${location.pathname === '/receive' ? 'active' : ''}`}>
          <i className="fas fa-qrcode"></i>
        </Link>
      </li>
      <li className="nav-item nav-item-desktop">
        <Link to="/history" className={`nav-link icon-only ${location.pathname === '/history' ? 'active' : ''}`}>
          <i className="fas fa-history"></i>
        </Link>
      </li>
    </>
  );

  const guestLinks = (
    <>
      <li className="nav-item">
        <Link to="/login" className={`nav-link ${location.pathname === '/login' ? 'active' : ''}`}>
          <i className="fas fa-sign-in-alt"></i> 
          <span className="nav-label">Login</span>
        </Link>
      </li>
      <li className="nav-item">
        <Link to="/register" className={`nav-link ${location.pathname === '/register' ? 'active' : ''}`}>
          <i className="fas fa-user-plus"></i> 
          <span className="nav-label">Register</span>
        </Link>
      </li>
    </>
  );

  // Get user initials for avatar
  const getUserInitials = () => {
    const user = JSON.parse(localStorage.getItem('user')) || {};
    if (user.name) {
      return user.name.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    return 'U';
  };

  // Get user name for display
  const getUserName = () => {
    const user = JSON.parse(localStorage.getItem('user')) || {};
    return user.name || 'User';
  };

  // Get user email for display
  const getUserEmail = () => {
    const user = JSON.parse(localStorage.getItem('user')) || {};
    return user.email || '';
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <i className="fas fa-money-bill-wave"></i>
          <span>PAY</span>
        </Link>

        {/* Desktop Navigation */}
        <ul className="navbar-nav">
          {isAuthenticated ? authLinks : guestLinks}
        </ul>

        {/* User Menu (if authenticated) */}
        {isAuthenticated && (
          <div className="user-menu" ref={userMenuRef}>
            <button className="user-menu-trigger" onClick={toggleUserMenu}>
              <div className="user-avatar">
                {getUserInitials()}
              </div>
              <div className="user-info">
                <div className="user-name">{getUserName()}</div>
                <div className="user-email">{getUserEmail()}</div>
              </div>
              <i className={`fas ${showUserMenu ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
            </button>

            <div className={`user-menu-dropdown ${showUserMenu ? 'show' : ''}`}>
              <div className="dropdown-header">
                <div className="dropdown-user-name">{getUserName()}</div>
                <div className="dropdown-user-email">{getUserEmail()}</div>
              </div>
              <ul className="dropdown-menu">
                <li className="dropdown-item">
                  <Link to="/profile" className="dropdown-link">
                    <i className="fas fa-user"></i> My Profile
                  </Link>
                </li>
                <li className="dropdown-item">
                  <Link to="/history" className="dropdown-link">
                    <i className="fas fa-history"></i> Transaction History
                  </Link>
                </li>
                <div className="dropdown-divider"></div>
                <li className="dropdown-item dropdown-item-danger">
                  <a href="#!" onClick={handleLogout} className="dropdown-link">
                    <i className="fas fa-sign-out-alt"></i> Logout
                  </a>
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Mobile Menu Toggle */}
        <button className="navbar-toggle" onClick={toggleMobileMenu}>
          <i className="fas fa-bars"></i>
        </button>

        {/* Mobile Menu */}
        <div className={`mobile-menu ${showMobileMenu ? 'show' : ''}`} ref={mobileMenuRef}>
          <div className="mobile-menu-header">
            <Link to="/" className="navbar-brand">
              <i className="fas fa-money-bill-wave"></i>
              <span>PAY</span>
            </Link>
            <button className="mobile-menu-close" onClick={toggleMobileMenu}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          <div className="mobile-menu-body">
            <ul className="mobile-menu-nav">
              {isAuthenticated ? (
                <>
                  <li className="mobile-menu-item">
                    <Link to="/" className={`mobile-menu-link ${location.pathname === '/' ? 'active' : ''}`}>
                      <i className="fas fa-home"></i> Home
                    </Link>
                  </li>
                  <li className="mobile-menu-item">
                    <Link to="/send" className={`mobile-menu-link ${location.pathname === '/send' ? 'active' : ''}`}>
                      <i className="fas fa-paper-plane"></i> Send
                    </Link>
                  </li>
                  <li className="mobile-menu-item">
                    <Link to="/receive" className={`mobile-menu-link ${location.pathname === '/receive' ? 'active' : ''}`}>
                      <i className="fas fa-qrcode"></i> Receive
                    </Link>
                  </li>
                  <li className="mobile-menu-item">
                    <Link to="/history" className={`mobile-menu-link ${location.pathname === '/history' ? 'active' : ''}`}>
                      <i className="fas fa-history"></i> Transactions
                    </Link>
                  </li>
                  <li className="mobile-menu-item">
                    <Link to="/profile" className={`mobile-menu-link ${location.pathname === '/profile' ? 'active' : ''}`}>
                      <i className="fas fa-user"></i> My Profile
                    </Link>
                  </li>
                </>
              ) : (
                <>
                  <li className="mobile-menu-item">
                    <Link to="/login" className={`mobile-menu-link ${location.pathname === '/login' ? 'active' : ''}`}>
                      <i className="fas fa-sign-in-alt"></i> Login
                    </Link>
                  </li>
                  <li className="mobile-menu-item">
                    <Link to="/register" className={`mobile-menu-link ${location.pathname === '/register' ? 'active' : ''}`}>
                      <i className="fas fa-user-plus"></i> Register
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
          {isAuthenticated && (
            <div className="mobile-menu-footer">
              <a href="#!" onClick={handleLogout} className="mobile-menu-link">
                <i className="fas fa-sign-out-alt"></i> Logout
              </a>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 