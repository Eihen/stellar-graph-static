/**
 * GroupManager - Manages all equation groups for the Groups tab
 *
 * Listens to: STATE_HYDRATED, GROUP_ADDED, GROUP_REMOVED, GROUP_UPDATED, CALCULATIONS_UPDATED
 * Calls: StateManager methods to add/remove/update groups
 */

import { Events } from '../events/event-types.js';
import { GroupCard } from './group-card.js';
import { GROUP_COLORS, MAX_GROUPS } from '../config/constants.js';

export class GroupManager {
  constructor(eventBus, stateManager, containerId, equations) {
    this.eventBus = eventBus;
    this.stateManager = stateManager;
    this.container = document.getElementById(containerId);
    this.equations = equations;
    this.groupCards = new Map();

    if (!this.container) {
      console.error(`GroupManager: Container #${containerId} not found`);
      return;
    }

    // Ensure 4 predefined groups exist
    this.ensurePredefinedGroups();

    // Listen to events
    this.eventBus.on(Events.STATE_HYDRATED, this.onStateHydrated.bind(this));
    this.eventBus.on(Events.GROUP_ADDED, this.render.bind(this));
    this.eventBus.on(Events.GROUP_REMOVED, this.render.bind(this));
    this.eventBus.on(Events.GROUP_UPDATED, this.render.bind(this));
    this.eventBus.on(Events.CALCULATIONS_UPDATED, this.updateCooldowns.bind(this));

    // Initial render
    this.render();
  }

  /**
   * Handle state hydration - ensure groups exist after loading
   */
  onStateHydrated() {
    this.ensurePredefinedGroups();
    this.render();
  }

  /**
   * Ensure 4 predefined groups exist in state
   */
  ensurePredefinedGroups() {
    const state = this.stateManager.getState();
    const groups = state.groups || [];

    // If we don't have 4 groups, create them
    if (groups.length < MAX_GROUPS) {
      for (let i = groups.length; i < MAX_GROUPS; i++) {
        const groupName = `Group ${i + 1}`;
        const color = GROUP_COLORS[i % GROUP_COLORS.length];

        const newGroup = {
          name: groupName,
          keys: new Set(),
          color
        };

        // Directly add to state without emitting event to avoid loops
        groups.push(newGroup);
      }
    }
  }

  /**
   * Update cooldown displays when calculations update
   * @param {Object} detail - { groupSeries }
   */
  updateCooldowns({ groupSeries }) {
    if (!groupSeries) return;

    const state = this.stateManager.getState();

    // Update each group with its cooldown data
    groupSeries.forEach(seriesData => {
      const group = state.groups.find(g => g.name === seriesData.key);
      if (group) {
        group.cooldown = seriesData.cooldown;
        group.modifiers = seriesData.modifiers;
      }
    });

    // Re-render to show updated cooldowns
    this.render();
  }

  /**
   * Render the group manager
   */
  render() {
    this.container.innerHTML = '';
    this.container.className = 'card';

    const state = this.stateManager.getState();
    const groups = state.groups || [];

    // Create container for group cards
    const cardsContainer = document.createElement('div');
    cardsContainer.className = 'group-cards-container';

    // Render group cards
    groups.forEach(group => {
      const card = new GroupCard(
        group,
        this.equations,
        (groupName, updates) => this.updateGroup(groupName, updates),
        (groupName) => this.removeGroup(groupName)
      );

      const cardElement = card.render();
      cardsContainer.appendChild(cardElement);
      this.groupCards.set(group.name, card);
    });

    this.container.appendChild(cardsContainer);
  }

  /**
   * Add a new group
   */
  addGroup() {
    const state = this.stateManager.getState();
    const groups = state.groups || [];

    if (groups.length >= MAX_GROUPS) {
      alert(`Maximum ${MAX_GROUPS} groups allowed`);
      return;
    }

    // Generate group name
    const groupNumber = groups.length + 1;
    const groupName = `Group ${groupNumber}`;

    // Assign color from palette
    const color = GROUP_COLORS[(groups.length) % GROUP_COLORS.length];

    // Create new group
    const newGroup = {
      name: groupName,
      keys: new Set(),
      color
    };

    this.stateManager.addGroup(newGroup);
  }

  /**
   * Remove a group
   * @param {string} groupName
   */
  removeGroup(groupName) {
    this.stateManager.removeGroup(groupName);
  }

  /**
   * Update a group
   * @param {string} groupName
   * @param {Object} updates
   */
  updateGroup(groupName, updates) {
    this.stateManager.updateGroup(groupName, updates);
  }
}
