/**
 * CalculationManager - Listens to state changes and runs calculations
 *
 * Responsibilities:
 * - Listen to events that affect calculations
 * - Run calculations when needed
 * - Emit CALCULATIONS_UPDATED event with results
 * - Emit COOLDOWN_CHANGED event when cooldown changes
 */

import { Events } from '../events/event-types.js';
import { calculate } from '../core/calculator.js';

export class CalculationManager {
  constructor(eventBus, stateManager, config) {
    this.eventBus = eventBus;
    this.stateManager = stateManager;
    this.config = config; // { equations, timeAxis, baseCooldown, castOffset }

    this.lastCooldown = null;
    this.lastResults = null;

    // Listen to events that require recalculation
    this.setupListeners();
  }

  /**
   * Setup listeners for events that affect calculations
   */
  setupListeners() {
    // Initial state load
    this.eventBus.on(Events.STATE_HYDRATED, (detail) => {
      this.recalculate(detail.enabledKeys, detail.groups);
    });

    // State changes that affect calculations
    this.eventBus.on(Events.EQUATION_TOGGLED, (detail) => {
      this.recalculate(detail.enabledKeys);
    });

    this.eventBus.on(Events.EQUATIONS_RESET, (detail) => {
      this.recalculate(detail.enabledKeys);
    });

    // Group changes affect calculations
    this.eventBus.on(Events.GROUP_ADDED, (detail) => {
      this.recalculate(detail.enabledKeys, detail.groups);
    });

    this.eventBus.on(Events.GROUP_REMOVED, (detail) => {
      this.recalculate(detail.enabledKeys, detail.groups);
    });

    this.eventBus.on(Events.GROUP_UPDATED, (detail) => {
      this.recalculate(detail.enabledKeys, detail.groups);
    });
  }

  /**
   * Run calculations and emit results
   * @param {Set<string>} enabledKeys - Enabled equation keys
   * @param {Array} [groups] - Optional groups
   */
  recalculate(enabledKeys, groups = null) {
    const state = this.stateManager.getState();

    // Run calculations
    const results = calculate({
      equations: this.config.equations,
      timeAxis: this.config.timeAxis,
      enabledKeys: enabledKeys,
      baseCooldown: this.config.baseCooldown,
      castOffset: this.config.castOffset,
      includeFinalDps: false, // Removed (will use groups instead)
      groups: groups || state.groups
    });

    // Store results
    this.lastResults = results;

    // Emit calculation results
    this.eventBus.emit(Events.CALCULATIONS_UPDATED, {
      cooldown: results.cooldown,
      cooldownModifiers: results.cooldownModifiers,
      series: results.series,
      groupSeries: results.groupSeries,
      castTimes: results.castTimes
    });

    // Check if cooldown changed
    if (this.lastCooldown !== results.cooldown) {
      const previousCooldown = this.lastCooldown;
      this.lastCooldown = results.cooldown;

      // Emit cooldown changed event
      this.eventBus.emit(Events.COOLDOWN_CHANGED, {
        cooldown: results.cooldown,
        previousCooldown,
        modifiers: results.cooldownModifiers,
        castTimes: results.castTimes
      });
    }
  }

  /**
   * Get last calculation results
   * @returns {Object|null}
   */
  getLastResults() {
    return this.lastResults;
  }

  /**
   * Force recalculation with current state
   */
  forceRecalculate() {
    const state = this.stateManager.getState();
    this.recalculate(state.enabledKeys, state.groups);
  }
}
