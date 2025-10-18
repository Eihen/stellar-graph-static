/**
 * StateManager - Manages application state and emits specific events
 *
 * Responsibilities:
 * - Hold current state
 * - Provide methods to update state
 * - Emit specific events when state changes
 * - Does NOT handle side effects (rendering, storage, calculations)
 */

import { Events } from '../events/event-types.js';

export class StateManager {
  constructor(eventBus, initialState) {
    this.eventBus = eventBus;
    this.state = initialState;
  }

  /**
   * Get current state (read-only)
   */
  getState() {
    return this.state;
  }

  /**
   * Toggle an equation on/off
   * @param {string} key - Equation key
   */
  toggleEquation(key) {
    const wasEnabled = this.state.enabledKeys.has(key);

    if (wasEnabled) {
      this.state.enabledKeys.delete(key);
    } else {
      this.state.enabledKeys.add(key);
    }

    // Emit specific event
    this.eventBus.emit(Events.EQUATION_TOGGLED, {
      key,
      enabled: !wasEnabled,
      enabledKeys: new Set(this.state.enabledKeys) // Copy for immutability
    });
  }

  /**
   * Reset all equations to enabled
   * @param {Array<string>} allKeys - All equation keys
   */
  resetEquations(allKeys) {
    this.state.enabledKeys = new Set(allKeys);

    this.eventBus.emit(Events.EQUATIONS_RESET, {
      enabledKeys: new Set(this.state.enabledKeys)
    });
  }

  /**
   * Change theme
   * @param {string} theme - 'dark' or 'light'
   */
  changeTheme(theme) {
    this.state.theme = theme;

    this.eventBus.emit(Events.THEME_CHANGED, {
      theme
    });
  }

  /**
   * Change active tab
   * @param {string} tab - 'individual' or 'groups'
   */
  changeTab(tab) {
    if (tab !== 'individual' && tab !== 'groups') {
      console.error(`Invalid tab: ${tab}`);
      return;
    }

    this.state.activeTab = tab;

    this.eventBus.emit(Events.TAB_CHANGED, {
      tab
    });
  }

  /**
   * Update selected breakpoints
   * @param {Array<number>} breakpoints - Selected breakpoint values
   */
  updateBreakpoints(breakpoints) {
    this.state.selectedBreakpoints = new Set(breakpoints);

    this.eventBus.emit(Events.BREAKPOINTS_CHANGED, {
      breakpoints: Array.from(this.state.selectedBreakpoints)
    });
  }

  /**
   * Update selected cast times
   * @param {Array<number>} castTimes - Selected cast time values
   */
  updateCastTimes(castTimes) {
    this.state.selectedCastTimes = new Set(castTimes);

    this.eventBus.emit(Events.CAST_TIMES_CHANGED, {
      castTimes: Array.from(this.state.selectedCastTimes)
    });
  }

  /**
   * Add an equation group
   * @param {Object} group - { name, keys: Set<string>, color }
   */
  addGroup(group) {
    this.state.groups.push(group);

    this.eventBus.emit(Events.GROUP_ADDED, {
      group,
      groups: [...this.state.groups],
      enabledKeys: new Set(this.state.enabledKeys) // For recalculation
    });
  }

  /**
   * Remove an equation group
   * @param {string} groupName - Name of group to remove
   */
  removeGroup(groupName) {
    const index = this.state.groups.findIndex(g => g.name === groupName);
    if (index === -1) return;

    const removedGroup = this.state.groups[index];
    this.state.groups.splice(index, 1);

    this.eventBus.emit(Events.GROUP_REMOVED, {
      groupName,
      removedGroup,
      groups: [...this.state.groups],
      enabledKeys: new Set(this.state.enabledKeys) // For recalculation
    });
  }

  /**
   * Update an equation group
   * @param {string} groupName - Name of group to update
   * @param {Object} updates - Properties to update
   */
  updateGroup(groupName, updates) {
    const group = this.state.groups.find(g => g.name === groupName);
    if (!group) return;

    Object.assign(group, updates);

    this.eventBus.emit(Events.GROUP_UPDATED, {
      groupName,
      group,
      groups: [...this.state.groups],
      enabledKeys: new Set(this.state.enabledKeys) // For recalculation
    });
  }

  /**
   * Bulk update state (used for loading from storage)
   * Emits STATE_HYDRATED event to notify all components
   * @param {Object} updates - State updates
   */
  loadState(updates) {
    Object.assign(this.state, updates);

    // Emit STATE_HYDRATED with full state so components can initialize
    this.eventBus.emit(Events.STATE_HYDRATED, {
      enabledKeys: new Set(this.state.enabledKeys),
      theme: this.state.theme,
      selectedBreakpoints: Array.from(this.state.selectedBreakpoints),
      selectedCastTimes: Array.from(this.state.selectedCastTimes),
      groups: [...this.state.groups],
      activeTab: this.state.activeTab
    });
  }
}
