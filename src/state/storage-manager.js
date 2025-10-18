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
const STORAGE_KEY_FROM_URL = 'stellar-plot-prefs-from-url';

export class StorageManager {
  constructor(eventBus, stateManager, equations = []) {
    this.eventBus = eventBus;
    this.stateManager = stateManager;
    this.equations = equations;
    this.isFromUrl = false; // Track if state was loaded from URL

    // Create key<->id mappings for URL compression
    this.keyToId = new Map(equations.map(eq => [eq.key, eq.id]));
    this.idToKey = new Map(equations.map(eq => [eq.id, eq.key]));

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
      const key = this.isFromUrl ? STORAGE_KEY_FROM_URL : STORAGE_KEY;
      localStorage.setItem(key, JSON.stringify(serialized));
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
      theme: stored.theme || 'dark',
      activeTab: stored.activeTab || 'individual',
      groups: (stored.groups || []).map(g => ({
        name: g.name,
        keys: new Set(g.keys),
        color: g.color
      }))
    };
  }

  /**
   * Serialize groups state for URL (only groups-relevant data)
   * Compact format to minimize URL length:
   * - Short property names (g, n, k, c)
   * - Use equation IDs instead of keys
   * - Omit empty/default values
   * @returns {Object} Serializable object for URL
   */
  serializeGroupsForUrl() {
    const state = this.stateManager.getState();

    const compact = {
      g: state.groups.map((group, index) => {
        const obj = {};

        // Only include name if not default pattern "Group N"
        const defaultName = `Group ${index + 1}`;
        if (group.name !== defaultName) {
          obj.n = group.name;
        }

        // Convert keys to IDs and include if not empty
        const keys = Array.from(group.keys);
        if (keys.length > 0) {
          obj.k = keys.map(key => this.keyToId.get(key)).filter(id => id !== undefined);
        }

        // Only include color if not using default from palette
        // Default colors are based on index in GROUP_COLORS array
        if (group.color) {
          obj.c = group.color;
        }

        return obj;
      }).filter(g => Object.keys(g).length > 0) // Remove completely empty groups
    };

    return compact;
  }

  /**
   * Generate shareable URL with current groups state
   * Uses LZ-String compression for optimal URL length
   * @returns {string} Shareable URL
   */
  generateShareUrl() {
    try {
      const groupsState = this.serializeGroupsForUrl();
      const jsonString = JSON.stringify(groupsState);
      const encoded = window.LZString.compressToEncodedURIComponent(jsonString);

      const url = new URL(window.location.href);
      url.searchParams.set('state', encoded);
      return url.toString();
    } catch (error) {
      console.error('Failed to generate share URL:', error);
      return window.location.href;
    }
  }

  /**
   * Load state from URL query string if present
   * Uses LZ-String decompression
   * @returns {Object|null} Decoded state or null
   */
  loadFromUrl() {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const encoded = urlParams.get('state');
      if (!encoded) return null;

      // Decompress using LZ-String
      const jsonString = window.LZString.decompressFromEncodedURIComponent(encoded);
      if (!jsonString) {
        throw new Error('Failed to decompress state from URL');
      }

      const decoded = JSON.parse(jsonString);
      this.isFromUrl = true;

      // Save to temp storage key
      localStorage.setItem(STORAGE_KEY_FROM_URL, JSON.stringify(decoded));

      // Decode compact format: { g: [{n, k, c}] }
      const groups = (decoded.g || []).map((g, index) => {
        // Convert IDs to keys
        const keys = (g.k || []).map(id => this.idToKey.get(id)).filter(key => key !== undefined);

        return {
          name: g.n || `Group ${index + 1}`,
          keys: new Set(keys),
          color: g.c
        };
      });

      // Return partial state (only groups-related)
      return {
        groups,
        activeTab: 'groups' // Always open groups tab when loading from URL
      };
    } catch (error) {
      console.error('Failed to load state from URL:', error);
      return null;
    }
  }

  /**
   * Persist URL state to default storage key
   */
  persistUrlState() {
    try {
      const urlState = localStorage.getItem(STORAGE_KEY_FROM_URL);
      if (!urlState) return;

      // Get current default state
      const defaultStored = localStorage.getItem(STORAGE_KEY);
      const defaultState = defaultStored ? JSON.parse(defaultStored) : {};

      // Merge URL state into default state
      const urlStateObj = JSON.parse(urlState);
      const merged = {
        ...defaultState,
        groups: urlStateObj.groups,
        activeTab: 'groups'
      };

      // Save merged state to default key
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));

      // Switch to using default key
      this.isFromUrl = false;

      // Clear URL state
      localStorage.removeItem(STORAGE_KEY_FROM_URL);

      // Clear URL query parameter
      const url = new URL(window.location.href);
      url.searchParams.delete('state');
      window.history.replaceState({}, '', url.toString());

      return true;
    } catch (error) {
      console.error('Failed to persist URL state:', error);
      return false;
    }
  }

  /**
   * Check if current session is from URL
   * @returns {boolean}
   */
  getIsFromUrl() {
    return this.isFromUrl;
  }
}
