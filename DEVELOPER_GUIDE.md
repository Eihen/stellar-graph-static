# Developer Guide

This guide shows you how to add features, debug, and extend the Stellar Simulator.

## Table of Contents

1. [Adding Features](#adding-features)
2. [Adding New Equations](#adding-new-equations)
3. [Adding UI Components](#adding-ui-components)
4. [Adding Events](#adding-events)
5. [Debugging](#debugging)
6. [Testing](#testing)
7. [Common Patterns](#common-patterns)

## Adding Features

The event-driven architecture makes it easy to add new features without modifying existing code.

### Example: Add "Export to CSV" Button

**Step 1:** Create the component ([src/components/export-button.js](src/components/export-button.js)):

```javascript
import { Events } from '../events/event-types.js';

export class ExportButton {
  constructor(eventBus, buttonId) {
    this.eventBus = eventBus;
    this.button = document.getElementById(buttonId);
    this.data = null;

    // Listen to calculations to get data
    this.eventBus.on(Events.CALCULATIONS_UPDATED, this.onDataReady.bind(this));

    // Setup click handler
    this.button.addEventListener('click', this.export.bind(this));
  }

  onDataReady({ series }) {
    this.data = series;
  }

  export() {
    if (!this.data) return;

    // Convert to CSV
    const csv = this.convertToCSV(this.data);

    // Download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'stellar-results.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  convertToCSV(series) {
    // Implementation...
  }
}
```

**Step 2:** Add to [src/app.js](src/app.js):

```javascript
import { ExportButton } from './components/export-button.js';

export function createApp() {
  // ... existing setup

  // Add export button
  const exportButton = new ExportButton(eventBus, 'exportBtn');

  // ... rest of setup
}
```

**Step 3:** Add button to [index.html](index.html):

```html
<button id="exportBtn">Export to CSV</button>
```

That's it! No need to edit any existing components.

## Adding New Equations

Equations are defined in [src/config/equations.js](src/config/equations.js). The UI and calculations update automatically when you add new equations.

### Basic Equation

```javascript
{
  key: 'My New Buff',
  color: '#ff6b6b',
  gen: ({t, cooldown}) => {
    return t.map(timeInSeconds => {
      // Return multiplier at this time
      return timeInSeconds < 60 ? 1.5 : 1.0; // 50% buff for 1 minute
    });
  }
}
```

### Equation with Cooldown Modifier

Some equations reduce the global cooldown:

```javascript
{
  key: 'Celestial',
  color: '#4ecdc4',
  cooldownModifier: (cd) => cd - 3, // Reduces cooldown by 3 seconds
  gen: ({t, cooldown}) => {
    return t.map(timeInSeconds => 1.15); // Constant 15% buff
  }
}
```

### Equation with Stacking Behavior

```javascript
{
  key: 'World\'s Night',
  color: '#95e1d3',
  gen: ({t, cooldown}) => {
    return t.map(timeInSeconds => {
      const stacks = Math.floor(timeInSeconds / 40); // Stack every 40s
      return 1 + (stacks * 0.05); // 5% per stack
    });
  }
}
```

### Equation that Scales with Cooldown

```javascript
{
  key: 'Core Garden',
  color: '#f38181',
  gen: ({t, cooldown}) => {
    // Stronger when cooldown is higher
    const bonus = cooldown / 30; // 100% bonus at 30s cooldown
    return t.map(timeInSeconds => 1 + bonus);
  }
}
```

### Equation with Time-Based Behavior

```javascript
{
  key: 'Toybox',
  color: '#aa96da',
  gen: ({t, cooldown}) => {
    return t.map(timeInSeconds => {
      if (timeInSeconds <= 60) return 1.8; // Strong buff for 1 minute
      if (timeInSeconds <= 120) return 1.3; // Weaker for next minute
      return 1.0; // No buff after 2 minutes
    });
  }
}
```

### Parameters Available to Equations

The `gen` function receives an object with:

- `t` - Array of time points (0-300 seconds by default)
- `cooldown` - Current global cooldown value
- `baseCooldown` - Base cooldown before modifiers (30s)

## Adding UI Components

All UI components follow the same pattern:

### Component Template

```javascript
import { Events } from '../events/event-types.js';

export class MyComponent {
  constructor(eventBus, stateManager, containerId) {
    this.eventBus = eventBus;
    this.stateManager = stateManager;
    this.container = document.getElementById(containerId);

    // Setup event listeners
    this.setupListeners();

    // Initial render
    this.render();
  }

  setupListeners() {
    // Listen to events this component cares about
    this.eventBus.on(Events.SOME_EVENT, this.onEventHandler.bind(this));
  }

  onEventHandler(detail) {
    // Handle event
    this.render();
  }

  render() {
    // Update DOM
    this.container.innerHTML = '...';
  }
}
```

### Component Best Practices

1. **Self-Contained** - Component manages its own DOM
2. **Event-Driven** - Only update when relevant events occur
3. **No Cross-Talk** - Don't call other components directly
4. **State via Events** - Call `stateManager.method()` to change state
5. **No Side Effects** - Don't modify state directly

### Example: Adding a Statistics Panel

```javascript
import { Events } from '../events/event-types.js';

export class StatisticsPanel {
  constructor(eventBus, containerId) {
    this.eventBus = eventBus;
    this.container = document.getElementById(containerId);

    // Listen to calculations
    this.eventBus.on(Events.CALCULATIONS_UPDATED, this.update.bind(this));
  }

  update({ series }) {
    // Calculate statistics
    const stats = this.calculateStats(series);

    // Render
    this.container.innerHTML = `
      <h3>Statistics</h3>
      <ul>
        <li>Average DPS: ${stats.avg.toFixed(2)}</li>
        <li>Max DPS: ${stats.max.toFixed(2)}</li>
        <li>Min DPS: ${stats.min.toFixed(2)}</li>
      </ul>
    `;
  }

  calculateStats(series) {
    // Implementation...
  }
}
```

## Adding Events

### Step 1: Define Event Type

Add to [src/events/event-types.js](src/events/event-types.js):

```javascript
export const Events = {
  // ... existing events
  EXPORT_REQUESTED: 'export:requested',
  FILTER_CHANGED: 'filter:changed',
};
```

### Step 2: Emit the Event

From StateManager or any component:

```javascript
this.eventBus.emit(Events.FILTER_CHANGED, {
  filter: 'top-3',
  threshold: 1.5
});
```

### Step 3: Listen to the Event

In any component:

```javascript
this.eventBus.on(Events.FILTER_CHANGED, this.applyFilter.bind(this));
```

### Event Naming Convention

- Use namespaced format: `category:action`
- Examples:
  - `equation:toggled`
  - `theme:changed`
  - `calculations:updated`
  - `export:requested`

### Event Payload Best Practices

1. **Include all relevant data** - Listeners shouldn't need to query state
2. **Use descriptive keys** - `{ key, enabled }` not `{ k, e }`
3. **Immutable data** - Send copies, not references
4. **Consistent structure** - Same event type should have same payload shape

## Debugging

### Enable Debug Logging

Debug logging is automatically enabled on `localhost`:

```javascript
// In browser console
window.app.eventBus.enableDebug();

// You'll see all events logged:
// [EventBus] equation:toggled { key: 'Celestial', enabled: false, ... }
// [EventBus] calculations:updated { series: [...], cooldown: 30 }
```

### Inspect Current State

```javascript
// Get current state
const state = window.app.getState();
console.log(state);

// Example output:
// {
//   enabledKeys: Set(['Toybox', 'World's Night']),
//   theme: 'dark',
//   selectedBreakpoints: Set([60, 120, 180]),
//   ...
// }
```

### Trigger Test Events

```javascript
// Emit a test event
window.app.emit(Events.EQUATION_TOGGLED, {
  key: 'Toybox',
  enabled: false
});

// Watch the event flow in debug logs
```

### Trace Event Flow

Add logging to component event handlers:

```javascript
setupListeners() {
  this.eventBus.on(Events.CALCULATIONS_UPDATED, (detail) => {
    console.log('[ChartComponent] Received CALCULATIONS_UPDATED:', detail);
    this.render(detail);
  });
}
```

### Common Issues

**Problem:** Component not updating

```javascript
// Check if component is listening to the right event
console.log('Listening to:', Events.CALCULATIONS_UPDATED);

// Verify event is being emitted
window.app.eventBus.enableDebug();
```

**Problem:** State not persisting

```javascript
// Check StorageManager is listening
// Look for errors in console
// Check localStorage in DevTools
localStorage.getItem('stellarState');
```

**Problem:** Calculations not running

```javascript
// Check CalculationManager is set up
window.app.calculationManager.forceRecalculate();
```

## Testing

### Testing Components in Isolation

```javascript
import { ChartComponent } from './components/chart-component.js';
import { Events } from './events/event-types.js';

describe('ChartComponent', () => {
  let mockEventBus;
  let component;

  beforeEach(() => {
    // Mock event bus
    mockEventBus = {
      on: jest.fn(),
      emit: jest.fn()
    };

    // Create component
    component = new ChartComponent(mockEventBus, 'chart', options);
  });

  test('subscribes to CALCULATIONS_UPDATED', () => {
    expect(mockEventBus.on).toHaveBeenCalledWith(
      Events.CALCULATIONS_UPDATED,
      expect.any(Function)
    );
  });

  test('renders chart when calculations update', () => {
    // Get the handler that was registered
    const handler = mockEventBus.on.mock.calls[0][1];

    // Trigger event
    handler({ series: [...], cooldown: 30 });

    // Verify chart was rendered
    // (check DOM, Plotly.newPlot calls, etc.)
  });
});
```

### Testing Event Flow

```javascript
describe('Event Flow', () => {
  test('toggling equation triggers calculations', async () => {
    const app = createApp();

    // Toggle equation
    app.stateManager.toggleEquation('Celestial');

    // Wait for calculations
    await waitFor(() => {
      expect(app.calculationManager.getLastResults()).toBeDefined();
    });
  });
});
```

### Testing Pure Functions

```javascript
import { calculate } from './core/calculator.js';

describe('calculate', () => {
  test('calculates correct cooldown with modifiers', () => {
    const result = calculate({
      enabledKeys: new Set(['Celestial']),
      equations: [
        { key: 'Celestial', cooldownModifier: cd => cd - 3, ... }
      ],
      baseCooldown: 30,
      t: [0, 1, 2]
    });

    expect(result.cooldown).toBe(27);
  });
});
```

## Common Patterns

### Pattern: State Change

```javascript
// In UI component
onClick() {
  // Call StateManager method
  this.stateManager.toggleEquation('Toybox');

  // StateManager handles:
  // 1. Update state
  // 2. Emit event
  // 3. All listeners update
}
```

### Pattern: Component Listening to Multiple Events

```javascript
setupListeners() {
  this.eventBus.on(Events.CALCULATIONS_UPDATED, this.onCalculations.bind(this));
  this.eventBus.on(Events.THEME_CHANGED, this.onTheme.bind(this));
}

onCalculations({ series }) {
  this.series = series;
  this.render();
}

onTheme({ theme }) {
  this.theme = theme;
  this.render();
}
```

### Pattern: Conditional Rendering

```javascript
render() {
  // Only render if we have data
  if (!this.series || this.series.length === 0) {
    this.container.innerHTML = '<p>No data available</p>';
    return;
  }

  // Render normally
  this.container.innerHTML = '...';
}
```

### Pattern: Cleanup

```javascript
destroy() {
  // Remove event listeners
  this.eventBus.off(Events.CALCULATIONS_UPDATED, this.onCalculations);

  // Clean up DOM
  this.container.innerHTML = '';

  // Remove references
  this.eventBus = null;
  this.stateManager = null;
}
```

### Pattern: Derived State

```javascript
onCalculations({ series, cooldown }) {
  // Store raw data
  this.series = series;

  // Derive computed values
  this.topSeries = this.series
    .sort((a, b) => b.y[b.y.length - 1] - a.y[a.y.length - 1])
    .slice(0, 3);

  this.render();
}
```

## File Organization

When adding new files:

```
src/
├── components/       # UI components (classes)
├── ui/primitives/    # Reusable UI elements (functions)
├── core/             # Pure calculation logic (functions)
├── config/           # Configuration (data)
├── events/           # Event system (EventBus, types)
├── state/            # State management
└── managers/         # Orchestration (CalculationManager)
```

**Guidelines:**
- **Components** are classes that listen to events
- **Primitives** are functions that return DOM elements
- **Core** functions have no side effects
- **Config** is pure data
- **Managers** orchestrate between components

## See Also

- [ARCHITECTURE.md](ARCHITECTURE.md) - System architecture and event flow
- [API_REFERENCE.md](API_REFERENCE.md) - Detailed API documentation
- [README.md](README.md) - Quick start and overview
