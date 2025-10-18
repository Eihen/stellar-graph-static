/**
 * EquationToggles - Renders equation toggle checkboxes
 *
 * Listens to: STATE_HYDRATED, EQUATIONS_RESET (to update UI)
 * Emits: Calls StateManager methods to trigger events
 */

import { Events } from '../events/event-types.js';
import { createCheckbox } from '../ui/primitives/checkbox.js';

export class EquationToggles {
  constructor(eventBus, stateManager, containerId, equations) {
    this.eventBus = eventBus;
    this.stateManager = stateManager;
    this.container = document.getElementById(containerId);
    this.equations = equations;

    if (!this.container) {
      console.error(`EquationToggles: Container #${containerId} not found`);
      return;
    }

    // Listen to state hydration and reset events to update UI
    this.eventBus.on(Events.STATE_HYDRATED, this.render.bind(this));
    this.eventBus.on(Events.EQUATIONS_RESET, this.render.bind(this));

    // Initial render
    this.render();
  }

  /**
   * Render equation toggles
   */
  render() {
    this.container.innerHTML = '';
    this.container.className = 'eqs';

    const state = this.stateManager.getState();

    this.equations.forEach(eq => {
      const id = `eq-${eq.key.replace(/\s+/g, '-')}`;
      const checkbox = createCheckbox({
        id,
        label: eq.key,
        checked: state.enabledKeys.has(eq.key),
        color: eq.color,
        onChange: () => {
          // Call state manager to toggle equation
          this.stateManager.toggleEquation(eq.key);
        }
      });

      this.container.appendChild(checkbox);
    });
  }
}
