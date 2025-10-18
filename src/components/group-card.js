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
      label: eq.key,
      color: eq.color
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

    // Cooldown display with tooltip (matching individual tab style)
    const cooldownWrapper = document.createElement('div');
    cooldownWrapper.className = 'tooltip-wrapper';
    cooldownWrapper.style.marginTop = '8px';

    const cooldownPill = document.createElement('div');
    cooldownPill.className = 'pill';
    cooldownPill.style.width = 'fit-content';
    cooldownPill.style.fontSize = '12px';

    if (this.group.cooldown !== undefined) {
      cooldownPill.textContent = `Cooldown: ${this.group.cooldown}s`;
    } else {
      cooldownPill.textContent = 'Cooldown: —';
    }

    const tooltipContent = document.createElement('div');
    tooltipContent.className = 'tooltip-content';

    // Generate tooltip text
    if (this.group.modifiers && this.group.modifiers.length > 0) {
      const lines = this.group.modifiers.map(m =>
        `• ${m.key} (${m.from.toFixed(1)}s → ${m.to.toFixed(1)}s)`
      );
      tooltipContent.textContent = `Modifiers applied:\n${lines.join('\n')}`;
    } else {
      tooltipContent.textContent = 'No cooldown modifiers active';
    }

    // Setup tooltip interaction
    cooldownPill.addEventListener('mouseenter', () => {
      tooltipContent.classList.add('visible');
    });
    cooldownPill.addEventListener('mouseleave', () => {
      tooltipContent.classList.remove('visible');
    });

    cooldownWrapper.appendChild(cooldownPill);
    cooldownWrapper.appendChild(tooltipContent);

    // Assemble card
    card.appendChild(header);
    card.appendChild(this.multiSelect.element);
    card.appendChild(cooldownWrapper);

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
