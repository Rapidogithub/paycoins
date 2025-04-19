import React from 'react';
import useAnimation from '../hooks/useAnimation';
import './AnimatedCard.css';
import PropTypes from 'prop-types';

/**
 * AnimatedCard Component
 * 
 * A reusable card component with built-in animations and elevation shadows
 * 
 * @param {Object} props - Component props
 * @param {ReactNode} props.children - Card content
 * @param {string} props.className - Additional CSS classes
 * @param {number} props.elevation - Card elevation (1-5) determines shadow depth
 * @param {string} props.animationType - Animation type from useAnimation hook
 * @param {number} props.animationDuration - Animation duration in ms
 * @param {number} props.animationDelay - Animation delay in ms
 * @param {Function} props.onClick - Click handler function
 * @param {string} props.theme - Card theme ('light' or 'dark')
 * @param {Object} props.style - Additional inline styles
 */
const AnimatedCard = ({
  children,
  className = '',
  elevation = 1,
  animationType = 'fadeIn',
  animationDuration = 300,
  animationDelay = 0,
  onClick,
  theme = 'light',
  style = {},
}) => {
  // Validate elevation range
  const validElevation = Math.min(Math.max(elevation, 1), 5);
  
  // Initialize animation hook
  const { styles: animationStyles, isComplete } = useAnimation({
    type: animationType,
    duration: animationDuration,
    delay: animationDelay,
  });
  
  // Combine all classes
  const cardClasses = [
    'animated-card',
    `elevation-${validElevation}`,
    `theme-${theme}`,
    isComplete ? 'animation-complete' : '',
    className,
  ].filter(Boolean).join(' ');
  
  return (
    <div 
      className={cardClasses}
      onClick={onClick}
      style={{
        ...animationStyles,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

AnimatedCard.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  elevation: PropTypes.oneOf([1, 2, 3, 4, 5]),
  animationType: PropTypes.oneOf([
    'fadeIn', 
    'slideUp', 
    'slideDown', 
    'slideLeft', 
    'slideRight',
    'zoomIn',
    'zoomOut'
  ]),
  animationDuration: PropTypes.number,
  animationDelay: PropTypes.number,
  onClick: PropTypes.func,
  theme: PropTypes.oneOf(['light', 'dark']),
  style: PropTypes.object,
};

export default AnimatedCard; 