/**
 * Application constants
 * Single source of truth for configuration values
 */

export const CONFIG = {
  // Simulation settings
  simulation: {
    maxTime: 300,        // Maximum simulation time in seconds
    castOffset: 10,      // Offset for first cast (ti % cooldown === offset)
  },

  // Cooldown settings
  cooldown: {
    base: 30,           // Base cooldown in seconds
  },

  // Display settings
  breakpoints: {
    battleLength: [30, 60, 90, 120, 150, 180, 210, 240, 270, 300],
  },

  // Chart settings
  chart: {
    title: 'Stellar DPS',
    dpsMultiplier: 10,   // Multiplier for display (mean * 10)
  },

  // Theme colors
  colors: {
    finalDps: {
      dark: '#ffffff',
      light: '#000000',
    },
  },

  // Storage
  storage: {
    key: 'stellar-plot-prefs',
  },
};

// Export commonly used values for convenience
export const BASE_COOLDOWN = CONFIG.cooldown.base;
export const MAX_TIME = CONFIG.simulation.maxTime;
export const CAST_OFFSET = CONFIG.simulation.castOffset;
export const BREAKPOINTS = CONFIG.breakpoints.battleLength;
