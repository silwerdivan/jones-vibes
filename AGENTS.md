# AGENTS.md - Developer Guidelines for Jones in the Fastlane Vibes

## Project Overview
This is a vanilla JavaScript browser-based game. The codebase uses ES6 modules, Jest for testing, and Babel for transpilation. The game simulates a life simulation where players manage time, money, and happiness through jobs, education, and activities.

---

## Build, Lint, and Test Commands

### Running Tests
```bash
# Run all tests
npm test

# Run a single test file
npm test -- GameState.test.js

# Run a specific test by name pattern
npm test -- --testNamePattern="GameState constructor"
```

### No Build Step Required
This is a vanilla JavaScript project - no build step is required. The code runs directly in the browser via ES6 modules.

### No Linter Configured
There is currently no ESLint or Prettier configuration. Code style follows basic JavaScript conventions (see below).

---

## Code Style Guidelines

### General Conventions
- Use ES6 modules (`import`/`export`) for all JavaScript files
- Use `export default` for single-class modules
- Use 4 spaces for indentation (not tabs)
- Use single quotes for strings
- Always use semicolons
- Use `camelCase` for variables and functions, `PascalCase` for classes

### Imports
- Place imports at the top of the file
- Group imports by type: built-in, external (if any), then local
- Use explicit `.js` extensions in import paths
- Example:
```javascript
import Player from './Player.js';
import { JOBS, COURSES } from './gameData.js';
import EventBus from '../EventBus.js';
```

### Naming Conventions
- **Classes**: `PascalCase` (e.g., `GameState`, `Player`)
- **Functions/Variables**: `camelCase` (e.g., `addCash`, `currentPlayer`)
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `DAILY_EXPENSE`)
- **Private methods**: Prefix with underscore (e.g., `_formatMoney`)
- **Boolean variables**: Use `is`, `has`, `can` prefixes (e.g., `isAI`, `hasCar`)

### File Organization
- Main entry: `js/app.js`
- Game logic: `js/game/` (GameState.js, Player.js, GameController.js, AIController.js)
- UI logic: `js/ui/` (Icons.js, EventNotificationManager.js, ClockVisualization.js)
- Shared utilities: `js/EventBus.js`
- Tests mirror source structure in `tests/` folder

### Classes
- Use ES6 class syntax
- Place constructor at the top of the class
- Group related methods together
- Use getter/setter methods instead of direct property access when appropriate
- Example:
```javascript
export default class GameState {
    constructor(numberOfPlayers, isPlayer2AI = false) {
        // ...
    }

    getCurrentPlayer() {
        return this.players[this.currentPlayerIndex];
    }

    _privateMethod() {
        // ...
    }
}
```

### Error Handling
- Throw descriptive errors for invalid state:
```javascript
if (numberOfPlayers < 1 || numberOfPlayers > 2) {
    throw new Error("Game can only be played with 1 or 2 players.");
}
```
- Use `try/catch` for async operations and external data parsing
- Return `false` or `null` for failed operations that aren't errors (e.g., `spendCash` returns boolean)

### Testing Conventions
- Use Jest with `jest-environment-jsdom`
- Follow the `describe`/`it`/`test` pattern
- Mock external dependencies (see `tests/GameState.test.js` for examples):
```javascript
jest.mock('../js/game/Player.js');
Player.mockClear();
Player.mockImplementation(() => { /* mock object */ });
```
- Use `beforeEach` to reset state between tests
- Test file naming: `<ModuleName>.test.js` or `<ModuleName>.integration.test.js`

### CSS
- Main stylesheet: `style.css`
- Avoid inline styles
- Use CSS custom properties (variables) for theming
- Follow existing naming patterns in the CSS file

### Event System
- Use `EventBus` for decoupled communication between components
- Publish events with meaningful names: `'stateChanged'`, `'gameEvent'`, etc.
- Subscribe to events in initialization, unsubscribe when appropriate

---

## Common Tasks

### Adding a New Feature
1. Create or modify files in `js/game/` or `js/ui/`
2. Add corresponding tests in `tests/`
3. Test with `npm test`

### Fixing a Bug
1. Create a reproduction test in `tests/`
2. Run the test to confirm failure
3. Fix the code
4. Verify the test passes

### Adding a New Location/Job/Course
- Edit `js/game/gameData.js` which contains `LOCATIONS`, `JOBS`, `COURSES`, `SHOPPING_ITEMS`

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `js/app.js` | Application entry point |
| `js/game/GameState.js` | Core game state and turn logic |
| `js/game/Player.js` | Player data model |
| `js/game/GameController.js` | Coordinates game flow |
| `js/game/AIController.js` | AI opponent logic |
| `js/game/gameData.js` | Static data (jobs, locations, etc.) |
| `js/ui.js` | DOM manipulation and UI updates |
| `js/EventBus.js` | Pub/sub event system |
| `tests/` | Jest test suite |
