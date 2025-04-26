import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSpring, animated, config, useTrail } from 'react-spring';
import { getStoredToken } from '../utils/localStorage';
import './Welcome.css'; // Import the CSS file

const Welcome = () => {
  const navigate = useNavigate();
  const [showButton, setShowButton] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [redirectPath, setRedirectPath] = useState('/login');

  // Check if user is authenticated on mount
  useEffect(() => {
    // Check user authentication status
    const token = getStoredToken();
    if (token) {
      setIsAuthenticated(true);
      setRedirectPath('/dashboard');
    }

    // Check if there's a stored redirect path from a direct URL access
    const storedRedirect = sessionStorage.getItem('redirect_after_welcome');
    if (storedRedirect && token) {
      setRedirectPath(storedRedirect);
      // Clear the stored redirect path
      sessionStorage.removeItem('redirect_after_welcome');
    }

    // Show button after a brief delay for better UX
    const buttonTimer = setTimeout(() => {
      setShowButton(true);
    }, 1800);

    return () => clearTimeout(buttonTimer);
  }, []);

  // Main logo animation
  const logoAnimation = useSpring({
    from: { opacity: 0, transform: 'scale(0.5) translateY(50px)' },
    to: { opacity: 1, transform: 'scale(1) translateY(0)' },
    config: { mass: 2, tension: 180, friction: 22 },
    delay: 300
  });

  // Circle pulse animation
  const circleAnimation = useSpring({
    from: { transform: 'scale(0)', opacity: 0 },
    to: { transform: 'scale(1)', opacity: 1 },
    config: { mass: 1, tension: 200, friction: 20 },
    delay: 600
  });
  
  // Logo text animation
  const textItems = ['PAY', 'Your Digital Wallet'];
  const trail = useTrail(textItems.length, {
    config: config.gentle,
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    delay: 800
  });
  
  // Button fade-in animation
  const buttonAnimation = useSpring({
    opacity: showButton ? 1 : 0,
    transform: showButton ? 'translateY(0)' : 'translateY(20px)',
    config: { tension: 300, friction: 20 }
  });

  // Floating animation for the logo
  const float = useSpring({
    from: { transform: 'translateY(0px)' },
    to: async (next) => {
      while(true) {
        await next({ transform: 'translateY(-10px)' });
        await next({ transform: 'translateY(0px)' });
      }
    },
    config: { duration: 2000 },
    delay: 1500
  });

  // Automatic redirect after a set time
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate(redirectPath);
    }, 6000); // 6 seconds to give enough time to see the animations

    return () => clearTimeout(timer);
  }, [navigate, redirectPath]);

  // Handle manual navigation
  const handleGetStarted = () => {
    navigate(redirectPath);
  };

  return (
    <div className="welcome-container">
      <div className="logo-container">
        <animated.div style={{ ...logoAnimation, ...float }}>
          <animated.div style={circleAnimation} className="logo-circle">
            <i className="fas fa-wallet"></i>
          </animated.div>
          
          {trail.map((props, index) => (
            <animated.div key={index} style={props} className={index === 0 ? "logo-text" : "logo-tagline"}>
              {textItems[index]}
            </animated.div>
          ))}
        </animated.div>
        
        <animated.button 
          style={buttonAnimation}
          className="btn btn-primary get-started"
          onClick={handleGetStarted}
        >
          {isAuthenticated ? 'Go to Dashboard' : 'Get Started'} <i className="fas fa-arrow-right"></i>
        </animated.button>
      </div>
    </div>
  );
};

export default Welcome; 