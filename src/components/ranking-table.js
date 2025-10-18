/**
 * RankingTable - Displays ranking table for breakpoints or cast times
 *
 * Listens to: CALCULATIONS_UPDATED, BREAKPOINTS_CHANGED or COOLDOWN_CHANGED + CAST_TIMES_CHANGED
 * Updates: Ranking table rendering
 */

import { Events } from '../events/event-types.js';
import { renderTable } from '../ui/table.js';

export class RankingTable {
  constructor(eventBus, stateManager, containerId, timeAxis, type = 'breakpoints', mode = 'individual') {
    this.eventBus = eventBus;
    this.stateManager = stateManager;
    this.containerId = containerId;
    this.timeAxis = timeAxis;
    this.type = type;
    this.mode = mode; // 'individual' or 'groups'

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
    if (!this.lastResults) return;

    const state = this.stateManager.getState();

    // Filter series based on mode
    let seriesToRender = [];
    if (this.mode === 'groups') {
      // Groups tab: only show group series
      if (this.lastResults.groupSeries && this.lastResults.groupSeries.length > 0) {
        seriesToRender = [...this.lastResults.groupSeries];
      }
    } else {
      // Individual tab: only show individual series
      if (this.lastResults.series) {
        seriesToRender = [...this.lastResults.series];
      }
    }

    if (seriesToRender.length === 0) return;

    // Get time points based on type
    let timePoints;
    if (this.type === 'breakpoints') {
      timePoints = Array.from(state.selectedBreakpoints).sort((a, b) => a - b);
    } else if (this.type === 'casts') {
      // For groups mode, collect union of all cast times from all groups
      if (this.mode === 'groups') {
        const allCastTimes = new Set();
        seriesToRender.forEach(series => {
          if (series.castTimes && series.castTimes.length > 0) {
            series.castTimes.forEach(ct => allCastTimes.add(ct));
          }
        });
        timePoints = Array.from(allCastTimes).sort((a, b) => a - b);
      } else {
        // Individual mode uses selected cast times from state
        timePoints = Array.from(state.selectedCastTimes).sort((a, b) => a - b);
      }
    }

    // Render table (show footer only for cast time tables in groups mode)
    const showCastFooter = this.type === 'casts' && this.mode === 'groups';
    renderTable(this.containerId, timePoints, seriesToRender, this.timeAxis, showCastFooter);
  }
}
