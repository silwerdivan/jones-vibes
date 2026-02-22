# AGENTS.md - Developer Guidelines for Jones in the Fastlane Vibes

## Project Overview
This is a **TypeScript** browser-based game using **Vite** for build tooling and **Vitest** for testing. The game simulates a life simulation where players manage time, money, and happiness through jobs, education, and activities.

---

## Build, Lint, and Test Commands

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode (during development)
npm run test:watch

# Run with coverage
npm test -- --coverage
```

### Development Server
```bash
# Start development server
npm run dev
```

### Production Build
```bash
# Create optimized production build
npm run build

# Preview production build
npm run preview
```

### No Linter Configured
There is currently no ESLint or Prettier configuration. Code style follows basic TypeScript conventions (see below).

---

## Code Style Guidelines

### General Conventions
- Use ES6 modules (`import`/`export`) for all TypeScript files
- Use `export default` for single-class modules
- Use 4 spaces for indentation (not tabs)
- Use single quotes for strings
- Always use semicolons
- Use `camelCase` for variables and functions, `PascalCase` for classes
- Prefer explicit types over implicit inference for function parameters and return types

### Imports
- Place imports at the top of the file
- Group imports by type: built-in, external, then local
- Use explicit `.ts` extensions in import paths (TypeScript allows this)
- Example:
```typescript
import Player from './Player.ts';
import { JOBS, COURSES } from '../data/jobs.ts';
import EventBus from '../EventBus.ts';
import type { GameState } from '../models/types.ts';
```

### Naming Conventions
- **Classes**: `PascalCase` (e.g., `GameState`, `Player`, `BaseComponent`)
- **Functions/Variables**: `camelCase` (e.g., `addCash`, `currentPlayer`)
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `DAILY_EXPENSE`)
- **Private methods**: Prefix with underscore (e.g., `_formatMoney`)
- **Boolean variables**: Use `is`, `has`, `can` prefixes (e.g., `isAI`, `hasCar`)
- **Interfaces/Types**: `PascalCase` (e.g., `PlayerData`, `GameConfig`)

### File Organization
- Main entry: `src/main.ts`
- Game logic: `src/game/` (GameState.ts, Player.ts, GameController.ts, AIController.ts)
- UI logic: `src/ui/` (UIManager.ts, BaseComponent.ts, Icons.ts, EventNotificationManager.ts, ClockVisualization.ts)
- UI components: `src/ui/components/` (HUD.ts, Modal.ts, etc.)
- Systems: `src/systems/` (EconomySystem.ts, TimeSystem.ts)
- Data: `src/data/` (locations.ts, jobs.ts, items.ts, courses.ts, clerks.ts)
- Models/Types: `src/models/types.ts`
- Shared utilities: `src/EventBus.ts`, `src/InputManager.ts`
- Tests mirror source structure in `tests/` folder

### Classes
- Use ES6 class syntax
- Place constructor at the top of the class
- Group related methods together
- Use getter/setter methods instead of direct property access when appropriate
- Mark abstract methods with `abstract` keyword
- Example:
```typescript
export default class GameState {
    constructor(numberOfPlayers: number, isPlayer2AI: boolean = false) {
        // ...
    }

    getCurrentPlayer(): Player {
        return this.players[this.currentPlayerIndex];
    }

    private _privateMethod(): void {
        // ...
    }
}
```

### Error Handling
- Throw descriptive errors for invalid state:
```typescript
if (numberOfPlayers < 1 || numberOfPlayers > 2) {
    throw new Error("Game can only be played with 1 or 2 players.");
}
```
- Use `try/catch` for async operations and external data parsing
- Return `false` or `null` for failed operations that aren't errors (e.g., `spendCash` returns boolean)

### Testing Conventions
- Use Vitest with `jsdom` environment (configured in `vitest.config.ts`)
- Follow the `describe`/`it`/`test` pattern
- Mock external dependencies when needed
- Use `beforeEach` to reset state between tests
- Test file naming: `<ModuleName>.test.ts` or `<ModuleName>.integration.test.ts`
- Place tests in `tests/` folder mirroring the `src/` structure

### CSS
- Main stylesheet: `style.css` (in project root)
- Avoid inline styles
- Use CSS custom properties (variables) for theming
- Follow existing naming patterns in the CSS file

### Event System
- Use `EventBus` for decoupled communication between components
- Publish events with meaningful names: `'stateChanged'`, `'gameEvent'`, `'cashChanged'`, etc.
- Subscribe to events in initialization, unsubscribe when appropriate
- Use typed events where possible

---

## Common Tasks

### Adding a New Feature
1. Create or modify files in `src/game/`, `src/ui/`, or `src/systems/`
2. Add corresponding tests in `tests/`
3. Test with `npm test`

### Fixing a Bug
1. Create a reproduction test in `tests/`
2. Run the test to confirm failure
3. Fix the code
4. Verify the test passes

### Adding a New Location/Job/Course/Item
- Edit files in `src/data/`:
  - `src/data/locations.ts` - Location definitions
  - `src/data/jobs.ts` - Job definitions
  - `src/data/courses.ts` - Course definitions
  - `src/data/items.ts` - Shopping items
  - `src/data/clerks.ts` - NPC dialog

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `src/main.ts` | Application entry point (composition root) |
| `src/game/GameState.ts` | Core game state and turn logic |
| `src/game/Player.ts` | Player data model |
| `src/game/GameController.ts` | Coordinates game flow |
| `src/game/AIController.ts` | AI opponent logic |
| `src/ui/UIManager.ts` | Main UI orchestrator |
| `src/ui/BaseComponent.ts` | Abstract base class for UI components |
| `src/systems/EconomySystem.ts` | Economy logic |
| `src/systems/TimeSystem.ts` | Time progression logic |
| `src/EventBus.ts` | Pub/sub event system |
| `src/InputManager.ts` | Input abstraction |
| `src/models/types.ts` | TypeScript interfaces and types |
| `tests/` | Vitest test suite |

---

## Architecture Notes

### Component-Based UI
The UI is being refactored to use a component-based architecture:
- `BaseComponent.ts` provides the abstract base class
- Components extend `BaseComponent` and implement `render(state)`
- Components manage their own DOM structure and lifecycle

### Unidirectional Data Flow
```
Input → EventBus → Systems → GameState → EventBus → UI Components
```

See `plan.md` for the active refactoring roadmap.
