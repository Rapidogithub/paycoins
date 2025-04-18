import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { removeToken, clearAllData, getStoredTransactions } from '../../utils/localStorage';
import './Navbar.css';
import moment from 'moment';

const Navbar = ({ isAuthenticated }) => {
  const navigate = useNavigate();
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Check online status
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load notifications
  useEffect(() => {
    if (isAuthenticated) {
      // We'll simulate notifications based on recent transactions
      const transactions = getStoredTransactions();
      const newNotifications = transactions.slice(0, 5).map(tx => ({
        id: tx.id,
        type: tx.senderWalletAddress ? 'payment' : 'system',
        message: tx.senderWalletAddress ? 
          `${tx.receiverWalletAddress === tx.walletAddress ? 'Received' : 'Sent'} ${tx.amount} PAY` : 
          'Welcome to PAY App!',
        date: tx.date || new Date(),
        read: false
      }));
      
      setNotifications(newNotifications);
      setUnreadCount(newNotifications.filter(n => !n.read).length);
    }
  }, [isAuthenticated]);

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (showNotifications) {
      // Mark notifications as read when closing
      markAllAsRead();
    }
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const formatNotificationTime = (date) => {
    return moment(date).fromNow();
  };

  const logout = () => {
    // Clear localStorage and state
    removeToken();
    clearAllData();
    
    // Reload page to reset app state
    window.location.reload();
  };

  const authLinks = (
    <ul>
      <li className="nav-item-desktop">
        <Link to="/">Dashboard</Link>
      </li>
      <li className="nav-item-desktop">
        <Link to="/history">History</Link>
      </li>
      <li className="nav-item-desktop">
        <Link to="/profile">Profile</Link>
      </li>
      <li className="notification-wrapper">
        <button 
          className="notification-btn" 
          onClick={toggleNotifications}
          aria-label="Notifications"
        >
          <i className="fas fa-bell"></i>
          {unreadCount > 0 && (
            <span className="notification-badge">{unreadCount}</span>
          )}
        </button>
        
        {showNotifications && (
          <div className="notifications-dropdown">
            <div className="notifications-header">
              <h3>Notifications</h3>
              <button 
                className="mark-read-btn" 
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
              >
                Mark all as read
              </button>
            </div>
            
            <div className="notifications-list">
              {notifications.length > 0 ? (
                notifications.map(notification => (
                  <div 
                    key={notification.id}
                    className={`notification-item ${!notification.read ? 'unread' : ''}`}
                  >
                    <div className={`notification-icon ${notification.type}`}>
                      <i className={`fas fa-${notification.type === 'payment' ? 'money-bill-wave' : 'info-circle'}`}></i>
                    </div>
                    <div className="notification-content">
                      <div className="notification-message">{notification.message}</div>
                      <div className="notification-time">{formatNotificationTime(notification.date)}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-notifications">
                  <div className="empty-icon">
                    <i className="fas fa-bell-slash"></i>
                  </div>
                  <p>No notifications yet</p>
                </div>
              )}
            </div>
          </div>
        )}
      </li>
      <li>
        <a onClick={logout} href="#!">
          <i className="fas fa-sign-out-alt"></i>{' '}
          <span className="hide-sm">Logout</span>
        </a>
      </li>
      {isOffline && (
        <li className="offline-indicator">
          <i className="fas fa-wifi-slash"></i>
          <span className="hide-sm">Offline</span>
        </li>
      )}
    </ul>
  );

  const guestLinks = (
    <ul>
      <li>
        <Link to="/register">Register</Link>
      </li>
      <li>
        <Link to="/login">Login</Link>
      </li>
      {isOffline && (
        <li className="offline-indicator">
          <i className="fas fa-wifi-slash"></i>
          <span className="hide-sm">Offline</span>
        </li>
      )}
    </ul>
  );

  return (
    <nav className="navbar">
      <h1>
        <Link to="/">
          <i className="fas fa-money-bill-wave"></i> PAY
        </Link>
      </h1>
      {isAuthenticated ? authLinks : guestLinks}
    </nav>
  );
};

export default Navbar; 