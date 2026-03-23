# AGENTS.md - Jones in the Fast Lane Development

## Project Overview

This is a TypeScript-based browser game using Vite. The codebase follows strict TypeScript conventions with ESNext modules.

## Build / Lint / Test Commands

```bash
# Development
npm run dev                    # Start Vite dev server (http://localhost:5173)

# Build
npm run build                  # TypeScript check + Vite production build
npm run preview                # Preview production build

# Testing
npm run test                   # Run all unit tests (vitest run)
npm run test:watch             # Run tests in watch mode
npm run test:e2e               # Run Playwright e2e tests

# Single test file
npx vitest run tests/GameState.test.ts
npx vitest run tests/GameState.test.ts --reporter=verbose

# Test with coverage
npx vitest run --coverage

# Specific test matching
npx vitest run -t "should serialize"
```

## Project Structure

```
src/
├── game/           # Core game logic (GameState, Player, AIController, EventManager)
├── systems/        # Game systems (EconomySystem, TimeSystem)
├── ui/             # UI components, managers, screens
│   └── components/ # Reusable components (shared/, screens/)
├── models/         # TypeScript interfaces and types
├── data/           # Game data (jobs, courses, items, events, conditions)
├── services/       # Services (PersistenceService, LiveSessionBridge)
└── EventBus.ts     # Pub/sub event system

tests/
├── ui/             # UI component tests
├── scripts/        # Workflow script tests
└── *.test.ts       # Core game logic tests
```

## TypeScript Configuration

- **Strict mode enabled** (`strict: true`)
- **No unused locals/parameters** (`noUnusedLocals`, `noUnusedParameters`)
- **ESNext target** with bundler module resolution
- `noEmit: true` (Vite handles compilation)
- Files must use `.js` extension in imports (even in `.ts` files)

## Code Style Guidelines

### Imports

```typescript
// Internal modules - ALWAYS include .js extension
import GameState from './game/GameState.js';
import { UI_EVENTS, STATE_EVENTS } from '../EventBus.js';
import type EconomySystem from '../systems/EconomySystem.js';
import { Player } from './Player.js';

// External modules - no extension
import { describe, it, expect, beforeEach } from 'vitest';
import EventBus from '../EventBus';  // Works but prefer explicit .js
```

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Classes | PascalCase | `class GameState {}` |
| Interfaces | PascalCase | `interface PlayerState {}` |
| Type aliases | PascalCase | `type ConditionEffectType = ...` |
| Constants (const objects) | SCREAMING_SNAKE | `export const STATE_EVENTS = {...} as const` |
| Event strings | SCREAMING_SNAKE | `'STATE_CREDITS_CHANGED'` |
| Variables/functions | camelCase | `function addCredits() {}` |
| Private class members | underscore prefix | `_economySystem`, `_render()` |
| Files | kebab-case | `game-state.ts`, `action-card.ts` |

### TypeScript Patterns

**Interfaces for data shapes:**
```typescript
export interface PlayerState {
    id: number;
    credits: number;
    savings: number;
}
```

**Type unions for limited sets:**
```typescript
export type RandomEventType = 'Global' | 'Local' | 'Consequence' | 'Hidden';
export type ItemType = 'essential' | 'asset';
```

**Enum-like constants with `as const`:**
```typescript
export const STATE_EVENTS = {
    CREDITS_CHANGED: 'STATE_CREDITS_CHANGED',
    TIME_CHANGED: 'STATE_TIME_CHANGED',
} as const;

export const UI_EVENTS = {
    REST_END_TURN: 'UI_INTENT_REST_END_TURN',
} as const;
```

**Type-only imports:**
```typescript
import type EconomySystem from '../systems/EconomySystem.js';
```

### Error Handling

**Constructor validation:**
```typescript
constructor(numberOfPlayers: number) {
    if (numberOfPlayers < 1 || numberOfPlayers > 2) {
        throw new Error("Game can only be played with 1 or 2 players.");
    }
}
```

**Fail-fast with boolean returns:**
```typescript
spendCredits(amount: number): boolean {
    if (this.credits >= amount) {
        this.credits -= amount;
        return true;
    }
    return false;
}
```

**Guard patterns for invalid states:**
```typescript
if (this.isAIThinking && !isAIAction) {
    return false;
}
```

**console.warn for non-critical issues:**
```typescript
default:
    console.warn(`AI tried an unknown action: ${aiAction.action}`);
    break;
```

### UI Components (BaseComponent Pattern)

```typescript
export default abstract class BaseComponent<T = unknown> {
    protected element: HTMLElement;
    protected mounted: boolean = false;
    private subscriptions: Subscription[] = [];

    constructor(tagName: string, className?: string, id?: string) {
        this.element = document.createElement(tagName);
        if (className) this.element.className = className;
        if (id) this.element.id = id;
    }

    public render(state: T): void {
        const startTime = performance.now();
        this._render(state);
        // Performance logging...
    }

    protected abstract _render(state: T): void;

    mount(parent: HTMLElement): void {
        if (this.mounted) return;
        parent.appendChild(this.element);
        this.mounted = true;
    }

    unmount(): void {
        if (!this.mounted || !this.element.parentElement) return;
        this.element.parentElement.removeChild(this.element);
        this.mounted = false;
        this.unsubscribeAll();
    }
}
```

### Event Bus Pattern

```typescript
import EventBus, { UI_EVENTS, STATE_EVENTS } from '../EventBus.js';

// Subscribe
const handler = (data: any) => { /* ... */ };
EventBus.subscribe(UI_EVENTS.WORK_SHIFT, handler);

// Unsubscribe when component unmounts
EventBus.unsubscribe(UI_EVENTS.WORK_SHIFT, handler);

// Publish
EventBus.publish(STATE_EVENTS.CREDITS_CHANGED, { player, amount });

// Clear all subscriptions (in tests and cleanup)
EventBus.clearAll();
```

### Serialization Pattern

Classes implementing persistence:
```typescript
toJSON(): PlayerState { /* return plain object */ }

static fromJSON(data: PlayerState): Player {
    const player = new Player(data.id);
    player.credits = data.credits;
    // restore all state
    return player;
}
```

### Testing Patterns

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import GameState from '../src/game/GameState.js';
import EventBus from '../src/EventBus.js';

describe('GameState', () => {
    let gameState: GameState;

    beforeEach(() => {
        EventBus.clearAll();
        gameState = new GameState(2, true);
    });

    it('should serialize to JSON correctly', () => {
        gameState.turn = 5;
        const json = gameState.toJSON();
        expect(json.turn).toBe(5);
    });

    it('should deserialize from JSON correctly', () => {
        const json = gameState.toJSON();
        const restored = GameState.fromJSON(json);
        expect(restored.turn).toBe(gameState.turn);
    });
});
```

## General Guidelines

- Keep files focused on single responsibility
- Use `any` sparingly; prefer explicit types
- Always clear EventBus in `beforeEach` hooks
- Prefer early returns over nested conditionals
- Group related tests with nested `describe` blocks
- Test files go in `tests/` directory mirroring `src/` structure
