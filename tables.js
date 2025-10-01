// Table rendering helpers
// Exports: renderTable(containerId, secondsList, series, t), createBreakpointToggles(containerId, breakpoints, onToggle)

// Create breakpoint toggle checkboxes
export function createBreakpointToggles(containerId, breakpoints, onToggle) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  
  breakpoints.forEach(breakpoint => {
    const label = document.createElement('label');
    label.style.display = 'flex';
    label.style.alignItems = 'center';
    label.style.gap = '4px';
    label.style.fontSize = '12px';
    label.style.opacity = '0.8';
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = true; // All breakpoints selected by default
    checkbox.addEventListener('change', onToggle);
    
    const text = document.createElement('span');
    text.textContent = breakpoint + 's';
    
    label.appendChild(checkbox);
    label.appendChild(text);
    container.appendChild(label);
  });
}

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
  html += '<div style="display:grid; grid-template-columns: repeat('+cols.length+', 1fr); min-width: max-content;">';
  cols.forEach((col, i) => {
    const isLast = i === cols.length - 1;
    const borderStyle = isLast ? '' : 'border-right: 1px solid #2b3b52;';
    const padStyle = isLast ? 'padding-left:10px;' : 'padding-left:10px; padding-right:10px;';
    html += '<div style="'+borderStyle+padStyle+'">\
      <div style="font-weight:600; margin-bottom:6px; opacity:.9; border-bottom:1px solid #2b3b52; padding-bottom:6px; white-space: nowrap;">'+col.sec+'s</div>';
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
      
      html += '<div style="opacity:.9; display: flex; align-items: center; white-space: nowrap;">' + arrow + row.name + '</div><div style="text-align:right; font-variant-numeric: tabular-nums;">'+row.value+'</div>';
    }
    html += '</div></div>';
  });
  html += '</div>';
  container.innerHTML = html;
}