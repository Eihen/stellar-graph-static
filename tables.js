// Table rendering helpers
// Exports: renderTable(containerId, secondsList, series, t)

export function renderTable(containerId, secondsList, series, t) {
  const container = document.getElementById(containerId);
  const cols = secondsList.map(sec => {
    const idx = Math.min(sec, t.length - 1);
    const sorted = [...series]
      .map(s => ({ name: s.key, value: Number(s.mean[idx].toFixed(4)) }))
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
    for (const row of col.rows) {
      html += '<div style="opacity:.9">'+row.name+'</div><div style="text-align:right; font-variant-numeric: tabular-nums;">'+row.value+'</div>';
    }
    html += '</div></div>';
  });
  html += '</div>';
  container.innerHTML = html;
}