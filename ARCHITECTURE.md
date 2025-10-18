# System Architecture

This document describes the event-driven architecture of the Stellar Simulator.

## Table of Contents

1. [Overview](#overview)
2. [Architecture Diagram](#architecture-diagram)
3. [Event Flow](#event-flow)
4. [Event Types](#event-types)
5. [Component Responsibilities](#component-responsibilities)
6. [Directory Structure](#directory-structure)
7. [Performance](#performance)

## Overview

The application uses an **event-driven architecture** where components are self-contained and communicate through specific events via a central EventBus.

### Key Benefits

- **Decoupled Components** - Components don't know about each other
- **Selective Updates** - Only components that care about an event update
- **Scalable** - Add new components without editing existing code
- **Clear Dependencies** - Components subscribe to events they care about
- **Better Separation** - Each component manages its own rendering

### Core Principles

1. **Unidirectional Data Flow**: User Action → StateManager → EventBus → Components
2. **Specific Events**: No generic `STATE_CHANGED` event; each event describes exactly what changed
3. **Pure Functions**: All calculation logic in `src/core/` has no side effects
4. **Self-Contained Components**: Each component listens to events and updates its own DOM

## Architecture Diagram

```
User Action
    ↓
UI Component
    ↓
StateManager (updates state, emits specific event)
    ↓
EventBus (broadcasts event)
    ├──→ CalculationManager (listens, calculates, emits CALCULATIONS_UPDATED)
    ├──→ StorageManager (listens, saves to localStorage)
    └──→ UI Components (listen to specific events, update themselves)
```

## Event Flow

### Example: Toggling "Celestial" Equation

```
1. User clicks "Celestial" checkbox
   ↓
2. EquationToggles component
   → stateManager.toggleEquation('Celestial')
   ↓
3. StateManager
   → Updates state.enabledKeys
   → Emits EQUATION_TOGGLED { key: 'Celestial', enabled: false, enabledKeys: Set(...) }
   ↓
4. EventBus broadcasts EQUATION_TOGGLED to all listeners
   ↓
5. Listeners react:
   ├─→ CalculationManager hears EQUATION_TOGGLED
   │   → Runs calculate()
   │   → Emits CALCULATIONS_UPDATED { series, cooldown, ... }
   │   → Emits COOLDOWN_CHANGED { cooldown: 30, castTimes: [...] }
   │
   └─→ StorageManager hears EQUATION_TOGGLED
       → Saves state to localStorage
   ↓
6. CALCULATIONS_UPDATED event broadcast
   ├─→ ChartComponent: Re-renders chart
   └─→ RankingTable (x2): Update tables
   ↓
7. COOLDOWN_CHANGED event broadcast
   ├─→ CooldownDisplay: Updates display text "30s"
   └─→ CastTimeToggles: Regenerates toggles with new cast times
```

## Event Types

### User Action Events (State Changes)

| Event | Emitted By | Payload | Listeners |
|-------|-----------|---------|-----------|
| `EQUATION_TOGGLED` | StateManager | `{ key, enabled, enabledKeys }` | CalculationManager, StorageManager |
| `EQUATIONS_RESET` | StateManager | `{ enabledKeys }` | CalculationManager, StorageManager, EquationToggles |
| `THEME_CHANGED` | StateManager | `{ theme }` | StorageManager, ThemeToggle, ChartComponent |
| `BREAKPOINTS_CHANGED` | StateManager | `{ breakpoints }` | StorageManager, RankingTable |
| `CAST_TIMES_CHANGED` | StateManager | `{ castTimes }` | StorageManager, RankingTable |
| `GROUP_ADDED` | StateManager | `{ group, groups, enabledKeys }` | CalculationManager, StorageManager |
| `GROUP_REMOVED` | StateManager | `{ groupName, groups, enabledKeys }` | CalculationManager, StorageManager |
| `GROUP_UPDATED` | StateManager | `{ groupName, group, groups, enabledKeys }` | CalculationManager, StorageManager |

### System Events (Calculated Results)

| Event | Emitted By | Payload | Listeners |
|-------|-----------|---------|-----------|
| `CALCULATIONS_UPDATED` | CalculationManager | `{ series, groupSeries, cooldown, ... }` | ChartComponent, RankingTable (x2) |
| `COOLDOWN_CHANGED` | CalculationManager | `{ cooldown, modifiers, castTimes }` | CooldownDisplay, CastTimeToggles |

## Component Responsibilities

### Core System Components

#### EventBus ([src/events/event-bus.js](src/events/event-bus.js))

Central event dispatcher using browser's native `CustomEvent` API.

**Responsibilities:**
- Broadcast events to all listeners
- Track listeners for cleanup
- Provide debug logging

**Key Methods:**
```javascript
emit(eventType, detail = {})  // Emit an event
on(eventType, handler)         // Subscribe to event
off(eventType, handler)        // Unsubscribe
once(eventType, handler)       // Subscribe once
clear()                        // Clear all listeners
enableDebug()                  // Enable debug logging
```

#### StateManager ([src/state/state-manager.js](src/state/state-manager.js))

Holds application state and emits specific events when state changes.

**Responsibilities:**
- Manage application state (enabled equations, theme, breakpoints, etc.)
- Provide methods to update state
- Emit specific events on state changes
- Does NOT handle rendering, storage, or calculations

**Key Methods:**
```javascript
toggleEquation(key)           // Toggle equation on/off
resetEquations()              // Reset to default equations
changeTheme(theme)            // Change dark/light theme
updateBreakpoints(selected)   // Update selected breakpoints
updateCastTimes(selected)     // Update selected cast times
addGroup(group)               // Add equation group
removeGroup(groupName)        // Remove equation group
updateGroup(groupName, group) // Update equation group
getState()                    // Get current state
```

#### CalculationManager ([src/managers/calculation-manager.js](src/managers/calculation-manager.js))

Orchestrates calculations in response to state changes.

**Responsibilities:**
- Listen to state change events that affect calculations
- Run calculations using pure functions from `src/core/`
- Emit `CALCULATIONS_UPDATED` with results
- Emit `COOLDOWN_CHANGED` when cooldown changes

**Listens To:**
- `EQUATION_TOGGLED`
- `EQUATIONS_RESET`
- `GROUP_ADDED`
- `GROUP_REMOVED`
- `GROUP_UPDATED`

**Emits:**
- `CALCULATIONS_UPDATED` - When calculations complete
- `COOLDOWN_CHANGED` - When cooldown value changes

#### StorageManager ([src/state/storage-manager.js](src/state/storage-manager.js))

Persists state to localStorage.

**Responsibilities:**
- Listen to all state change events
- Save state to localStorage
- Load state on initialization
- Serialize/deserialize state (Sets, Maps)

**Listens To:** All user action events

### UI Components

All UI components are **self-contained classes** that:
- Listen to specific events they care about
- Update their own DOM
- Call StateManager methods to trigger state changes
- Have NO knowledge of other components

#### CooldownDisplay ([src/components/cooldown-display.js](src/components/cooldown-display.js))

Displays the current global cooldown value and which equations modify it.

**Listens To:** `COOLDOWN_CHANGED`
**Updates:** Cooldown display text and tooltip

#### ChartComponent ([src/components/chart-component.js](src/components/chart-component.js))

Renders the main Plotly chart showing DPS over time.

**Listens To:** `CALCULATIONS_UPDATED`, `THEME_CHANGED`
**Updates:** Plotly chart

#### RankingTable ([src/components/ranking-table.js](src/components/ranking-table.js))

Displays ranking tables for either breakpoints or cast times.

**Listens To:** `CALCULATIONS_UPDATED`, `BREAKPOINTS_CHANGED` or `CAST_TIMES_CHANGED`
**Updates:** Ranking table

**Types:**
- `type: 'breakpoints'` - Shows rankings at selected breakpoint times
- `type: 'casts'` - Shows rankings at selected cast times

#### EquationToggles ([src/components/equation-toggles.js](src/components/equation-toggles.js))

Renders equation toggle checkboxes.

**Listens To:** `EQUATIONS_RESET`
**Calls:** `stateManager.toggleEquation(key)`
**Updates:** Checkbox states

#### BreakpointToggles ([src/components/breakpoint-toggles.js](src/components/breakpoint-toggles.js))

Renders breakpoint selection toggles.

**Listens To:** None (static)
**Calls:** `stateManager.updateBreakpoints(selected)`

#### CastTimeToggles ([src/components/cast-time-toggles.js](src/components/cast-time-toggles.js))

Renders cast time selection toggles.

**Listens To:** `COOLDOWN_CHANGED`
**Calls:** `stateManager.updateCastTimes(selected)`
**Updates:** Regenerates toggles when cooldown changes

#### ThemeToggle ([src/components/theme-toggle.js](src/components/theme-toggle.js))

Renders theme toggle button (dark/light mode).

**Listens To:** `THEME_CHANGED`
**Calls:** `stateManager.changeTheme(theme)`
**Updates:** Button state and document theme

## Directory Structure

```
src/
├── events/
│   ├── event-bus.js         # EventBus class
│   └── event-types.js       # Event type constants
│
├── state/
│   ├── state-manager.js     # State + event emitters
│   └── storage-manager.js   # Persistence listener
│
├── managers/
│   └── calculation-manager.js  # Calculation orchestrator
│
├── components/              # Self-contained UI components
│   ├── cooldown-display.js
│   ├── chart-component.js
│   ├── ranking-table.js
│   ├── equation-toggles.js
│   ├── breakpoint-toggles.js
│   ├── cast-time-toggles.js
│   └── theme-toggle.js
│
├── ui/                      # Low-level UI primitives
│   ├── primitives/
│   │   ├── checkbox.js      # Checkbox component
│   │   ├── toggle-group.js  # Toggle group component
│   │   └── tooltip.js       # Tooltip component
│   ├── chart.js             # Plotly chart renderer
│   └── table.js             # Table renderer
│
├── core/                    # Pure calculation logic
│   └── calculator.js        # Main calculation function
│
├── config/                  # Configuration
│   ├── equations.js         # Equation definitions
│   └── constants.js         # Constants (breakpoints, time axis, etc.)
│
├── app.js                   # Application orchestrator
└── main.js                  # Entry point
```

## Performance

### Selective Updates

Only components that care about an event update, not all components on every state change.

**Example:** When breakpoints change:
- ✅ RankingTable (breakpoints) updates
- ❌ ChartComponent does NOT update (doesn't listen to `BREAKPOINTS_CHANGED`)
- ❌ CooldownDisplay does NOT update

### Lazy Calculations

Calculations only run when state changes that affect them:
- Toggling an equation → Triggers calculation
- Changing breakpoints → Does NOT trigger calculation (only affects table display)
- Changing theme → Does NOT trigger calculation (only affects chart rendering)

### Current Performance

- **Calculation time:** <10ms (300 time points, 10 equations)
- **Chart rendering:** ~50ms (Plotly)
- **Event overhead:** <1ms
- **Table updates:** <5ms

### Future Optimizations

- Batch multiple state changes before emitting events
- Debounce rapid toggle changes
- Memoize calculation results for unchanged equations
- Web Workers for heavy calculations

## See Also

- [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md) - How to add features and debug
- [API_REFERENCE.md](API_REFERENCE.md) - Detailed API documentation
- [README.md](README.md) - Quick start and overview
