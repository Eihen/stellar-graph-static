/**
 * CastTimeToggles - Renders cast time selection toggles
 *
 * Listens to: COOLDOWN_CHANGED (regenerates toggles)
 * Emits: Calls StateManager to trigger CAST_TIMES_CHANGED
 */

import { Events } from '../events/event-types.js';
import { createToggleGroup } from '../ui/primitives/toggle-group.js';

export class CastTimeToggles {
  constructor(eventBus, stateManager, containerId) {
    this.eventBus = eventBus;
    this.stateManager = stateManager;
    this.containerId = containerId;

    // Listen to cooldown changes to regenerate toggles
    this.eventBus.on(Events.COOLDOWN_CHANGED, this.regenerate.bind(this));
  }

  /**
   * Regenerate toggles when cooldown changes
   * @param {Object} detail - { castTimes }
   */
  regenerate({ castTimes }) {
    const state = this.stateManager.getState();

    // Check if we need to reset selected cast times
    // (happens when cooldown changes and old cast times are invalid)
    const needsReset = state.selectedCastTimes.size === 0 ||
                       !castTimes.includes(Array.from(state.selectedCastTimes)[0]);

    if (needsReset) {
      // Select all new cast times by default
      this.stateManager.updateCastTimes(castTimes);
    }

    this.render(castTimes);
  }

  /**
   * Render cast time toggles
   * @param {Array<number>} castTimes - Available cast times
   */
  render(castTimes) {
    const state = this.stateManager.getState();

    this.toggleGroup = createToggleGroup({
      containerId: this.containerId,
      items: castTimes.map(ct => ({
        value: ct,
        label: `${ct}s`,
        checked: state.selectedCastTimes.has(ct)
      })),
      onChange: (selected) => {
        // Call state manager to update cast times
        this.stateManager.updateCastTimes(selected);
      }
    });
  }
}
