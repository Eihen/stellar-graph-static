# Stellar Simulator

A damage-over-time (DPS) simulator for analyzing buff/modifier combinations over time (0-300 seconds).

## Features

- 🎯 **Interactive Visualization** - Real-time Plotly charts
- 📊 **Dynamic Rankings** - Compare performance at different battle lengths
- 👥 **Equation Groups** - Create up to 4 groups to compare different buff combinations
- 🔗 **Share URLs** - Generate compressed shareable URLs for group configurations (85-95% size reduction)
- ⚡ **Live Updates** - Event-driven architecture for responsive UI
- 🎨 **Dark/Light Mode** - Theme support
- 💾 **Auto-Save** - Preferences persist to localStorage
- 🔧 **Extensible** - Easy to add new equations and features

## Quick Start

**No build step required!** Just open `index.html` in a browser.

```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve

# Then open http://localhost:8000
```

## How It Works

The simulator models how different buffs/modifiers (called "equations") affect DPS over time:

### Individual Mode
1. **Select equations** - Toggle different buffs on/off
2. **Automatic calculation** - Cooldowns and cast times update automatically
3. **View results** - Chart shows DPS progression, tables show rankings

### Groups Mode
1. **Create groups** - Up to 4 groups with custom equation combinations
2. **Per-group cooldowns** - Each group calculates its own cooldown based on selected equations
3. **Compare configurations** - See which buff combination performs best at different battle lengths
4. **Share your setup** - Generate compressed shareable URLs (LZ-String compression reduces URL size by 85-95%)

### Example Equations

- **World's Night** - Stacks every 40 seconds
- **Toybox** - Strong buff for first 60 seconds
- **Celestial** - Reduces global cooldown by 3 seconds
- **Core Garden** - Scales with current cooldown value

## Architecture

Built with **event-driven architecture** for clean separation of concerns:

```
User Action → State Change → Event Emitted → Components Update
```

Each component is self-contained and only updates when needed.

### Key Technologies

- **Vanilla JavaScript** (ES modules)
- **Plotly.js** for charting
- **CustomEvent API** for component communication
- **CSS Variables** for theming

## Documentation

### For Users
- 📖 **[This README](#quick-start)** - Getting started

### For Developers
- 🏗️ **[ARCHITECTURE.md](ARCHITECTURE.md)** - System architecture and event flow
- 💻 **[DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md)** - How to add features and debug
- 📚 **[API_REFERENCE.md](API_REFERENCE.md)** - Detailed API documentation

## Project Structure

```
stellar-graph-static/
├── index.html              # HTML structure
├── styles.css              # Global styles
├── src/
│   ├── events/            # Event system (EventBus, event types)
│   ├── state/             # State management (StateManager, StorageManager)
│   ├── managers/          # CalculationManager
│   ├── components/        # UI components (self-contained)
│   ├── ui/                # Reusable UI primitives
│   ├── core/              # Pure calculation logic
│   ├── config/            # Configuration (equations, constants)
│   ├── app.js             # Application orchestrator
│   └── main.js            # Entry point
└── docs/                  # Documentation (see above)
```

## Adding New Equations

Edit [src/config/equations.js](src/config/equations.js):

```javascript
{
  key: 'My New Buff',
  color: '#ff6b6b',
  gen: ({t, cooldown}) => {
    return t.map(timeInSeconds => {
      return timeInSeconds < 60 ? 1.5 : 1.0; // 50% buff for 1 minute
    });
  },
  // Optional: modify global cooldown
  cooldownModifier: (cd) => cd - 2
}
```

The UI and calculations update automatically!

## Event-Driven Architecture

Components communicate through events:

```javascript
// StateManager emits specific events
stateManager.toggleEquation('Celestial');
// → Emits EQUATION_TOGGLED event

// CalculationManager listens and calculates
// → Emits CALCULATIONS_UPDATED event

// UI components listen and update themselves
// → Chart re-renders
// → Tables update
// → Cooldown display updates
```

**Benefits:**
- ✅ No tight coupling between components
- ✅ Easy to add new features
- ✅ Clear event flow (easy to debug)
- ✅ Selective updates (better performance)

See [ARCHITECTURE.md](ARCHITECTURE.md) for details.

## Development

### Debug Mode

Debug logging is automatically enabled on localhost:

```javascript
// View all events
window.app.eventBus.enableDebug();

// Inspect state
window.app.getState();

// Test events
window.app.emit(Events.EQUATION_TOGGLED, { key: 'Toybox', enabled: false });
```

### Testing

Components are designed to be testable in isolation:

```javascript
import { CooldownDisplay } from './components/cooldown-display.js';

const mockEventBus = {
  on: jest.fn(),
  emit: jest.fn()
};

const component = new CooldownDisplay(mockEventBus, 'cooldownDisplay');
// Test event handling, DOM updates, etc.
```

See [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md) for more details.

## Performance

- **Selective Updates** - Only components that care about an event update
- **No Over-Rendering** - Chart doesn't re-render when only breakpoints change
- **Pure Calculations** - Math functions have no side effects (easy to optimize)
- **Lazy Loading** - Calculations only run when state changes

Current performance:
- Calculation time: <10ms (300 time points, 10 equations)
- Chart rendering: ~50ms (Plotly)
- Event overhead: <1ms

## Browser Support

- Modern browsers with ES6 module support
- Chrome 61+
- Firefox 60+
- Safari 11+
- Edge 79+

## License

MIT License - See [LICENSE](LICENSE) file

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

See [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md) for development guidelines.

## Roadmap

- [x] Equation groups (compare multiple buff combinations)
- [x] Share configurations via URL
- [ ] Export data to CSV
- [ ] More equation types (conditional, stacking, etc.)
- [ ] Custom breakpoints (user-defined battle lengths)
- [ ] Group naming and color customization
- [ ] TypeScript migration
- [ ] Unit tests

## Questions?

- 📖 Read the [Architecture docs](ARCHITECTURE.md)
- 💻 Check the [Developer Guide](DEVELOPER_GUIDE.md)
- 🔍 Browse the [API Reference](API_REFERENCE.md)
- 🐛 Found a bug? Open an issue

---

**Built with ❤️ using Event-Driven Architecture**
