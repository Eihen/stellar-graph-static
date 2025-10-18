/**
 * StorageManager - Handles state persistence to localStorage
 *
 * Responsibilities:
 * - Listen to state change events
 * - Serialize and save state to localStorage
 * - Load and deserialize state from localStorage
 */

import { Events } from '../events/event-types.js';

const STORAGE_KEY = 'stellar-plot-prefs';

export class StorageManager {
  constructor(eventBus, stateManager) {
    this.eventBus = eventBus;
    this.stateManager = stateManager;

    // Listen to all state change events
    this.setupListeners();
  }

  /**
   * Setup listeners for state changes
   */
  setupListeners() {
    // Listen to all events that change state
    this.eventBus.on(Events.EQUATION_TOGGLED, () => this.save());
    this.eventBus.on(Events.EQUATIONS_RESET, () => this.save());
    this.eventBus.on(Events.THEME_CHANGED, () => this.save());
    this.eventBus.on(Events.BREAKPOINTS_CHANGED, () => this.save());
    this.eventBus.on(Events.CAST_TIMES_CHANGED, () => this.save());
    this.eventBus.on(Events.TAB_CHANGED, () => this.save());
    this.eventBus.on(Events.GROUP_ADDED, () => this.save());
    this.eventBus.on(Events.GROUP_REMOVED, () => this.save());
    this.eventBus.on(Events.GROUP_UPDATED, () => this.save());
  }

  /**
   * Save current state to localStorage
   */
  save() {
    try {
      const state = this.stateManager.getState();
      const serialized = this.serializeState(state);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(serialized));
    } catch (error) {
      console.error('Failed to save state:', error);
    }
  }

  /**
   * Load state from localStorage
   * @returns {Object|null} Deserialized state or null if not found
   */
  load() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return null;

      const parsed = JSON.parse(stored);
      return this.deserializeState(parsed);
    } catch (error) {
      console.error('Failed to load state:', error);
      return null;
    }
  }

  /**
   * Clear stored state
   */
  clear() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear state:', error);
    }
  }

  /**
   * Serialize state for storage
   * @param {Object} state - Current state
   * @returns {Object} Serializable object
   */
  serializeState(state) {
    return {
      enabledKeys: Array.from(state.enabledKeys),
      selectedBreakpoints: Array.from(state.selectedBreakpoints),
      selectedCastTimes: Array.from(state.selectedCastTimes),
      theme: state.theme,
      activeTab: state.activeTab,
      groups: state.groups.map(g => ({
        name: g.name,
        keys: Array.from(g.keys),
        color: g.color
      }))
    };
  }

  /**
   * Deserialize stored state
   * @param {Object} stored - Stored object
   * @returns {Object} Partial state object
   */
  deserializeState(stored) {
    return {
      enabledKeys: new Set(stored.enabledKeys || []),
      selectedBreakpoints: new Set(stored.selectedBreakpoints || []),
      selectedCastTimes: new Set(stored.selectedCastTimes || []),
      theme: stored.theme || 'dark',
      activeTab: stored.activeTab || 'individual',
      groups: (stored.groups || []).map(g => ({
        name: g.name,
        keys: new Set(g.keys),
        color: g.color
      }))
    };
  }
}
