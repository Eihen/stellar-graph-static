/**
 * ResetButton - Resets application state to defaults
 *
 * Listens to: STATE_HYDRATED (for initial render)
 * Updates: Resets equations, breakpoints, and theme
 */

import { Events } from '../events/event-types.js';

export class ResetButton {
  constructor(eventBus, stateManager, containerId, config) {
    this.eventBus = eventBus;
    this.stateManager = stateManager;
    this.containerId = containerId;
    this.config = config;

    this.setupListeners();
    this.render();
  }

  /**
   * Setup event listeners
   */
  setupListeners() {
    this.eventBus.on(Events.STATE_HYDRATED, this.render.bind(this));
  }

  /**
   * Handle reset button click
   */
  handleClick() {
    // Reset state
    this.stateManager.resetEquations(this.config.equationKeys);

    // Reset breakpoints (will emit event)
    this.stateManager.updateBreakpoints(this.config.breakpoints);

    // Reset theme
    if (this.stateManager.getState().theme !== 'dark') {
      this.stateManager.changeTheme('dark');
    }
  }

  /**
   * Render the reset button
   */
  render() {
    const container = document.getElementById(this.containerId);
    if (!container) {
      console.error(`Container #${this.containerId} not found`);
      return;
    }

    // Button already exists in HTML, just attach event listener
    container.removeEventListener('click', this.handleClick.bind(this));
    container.addEventListener('click', this.handleClick.bind(this));
  }
}
