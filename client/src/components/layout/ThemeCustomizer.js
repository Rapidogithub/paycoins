import React from 'react';
import PropTypes from 'prop-types';

const ThemeCustomizer = ({ 
  darkMode, 
  themeColor, 
  toggleDarkMode, 
  changeThemeColor, 
  closeCustomizer 
}) => {
  // Available theme colors
  const themeColors = [
    { name: 'green', label: 'Green' },
    { name: 'blue', label: 'Blue' },
    { name: 'purple', label: 'Purple' },
    { name: 'orange', label: 'Orange' },
    { name: 'red', label: 'Red' }
  ];

  return (
    <div className="theme-customizer mobile-bottom-spacing">
      <div className="theme-customizer-header">
        <h3>Theme Settings</h3>
        <button className="close-btn" onClick={closeCustomizer}>
          <i className="fas fa-times"></i>
        </button>
      </div>
      
      <div className="theme-customizer-section">
        <h4>Mode</h4>
        <div className="theme-mode-toggle">
          <button 
            className={`mode-btn ${!darkMode ? 'active' : ''}`}
            onClick={() => darkMode && toggleDarkMode()}
          >
            <i className="fas fa-sun"></i> Light
          </button>
          <button 
            className={`mode-btn ${darkMode ? 'active' : ''}`}
            onClick={() => !darkMode && toggleDarkMode()}
          >
            <i className="fas fa-moon"></i> Dark
          </button>
        </div>
      </div>
      
      <div className="theme-customizer-section">
        <h4>Theme Color</h4>
        <div className="theme-color-options">
          {themeColors.map(color => (
            <button
              key={color.name}
              className={`color-option ${color.name} ${themeColor === color.name ? 'active' : ''}`}
              onClick={() => changeThemeColor(color.name)}
              aria-label={`Switch to ${color.label} theme`}
            >
              {themeColor === color.name && <i className="fas fa-check"></i>}
            </button>
          ))}
        </div>
      </div>
      
      <div className="theme-customizer-footer">
        <p>Your theme preferences are automatically saved.</p>
      </div>
    </div>
  );
};

ThemeCustomizer.propTypes = {
  darkMode: PropTypes.bool.isRequired,
  themeColor: PropTypes.string.isRequired,
  toggleDarkMode: PropTypes.func.isRequired,
  changeThemeColor: PropTypes.func.isRequired,
  closeCustomizer: PropTypes.func.isRequired
};

export default ThemeCustomizer; 