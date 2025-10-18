/**
 * ChartComponent - Manages the Plotly chart
 *
 * Listens to: CALCULATIONS_UPDATED, THEME_CHANGED
 * Updates: Chart rendering
 */

import { Events } from '../events/event-types.js';
import { createChart } from '../ui/chart.js';

export class ChartComponent {
  constructor(eventBus, containerId, options) {
    this.eventBus = eventBus;
    this.chart = createChart(containerId, options);

    if (!this.chart) {
      console.error(`ChartComponent: Failed to create chart in #${containerId}`);
      return;
    }

    // Listen to events
    this.eventBus.on(Events.CALCULATIONS_UPDATED, this.render.bind(this));
    this.eventBus.on(Events.THEME_CHANGED, this.updateTheme.bind(this));
  }

  /**
   * Render chart with calculation results
   * @param {Object} detail - { series, groupSeries, cooldown }
   */
  render({ series, groupSeries, cooldown }) {
    if (!series) return;

    // Combine individual series with group series
    const allSeries = [...series];
    if (groupSeries && groupSeries.length > 0) {
      allSeries.push(...groupSeries);
    }

    // Render chart
    this.chart.render(allSeries, cooldown);
  }

  /**
   * Update chart theme
   * @param {Object} detail - { theme }
   */
  updateTheme({ theme }) {
    this.chart.setTheme(theme);
  }
}
