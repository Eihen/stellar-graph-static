/**
 * Ranking table renderer
 * Pure rendering function for ranking tables
 */

/**
 * Render ranking table
 * @param {string} containerId - Container element ID
 * @param {Array<number>} timePoints - Time points to show columns for
 * @param {Array<{key: string, mean: number[]}>} series - Series data
 * @param {number[]} timeAxis - Full time axis
 */
export function renderTable(containerId, timePoints, series, timeAxis) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container #${containerId} not found`);
    return;
  }

  // Build columns data
  const columns = timePoints.map(timePoint => {
    const timeIndex = Math.min(timePoint, timeAxis.length - 1);

    const sorted = [...series]
      .map(s => ({
        name: s.key,
        value: Number((s.mean[timeIndex] * 10).toFixed(4))
      }))
      .sort((a, b) => b.value - a.value);

    return { timePoint, rows: sorted };
  });

  // Render HTML
  let html = '';
  html += `<div style="display:grid; grid-template-columns: repeat(${columns.length}, 1fr); min-width: max-content;">`;

  columns.forEach((col, colIndex) => {
    const isLast = colIndex === columns.length - 1;
    const borderStyle = isLast ? '' : 'border-right: 1px solid #2b3b52;';
    const padStyle = isLast ? 'padding-left:10px;' : 'padding-left:10px; padding-right:10px;';

    html += `<div style="${borderStyle}${padStyle}">`;
    html += `<div style="font-weight:600; margin-bottom:6px; opacity:.9; border-bottom:1px solid #2b3b52; padding-bottom:6px; white-space: nowrap;">${col.timePoint}s</div>`;
    html += '<div style="display:grid; grid-template-columns: 1fr max-content; gap:6px;">';

    col.rows.forEach((row, rowIndex) => {
      const currentPosition = rowIndex + 1;

      // Calculate position change arrow
      let arrow = '';
      if (colIndex > 0) {
        const prevCol = columns[colIndex - 1];
        const prevRow = prevCol.rows.find(r => r.name === row.name);

        if (prevRow) {
          const prevPosition = prevCol.rows.indexOf(prevRow) + 1;
          const positionChange = Math.abs(currentPosition - prevPosition);

          if (currentPosition < prevPosition) {
            // Improved (moved up)
            arrow = `<span style="color: #10b981; margin-right: 4px;">${positionChange}\u2191</span>`;
          } else if (currentPosition > prevPosition) {
            // Worsened (moved down)
            arrow = `<span style="color: #ef4444; margin-right: 4px;">${positionChange}\u2193</span>`;
          }
        }
      }

      html += `<div style="opacity:.9; display: flex; align-items: center; white-space: nowrap;">${arrow}${row.name}</div>`;
      html += `<div style="text-align:right; font-variant-numeric: tabular-nums;">${row.value}</div>`;
    });

    html += '</div></div>';
  });

  html += '</div>';
  container.innerHTML = html;
}
