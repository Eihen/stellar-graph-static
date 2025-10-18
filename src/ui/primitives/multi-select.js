/**
 * MultiSelect - A dropdown component for selecting multiple items
 * Pure UI primitive with no dependencies on application state
 */

/**
 * Create a multi-select dropdown
 * @param {Object} options - Configuration options
 * @param {string} options.id - Unique ID for the select element
 * @param {Array<{value: string, label: string}>} options.items - Items to select from
 * @param {Set<string>} options.selected - Currently selected values
 * @param {number} options.maxItems - Maximum number of items that can be selected
 * @param {Function} options.onChange - Callback when selection changes (selected: Set<string>) => void
 * @param {Set<string>} [options.disabled] - Values that should be disabled
 * @returns {HTMLElement} The multi-select container element
 */
export function createMultiSelect({ id, items, selected, maxItems, onChange, disabled = new Set() }) {
  const container = document.createElement('div');
  container.className = 'multi-select';
  container.id = id;

  // Create display area
  const display = document.createElement('div');
  display.className = 'multi-select-display';

  // Create dropdown
  const dropdown = document.createElement('div');
  dropdown.className = 'multi-select-dropdown';
  dropdown.style.display = 'none';

  // Render selected items
  const renderDisplay = () => {
    if (selected.size === 0) {
      display.innerHTML = '<span class="multi-select-placeholder">Select equations...</span>';
    } else {
      const selectedItems = items.filter(item => selected.has(item.value));
      display.innerHTML = selectedItems.map(item =>
        `<span class="multi-select-tag">
          ${item.label}
          <button class="multi-select-remove" data-value="${item.value}" type="button">&times;</button>
        </span>`
      ).join('');
    }

    // Add dropdown arrow
    const arrow = document.createElement('span');
    arrow.className = 'multi-select-arrow';
    arrow.textContent = '▼';
    display.appendChild(arrow);
  };

  // Render dropdown items
  const renderDropdown = () => {
    dropdown.innerHTML = '';

    items.forEach(item => {
      const isSelected = selected.has(item.value);
      const isDisabled = disabled.has(item.value);
      const isMaxReached = !isSelected && selected.size >= maxItems;

      const option = document.createElement('div');
      option.className = 'multi-select-option';

      if (isSelected) option.classList.add('selected');
      if (isDisabled || isMaxReached) option.classList.add('disabled');

      option.innerHTML = `
        <input
          type="checkbox"
          ${isSelected ? 'checked' : ''}
          ${isDisabled || isMaxReached ? 'disabled' : ''}
        />
        <span>${item.label}</span>
      `;

      if (!isDisabled && !isMaxReached) {
        option.addEventListener('click', (e) => {
          e.stopPropagation();
          const newSelected = new Set(selected);

          if (isSelected) {
            newSelected.delete(item.value);
          } else if (newSelected.size < maxItems) {
            newSelected.add(item.value);
          }

          onChange(newSelected);
        });
      }

      dropdown.appendChild(option);
    });
  };

  // Toggle dropdown
  display.addEventListener('click', (e) => {
    // Don't toggle if clicking remove button
    if (e.target.classList.contains('multi-select-remove')) {
      return;
    }

    const isOpen = dropdown.style.display === 'block';
    dropdown.style.display = isOpen ? 'none' : 'block';
  });

  // Handle remove button clicks
  display.addEventListener('click', (e) => {
    if (e.target.classList.contains('multi-select-remove')) {
      e.stopPropagation();
      const value = e.target.dataset.value;
      const newSelected = new Set(selected);
      newSelected.delete(value);
      onChange(newSelected);
    }
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!container.contains(e.target)) {
      dropdown.style.display = 'none';
    }
  });

  // Initial render
  renderDisplay();
  renderDropdown();

  container.appendChild(display);
  container.appendChild(dropdown);

  // Return API for updating the component
  return {
    element: container,
    update: (newSelected) => {
      selected = newSelected;
      renderDisplay();
      renderDropdown();
    }
  };
}
