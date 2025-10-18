/**
 * Application entry point
 * Initializes and starts the application
 */

import { createApp } from './app.js';

// Initialize application when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.app = createApp();
  });
} else {
  window.app = createApp();
}

// Export for debugging in console
export { createApp };
