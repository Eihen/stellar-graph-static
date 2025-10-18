/**
 * Application - Event-Driven Architecture
 *
 * Wires together all components using the event bus.
 * Each component is self-contained and listens to specific events.
 */

import { EventBus } from './events/event-bus.js';
import { Events } from './events/event-types.js';
import { StateManager } from './state/state-manager.js';
import { StorageManager } from './state/storage-manager.js';
import { CalculationManager } from './managers/calculation-manager.js';
import { createEquations } from './config/equations.js';
import { BASE_COOLDOWN, BREAKPOINTS, CAST_OFFSET, CONFIG } from './config/constants.js';

// UI Components
import { CooldownDisplay } from './components/cooldown-display.js';
import { ChartComponent } from './components/chart-component.js';
import { RankingTable } from './components/ranking-table.js';
import { EquationToggles } from './components/equation-toggles.js';
import { BreakpointToggles } from './components/breakpoint-toggles.js';
import { CastTimeToggles } from './components/cast-time-toggles.js';
import { ThemeToggle } from './components/theme-toggle.js';

/**
 * Create initial state
 */
function createInitialState(equations, breakpoints) {
  return {
    enabledKeys: new Set(equations.map(eq => eq.key)),
    selectedBreakpoints: new Set(breakpoints),
    selectedCastTimes: new Set(),
    theme: 'dark',
    groups: []
  };
}

/**
 * Create and initialize the application
 */
export function createApp() {
  // 1. Create EventBus (central communication)
  const eventBus = new EventBus();

  // Enable debug logging in development
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    eventBus.enableDebug();
  }

  // 2. Load configuration
  const { timeAxis, equations } = createEquations(CONFIG.simulation.maxTime);

  // 3. Create StateManager
  const initialState = createInitialState(equations, BREAKPOINTS);
  const stateManager = new StateManager(eventBus, initialState);

  // 4. Create StorageManager (handles persistence)
  const storageManager = new StorageManager(eventBus, stateManager);

  // 5. Create CalculationManager (orchestrates calculations)
  const calculationManager = new CalculationManager(eventBus, stateManager, {
    equations,
    timeAxis,
    baseCooldown: BASE_COOLDOWN,
    castOffset: CAST_OFFSET
  });

  // 6. Create UI Components (self-contained, listen to events)
  // Note: Components are created BEFORE loading state so they can listen to STATE_HYDRATED

  // Cooldown display
  const cooldownDisplay = new CooldownDisplay(
    eventBus,
    'cooldownDisplay'
  );

  // Chart
  const chartComponent = new ChartComponent(
    eventBus,
    'chart',
    {
      timeAxis,
      title: CONFIG.chart.title,
      breakpoints: BREAKPOINTS
    }
  );

  // Ranking tables
  const rankingsTable = new RankingTable(
    eventBus,
    stateManager,
    'rankings',
    timeAxis,
    'breakpoints'
  );

  const rankingsCastsTable = new RankingTable(
    eventBus,
    stateManager,
    'rankingsCasts',
    timeAxis,
    'casts'
  );

  // Equation toggles
  const equationToggles = new EquationToggles(
    eventBus,
    stateManager,
    'eqToggles',
    equations
  );

  // Breakpoint toggles
  const breakpointToggles = new BreakpointToggles(
    eventBus,
    stateManager,
    'breakpointToggles',
    BREAKPOINTS
  );

  // Cast time toggles
  const castTimeToggles = new CastTimeToggles(
    eventBus,
    stateManager,
    'breakpointTogglesCasts'
  );

  // Theme toggle
  const themeToggle = new ThemeToggle(
    eventBus,
    stateManager,
    'themeToggle'
  );

  // 7. Setup reset button
  const resetBtn = document.getElementById('reset');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      // Reset state
      stateManager.resetEquations(equations.map(eq => eq.key));

      // Reset breakpoints (will emit event)
      stateManager.updateBreakpoints(BREAKPOINTS);

      // Reset theme
      if (stateManager.getState().theme !== 'dark') {
        stateManager.changeTheme('dark');
      }
    });
  }

  // 8. Load saved state or trigger initial calculation
  const savedState = storageManager.load();
  if (savedState) {
    // Loading state will emit STATE_HYDRATED, which triggers calculations
    stateManager.loadState(savedState);
  } else {
    // No saved state, trigger initial calculation with default state
    calculationManager.forceRecalculate();
  }

  // Apply theme to document
  document.documentElement.dataset.theme = stateManager.getState().theme;

  // 9. Return public API (for debugging/testing)
  return {
    eventBus,
    stateManager,
    calculationManager,
    storageManager,
    // Expose for debugging
    getState: () => stateManager.getState(),
    emit: (event, detail) => eventBus.emit(event, detail)
  };
}
