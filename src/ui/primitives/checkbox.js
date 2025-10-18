/**
 * Reusable checkbox component
 * Emits events, doesn't manage state
 */

/**
 * Create a checkbox element
 * @param {Object} options
 * @param {string} options.id - Checkbox ID
 * @param {string} options.label - Label text
 * @param {boolean} [options.checked=true] - Initial checked state
 * @param {string} [options.color] - Border/indicator color
 * @param {Function} options.onChange - Change handler (receives checked state)
 * @returns {HTMLElement} Label element containing checkbox
 */
export function createCheckbox({ id, label, checked = true, color, onChange }) {
  const wrapper = document.createElement('label');
  wrapper.className = 'pill';
  if (color) {
    wrapper.style.borderColor = color;
  }

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.id = id;
  checkbox.checked = checked;

  checkbox.addEventListener('change', () => {
    onChange(checkbox.checked);
  });

  // Optional color indicator dot
  if (color) {
    const dot = document.createElement('span');
    dot.className = 'color-dot';
    dot.style.width = '10px';
    dot.style.height = '10px';
    dot.style.background = color;
    dot.style.borderRadius = '999px';
    dot.style.display = 'inline-block';
    wrapper.appendChild(checkbox);
    wrapper.appendChild(dot);
  } else {
    wrapper.appendChild(checkbox);
  }

  const text = document.createElement('span');
  text.textContent = label;
  wrapper.appendChild(text);

  return wrapper;
}

/**
 * Update checkbox checked state
 * @param {string} id - Checkbox ID
 * @param {boolean} checked - New checked state
 */
export function setCheckboxState(id, checked) {
  const checkbox = document.getElementById(id);
  if (checkbox) {
    checkbox.checked = checked;
  }
}
