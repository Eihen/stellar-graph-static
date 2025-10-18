/**
 * Equation definitions
 * Each equation represents a buff/modifier that affects DPS
 */

/**
 * Create time axis and equation definitions
 * @param {number} maxTime - Maximum simulation time
 * @returns {{timeAxis: number[], equations: Array}}
 */
export function createEquations(maxTime = 300) {
  // Time axis: [0, 1, 2, ..., maxTime]
  const timeAxis = Array.from({ length: maxTime + 1 }, (_, i) => i);

  // Helper for constant arrays
  const constant = (value) => Array(timeAxis.length).fill(value);

  // Helper for time-based mapping
  const map = (fn) => timeAxis.map((t, i) => fn(t, i));

  // Game-specific constant
  const hits = 8.0;

  // Equation definitions
  const equations = [
    {
      key: "World's Night",
      color: 'blue',
      gen: () => map((t) => 1.0 + Math.min(Math.floor(t / 40.0) * 0.08, 5 * 0.08))
    },

    {
      key: 'Toybox',
      color: 'orange',
      gen: () => map((t) => t < 60 ? 1.48 : 1.0)
    },

    {
      key: 'Burning Will',
      color: 'green',
      gen: () => map((t) => t < 90 ? 1.0 : 1.28)
    },

    {
      key: 'Doomsday',
      color: 'red',
      gen: () => map((t) => t < 15 ? 1.8 : 0.9)
    },

    {
      key: 'Core Garden',
      color: 'purple',
      gen: ({ cooldown }) => map((t) => 1.0 + (t < 15 ? 0.006 * 10 : 0.006 * cooldown))
    },

    {
      key: 'Cross Path',
      color: 'brown',
      gen: () => constant(
        [...Array(hits).keys()].reduce((acc, i) => acc + Math.pow(1.04, i) / hits, 0)
      )
    },

    {
      key: 'Little Corona',
      color: 'pink',
      gen: ({ cooldown }) => {
        if (cooldown < 30) {
          return map((t) => t < 15 ? 1.0 : (t < 45 ? 1.16 : Math.pow(1.16, 2)));
        }
        return map((t) => t < 15 ? 1.0 : 1.16);
      }
    },

    {
      key: 'Celestial',
      color: 'cyan',
      gen: () => constant(1.035),
      cooldownModifier: (cooldown) => cooldown - 3
    },

    {
      key: 'Cosmos Sky',
      color: 'grey',
      gen: () => constant(0.98 * 1.39)
    },

    {
      key: 'Evolution & Growth',
      color: 'aquamarine',
      gen: () => map((t) => 1.0 + (t < 15 ? 0 : 0.014 * hits))
    }
  ];

  return { timeAxis, equations };
}
