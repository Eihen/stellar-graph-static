import { createEquations } from './equations.js';
import { renderTable, createBreakpointToggles } from './tables.js';
import { setupPreferences, loadPreferences, savePreferences } from './preferences.js';
import { BASE_COOLDOWN } from './constants.js';

const { t, eqDefs } = createEquations();
const breakpoints = [30, 60, 90, 120, 150, 180, 210, 240, 270, 300];

// Application state
const state = {
  selectedBreakpoints: new Set(breakpoints),
  selectedCastTimes: new Set(), // Will be populated with actual cast times
  theme: 'dark',
  enabledKeys: new Set(eqDefs.map(d => d.key)) // Initialize with all equations enabled
};

function runningMean(arr) {
  const out = new Array(arr.length);
  let sum = 0;
  for (let i = 0; i < arr.length; i++) { sum += arr[i]; out[i] = sum / (i + 1); }
  return out;
}

function where(cond, a, b) {
  const out = new Array(cond.length);
  for (let i = 0; i < cond.length; i++) out[i] = cond[i] ? a[i] : b[i];
  return out;
}

function constant(v) { return Array(t.length).fill(v); }

function build(cooldown, enabledKeys) {
  const cond = t.map((ti) => ti % cooldown === 10);
  const series = [];
  for (const def of eqDefs) {
    if (!enabledKeys.has(def.key)) continue;
    const raw = def.gen({ t, cooldown });
    const gated = where(cond, raw, constant(0.0));
    const mean = runningMean(gated);
    series.push({ key: def.key, color: def.color, mean });
  }
  return series;
}

// renderTable now imported from tables.js

function layout(cooldown) {
  const isDark = document.documentElement.dataset.theme !== 'light';
  return {
    paper_bgcolor: isDark ? '#0b1220' : '#ffffff',
    plot_bgcolor: isDark ? '#0b1220' : '#ffffff',
    font: { color: isDark ? '#e6edf3' : '#1e293b' },
    title: `Stellar DPS`,
    xaxis: { title: 'Time (s)', tick0: 0, dtick: 30, gridcolor: isDark ? '#1f2937' : '#e2e8f0' },
    yaxis: { title: 'Stellar DPS', gridcolor: isDark ? '#1f2937' : '#e2e8f0' },
    shapes: breakpoints.map(bp => ({ type: 'line', x0: bp, x1: bp, y0: 0, y1: 2.5, xref: 'x', yref: 'paper', line: { color: isDark ? 'rgba(148,163,184,0.5)' : 'rgba(100,116,139,0.5)', dash: 'dash' }})),
    margin: { l: 60, r: 30, t: 40, b: 50 },
    legend: { orientation: 'h', y: -0.2 },
  };
}

// UI setup
const resetBtn = document.getElementById('reset');
const eqToggles = document.getElementById('eqToggles');

state.enabledKeys = new Set(eqDefs.map(d=>d.key));
for (const def of eqDefs) {
  const id = 'eq-' + def.key.replace(/\s+/g,'-');
  const wrap = document.createElement('label');
  wrap.className = 'pill';
  wrap.style.borderColor = def.color;
  const cb = document.createElement('input');
  cb.type = 'checkbox';
  cb.id = id; cb.checked = true;
  cb.addEventListener('change', () => {
    if (cb.checked) state.enabledKeys.add(def.key); else state.enabledKeys.delete(def.key);
    savePreferences(state);
    // Recalculate cooldown since equation toggles might affect it
    const newCooldown = calculateCooldown(BASE_COOLDOWN, state.enabledKeys);
    setupCastTimeToggles(newCooldown);
    redraw();
  });
  const dot = document.createElement('span');
  dot.style.width = '10px'; dot.style.height = '10px'; dot.style.background = def.color; dot.style.borderRadius = '999px'; dot.style.display = 'inline-block';
  const text = document.createElement('span'); text.textContent = def.key;
  wrap.appendChild(cb); wrap.appendChild(dot); wrap.appendChild(text);
  eqToggles.appendChild(wrap);
}

// Function to generate cast times based on cooldown
function updateCooldownDisplay(cooldown, modifiers) {
  const display = document.getElementById('cooldownDisplay');
  const tooltip = display.closest('.tooltip-wrapper').querySelector('.tooltip-content');
  
  if (modifiers.length > 0) {
    const modifierText = modifiers.map(m => `• ${m}`).join('\n');
    tooltip.textContent = `Modifiers applied:\n${modifierText}`;
    display.textContent = `Stellar Cooldown: ${cooldown.toFixed(1)}s`;
  } else {
    tooltip.textContent = 'No cooldown modifiers active';
    display.textContent = `Stellar Cooldown: ${cooldown}s`;
  }
}

function calculateCooldown(baseCooldown, enabledKeys) {
  let finalCooldown = baseCooldown;
  const appliedModifiers = [];

  // Get only enabled equations with cooldown modifiers
  const activeModifiers = eqDefs
    .filter(def => enabledKeys.has(def.key) && def.cooldownModifier)
    .map(def => ({ key: def.key, modifier: def.cooldownModifier }));

  // Apply modifiers in sequence
  for (const { key, modifier } of activeModifiers) {
    const prevCooldown = finalCooldown;
    finalCooldown = modifier(finalCooldown);
    if (finalCooldown !== prevCooldown) {
      appliedModifiers.push(`${key} (${prevCooldown.toFixed(1)}s → ${finalCooldown.toFixed(1)}s)`);
    }
  }

  updateCooldownDisplay(finalCooldown, appliedModifiers);
  return finalCooldown;
}

