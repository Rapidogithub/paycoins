import React, { useState, useEffect } from 'react';
import { getStoredUser } from '../utils/localStorage';
import '../styles/Profile.css';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch user data from localStorage or API
    const fetchUserData = async () => {
      try {
        const userData = getStoredUser();
        setUser(userData);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-error">
        <i className="fas fa-exclamation-circle"></i>
        <p>Unable to load profile information</p>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar">
          <i className="fas fa-user-circle"></i>
        </div>
        <h1>{user.name}</h1>
        <p className="profile-email">{user.email}</p>
      </div>

      <div className="profile-section">
        <h2>Account Information</h2>
        <div className="profile-info-item">
          <span className="info-label">Wallet Address</span>
          <span className="info-value">{user.walletAddress}</span>
        </div>
        <div className="profile-info-item">
          <span className="info-label">Joined</span>
          <span className="info-value">{new Date(user.date).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="profile-section">
        <h2>Security</h2>
        <button className="profile-button">
          <i className="fas fa-lock"></i> Change Password
        </button>
      </div>

      <div className="profile-section">
        <h2>Preferences</h2>
        <div className="preference-item">
          <label htmlFor="notifications">Enable Notifications</label>
          <div className="toggle-switch">
            <input type="checkbox" id="notifications" defaultChecked />
            <span className="toggle-slider"></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 