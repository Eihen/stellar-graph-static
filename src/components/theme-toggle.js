/**
 * ThemeToggle - Manages theme toggle button
 *
 * Listens to: THEME_CHANGED (to update button state)
 * Emits: Calls StateManager to trigger THEME_CHANGED
 */

import { Events } from '../events/event-types.js';

export class ThemeToggle {
  constructor(eventBus, stateManager, buttonId) {
    this.eventBus = eventBus;
    this.stateManager = stateManager;
    this.button = document.getElementById(buttonId);

    if (!this.button) {
      console.error(`ThemeToggle: Button #${buttonId} not found`);
      return;
    }

    // Listen to theme changes to update button state
    this.eventBus.on(Events.THEME_CHANGED, this.updateButton.bind(this));

    // Setup click handler
    this.button.addEventListener('click', this.toggle.bind(this));

    // Initialize button state
    this.updateButton({ theme: this.stateManager.getState().theme });
  }

  /**
   * Toggle theme
   */
  toggle() {
    const state = this.stateManager.getState();
    const newTheme = state.theme === 'dark' ? 'light' : 'dark';

    // Call state manager to change theme
    this.stateManager.changeTheme(newTheme);
  }

  /**
   * Update button state
   * @param {Object} detail - { theme }
   */
  updateButton({ theme }) {
    // Update document theme
    document.documentElement.dataset.theme = theme;

    // Update button active state
    this.button.dataset.active = theme === 'dark' ? 'true' : 'false';
  }
}
