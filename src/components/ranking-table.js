/**
 * RankingTable - Displays ranking table for breakpoints or cast times
 *
 * Listens to: CALCULATIONS_UPDATED
 * Updates: Ranking table rendering
 */

import { Events } from '../events/event-types.js';
import { renderTable } from '../ui/table.js';

export class RankingTable {
  constructor(eventBus, stateManager, containerId, timeAxis, type = 'breakpoints', mode = 'individual', breakpoints = []) {
    this.eventBus = eventBus;
    this.stateManager = stateManager;
    this.containerId = containerId;
    this.timeAxis = timeAxis;
    this.type = type;
    this.mode = mode; // 'individual' or 'groups'
    this.breakpoints = breakpoints; // Predefined breakpoints for 'breakpoints' type

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
   * Render the table
   */
  render() {
    if (!this.lastResults) return;

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
      // Show all predefined breakpoints
      timePoints = [...this.breakpoints];
    } else if (this.type === 'casts') {
      // Show all cast times from calculations
      if (this.mode === 'groups') {
        // For groups mode, collect union of all cast times from all groups
        const allCastTimes = new Set();
        seriesToRender.forEach(series => {
          if (series.castTimes && series.castTimes.length > 0) {
            series.castTimes.forEach(ct => allCastTimes.add(ct));
          }
        });
        timePoints = Array.from(allCastTimes).sort((a, b) => a - b);
      } else {
        // Individual mode: get cast times from calculation results (global cooldown)
        if (this.lastResults.castTimes && this.lastResults.castTimes.length > 0) {
          timePoints = [...this.lastResults.castTimes];
        }
      }
    }

    // Don't render if timePoints is undefined or empty
    if (!timePoints || timePoints.length === 0) return;

    // Render table (show footer only for cast time tables in groups mode)
    const showCastFooter = this.type === 'casts' && this.mode === 'groups';
    renderTable(this.containerId, timePoints, seriesToRender, this.timeAxis, showCastFooter);
  }
}
