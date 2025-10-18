/**
 * CooldownDisplay - Displays current cooldown value
 *
 * Listens to: COOLDOWN_CHANGED
 * Updates: Cooldown display text and tooltip
 */

import { Events } from '../events/event-types.js';
import { createTooltip } from '../ui/primitives/tooltip.js';

export class CooldownDisplay {
  constructor(eventBus, elementId) {
    this.eventBus = eventBus;
    this.element = document.getElementById(elementId);

    if (!this.element) {
      console.error(`CooldownDisplay: Element #${elementId} not found`);
      return;
    }

    this.currentCooldown = null;
    this.currentModifiers = [];

    // Setup tooltip
    this.setupTooltip();

    // Listen to cooldown changes
    this.eventBus.on(Events.COOLDOWN_CHANGED, this.update.bind(this));
  }

  /**
   * Setup tooltip for cooldown display
   */
  setupTooltip() {
    this.tooltip = createTooltip(this.element.id, () => {
      if (!this.currentModifiers || this.currentModifiers.length === 0) {
        return 'No cooldown modifiers active';
      }

      const lines = this.currentModifiers.map(m =>
        `• ${m.key} (${m.from.toFixed(1)}s → ${m.to.toFixed(1)}s)`
      );
      return `Modifiers applied:\n${lines.join('\n')}`;
    });
  }

  /**
   * Update cooldown display
   * @param {Object} detail - { cooldown, modifiers }
   */
  update({ cooldown, modifiers }) {
    this.currentCooldown = cooldown;
    this.currentModifiers = modifiers;

    // Update display text
    if (modifiers.length > 0) {
      this.element.textContent = `Stellar Cooldown: ${cooldown.toFixed(1)}s`;
    } else {
      this.element.textContent = `Stellar Cooldown: ${cooldown}s`;
    }

    // Update tooltip if it exists
    if (this.tooltip) {
      this.tooltip.update();
    }
  }
}
