/**
 * Cooldown calculation logic
 * Pure functions with no side effects
 */

/**
 * Calculate effective cooldown by applying modifiers from enabled equations
 * @param {number} baseCooldown - Base cooldown value
 * @param {Array<{key: string, cooldownModifier?: Function}>} equations - All equations
 * @param {Set<string>} enabledKeys - Keys of enabled equations
 * @returns {{cooldown: number, modifiers: Array<{key: string, from: number, to: number}>}}
 */
export function calculateCooldown(baseCooldown, equations, enabledKeys) {
  let currentCooldown = baseCooldown;
  const modifiers = [];

  // Get enabled equations with cooldown modifiers
  const activeModifiers = equations
    .filter(eq => enabledKeys.has(eq.key) && eq.cooldownModifier);

  // Apply each modifier sequentially
  for (const eq of activeModifiers) {
    const previousCooldown = currentCooldown;
    currentCooldown = eq.cooldownModifier(currentCooldown);

    // Track if modifier actually changed the cooldown
    if (currentCooldown !== previousCooldown) {
      modifiers.push({
        key: eq.key,
        from: previousCooldown,
        to: currentCooldown
      });
    }
  }

  return { cooldown: currentCooldown, modifiers };
}

/**
 * Generate cast times based on cooldown and offset
 * @param {number} maxTime - Maximum simulation time
 * @param {number} cooldown - Cooldown period
 * @param {number} offset - Offset for first cast
 * @returns {number[]} Array of cast times
 * @example generateCastTimes(100, 30, 10) → [10, 40, 70, 100]
 */
export function generateCastTimes(maxTime, cooldown, offset = 10) {
  const castTimes = [];
  for (let t = offset; t <= maxTime; t += cooldown) {
    castTimes.push(t);
  }
  return castTimes;
}

/**
 * Create a cast condition array (boolean array indicating when casts happen)
 * @param {number[]} timeAxis - Time axis array
 * @param {number} cooldown - Cooldown period
 * @param {number} offset - Offset for first cast
 * @returns {boolean[]} Cast condition array
 */
export function createCastCondition(timeAxis, cooldown, offset = 10) {
  return timeAxis.map(t => t % cooldown === offset);
}
