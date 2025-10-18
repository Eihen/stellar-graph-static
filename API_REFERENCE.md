# API Reference

Complete API documentation for all modules in the Stellar Simulator.

## Table of Contents

1. [Event System](#event-system)
2. [State Management](#state-management)
3. [Managers](#managers)
4. [Components](#components)
5. [UI Primitives](#ui-primitives)
6. [Core Calculations](#core-calculations)
7. [Configuration](#configuration)

---

## Event System

### EventBus

**Location:** [src/events/event-bus.js](src/events/event-bus.js)

Central event dispatcher using browser's native CustomEvent API.

#### Constructor

```javascript
new EventBus()
```

Creates a new EventBus instance.

#### Methods

##### `emit(eventType, detail = {})`

Emits an event to all listeners.

**Parameters:**
- `eventType` (string) - Event type constant from `Events`
- `detail` (Object) - Event payload data

**Returns:** void

**Example:**
```javascript
eventBus.emit(Events.EQUATION_TOGGLED, {
  key: 'Celestial',
  enabled: false,
  enabledKeys: new Set(['Toybox'])
});
```

##### `on(eventType, handler)`

Subscribe to an event.

**Parameters:**
- `eventType` (string) - Event type to listen for
- `handler` (Function) - Callback function `(detail) => void`

**Returns:** Function - Unsubscribe function

**Example:**
```javascript
const unsubscribe = eventBus.on(Events.CALCULATIONS_UPDATED, (detail) => {
  console.log('Calculations updated:', detail);
});

// Later: unsubscribe()
```

##### `off(eventType, handler)`

Unsubscribe from an event.

**Parameters:**
- `eventType` (string) - Event type
- `handler` (Function) - Original handler function

**Returns:** void

##### `once(eventType, handler)`

Subscribe to an event for one-time execution.

**Parameters:**
- `eventType` (string) - Event type
- `handler` (Function) - Callback function

**Returns:** Function - Unsubscribe function

##### `clear()`

Remove all event listeners.

**Returns:** void

##### `enableDebug()`

Enable debug logging (automatically enabled on localhost).

**Returns:** void

**Example:**
```javascript
eventBus.enableDebug();
// Console will now log: [EventBus] event:type { ...payload }
```

---

### Events

**Location:** [src/events/event-types.js](src/events/event-types.js)

Event type constants.

#### User Action Events

```javascript
Events.EQUATION_TOGGLED      // { key, enabled, enabledKeys }
Events.EQUATIONS_RESET       // { enabledKeys }
Events.THEME_CHANGED         // { theme }
Events.BREAKPOINTS_CHANGED   // { breakpoints }
Events.CAST_TIMES_CHANGED    // { castTimes }
Events.GROUP_ADDED           // { group, groups, enabledKeys }
Events.GROUP_REMOVED         // { groupName, groups, enabledKeys }
Events.GROUP_UPDATED         // { groupName, group, groups, enabledKeys }
```

#### System Events

```javascript
Events.CALCULATIONS_UPDATED  // { series, groupSeries, cooldown, ... }
Events.COOLDOWN_CHANGED      // { cooldown, modifiers, castTimes }
```

---

## State Management

### StateManager

**Location:** [src/state/state-manager.js](src/state/state-manager.js)

Manages application state and emits specific events on changes.

#### Constructor

```javascript
new StateManager(eventBus, initialState)
```

**Parameters:**
- `eventBus` (EventBus) - EventBus instance
- `initialState` (Object) - Initial state object

#### State Shape

```javascript
{
  enabledKeys: Set<string>,           // Enabled equation keys
  theme: 'light' | 'dark',            // Current theme
  selectedBreakpoints: Set<number>,   // Selected breakpoint times
  selectedCastTimes: Set<number>,     // Selected cast times
  groups: Map<string, Group>          // Equation groups
}
```

#### Methods

##### `toggleEquation(key)`

Toggle an equation on/off.

**Parameters:**
- `key` (string) - Equation key

**Emits:** `EQUATION_TOGGLED`

**Example:**
```javascript
stateManager.toggleEquation('Celestial');
```

##### `resetEquations()`

Reset to default equations.

**Emits:** `EQUATIONS_RESET`

##### `changeTheme(theme)`

Change the theme.

**Parameters:**
- `theme` ('light' | 'dark') - New theme

**Emits:** `THEME_CHANGED`

##### `updateBreakpoints(selected)`

Update selected breakpoints.

**Parameters:**
- `selected` (number[]) - Array of selected breakpoint times

**Emits:** `BREAKPOINTS_CHANGED`

##### `updateCastTimes(selected)`

Update selected cast times.

**Parameters:**
- `selected` (number[]) - Array of selected cast times

**Emits:** `CAST_TIMES_CHANGED`

##### `addGroup(group)`

Add an equation group.

**Parameters:**
- `group` (Object) - Group object `{ name, keys, color }`

**Emits:** `GROUP_ADDED`

##### `removeGroup(groupName)`

Remove an equation group.

**Parameters:**
- `groupName` (string) - Group name

**Emits:** `GROUP_REMOVED`

##### `updateGroup(groupName, updates)`

Update an equation group.

**Parameters:**
- `groupName` (string) - Group name
- `updates` (Object) - Partial group updates

**Emits:** `GROUP_UPDATED`

##### `getState()`

Get current state (read-only).

**Returns:** Object - Current state

---

### StorageManager

**Location:** [src/state/storage-manager.js](src/state/storage-manager.js)

Persists state to localStorage.

#### Constructor

```javascript
new StorageManager(eventBus, stateManager)
```

**Parameters:**
- `eventBus` (EventBus) - EventBus instance
- `stateManager` (StateManager) - StateManager instance

#### Methods

##### `loadState()`

Load state from localStorage.

**Returns:** Object | null - Loaded state or null

##### `saveState(state)`

Save state to localStorage.

**Parameters:**
- `state` (Object) - State to save

**Returns:** void

---

## Managers

### CalculationManager

**Location:** [src/managers/calculation-manager.js](src/managers/calculation-manager.js)

Orchestrates calculations in response to state changes.

#### Constructor

```javascript
new CalculationManager(eventBus, stateManager, config)
```

**Parameters:**
- `eventBus` (EventBus) - EventBus instance
- `stateManager` (StateManager) - StateManager instance
- `config` (Object) - Configuration `{ equations, baseCooldown, t }`

#### Methods

##### `forceRecalculate()`

Force recalculation regardless of state.

**Emits:** `CALCULATIONS_UPDATED`, `COOLDOWN_CHANGED`

**Returns:** void

##### `getLastResults()`

Get last calculation results.

**Returns:** Object | null - Last results or null

#### Events Listened To

- `EQUATION_TOGGLED`
- `EQUATIONS_RESET`
- `GROUP_ADDED`
- `GROUP_REMOVED`
- `GROUP_UPDATED`

#### Events Emitted

- `CALCULATIONS_UPDATED` - When calculations complete
- `COOLDOWN_CHANGED` - When cooldown value changes

---

## Components

### CooldownDisplay

**Location:** [src/components/cooldown-display.js](src/components/cooldown-display.js)

Displays the current global cooldown value.

#### Constructor

```javascript
new CooldownDisplay(eventBus, containerId)
```

**Parameters:**
- `eventBus` (EventBus) - EventBus instance
- `containerId` (string) - DOM element ID

#### Events Listened To

- `COOLDOWN_CHANGED`

---

### ChartComponent

**Location:** [src/components/chart-component.js](src/components/chart-component.js)

Renders the main Plotly chart.

#### Constructor

```javascript
new ChartComponent(eventBus, containerId, options)
```

**Parameters:**
- `eventBus` (EventBus) - EventBus instance
- `containerId` (string) - DOM element ID
- `options` (Object) - Chart options `{ timeAxis }`

#### Events Listened To

- `CALCULATIONS_UPDATED`
- `THEME_CHANGED`

---

### RankingTable

**Location:** [src/components/ranking-table.js](src/components/ranking-table.js)

Displays ranking tables.

#### Constructor

```javascript
new RankingTable(eventBus, stateManager, containerId, timeAxis, type)
```

**Parameters:**
- `eventBus` (EventBus) - EventBus instance
- `stateManager` (StateManager) - StateManager instance
- `containerId` (string) - DOM element ID
- `timeAxis` (number[]) - Time axis array
- `type` ('breakpoints' | 'casts') - Table type

#### Events Listened To

- `CALCULATIONS_UPDATED`
- `BREAKPOINTS_CHANGED` (if type === 'breakpoints')
- `CAST_TIMES_CHANGED` (if type === 'casts')
- `COOLDOWN_CHANGED` (if type === 'casts')

---

### EquationToggles

**Location:** [src/components/equation-toggles.js](src/components/equation-toggles.js)

Renders equation toggle checkboxes.

#### Constructor

```javascript
new EquationToggles(eventBus, stateManager, containerId, equations)
```

**Parameters:**
- `eventBus` (EventBus) - EventBus instance
- `stateManager` (StateManager) - StateManager instance
- `containerId` (string) - DOM element ID
- `equations` (Array) - Equation definitions

#### Events Listened To

- `EQUATIONS_RESET`

---

### BreakpointToggles

**Location:** [src/components/breakpoint-toggles.js](src/components/breakpoint-toggles.js)

Renders breakpoint selection toggles.

#### Constructor

```javascript
new BreakpointToggles(eventBus, stateManager, containerId, breakpoints)
```

**Parameters:**
- `eventBus` (EventBus) - EventBus instance
- `stateManager` (StateManager) - StateManager instance
- `containerId` (string) - DOM element ID
- `breakpoints` (number[]) - Breakpoint times

---

### CastTimeToggles

**Location:** [src/components/cast-time-toggles.js](src/components/cast-time-toggles.js)

Renders cast time selection toggles.

#### Constructor

```javascript
new CastTimeToggles(eventBus, stateManager, containerId)
```

**Parameters:**
- `eventBus` (EventBus) - EventBus instance
- `stateManager` (StateManager) - StateManager instance
- `containerId` (string) - DOM element ID

#### Events Listened To

- `COOLDOWN_CHANGED`

---

### ThemeToggle

**Location:** [src/components/theme-toggle.js](src/components/theme-toggle.js)

Renders theme toggle button.

#### Constructor

```javascript
new ThemeToggle(eventBus, stateManager, buttonId)
```

**Parameters:**
- `eventBus` (EventBus) - EventBus instance
- `stateManager` (StateManager) - StateManager instance
- `buttonId` (string) - Button element ID

#### Events Listened To

- `THEME_CHANGED`

---

## UI Primitives

### createCheckbox

**Location:** [src/ui/primitives/checkbox.js](src/ui/primitives/checkbox.js)

Creates a checkbox element.

```javascript
createCheckbox(options)
```

**Parameters:**
- `options.id` (string) - Checkbox ID
- `options.label` (string) - Label text
- `options.checked` (boolean) - Initial checked state
- `options.color` (string) - Optional color
- `options.onChange` (Function) - Change handler

**Returns:** HTMLElement

**Example:**
```javascript
const checkbox = createCheckbox({
  id: 'eq-celestial',
  label: 'Celestial',
  checked: true,
  color: '#4ecdc4',
  onChange: () => console.log('Toggled!')
});
```

---

### createToggleGroup

**Location:** [src/ui/primitives/toggle-group.js](src/ui/primitives/toggle-group.js)

Creates a toggle group (multiple checkboxes).

```javascript
createToggleGroup(options)
```

**Parameters:**
- `options.containerId` (string) - Container element ID
- `options.items` (Array) - Items `[{ value, label, checked }]`
- `options.onChange` (Function) - Change handler `(selected) => void`

**Returns:** Object - Toggle group instance

**Example:**
```javascript
const toggles = createToggleGroup({
  containerId: 'breakpoints',
  items: [
    { value: 60, label: '60s', checked: true },
    { value: 120, label: '120s', checked: false }
  ],
  onChange: (selected) => console.log('Selected:', selected)
});
```

---

### createTooltip

**Location:** [src/ui/primitives/tooltip.js](src/ui/primitives/tooltip.js)

Creates a tooltip for an element.

```javascript
createTooltip(element, getContent)
```

**Parameters:**
- `element` (HTMLElement) - Element to attach tooltip to
- `getContent` (Function) - Function returning tooltip content

**Returns:** void

**Example:**
```javascript
createTooltip(cooldownElement, () => {
  return `Cooldown: ${cooldown}s<br>Modifiers: ...`;
});
```

---

### renderChart

**Location:** [src/ui/chart.js](src/ui/chart.js)

Renders a Plotly chart.

```javascript
renderChart(containerId, series, timeAxis, theme)
```

**Parameters:**
- `containerId` (string) - Container element ID
- `series` (Array) - Series data `[{ key, color, y }]`
- `timeAxis` (number[]) - Time axis
- `theme` ('light' | 'dark') - Theme

**Returns:** void

---

### renderTable

**Location:** [src/ui/table.js](src/ui/table.js)

Renders a ranking table.

```javascript
renderTable(containerId, timePoints, series, timeAxis)
```

**Parameters:**
- `containerId` (string) - Container element ID
- `timePoints` (number[]) - Time points to show
- `series` (Array) - Series data
- `timeAxis` (number[]) - Time axis

**Returns:** void

---

## Core Calculations

### calculate

**Location:** [src/core/calculator.js](src/core/calculator.js)

Main calculation function.

```javascript
calculate(config)
```

**Parameters:**
- `config.enabledKeys` (Set<string>) - Enabled equation keys
- `config.equations` (Array) - Equation definitions
- `config.baseCooldown` (number) - Base cooldown value
- `config.t` (number[]) - Time axis
- `config.groups` (Map) - Optional equation groups

**Returns:** Object

```javascript
{
  cooldown: number,           // Final cooldown
  modifiers: Array,           // Cooldown modifiers applied
  series: Array,              // Individual series
  groupSeries: Array,         // Group series
  castTimes: Array            // Available cast times
}
```

**Example:**
```javascript
const results = calculate({
  enabledKeys: new Set(['Celestial', 'Toybox']),
  equations: equations,
  baseCooldown: 30,
  t: [0, 1, 2, ..., 300],
  groups: new Map()
});
```

---

## Configuration

### equations

**Location:** [src/config/equations.js](src/config/equations.js)

Array of equation definitions.

```javascript
[
  {
    key: string,                    // Equation name
    color: string,                  // Chart color
    gen: (params) => number[],      // Generator function
    cooldownModifier?: (cd) => cd   // Optional cooldown modifier
  }
]
```

**Generator Parameters:**
- `t` (number[]) - Time axis
- `cooldown` (number) - Current cooldown
- `baseCooldown` (number) - Base cooldown

**Example:**
```javascript
{
  key: 'Celestial',
  color: '#4ecdc4',
  cooldownModifier: (cd) => cd - 3,
  gen: ({t, cooldown}) => t.map(() => 1.15)
}
```

---

### constants

**Location:** [src/config/constants.js](src/config/constants.js)

Application constants.

```javascript
{
  baseCooldown: 30,           // Base cooldown (seconds)
  castOffset: 5,              // First cast time offset (seconds)
  maxTime: 300,               // Max simulation time (seconds)
  breakpoints: [60, 120, ...],// Default breakpoints
  defaultTheme: 'dark'        // Default theme
}
```

---

## Type Definitions

### Group

```typescript
{
  name: string,
  keys: Set<string>,
  color: string
}
```

### Series

```typescript
{
  key: string,
  color: string,
  y: number[]
}
```

### State

```typescript
{
  enabledKeys: Set<string>,
  theme: 'light' | 'dark',
  selectedBreakpoints: Set<number>,
  selectedCastTimes: Set<number>,
  groups: Map<string, Group>
}
```

---

## See Also

- [ARCHITECTURE.md](ARCHITECTURE.md) - System architecture and event flow
- [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md) - How to add features and debug
- [README.md](README.md) - Quick start and overview
