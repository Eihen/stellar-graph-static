/**
 * RankingTable - Displays ranking table for breakpoints or cast times
 *
 * Listens to: CALCULATIONS_UPDATED, BREAKPOINTS_CHANGED or COOLDOWN_CHANGED + CAST_TIMES_CHANGED
 * Updates: Ranking table rendering
 */

import { Events } from '../events/event-types.js';
import { renderTable } from '../ui/table.js';

export class RankingTable {
  constructor(eventBus, stateManager, containerId, timeAxis, type = 'breakpoints') {
    this.eventBus = eventBus;
    this.stateManager = stateManager;
    this.containerId = containerId;
    this.timeAxis = timeAxis;
    this.type = type;

    this.lastResults = null;

    // Setup listeners based on type
    this.setupListeners();
  }

  /**
   * Setup event listeners
   */
  setupListeners() {
    // Always listen to calculation updates
    this.eventBus.on(Events.CALCULATIONS_UPDATED, this.onCalculationsUpdated.bind(this));

    if (this.type === 'breakpoints') {
      // Listen to breakpoint selection changes
      this.eventBus.on(Events.BREAKPOINTS_CHANGED, this.render.bind(this));
    } else if (this.type === 'casts') {
      // Listen to cast time selection changes
      this.eventBus.on(Events.CAST_TIMES_CHANGED, this.render.bind(this));
      // Also listen to cooldown changes (affects available cast times)
      this.eventBus.on(Events.COOLDOWN_CHANGED, this.onCooldownChanged.bind(this));
    }
  }

  /**
   * Handle calculation updates
   * @param {Object} detail - { series, groupSeries }
   */
  onCalculationsUpdated(detail) {
    this.lastResults = detail;
    this.render();
  }

  /**
   * Handle cooldown changes (for cast time tables)
   * @param {Object} detail - { castTimes }
   */
  onCooldownChanged({ castTimes }) {
    if (this.type !== 'casts') return;

    // Update state with new cast times (all selected by default)
    this.stateManager.updateCastTimes(castTimes);
  }

  /**
   * Render the table
   */
  render() {
    if (!this.lastResults || !this.lastResults.series) return;

    const state = this.stateManager.getState();

    // Combine individual series with group series
    const allSeries = [...this.lastResults.series];
    if (this.lastResults.groupSeries && this.lastResults.groupSeries.length > 0) {
      allSeries.push(...this.lastResults.groupSeries);
    }

    // Get time points based on type
    let timePoints;
    if (this.type === 'breakpoints') {
      timePoints = Array.from(state.selectedBreakpoints).sort((a, b) => a - b);
    } else {
      timePoints = Array.from(state.selectedCastTimes).sort((a, b) => a - b);
    }

    // Render table
    renderTable(this.containerId, timePoints, allSeries, this.timeAxis);
  }
}
