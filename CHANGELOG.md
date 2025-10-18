# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0]

### Added
- **Grouped Equations Feature**: Complete implementation of equation grouping system
  - Two-tab interface: "Individual" and "Groups"
  - 4 predefined groups with auto-generated names ("Group 1", "Group 2", etc.)
  - Multi-select dropdown for equation selection per group
  - Each group can contain up to 4 equations
  - Equations can repeat across groups but not within the same group
  - Predefined color palette for groups (#3b82f6, #8b5cf6, #ec4899, #f59e0b)
  - Product calculation of equations within each group
  - Per-group cooldown isolation - each group calculates its own cooldown based on its equations
  - Individual cooldown display per group with tooltip
  - LocalStorage persistence for group configurations and active tab selection
  - Equation colors shown in multi-select dropdowns with colored dots
  - 4-column responsive grid layout for group cards

- **Tab System**
  - `TabSwitcher` component for navigation between Individual and Groups views
  - `TAB_CHANGED` event for tab switching
  - Tab state persistence in localStorage
  - Proper chart resizing when switching tabs

- **Components**
  - `GroupManager`: Manages all 4 predefined groups
  - `GroupCard`: Individual group display with multi-select and cooldown pill
  - `MultiSelect`: Multi-select dropdown with color indicators
  - Updated `ChartComponent` with mode parameter ('individual' or 'groups')
  - Updated `RankingTable` with mode parameter and union cast times support

- **Core Functionality**
  - `calculateCooldownForKeys()`: Calculates cooldown for specific equation sets
  - `buildGroupSeries()`: Builds series data for groups with per-group cooldowns
  - Union of cast times for groups mode - collects all unique cast times from all groups

- **UI Enhancements**
  - Bold text styling for actual cast times in "Top by casts" table (both name and value)
  - Footer explanation in cast times table: "Bold entries indicate actual cast times for that group."
  - Responsive grid layout for group cards (4 columns on desktop, 2 on smaller screens)

### Changed
- Chart rendering to support mode-based filtering (individual vs groups)
- Ranking tables to support union of cast times across groups with different cooldowns
- Storage manager to persist active tab and group configurations
- State manager to include `changeTab()` method and active tab state

### Fixed
- Chart rendering at incorrect size when groups tab loaded first (added Plotly resize on tab change)
- Chart on groups tab taking only half horizontal space (removed incorrect wrapper)
- Individual tab incorrectly showing grouped equations alongside individual equations
- Cast time table showing incorrect data when groups have different cooldowns (implemented union approach)
- Visual clutter in cast time indicators (replaced colored dots with bold text)
- Individual tab ranking tables incorrectly showing grouped equations alongside individual equations in both "Top by mean" and "Top by casts" tables

### Technical Details
- Event-driven architecture with EventBus pattern
- Pure functional calculation layer with no side effects
- Component self-containment with event-based communication
- Mode-based rendering for complete separation of individual and grouped views
- Per-group cooldown isolation ensures cooldown modifiers only affect their respective groups

## [1.0.0] - Previous Version

### Added
- Initial release with individual equation tracking
- DPS calculation engine
- Interactive chart visualization with Plotly
- Ranking tables (Top by mean, Top by casts)
- Equation management system
- Cooldown calculation system
- LocalStorage persistence
- Responsive UI design
- Dark mode theme