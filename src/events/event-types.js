/**
 * Event type constants
 * All events are specific to what changed (no generic STATE_CHANGED)
 */

export const Events = {
  // User action events (state changes)
  EQUATION_TOGGLED: 'equation:toggled',
  EQUATIONS_RESET: 'equations:reset',
  THEME_CHANGED: 'theme:changed',
  TAB_CHANGED: 'tab:changed',

  // Group management events
  GROUP_ADDED: 'group:added',
  GROUP_REMOVED: 'group:removed',
  GROUP_UPDATED: 'group:updated',

  // System events (calculated results)
  CALCULATIONS_UPDATED: 'calculations:updated',
  COOLDOWN_CHANGED: 'cooldown:changed',

  // Initialization event
  STATE_HYDRATED: 'state:hydrated',
};
