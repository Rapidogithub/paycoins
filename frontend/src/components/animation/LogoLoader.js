import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSpring, animated, config } from 'react-spring';

const LogoLoader = ({ redirectPath = '/dashboard', offlineMode = false }) => {
  const navigate = useNavigate();

  // Logo animation sequence
  const logoScale = useSpring({
    from: { scale: 0.2, opacity: 0 },
    to: [
      { scale: 1.2, opacity: 1 },
      { scale: 1, opacity: 1 }
    ],
    config: config.gentle,
  });

  // Circle animation
  const circleAnimation = useSpring({
    from: { strokeDashoffset: 284, rotation: 0 },
    to: { strokeDashoffset: 0, rotation: 360 },
    config: { duration: 2000 },
  });

  // Redirect after animation completes
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate(redirectPath);
    }, 2500); // 2.5 seconds
    
    return () => clearTimeout(timer);
  }, [navigate, redirectPath]);

  return (
    <div className="loader-container">
      <animated.div 
        style={{ 
          transform: logoScale.scale.to(s => `scale(${s})`),
          opacity: logoScale.opacity 
        }}
        className="logo-container"
      >
        <div className="logo">
          <svg width="80" height="80" viewBox="0 0 100 100">
            <animated.circle 
              cx="50" 
              cy="50" 
              r="45" 
              fill="none" 
              stroke="#007bff" 
              strokeWidth="6"
              strokeDasharray="283"
              strokeDashoffset={circleAnimation.strokeDashoffset}
              style={{
                transform: circleAnimation.rotation.to(r => `rotate(${r}deg)`),
                transformOrigin: 'center'
              }}
            />
            <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize="28" fontWeight="bold" fill="#007bff">
              PAY
            </text>
          </svg>
        </div>
        <h2>Loading...</h2>
        {offlineMode && (
          <div className="offline-notice">
            <i className="fas fa-wifi-slash"></i> Offline Mode
            <p>Limited functionality available</p>
          </div>
        )}
      </animated.div>
    </div>
  );
};

export default LogoLoader; 