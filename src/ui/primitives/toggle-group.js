/**
 * Reusable toggle group component
 * Renders a group of checkboxes
 */

/**
 * Create a toggle group
 * @param {Object} options
 * @param {string} options.containerId - Container element ID
 * @param {Array<{value: any, label: string, checked?: boolean}>} options.items - Items to render
 * @param {Function} options.onChange - Change handler (receives array of selected values)
 * @param {string} [options.className='toggle-group'] - CSS class name
 */
export function createToggleGroup({ containerId, items, onChange, className = 'toggle-group' }) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container #${containerId} not found`);
    return;
  }

  container.innerHTML = '';
  container.className = className;

  const checkboxes = items.map((item, index) => {
    const label = document.createElement('label');
    label.className = 'toggle-item';
    label.style.display = 'flex';
    label.style.alignItems = 'center';
    label.style.gap = '4px';
    label.style.fontSize = '12px';
    label.style.opacity = '0.8';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = item.checked !== false; // Default to checked
    checkbox.dataset.value = JSON.stringify(item.value);

    checkbox.addEventListener('change', () => {
      // Collect all selected values
      const selected = Array.from(container.querySelectorAll('input[type="checkbox"]:checked'))
        .map(cb => JSON.parse(cb.dataset.value));
      onChange(selected);
    });

    const text = document.createElement('span');
    text.textContent = item.label;

    label.appendChild(checkbox);
    label.appendChild(text);
    container.appendChild(label);

    return checkbox;
  });

  return {
    // Return API for external control
    setValues(selectedValues) {
      checkboxes.forEach((checkbox, i) => {
        const value = items[i].value;
        checkbox.checked = selectedValues.includes(value);
      });
    },
    getValues() {
      return checkboxes
        .map((cb, i) => cb.checked ? items[i].value : null)
        .filter(v => v !== null);
    }
  };
}

/**
 * Update toggle group items (re-render)
 * @param {Object} options - Same as createToggleGroup
 */
export function updateToggleGroup(options) {
  return createToggleGroup(options);
}
