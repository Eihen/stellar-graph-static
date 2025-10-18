/**
 * GroupCard - Displays a single group with equation selection
 *
 * Self-contained component for managing one group
 */

import { createMultiSelect } from '../ui/primitives/multi-select.js';
import { MAX_EQUATIONS_PER_GROUP } from '../config/constants.js';

export class GroupCard {
  constructor(group, equations, onUpdate, onRemove) {
    this.group = group;
    this.equations = equations;
    this.onUpdate = onUpdate;
    this.onRemove = onRemove;
    this.multiSelect = null;
  }

  /**
   * Render the group card
   * @returns {HTMLElement}
   */
  render() {
    const card = document.createElement('div');
    card.className = 'group-card';

    // Header
    const header = document.createElement('div');
    header.className = 'group-card-header';

    const nameDiv = document.createElement('div');
    nameDiv.className = 'group-name';
    nameDiv.innerHTML = `
      <span class="group-color-indicator" style="background-color: ${this.group.color};"></span>
      <span>${this.group.name}</span>
    `;

    header.appendChild(nameDiv);

    // Multi-select for equations
    const equationItems = this.equations.map(eq => ({
      value: eq.key,
      label: eq.key
    }));

    // Create disabled set: equations already in this group's keys
    // (prevents duplicates within the same group)
    const getDisabledItems = () => {
      const disabled = new Set();
      // No items are inherently disabled, validation happens at max items
      return disabled;
    };

    this.multiSelect = createMultiSelect({
      id: `group-select-${this.group.name.replace(/\s+/g, '-')}`,
      items: equationItems,
      selected: new Set(this.group.keys),
      maxItems: MAX_EQUATIONS_PER_GROUP,
      disabled: getDisabledItems(),
      onChange: (newSelected) => {
        this.onUpdate(this.group.name, { keys: newSelected });
      }
    });

    // Cooldown display
    const cooldownDiv = document.createElement('div');
    cooldownDiv.className = 'group-cooldown';
    if (this.group.cooldown !== undefined) {
      const modifiersText = this.group.modifiers && this.group.modifiers.length > 0
        ? ` (modified by: ${this.group.modifiers.map(m => m.key).join(', ')})`
        : '';
      cooldownDiv.textContent = `Cooldown: ${this.group.cooldown}s${modifiersText}`;
    } else {
      cooldownDiv.textContent = 'Cooldown: Not calculated yet';
    }

    // Assemble card
    card.appendChild(header);
    card.appendChild(this.multiSelect.element);
    card.appendChild(cooldownDiv);

    return card;
  }

  /**
   * Update the multi-select with new selected values
   * @param {Set<string>} newSelected
   */
  updateSelection(newSelected) {
    if (this.multiSelect) {
      this.multiSelect.update(newSelected);
    }
  }
}
