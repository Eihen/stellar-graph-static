// Table rendering helpers
// Exports: renderTable(containerId, secondsList, series, t)

export function renderTable(containerId, secondsList, series, t) {
  const container = document.getElementById(containerId);
  const cols = secondsList.map(sec => {
    const idx = Math.min(sec, t.length - 1);
    const sorted = [...series]
      .map(s => ({ name: s.key, value: Number((s.mean[idx] * 10).toFixed(4)) }))
      .sort((a, b) => b.value - a.value);
    return { sec, rows: sorted };
  });
  
  let html = '';
  html += '<div style="display:grid; grid-template-columns: repeat('+cols.length+', 1fr);">';
  cols.forEach((col, i) => {
    const isLast = i === cols.length - 1;
    const borderStyle = isLast ? '' : 'border-right: 1px solid #2b3b52;';
    const padStyle = isLast ? 'padding-left:10px;' : 'padding-left:10px; padding-right:10px;';
    html += '<div style="'+borderStyle+padStyle+'">\
      <div style="font-weight:600; margin-bottom:6px; opacity:.9; border-bottom:1px solid #2b3b52; padding-bottom:6px;">'+col.sec+'s</div>';
    html += '<div style="display:grid; grid-template-columns: 1fr max-content; gap:6px;">';
    
    for (let j = 0; j < col.rows.length; j++) {
      const row = col.rows[j];
      const currentPosition = j + 1; // 1-based position
      
      // Compare with previous time breakpoint (if it exists)
      let arrow = '';
      if (i > 0) { // Not the first column
        const prevCol = cols[i - 1];
        const prevRow = prevCol.rows.find(r => r.name === row.name);
        if (prevRow) {
          const prevPosition = prevCol.rows.indexOf(prevRow) + 1; // 1-based position
          const positionChange = Math.abs(currentPosition - prevPosition);
          if (currentPosition < prevPosition) {
            // Position improved (moved up in rankings)
            arrow = '<span style="color: #10b981; margin-right: 4px;">' + positionChange + '↑</span>';
          } else if (currentPosition > prevPosition) {
            // Position worsened (moved down in rankings)
            arrow = '<span style="color: #ef4444; margin-right: 4px;">' + positionChange + '↓</span>';
          }
        }
      }
      
      html += '<div style="opacity:.9; display: flex; align-items: center;">' + arrow + row.name + '</div><div style="text-align:right; font-variant-numeric: tabular-nums;">'+row.value+'</div>';
    }
    html += '</div></div>';
  });
  html += '</div>';
  container.innerHTML = html;
}