import { useEffect, useState } from 'react';

/**
 * Custom hook for handling animations with different types, durations, and delays
 * @param {Object} options - Animation options
 * @param {string} options.type - Animation type (fadeIn, slideUp, slideDown, slideLeft, slideRight, scale, bounce)
 * @param {number} options.duration - Animation duration in ms
 * @param {number} options.delay - Animation delay in ms
 * @param {Function} options.onComplete - Callback function to be called when animation completes
 * @returns {Object} Animation state and controlling functions
 */
const useAnimation = ({
  type = 'fadeIn',
  duration = 300,
  delay = 0,
  onComplete = () => {},
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [styles, setStyles] = useState({});

  const getInitialStyles = () => {
    switch (type) {
      case 'fadeIn':
        return {
          opacity: 0,
          transition: `opacity ${duration}ms ease ${delay}ms`,
        };
      case 'slideUp':
        return {
          opacity: 0,
          transform: 'translateY(30px)',
          transition: `opacity ${duration}ms ease ${delay}ms, transform ${duration}ms ease ${delay}ms`,
        };
      case 'slideDown':
        return {
          opacity: 0,
          transform: 'translateY(-30px)',
          transition: `opacity ${duration}ms ease ${delay}ms, transform ${duration}ms ease ${delay}ms`,
        };
      case 'slideLeft':
        return {
          opacity: 0,
          transform: 'translateX(30px)',
          transition: `opacity ${duration}ms ease ${delay}ms, transform ${duration}ms ease ${delay}ms`,
        };
      case 'slideRight':
        return {
          opacity: 0,
          transform: 'translateX(-30px)',
          transition: `opacity ${duration}ms ease ${delay}ms, transform ${duration}ms ease ${delay}ms`,
        };
      case 'scale':
        return {
          opacity: 0,
          transform: 'scale(0.8)',
          transition: `opacity ${duration}ms ease ${delay}ms, transform ${duration}ms ease ${delay}ms`,
        };
      case 'bounce':
        return {
          opacity: 0,
          transform: 'scale(0.8)',
          transition: `opacity ${duration * 0.5}ms ease ${delay}ms, transform ${duration}ms cubic-bezier(0.175, 0.885, 0.32, 1.275) ${delay}ms`,
        };
      default:
        return {
          opacity: 0,
          transition: `opacity ${duration}ms ease ${delay}ms`,
        };
    }
  };

  const getAnimatedStyles = () => {
    switch (type) {
      case 'fadeIn':
        return {
          opacity: 1,
          transition: `opacity ${duration}ms ease ${delay}ms`,
        };
      case 'slideUp':
      case 'slideDown':
      case 'slideLeft':
      case 'slideRight':
        return {
          opacity: 1,
          transform: 'translate(0, 0)',
          transition: `opacity ${duration}ms ease ${delay}ms, transform ${duration}ms ease ${delay}ms`,
        };
      case 'scale':
        return {
          opacity: 1,
          transform: 'scale(1)',
          transition: `opacity ${duration}ms ease ${delay}ms, transform ${duration}ms ease ${delay}ms`,
        };
      case 'bounce':
        return {
          opacity: 1,
          transform: 'scale(1)',
          transition: `opacity ${duration * 0.5}ms ease ${delay}ms, transform ${duration}ms cubic-bezier(0.175, 0.885, 0.32, 1.275) ${delay}ms`,
        };
      default:
        return {
          opacity: 1,
          transition: `opacity ${duration}ms ease ${delay}ms`,
        };
    }
  };

  useEffect(() => {
    // Apply initial styles
    setStyles(getInitialStyles());
  }, [type, duration, delay]);

  const startAnimation = () => {
    if (isAnimating || isComplete) return;
    
    setIsAnimating(true);
    
    // Apply animated styles
    setStyles(getAnimatedStyles());
    
    // Set a timeout to mark animation as complete
    const timeoutId = setTimeout(() => {
      setIsAnimating(false);
      setIsComplete(true);
      onComplete();
    }, duration + delay);
    
    // Clean up timeout on unmount
    return () => clearTimeout(timeoutId);
  };

  const resetAnimation = () => {
    setIsAnimating(false);
    setIsComplete(false);
    setStyles(getInitialStyles());
  };

  // Auto-start animation on mount
  useEffect(() => {
    startAnimation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    styles,
    isAnimating,
    isComplete,
    startAnimation,
    resetAnimation,
  };
};

export default useAnimation; 