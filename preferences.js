// User preferences management
import { redraw } from './main.js';

export function loadPreferences(eqDefs, breakpoints) {
  const savedPrefs = localStorage.getItem('stellar-plot-prefs');
  
  if (savedPrefs) {
    const prefs = JSON.parse(savedPrefs);
    return {
      theme: prefs.theme,
      enabledKeys: new Set(prefs.enabledKeys),
      selectedBreakpoints: new Set(prefs.selectedBreakpoints),
      selectedCastTimes: new Set(prefs.selectedCastTimes)
    };
  }

  // Default preferences - everything enabled
  return {
    theme: 'dark',
    enabledKeys: new Set(eqDefs.map(d => d.key)),
    selectedBreakpoints: new Set(breakpoints),
    selectedCastTimes: null // Will be set when setupCastTimeToggles is called
  };
}

export function savePreferences({ theme, enabledKeys, selectedBreakpoints, selectedCastTimes }) {
  localStorage.setItem('stellar-plot-prefs', JSON.stringify({
    theme,
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

export function setupPreferences(state, eqDefs, breakpoints) {
  // Load preferences (either from storage or defaults)
  const prefs = loadPreferences(eqDefs, breakpoints);
  
  // Apply preferences to state
  Object.assign(state, prefs);

  // Initialize UI with loaded preferences
  document.getElementById('themeToggle').dataset.active = state.theme === 'dark';
  document.documentElement.dataset.theme = state.theme;

  // Initialize equation toggles
  const eqToggles = document.querySelectorAll('#eqToggles input[type="checkbox"]');
  eqToggles.forEach(toggle => {
    const eqKey = toggle.parentElement.querySelector('span:last-child').textContent;
    toggle.checked = state.enabledKeys.has(eqKey);
  });

  // Initialize breakpoint toggles
  const breakpointToggles = document.querySelectorAll('#breakpointToggles input[type="checkbox"]');
  breakpointToggles.forEach(toggle => {
    const bp = parseInt(toggle.parentElement.textContent);
    toggle.checked = state.selectedBreakpoints.has(bp);
  });

  // Initialize cast time toggles
  const castTimeToggles = document.querySelectorAll('#breakpointTogglesCasts input[type="checkbox"]');
  castTimeToggles.forEach((toggle, i) => {
    const castTime = parseInt(toggle.parentElement.textContent);
    toggle.checked = state.selectedCastTimes.has(castTime);
  });

  // Set up event listeners
  const themeToggle = document.getElementById('themeToggle');
  themeToggle.addEventListener('click', () => {
    state.theme = state.theme === 'light' ? 'dark' : 'light';
    document.documentElement.dataset.theme = state.theme;
    themeToggle.dataset.active = state.theme === 'dark';
    savePreferences(state);
    redraw();
  });
}