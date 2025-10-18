/**
 * Series building logic - converts equations into plottable data
 * Pure functions with no side effects
 */

import { runningMean, where, constant, product } from './math.js';
import { calculateCooldownForKeys, createCastCondition, generateCastTimes } from './cooldown.js';

/**
 * Build a series from a single equation
 * @param {Object} equation - Equation definition
 * @param {number[]} timeAxis - Time axis array
 * @param {number} cooldown - Current cooldown value
 * @param {boolean[]} castCondition - When casts happen
 * @returns {{key: string, color: string, raw: number[], gated: number[], mean: number[]}}
 */
export function buildSeries(equation, timeAxis, cooldown, castCondition) {
  // Generate raw multipliers using equation's generator function
  const raw = equation.gen({ t: timeAxis, cooldown });

  // Gate by cast condition (zero out non-cast times)
  const gated = where(castCondition, raw, constant(0.0, raw.length));

  // Calculate running mean (cumulative average)
  const mean = runningMean(gated);

  return {
    key: equation.key,
    color: equation.color,
    raw,
    gated,
    mean
  };
}

/**
 * Build all series from enabled equations
 * @param {Array} equations - All equation definitions
 * @param {Set<string>} enabledKeys - Keys of enabled equations
 * @param {number[]} timeAxis - Time axis array
 * @param {number} cooldown - Current cooldown value
 * @param {boolean[]} castCondition - When casts happen
 * @returns {Array<{key: string, color: string, raw: number[], gated: number[], mean: number[]}>}
 */
export function buildAllSeries(equations, enabledKeys, timeAxis, cooldown, castCondition) {
  return equations
    .filter(eq => enabledKeys.has(eq.key))
    .map(eq => buildSeries(eq, timeAxis, cooldown, castCondition));
}

/**
 * Calculate combined DPS from multiple series (product of raw values)
 * @param {Array<{raw: number[]}>} series - Series to combine
 * @param {boolean[]} castCondition - When casts happen
 * @param {string} key - Name for the combined series
 * @param {string} color - Color for the combined series
 * @returns {{key: string, color: string, raw: number[], gated: number[], mean: number[]}}
 */
export function buildCombinedSeries(series, castCondition, key = 'Final DPS', color = '#ffffff') {
  // Extract raw values from all series
  const rawArrays = series.map(s => s.raw);

  // Calculate product of all raw values
  const combinedRaw = product(rawArrays);

  // Gate by cast condition
  const gated = where(castCondition, combinedRaw, constant(0.0, combinedRaw.length));

  // Calculate running mean
  const mean = runningMean(gated);

  return {
    key,
    color,
    raw: combinedRaw,
    gated,
    mean
  };
}

/**
 * Build equation groups with per-group cooldown isolation
 * @param {Array} equations - All equation definitions
 * @param {Array<{name: string, keys: Set<string>, color: string}>} groups - Group definitions
 * @param {number[]} timeAxis - Time axis array
 * @param {number} baseCooldown - Base cooldown value (before modifiers)
 * @param {number} castOffset - Cast offset
 * @returns {Array<{key: string, color: string, raw: number[], gated: number[], mean: number[], cooldown: number, modifiers: Array, castTimes: Array}>}
 */
export function buildGroupSeries(equations, groups, timeAxis, baseCooldown, castOffset) {
  return groups.map(group => {
    // Calculate cooldown for this specific group's equations
    const { cooldown, modifiers } = calculateCooldownForKeys(baseCooldown, equations, group.keys);

    // Create cast condition for this group's cooldown
    const castCondition = createCastCondition(timeAxis, cooldown, castOffset);

    // Build series for equations in this group with group-specific cooldown
    const groupSeries = equations
      .filter(eq => group.keys.has(eq.key))
      .map(eq => buildSeries(eq, timeAxis, cooldown, castCondition));

    // Combine into a single series for the group
    const combinedSeries = buildCombinedSeries(groupSeries, castCondition, group.name, group.color);

    // Add per-group cooldown data
    return {
      ...combinedSeries,
      cooldown,
      modifiers,
      castTimes: generateCastTimes(timeAxis[timeAxis.length - 1], cooldown, castOffset)
    };
  });
}
