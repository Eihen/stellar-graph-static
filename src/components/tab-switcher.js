/**
 * TabSwitcher - Handles tab navigation between Individual and Groups views
 *
 * Listens to: STATE_HYDRATED, TAB_CHANGED (to update UI)
 * Calls: StateManager.changeTab() to switch tabs
 */

import { Events } from '../events/event-types.js';

export class TabSwitcher {
  constructor(eventBus, stateManager, containerId) {
    this.eventBus = eventBus;
    this.stateManager = stateManager;
    this.container = document.getElementById(containerId);

    if (!this.container) {
      console.error(`TabSwitcher: Container #${containerId} not found`);
      return;
    }

    // Listen to state hydration and tab changes to update UI
    this.eventBus.on(Events.STATE_HYDRATED, this.render.bind(this));
    this.eventBus.on(Events.TAB_CHANGED, this.onTabChanged.bind(this));

    // Initial render
    this.render();
  }

  /**
   * Handle tab change event
   */
  onTabChanged({ tab }) {
    this.updateTabVisibility(tab);
    this.updateButtonStates(tab);
  }

  /**
   * Render tab navigation buttons
   */
  render() {
    const state = this.stateManager.getState();
    const activeTab = state.activeTab || 'individual';

    this.container.innerHTML = '';
    this.container.className = 'tab-nav';

    // Create Individual tab button
    const individualBtn = this.createTabButton('Individual', 'individual', activeTab);
    this.container.appendChild(individualBtn);

    // Create Groups tab button
    const groupsBtn = this.createTabButton('Groups', 'groups', activeTab);
    this.container.appendChild(groupsBtn);

    // Set initial tab visibility
    this.updateTabVisibility(activeTab);
  }

  /**
   * Create a tab button element
   * @param {string} label - Button label
   * @param {string} tabId - Tab identifier
   * @param {string} activeTab - Currently active tab
   * @returns {HTMLElement}
   */
  createTabButton(label, tabId, activeTab) {
    const button = document.createElement('button');
    button.className = 'tab-button';
    button.textContent = label;
    button.dataset.tab = tabId;

    if (tabId === activeTab) {
      button.classList.add('active');
    }

    button.addEventListener('click', () => {
      this.stateManager.changeTab(tabId);
    });

    return button;
  }

  /**
   * Update tab content visibility
   * @param {string} activeTab - Active tab identifier
   */
  updateTabVisibility(activeTab) {
    // Update tab content visibility
    const individualTab = document.getElementById('tab-individual');
    const groupsTab = document.getElementById('tab-groups');

    if (individualTab) {
      individualTab.dataset.active = activeTab === 'individual';
    }

    if (groupsTab) {
      groupsTab.dataset.active = activeTab === 'groups';
    }
  }

  /**
   * Update button active states
   * @param {string} activeTab - Active tab identifier
   */
  updateButtonStates(activeTab) {
    const buttons = this.container.querySelectorAll('.tab-button');
    buttons.forEach(button => {
      if (button.dataset.tab === activeTab) {
        button.classList.add('active');
      } else {
        button.classList.remove('active');
      }
    });
  }
}
