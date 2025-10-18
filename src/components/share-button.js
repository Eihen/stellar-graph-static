/**
 * ShareButton - Generates and copies shareable URL for group state
 *
 * Listens to: STATE_HYDRATED (for initial render)
 * Updates: Button text feedback on copy
 */

import { Events } from '../events/event-types.js';

export class ShareButton {
  constructor(eventBus, storageManager, containerId, urlDisplayId = 'shareUrlDisplay') {
    this.eventBus = eventBus;
    this.storageManager = storageManager;
    this.containerId = containerId;
    this.urlDisplayId = urlDisplayId;

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
   * Handle share button click
   */
  handleClick() {
    const shareUrl = this.storageManager.generateShareUrl();

    // Try to use clipboard API if available
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(shareUrl).then(() => {
        this.showFeedback('Copied!');
        this.hideUrlDisplay();
      }).catch(err => {
        console.error('Failed to copy URL:', err);
        this.showUrlOnPage(shareUrl);
      });
    } else {
      // Fallback: show URL on page
      this.showUrlOnPage(shareUrl);
    }
  }

  /**
   * Show temporary feedback on button
   * @param {string} message - Feedback message
   */
  showFeedback(message) {
    const button = document.getElementById(this.containerId);
    if (!button) return;

    const originalText = button.textContent;
    button.textContent = message;
    setTimeout(() => {
      button.textContent = originalText;
    }, 2000);
  }

  /**
   * Show URL on the page as selectable text
   * @param {string} url - The URL to display
   */
  showUrlOnPage(url) {
    const displayContainer = document.getElementById(this.urlDisplayId);
    if (!displayContainer) return;

    displayContainer.innerHTML = `
      <div class="card" style="padding: 12px; position: relative;">
        <button
          id="closeUrlDisplay"
          style="position: absolute; top: 8px; right: 8px; background: none; border: none; color: var(--text-primary); opacity: 0.6; cursor: pointer; font-size: 20px; padding: 4px 8px; line-height: 1;"
          title="Close"
        >&times;</button>
        <div style="margin-bottom: 8px; font-weight: 600; opacity: 0.9; padding-right: 24px;">Share URL:</div>
        <input
          type="text"
          readonly
          value="${url}"
          style="width: 100%; padding: 8px; font-family: monospace; font-size: 0.9em; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 4px; color: var(--text-primary); box-sizing: border-box;"
          onclick="this.select()"
        />
        <div style="margin-top: 8px; font-size: 0.85em; opacity: 0.7;">Click the text field to select the URL, then copy it manually.</div>
      </div>
    `;
    displayContainer.style.display = 'block';

    // Attach close button event listener
    const closeButton = document.getElementById('closeUrlDisplay');
    if (closeButton) {
      closeButton.addEventListener('click', () => this.hideUrlDisplay());
      closeButton.addEventListener('mouseenter', (e) => {
        e.target.style.opacity = '1';
      });
      closeButton.addEventListener('mouseleave', (e) => {
        e.target.style.opacity = '0.6';
      });
    }
  }

  /**
   * Hide the URL display
   */
  hideUrlDisplay() {
    const displayContainer = document.getElementById(this.urlDisplayId);
    if (displayContainer) {
      displayContainer.style.display = 'none';
      displayContainer.innerHTML = '';
    }
  }

  /**
   * Render the share button
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
