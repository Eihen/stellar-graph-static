/**
 * Reusable tooltip component
 * Shows informational tooltips on hover/click
 */

/**
 * Setup tooltip for an element
 * @param {string} elementId - Target element ID
 * @param {Function} getContent - Function that returns tooltip content (string or HTML)
 * @returns {Object} API for controlling tooltip
 */
export function createTooltip(elementId, getContent) {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element #${elementId} not found`);
    return null;
  }

  // Create tooltip wrapper if it doesn't exist
  let wrapper = element.closest('.tooltip-wrapper');
  if (!wrapper) {
    wrapper = document.createElement('div');
    wrapper.className = 'tooltip-wrapper';
    element.parentNode.insertBefore(wrapper, element);
    wrapper.appendChild(element);
  }

  // Create tooltip content element
  let tooltipContent = wrapper.querySelector('.tooltip-content');
  if (!tooltipContent) {
    tooltipContent = document.createElement('div');
    tooltipContent.className = 'tooltip-content';
    wrapper.appendChild(tooltipContent);
  }

  let isTooltipVisible = false;
  let isMouseOverTooltip = false;
  let isMouseOverElement = false;

  // Update content
  const updateContent = () => {
    const content = getContent();
    if (typeof content === 'string') {
      tooltipContent.textContent = content;
    } else {
      tooltipContent.innerHTML = '';
      tooltipContent.appendChild(content);
    }
  };

  // Show tooltip
  const show = () => {
    updateContent();
    tooltipContent.classList.add('visible');
    isTooltipVisible = true;
  };

  // Hide tooltip
  const hide = () => {
    tooltipContent.classList.remove('visible');
    isTooltipVisible = false;
  };

  // Click to toggle
  element.addEventListener('click', (e) => {
    e.stopPropagation();
    if (isTooltipVisible) {
      hide();
    } else {
      show();
    }
  });

  // Hover to show
  element.addEventListener('mouseenter', () => {
    isMouseOverElement = true;
    show();
  });

  element.addEventListener('mouseleave', () => {
    isMouseOverElement = false;
    setTimeout(() => {
      if (!isMouseOverTooltip && !isTooltipVisible) {
        hide();
      }
    }, 100);
  });

  tooltipContent.addEventListener('mouseenter', () => {
    isMouseOverTooltip = true;
  });

  tooltipContent.addEventListener('mouseleave', () => {
    isMouseOverTooltip = false;
    if (!isTooltipVisible) {
      hide();
    }
  });

  // Click outside to close
  document.addEventListener('click', () => {
    hide();
  });

  return {
    show,
    hide,
    update: updateContent
  };
}
