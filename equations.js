// Equations module - returns array of equation defs
// Each equation: { key, color, gen({ t, cooldown }) -> 1-based multiplier array }

export function createEquations() {
  const T_MAX = 300;
  const t = Array.from({ length: T_MAX + 1 }, (_, i) => i);

  const map = (fn) => t.map((ti, i) => fn(ti, i));
  const constant = (v) => Array(t.length).fill(v);

  const eqDefs = [
    { key: 'Base', color: 'black', gen: () => constant(1.0) },
    { key: "World's Night", color: 'blue', gen: () => map((ti)=> 1.0 + Math.min(Math.floor(ti/40.0)*0.08, 5*0.08)) },
    { key: 'Toybox', color: 'orange', gen: () => map((ti)=> ti < 60 ? 1.48 : 1.0) },
    { key: 'Burning Will', color: 'green', gen: () => map((ti)=> ti < 90 ? 1.0 : 1.28) },
    { key: 'Doomsday', color: 'red', gen: () => map((ti)=> ti < 15 ? 1.8 : 0.9) },
    { key: 'Core Garden', color: 'purple', gen: ({cooldown}) => map((ti)=> ti < 15 ? 0.006 * 10 : 0.006 * cooldown) },
    { key: 'Cross Path', color: 'brown', gen: () => constant([...Array(8).keys()].reduce((acc, i)=> acc + Math.pow(1.04, i)/8.0, 0)) },
    { key: 'Little Corona', color: 'pink', gen: ({cooldown}) => {
        if (cooldown < 30) {
          return map((ti)=> ti < 15 ? 1.0 : (ti < 45 ? 1.16 : Math.pow(1.16, 2)));
        }
        return map((ti)=> ti < 15 ? 1.0 : 1.16);
      } },
    { key: 'Celestial', color: 'cyan', gen: () => constant(1.035) },
    { key: 'Cosmos Sky', color: 'grey', gen: () => constant(0.98 * 1.39)}
  ];

  return { t, eqDefs };
}
