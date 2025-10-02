// User preferences management
import { redraw } from './main.js';

export function loadPreferences() {
  const prefs = JSON.parse(localStorage.getItem('stellar-plot-prefs') || '{}');
  return {
    theme: prefs.theme || 'dark',
    celestialCdr: prefs.celestialCdr || false,
    enabledKeys: new Set(prefs.enabledKeys || []),
    selectedBreakpoints: new Set(prefs.selectedBreakpoints || []),
    selectedCastTimes: new Set(prefs.selectedCastTimes || [])
  };
}

export function savePreferences({ theme, celestialCdr, enabledKeys, selectedBreakpoints, selectedCastTimes }) {
  localStorage.setItem('stellar-plot-prefs', JSON.stringify({
    theme,
    celestialCdr,
    enabledKeys: Array.from(enabledKeys),
    selectedBreakpoints: Array.from(selectedBreakpoints),
    selectedCastTimes: Array.from(selectedCastTimes)
  }));
}

export function initializeTheme() {
  const { theme } = loadPreferences();
  document.documentElement.dataset.theme = theme;
  document.getElementById('themeToggle').checked = theme === 'light';
}

export function setupPreferences(state) {
  // Load initial preferences
  const prefs = loadPreferences();
  state.theme = prefs.theme;
  state.celestialCdr = prefs.celestialCdr;
  state.enabledKeys = prefs.enabledKeys;
  state.selectedBreakpoints = prefs.selectedBreakpoints;
  state.selectedCastTimes = prefs.selectedCastTimes;

  // Initialize UI
  document.getElementById('celestialCdr').checked = state.celestialCdr;
  document.getElementById('themeToggle').dataset.active = state.theme === 'dark';
  document.documentElement.dataset.theme = state.theme;

  // Set up event listeners
  const themeToggle = document.getElementById('themeToggle');
  themeToggle.addEventListener('click', () => {
    state.theme = state.theme === 'light' ? 'dark' : 'light';
    document.documentElement.dataset.theme = state.theme;
    themeToggle.dataset.active = state.theme === 'dark';
    savePreferences(state);
    redraw(); // Trigger redraw to update graph colors
  });
  // Set initial active state
  themeToggle.dataset.active = state.theme === 'dark';

  document.getElementById('celestialCdr').addEventListener('change', (e) => {
    state.celestialCdr = e.target.checked;
    savePreferences(state);
  });
}