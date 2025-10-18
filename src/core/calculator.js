/**
 * Main calculation orchestrator
 * Coordinates all calculation logic without side effects
 */

import { calculateCooldown, createCastCondition } from './cooldown.js';
import { buildAllSeries, buildGroupSeries } from './series-builder.js';

/**
 * Calculate everything needed for rendering
 * @param {Object} config - Calculation configuration
 * @param {Array} config.equations - Equation definitions
 * @param {number[]} config.timeAxis - Time axis array
 * @param {Set<string>} config.enabledKeys - Enabled equation keys
 * @param {number} config.baseCooldown - Base cooldown value
 * @param {number} config.castOffset - Cast offset
 * @param {Array} [config.groups] - Optional equation groups
 * @returns {Object} Calculation results
 */
export function calculate({
  equations,
  timeAxis,
  enabledKeys,
  baseCooldown,
  castOffset = 10,
  groups = null
}) {
  // Calculate effective cooldown
  const { cooldown, modifiers } = calculateCooldown(baseCooldown, equations, enabledKeys);

  // Create cast condition
  const castCondition = createCastCondition(timeAxis, cooldown, castOffset);

  // Build series for individual equations
  const series = buildAllSeries(equations, enabledKeys, timeAxis, cooldown, castCondition);

  // Build group series if provided (with per-group cooldown isolation)
  let groupSeries = null;
  if (groups && groups.length > 0) {
    groupSeries = buildGroupSeries(equations, groups, timeAxis, baseCooldown, castOffset);
  }

  return {
    cooldown,
    cooldownModifiers: modifiers,
    castCondition,
    series,
    groupSeries,
    // Helper data
    castTimes: timeAxis.filter((_, i) => castCondition[i])
  };
}
