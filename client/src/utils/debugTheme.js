/**
 * Debug utility to check if CSS variables are properly applied
 * This can be useful to diagnose theming issues
 */

const debugTheme = () => {
  // Get the computed style of the root element
  const rootStyles = getComputedStyle(document.documentElement);
  
  // Get all the CSS variables we're interested in
  const themeVariables = {
    // Theme colors
    'theme-color': rootStyles.getPropertyValue('--theme-color'),
    'theme-color-light': rootStyles.getPropertyValue('--theme-color-light'),
    'theme-color-hover': rootStyles.getPropertyValue('--theme-color-hover'),
    
    // Background colors
    'background-color': rootStyles.getPropertyValue('--background-color'),
    'surface-color': rootStyles.getPropertyValue('--surface-color'),
    
    // Text colors
    'text-color': rootStyles.getPropertyValue('--text-color'),
    'text-secondary': rootStyles.getPropertyValue('--text-secondary'),
    
    // Check if dark mode class is applied
    'dark-mode': document.body.classList.contains('dark-mode') ? 'Applied' : 'Not applied'
  };
  
  // Log them to the console
  console.log('=== THEME DEBUG INFO ===');
  console.table(themeVariables);
  console.log('======================');
  
  return themeVariables;
};

export default debugTheme; 