/**
 * Theme toggle component
 */

/**
 * Create theme toggle button
 * @param {string} buttonId - Button element ID
 * @param {string} initialTheme - Initial theme ('dark' or 'light')
 * @param {Function} onChange - Called when theme changes (receives new theme)
 * @returns {Object} API for controlling theme
 */
export function createThemeToggle(buttonId, initialTheme = 'dark', onChange) {
  const button = document.getElementById(buttonId);
  if (!button) {
    console.error(`Button #${buttonId} not found`);
    return null;
  }

  let currentTheme = initialTheme;

  const applyTheme = (theme) => {
    currentTheme = theme;
    document.documentElement.dataset.theme = theme;
    button.dataset.active = theme === 'dark' ? 'true' : 'false';
  };

  // Initialize
  applyTheme(currentTheme);

  // Handle clicks
  button.addEventListener('click', () => {
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
    onChange(newTheme);
  });

  return {
    getTheme() {
      return currentTheme;
    },
    setTheme(theme) {
      applyTheme(theme);
    }
  };
}
