/**
 * PersistButton - Saves URL state to default localStorage preferences
 *
 * Listens to: STATE_HYDRATED (for initial visibility)
 * Updates: Button visibility and feedback
 */

import { Events } from '../events/event-types.js';

export class PersistButton {
  constructor(eventBus, storageManager, containerId, shareButtonId) {
    this.eventBus = eventBus;
    this.storageManager = storageManager;
    this.containerId = containerId;
    this.shareButtonId = shareButtonId;

    this.setupListeners();
    this.render();
  }

  /**
   * Setup event listeners
   */
  setupListeners() {
    this.eventBus.on(Events.STATE_HYDRATED, this.render.bind(this));
    this.eventBus.on(Events.GROUP_UPDATED, this.render.bind(this));
    this.eventBus.on(Events.CALCULATIONS_UPDATED, this.render.bind(this));
  }

  /**
   * Handle persist button click
   */
  handleClick() {
    const success = this.storageManager.persistUrlState();
    if (success) {
      this.hide();
      this.showShareFeedback('Saved!');
    }
  }

  /**
   * Show temporary feedback on share button
   * @param {string} message - Feedback message
   */
  showShareFeedback(message) {
    const shareButton = document.getElementById(this.shareButtonId);
    if (!shareButton) return;

    const originalText = shareButton.textContent;
    shareButton.textContent = message;
    setTimeout(() => {
      shareButton.textContent = originalText;
    }, 2000);
  }

  /**
   * Hide the persist button
   */
  hide() {
    const button = document.getElementById(this.containerId);
    if (button) {
      button.style.display = 'none';
    }
  }

  /**
   * Show the persist button
   */
  show() {
    const button = document.getElementById(this.containerId);
    if (button) {
      button.style.display = 'block';
    }
  }

  /**
   * Update visibility based on whether state is from URL
   */
  updateVisibility() {
    if (this.storageManager.getIsFromUrl()) {
      this.show();
    } else {
      this.hide();
    }
  }

  /**
   * Render the persist button
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

    // Set initial visibility
    this.updateVisibility();
  }
}