function generateCastTimes(cooldown) {
  const castTimes = [];
  for (let ti = 0; ti <= t.length - 1; ti++) {
    if (ti % cooldown === 10) castTimes.push(ti);
  }
  return castTimes;
}

// Setup breakpoint toggles
createBreakpointToggles('breakpointToggles', breakpoints, () => {
  state.selectedBreakpoints.clear();
  const checkboxes = document.querySelectorAll('#breakpointToggles input[type="checkbox"]');
  checkboxes.forEach((cb, i) => {
    if (cb.checked) state.selectedBreakpoints.add(breakpoints[i]);
  });
  savePreferences(state);
  redraw();
});

// Setup cast time toggles - will be updated when cooldown changes
function setupCastTimeToggles(cooldown) {
  const castTimes = generateCastTimes(cooldown);
  if (!state.selectedCastTimes) {
    state.selectedCastTimes = new Set(castTimes);
  }
  
  createBreakpointToggles('breakpointTogglesCasts', castTimes, () => {
    state.selectedCastTimes.clear();
    const checkboxes = document.querySelectorAll('#breakpointTogglesCasts input[type="checkbox"]');
    checkboxes.forEach((cb, i) => {
      if (cb.checked) state.selectedCastTimes.add(castTimes[i]);
    });
    savePreferences(state);
    redraw();
  });
}

resetBtn.addEventListener('click', () => {
  for (const def of eqDefs) {
    const id = 'eq-' + def.key.replace(/\s+/g,'-');
    const cb = document.getElementById(id); if (cb) cb.checked = true;
    state.enabledKeys.add(def.key);
  }

  // Reset breakpoint toggles
  state.selectedBreakpoints = new Set(breakpoints);
  document.querySelectorAll('#breakpointToggles input[type="checkbox"]').forEach(cb => cb.checked = true);
  
  // Reset cast time toggles
  setupCastTimeToggles(BASE_COOLDOWN); // Default cooldown
  
  // Save reset preferences
  savePreferences(state);
  
  redraw();
});

export function redraw() {
  const cooldown = calculateCooldown(BASE_COOLDOWN, state.enabledKeys);
  const series = build(cooldown, state.enabledKeys);
  const data = series.map(s => ({ x: t, y: s.mean.map(v => v * 10), type: 'scatter', mode: 'lines', name: s.key, line: { color: s.color, width: 2 } }));
  Plotly.react('chart', data, layout(cooldown), {responsive: true, displaylogo: false});

  // Rankings by battle length (static 30s ticks) - use selected breakpoints
  const filteredBreakpoints = breakpoints.filter(bp => state.selectedBreakpoints.has(bp));
  renderTable('rankings', filteredBreakpoints, series, t);

  // Rankings by casts: use actual cast times
  const filteredCastTimes = Array.from(state.selectedCastTimes).sort((a, b) => a - b);
  renderTable('rankingsCasts', filteredCastTimes, series, t);
}

// Initialize tooltip handlers
const display = document.getElementById('cooldownDisplay');
const tooltip = display.closest('.tooltip-wrapper').querySelector('.tooltip-content');
let isTooltipVisible = false;
let isMouseOverTooltip = false;
let isMouseOverDisplay = false;

// Click handler for the display element
display.addEventListener('click', (e) => {
  e.stopPropagation(); // Prevent this click from triggering the document handler
  isTooltipVisible = !isTooltipVisible;
  tooltip.classList.toggle('visible', isTooltipVisible);
});

// Mouse enter/leave handlers for the display
display.addEventListener('mouseenter', () => {
  isMouseOverDisplay = true;
  tooltip.classList.add('visible');
});

display.addEventListener('mouseleave', () => {
  isMouseOverDisplay = false;
  // Hide tooltip only if mouse isn't over tooltip
  setTimeout(() => {
    if (!isMouseOverTooltip && !isTooltipVisible) {
      tooltip.classList.remove('visible');
    }
  }, 100);
});

// Mouse enter/leave handlers for the tooltip itself
tooltip.addEventListener('mouseenter', () => {
  isMouseOverTooltip = true;
});

tooltip.addEventListener('mouseleave', () => {
  isMouseOverTooltip = false;
  // Hide tooltip if it wasn't clicked to stay visible
  if (!isTooltipVisible) {
    tooltip.classList.remove('visible');
  }
});

// Global click handler to close tooltip when clicking elsewhere
document.addEventListener('click', () => {
  tooltip.classList.remove('visible');
  isTooltipVisible = false;
});

// Initialize preferences and UI
setupPreferences(state, eqDefs, breakpoints);
const initialCooldown = calculateCooldown(BASE_COOLDOWN, state.enabledKeys);
setupCastTimeToggles(initialCooldown);
redraw();
