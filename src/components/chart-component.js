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
    this.containerId = containerId;
    this.chart = createChart(containerId, options);
    this.mode = options.mode || 'individual'; // 'individual' or 'groups'
    this.lastData = null; // Store last render data

    if (!this.chart) {
      console.error(`ChartComponent: Failed to create chart in #${containerId}`);
      return;
    }

    // Listen to events
    this.eventBus.on(Events.CALCULATIONS_UPDATED, this.render.bind(this));
    this.eventBus.on(Events.THEME_CHANGED, this.updateTheme.bind(this));

    // Listen to tab changes to handle resize for groups tab
    if (this.mode === 'groups') {
      this.eventBus.on(Events.TAB_CHANGED, this.onTabChanged.bind(this));
    }
  }

  /**
   * Handle tab change events
   * @param {Object} detail - { tab }
   */
  onTabChanged({ tab }) {
    // When switching to groups tab, resize the chart
    if (tab === 'groups' && this.lastData) {
      // Small delay to ensure tab is visible before resizing
      setTimeout(() => {
        const container = document.getElementById(this.containerId);
        if (container && container.offsetParent !== null) {
          // Container is visible, trigger Plotly resize
          window.Plotly.Plots.resize(this.containerId);
        }
      }, 50);
    }
  }

  /**
   * Render chart with calculation results
   * @param {Object} detail - { series, groupSeries, cooldown }
   */
  render({ series, groupSeries, cooldown }) {
    let seriesToRender = [];

    if (this.mode === 'groups') {
      // Groups tab: only show group series
      if (groupSeries && groupSeries.length > 0) {
        seriesToRender = [...groupSeries];
      }
    } else {
      // Individual tab: only show individual series
      if (series) {
        seriesToRender = [...series];
      }
    }

    // Store last data for potential re-render
    this.lastData = { series, groupSeries, cooldown };

    // Render chart
    if (seriesToRender.length > 0) {
      this.chart.render(seriesToRender, cooldown);

      // For groups mode, trigger resize after render to fix initial width
      if (this.mode === 'groups') {
        setTimeout(() => {
          const container = document.getElementById(this.containerId);
          if (container && container.offsetParent !== null) {
            window.Plotly.Plots.resize(this.containerId);
          }
        }, 100);
      }
    }
  }

  /**
   * Update chart theme
   * @param {Object} detail - { theme }
   */
  updateTheme({ theme }) {
    this.chart.setTheme(theme);
  }
}
