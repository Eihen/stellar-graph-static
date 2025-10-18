/**
 * Chart rendering wrapper (Plotly)
 * Provides clean API for rendering series data
 */

/**
 * Create Plotly chart
 * @param {string} containerId - Chart container element ID
 * @param {Object} options - Chart options
 * @param {Array<number>} options.timeAxis - Time axis data
 * @param {string} [options.title='Stellar DPS'] - Chart title
 * @param {Array<number>} [options.breakpoints=[]] - Vertical lines to draw
 * @returns {Object} Chart API
 */
export function createChart(containerId, { timeAxis, title = 'Stellar DPS', breakpoints = [] }) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container #${containerId} not found`);
    return null;
  }

  let currentTheme = document.documentElement.dataset.theme || 'dark';

  /**
   * Build Plotly layout
   */
  const buildLayout = (cooldown) => {
    const isDark = currentTheme !== 'light';

    return {
      paper_bgcolor: isDark ? '#0b1220' : '#ffffff',
      plot_bgcolor: isDark ? '#0b1220' : '#ffffff',
      font: { color: isDark ? '#e6edf3' : '#1e293b' },
      title,
      xaxis: {
        title: 'Time (s)',
        tick0: 0,
        dtick: 30,
        gridcolor: isDark ? '#1f2937' : '#e2e8f0'
      },
      yaxis: {
        title: 'Stellar DPS',
        gridcolor: isDark ? '#1f2937' : '#e2e8f0'
      },
      shapes: breakpoints.map(bp => ({
        type: 'line',
        x0: bp,
        x1: bp,
        y0: 0,
        y1: 2.5,
        xref: 'x',
        yref: 'paper',
        line: {
          color: isDark ? 'rgba(148,163,184,0.5)' : 'rgba(100,116,139,0.5)',
          dash: 'dash'
        }
      })),
      margin: { l: 60, r: 30, t: 40, b: 50 },
      legend: { orientation: 'h', y: -0.2 }
    };
  };

  /**
   * Render chart with series data
   * @param {Array<{key: string, color: string, mean: number[]}>} series - Series to plot
   * @param {number} cooldown - Current cooldown (for layout)
   */
  const render = (series, cooldown) => {
    const data = series.map(s => ({
      x: timeAxis,
      y: s.mean.map(v => v * 10), // Scale for display
      type: 'scatter',
      mode: 'lines',
      name: s.key,
      line: { color: s.color, width: 2 }
    }));

    const layout = buildLayout(cooldown);

    Plotly.react(containerId, data, layout, {
      responsive: true,
      displaylogo: false
    });
  };

  /**
   * Update theme (triggers re-render)
   */
  const setTheme = (theme) => {
    currentTheme = theme;
  };

  return {
    render,
    setTheme
  };
}
