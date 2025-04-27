import React, { useState, useEffect } from 'react';
import '../styles/ThemeCustomizer.css';

const ThemeCustomizer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('theme-green');
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Available themes
  const themes = [
    { id: 'theme-green', name: 'Green', color: '#10b981' },
    { id: 'theme-blue', name: 'Blue', color: '#3b82f6' },
    { id: 'theme-purple', name: 'Purple', color: '#8b5cf6' },
    { id: 'theme-orange', name: 'Orange', color: '#f97316' },
    { id: 'theme-red', name: 'Red', color: '#ef4444' }
  ];

  // Load saved theme on initial render
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'theme-green';
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    
    setCurrentTheme(savedTheme);
    setIsDarkMode(savedDarkMode);
    
    applyTheme(savedTheme, savedDarkMode);
  }, []);

  // Apply theme by adding/removing classes from root element
  const applyTheme = (theme, darkMode) => {
    const rootElement = document.documentElement;
    
    // Remove all theme classes
    themes.forEach(t => {
      rootElement.classList.remove(t.id);
    });
    
    // Add selected theme class
    rootElement.classList.add(theme);
    
    // Toggle dark mode
    if (darkMode) {
      rootElement.classList.add('dark-mode');
    } else {
      rootElement.classList.remove('dark-mode');
    }
  };

  // Handle theme change
  const handleThemeChange = (themeId) => {
    setCurrentTheme(themeId);
    localStorage.setItem('theme', themeId);
    applyTheme(themeId, isDarkMode);
  };

  // Handle dark mode toggle
  const handleDarkModeToggle = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    applyTheme(currentTheme, newDarkMode);
  };

  // Toggle customizer panel
  const toggleCustomizer = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`theme-customizer ${isOpen ? 'open' : ''}`}>
      <div className="theme-customizer-toggle" onClick={toggleCustomizer}>
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        </svg>
      </div>
      
      <div className="theme-customizer-content">
        <div className="theme-customizer-header">
          <h3>Theme Customizer</h3>
          <button className="close-btn" onClick={toggleCustomizer}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <div className="theme-customizer-section">
          <h4>Mode</h4>
          <div className="theme-mode-toggle">
            <button 
              className={!isDarkMode ? 'active' : ''} 
              onClick={() => isDarkMode ? handleDarkModeToggle() : null}
            >
              Light
            </button>
            <button 
              className={isDarkMode ? 'active' : ''} 
              onClick={() => !isDarkMode ? handleDarkModeToggle() : null}
            >
              Dark
            </button>
          </div>
        </div>
        
        <div className="theme-customizer-section">
          <h4>Colors</h4>
          <div className="theme-color-options">
            {themes.map((theme) => (
              <div 
                key={theme.id}
                className={`color-option ${theme.id} ${currentTheme === theme.id ? 'active' : ''}`}
                style={{ backgroundColor: theme.color }}
                onClick={() => handleThemeChange(theme.id)}
              />
            ))}
          </div>
        </div>
        
        <div className="theme-customizer-footer">
          <button className="reset-btn" onClick={() => {
            handleThemeChange('theme-green');
            setIsDarkMode(false);
            localStorage.setItem('darkMode', 'false');
            applyTheme('theme-green', false);
          }}>
            Reset to Default
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThemeCustomizer; 