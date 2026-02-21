# Refactoring Roadmap: Project "Jones Vibes" Modernization

**Date:** 2026-02-21
**Architect:** Senior Technical Lead (AI)
**Target:** Modular, Typed, Event-Driven Architecture

---

## 1. Executive Summary

**Current State:**
The project is a functional Proof of Concept (PoC) written in vanilla ES6 JavaScript. It relies on a "God Object" anti-pattern in `GameView` (handling DOM, logic, and events) and `GameController` (tightly coupled to specific data). Global state (`window.gameController`) is used to bypass circular dependencies, leading to brittle code that is hard to test and extend.

**Desired State:**
We will migrate to a **TypeScript** codebase using **Vite** for modern tooling. The architecture will shift to a **Strict MVC (Model-View-Controller)** or **MVVM** pattern where the View is passive and decoupled from the Logic via a typed Event Bus. All assets and game data will be typed interfaces, ensuring data integrity.

---

## 2. Proposed Architecture

### Directory Structure
```text
src/
├── assets/             # Static assets (images, icons)
├── core/               # Engine-level logic
│   ├── GameLoop.ts
│   ├── EventBus.ts     # Typed Event Emitter
│   └── InputSystem.ts  # Input normalization
├── data/               # Static Game Data (Items, Locations)
│   ├── jobs.ts
│   ├── locations.ts
│   └── items.ts
├── models/             # Business Logic & State (The "Model")
│   ├── GameState.ts    # Single Source of Truth
│   ├── Player.ts
│   └── types.ts        # Shared Interfaces
├── systems/            # Game Logic Managers (The "Controller")
│   ├── EconomySystem.ts
│   ├── TimeSystem.ts
│   └── AIController.ts
├── ui/                 # Rendering Logic (The "View")
│   ├── components/     # Reusable UI components
│   │   ├── Modal.ts
│   │   ├── HUD.ts
│   │   └── Card.ts
│   └── UIManager.ts    # Main UI Orchestrator
├── main.ts             # Composition Root
└── vite-env.d.ts
```

### Architectural Patterns
1.  **Strict Typing:** No `any`. All game entities (Players, Items, Events) must have defined Interfaces.
2.  **Passive View:** The UI components will *never* modify state directly. They will emit `Intents` (e.g., `INTENT_TRAVEL`) via the EventBus.
3.  **System-Based Logic:** Instead of a monolithic `GameController`, we will split logic into Systems (e.g., `EconomySystem` handles banking, `TimeSystem` handles weeks/turns).
4.  **Composition Root:** `main.ts` will be the only place where Systems and Views are instantiated and wired together, removing the need for global variables.

---

## 3. The Roadmap (Phased Approach)

### Phase 1: Tooling & Environment (The Foundation)
*Goal: Stop the bleeding. Get TypeScript and a bundler running.*

- [x] **Task 1.1:** Initialize `package.json` with `vite` and `typescript`.
- [x] **Task 1.2:** Create `tsconfig.json` with `strict: true`.
- [x] **Task 1.3:** Rename all `.js` files to `.ts`. (Expect errors; allow loose compilation initially).
- [x] **Task 1.4:** Move `index.html` to root (Vite standard) and update script source to `src/main.ts`.

### Phase 2: The Data Layer (Typing the Domain)
*Goal: Define what the game "is" using Interfaces.*

- [x] **Task 2.1:** Create `src/models/types.ts`. Define interfaces for `Player`, `Job`, `Course`, `Item`.
- [x] **Task 2.2:** Convert `gameData.js` to typed `ts` files. Ensure all hardcoded data complies with interfaces.
- [x] **Task 2.3:** Refactor `GameState` to use these types. Remove magic strings.

### Phase 3: Decoupling the View (The Great Split)
*Goal: Break `ui.js` into manageable components.*

- [x] **Task 3.1:** Create `UIManager.ts` as the new entry point for UI.
- [x] **Task 3.2:** Extract `Modal` logic into `src/ui/components/Modal.ts`. It should have methods like `show(config)` and emit events on close/action.
- [x] **Task 3.3:** Extract `HUD` logic (cash, weeks, clocks) into `src/ui/components/HUD.ts`.
- [x] **Task 3.4:** Remove direct references to `window.gameController` in UI files. Replace with `EventBus.emit('ACTION_NAME', payload)`.

### Phase 4: Logic Segregation (System Architecture)
*Goal: Slim down `GameController`.*

- [x] **Task 4.1:** Create `EconomySystem`. Move `deposit`, `withdraw`, `buyItem` logic here.
- [x] **Task 4.2:** Create `TimeSystem`. Move `endTurn`, `advanceWeek` logic here.
- [x] **Task 4.3:** Update `main.ts` to listen for UI events and route them to the correct System.

### Phase 5: Cleanup & Optimization
*Goal: Polish and Performance.*

- [x] **Task 5.1:** Remove all `@ts-nocheck` and fix remaining type errors.
- [x] **Task 5.2:** Implement strict `null` checks.
- [x] **Task 5.3:** Optimize asset loading (if any heavy assets exist).

---

## 4. Acceptance Criteria

1.  **Zero Build Errors:** `npm run build` completes with no TypeScript errors.
2.  **No Globals:** `window.gameController` must not exist.
3.  **Testability:** Core logic (Economy, Time) must be testable via unit tests without a DOM present.
4.  **Feature Parity:** The game must be playable exactly as it is now, but with the new internal structure.
