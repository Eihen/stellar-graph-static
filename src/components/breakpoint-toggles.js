/**
 * BreakpointToggles - Renders breakpoint selection toggles
 *
 * Listens to: STATE_HYDRATED (to restore saved selections)
 * Emits: Calls StateManager to trigger BREAKPOINTS_CHANGED
 */

import { Events } from '../events/event-types.js';
import { createToggleGroup } from '../ui/primitives/toggle-group.js';

export class BreakpointToggles {
  constructor(eventBus, stateManager, containerId, breakpoints) {
    this.eventBus = eventBus;
    this.stateManager = stateManager;
    this.containerId = containerId;
    this.breakpoints = breakpoints;

    // Listen to state hydration to re-render with saved state
    this.eventBus.on(Events.STATE_HYDRATED, this.render.bind(this));

    this.render();
  }

  /**
   * Render breakpoint toggles
   */
  render() {
    const state = this.stateManager.getState();

    this.toggleGroup = createToggleGroup({
      containerId: this.containerId,
      items: this.breakpoints.map(bp => ({
        value: bp,
        label: `${bp}s`,
        checked: state.selectedBreakpoints.has(bp)
      })),
      onChange: (selected) => {
        // Call state manager to update breakpoints
        this.stateManager.updateBreakpoints(selected);
      }
    });
  }
}
