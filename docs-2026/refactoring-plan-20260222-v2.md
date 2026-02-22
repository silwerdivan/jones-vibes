# Executive Summary: Component Architecture Refactoring (v2)

This is an **updated refactoring plan** incorporating lessons learned from the initial migration. The codebase has successfully moved to TypeScript with a clean `src/` structure, but now faces a second-phase challenge: **HTML-UI coupling**.

---

## Current State Analysis

### What's Working Well ✓

| Area | Status | Evidence |
|------|--------|----------|
| **TypeScript Migration** | ✅ Complete | Strict typing in `src/models/types.ts`, all `.ts` files |
| **EventBus Architecture** | ✅ Solid | Typed events, unidirectional flow |
| **System Separation** | ✅ Good | `EconomySystem`, `TimeSystem` are decoupled |
| **Main Entry Point** | ✅ Clean | `main.ts` is a thin composition root (52 lines) |
| **Modal Abstraction** | ✅ Started | `Modal` base class exists with swipe-to-close |

### What Needs Improvement ⚠️

| Problem | Location | Impact |
|---------|----------|--------|
| **ID-based DOM coupling** | `HUD.ts`, `Modal.ts`, `UIManager.ts` | 50+ `document.getElementById()` calls create fragile links |
| **Static HTML skeleton** | `index.html` | 314 lines of empty containers waiting for JS injection |
| **God Object UIManager** | `UIManager.ts` | 752 lines, handles screens, modals, gauges, grids, feedback |
| **HTML-in-JS strings** | `renderActionCards()`, `updateGauge()` | Unmaintainable template strings mixed with logic |

---

## Proposed Architecture: Component Tree

```
src/
├── main.ts                      # Bootstrap (unchanged)
└── ui/
    ├── UIManager.ts             # Orchestrator (reduced scope)
    ├── BaseComponent.ts         # NEW: Abstract component base
    ├── Icons.ts                 # SVG icon registry (unchanged)
    ├── ClockVisualization.ts    # Existing utility
    ├── EventNotificationManager.ts
    └── components/
        ├── hud/
        │   ├── HUD.ts           # Refactored: self-rendering
        │   ├── StatusOrb.ts     # NEW: Extracted component
        │   └── Ticker.ts        # NEW: Extracted component
        ├── screens/
        │   ├── ScreenManager.ts # NEW: Screen switching logic
        │   ├── CityScreen.ts    # NEW: City grid component
        │   ├── LifeScreen.ts    # NEW: Life stats component
        │   └── InventoryScreen.ts # NEW: Inventory component
        ├── shared/
        │   ├── Modal.ts         # Enhanced base class
        │   ├── ActionCard.ts    # NEW: Reusable card factory
        │   └── Gauge.ts         # NEW: SVG gauge component
        └── widgets/
            └── FeedbackParticle.ts # NEW: Floating feedback
```

### Key Pattern: `BaseComponent`

Every UI piece extends a base class that handles DOM creation and lifecycle:

```typescript
// Conceptual interface (NOT implementation code)
abstract class BaseComponent<T = unknown> {
    protected element: HTMLElement;
    constructor(tagName: string, className?: string);
    abstract render(state: T): void;
    getElement(): HTMLElement;
    mount(parent: HTMLElement): void;
    unmount(): void;
}
```

---

## The Roadmap (Phased Approach)

---

### Phase 0: Dependency Audit (NEW)

**Goal:** Create a target list before any refactoring begins.

#### Task 0.1: DOM Selector Inventory
Create a file `refactoring-docs-20260222/dom-selectors-audit.md` listing:
- Every `document.getElementById()` call
- Every `document.querySelector()` call
- The file and line number for each
- Whether it's used once or multiple times

**Deliverable:** A markdown table with columns: `Selector | File | Line | Usage Count | Priority`

#### Task 0.2: HTML String Inventory
List all `innerHTML = ` assignments containing template strings:
- `renderActionCards()` (lines 388-398 in UIManager.ts)
- `updateGauge()` (lines 701-709 in UIManager.ts)
- `renderCityGrid()` (lines 602-606 in UIManager.ts)
- `renderInventoryScreen()` (lines 737-745 in UIManager.ts)

**Deliverable:** A markdown table with columns: `Method | Template Size (lines) | Refactor Target`

#### Task 0.3: Event Subscription Map
Document all `EventBus.subscribe()` calls:
- What events exist?
- Who subscribes to what?
- Who publishes what?

**Deliverable:** A diagram or table showing event flow.

**Acceptance Criteria (Phase 0):**
- [ ] `refactoring-docs-20260222/dom-selectors-audit.md` exists and is complete
- [ ] `refactoring-docs-20260222/html-strings-audit.md` exists and is complete
- [ ] `refactoring-docs-20260222/event-flow-diagram.md` exists and is complete
- [ ] All audits reviewed and approved before Phase 1 begins

---

### Phase 1: Shell Extraction

**Goal:** Reduce `index.html` to a minimal shell. Move HUD into a self-rendering component.

#### Task 1.1: Create `BaseComponent.ts`

Create the abstract base class in `src/ui/BaseComponent.ts`:

**Requirements:**
- Constructor accepts `tagName`, `className`, and optional `id`
- Stores reference to created element
- Abstract `render(state)` method
- `getElement()` returns the element
- `mount(parent)` appends to parent
- `unmount()` removes from DOM

**Testing:** Create `tests/ui/BaseComponent.test.ts`:
- Test element creation with tag and class
- Test mount/unmount cycle
- Test that abstract render throws if not implemented

#### Task 1.2: Refactor `HUD.ts` to Self-Render

**Current Problem:** HUD constructor calls `document.getElementById()` 7 times.

**Target State:**
- HUD extends `BaseComponent<GameState>`
- HUD creates its own DOM structure in constructor
- HUD no longer relies on `index.html` having specific elements
- HUD exposes `getElement()` for mounting

**Steps:**
1. Move HUD HTML structure from `index.html` into HUD's `render()` method
2. Replace `document.getElementById()` with `this.element.querySelector()` on internal elements
3. Update `main.ts` to mount HUD: `uiManager.hud.mount(document.querySelector('.app-shell'))`

**Testing:** 
- Visual test: HUD renders identically
- Unit test: HUD works when `index.html` has no HUD elements

#### Task 1.3: Extract `StatusOrb.ts`

The HUD contains two status orbs (P1/P2). Extract into a reusable component.

**Requirements:**
- `StatusOrb` extends `BaseComponent`
- Accepts player index and config (colors, labels)
- Handles clock visualization internally
- Emits click event via EventBus

**Testing:**
- Test with mock player data
- Test click event emission

#### Task 1.4: Create `ScreenManager.ts`

**Current Problem:** Screen switching logic is scattered in `UIManager.ts` (lines 143-178).

**Target State:**
- `ScreenManager` manages screen lifecycle
- Screens are registered components, not DOM queries
- `switchScreen(id)` is a single method call

**Requirements:**
- `registerScreen(id: string, component: BaseComponent)`
- `switchScreen(id: string)` hides current, shows new
- Emits `screenSwitched` event

**Acceptance Criteria (Phase 1):**
- [ ] `index.html` HUD section is empty (or removed entirely)
- [ ] HUD component creates its own DOM structure
- [ ] All HUD tests pass
- [ ] Screen switching still works
- [ ] No visual regression

---

### Phase 2: Template Decoupling

**Goal:** Move all `innerHTML` string templates into component classes or factory functions.

#### Task 2.1: Create `ActionCard.ts`

**Current Problem:** `renderActionCards()` in UIManager.ts contains a 40-line template string with complex logic.

**Target State:**
- `ActionCard` is a component or factory function
- Accepts typed data: `Job | Course | Item`
- Handles locked/hired states internally
- Emits click with action payload

**Decision Point:** For a list of 20+ cards, use a **factory function** instead of a class to avoid instantiation overhead:

```typescript
// Factory approach (lighter weight)
function createActionCard(data: ActionCardData, onClick: (action: Action) => void): HTMLElement
```

**Testing:**
- Test with job data, course data, shopping data
- Test locked state visual
- Test click handler invocation

#### Task 2.2: Create `CityScreen.ts` and `Gauge.ts`

**Current Problem:** `renderCityGrid()` and `updateGauge()` contain inline SVG and HTML strings.

**Target State:**
- `CityScreen` extends `BaseComponent<GameState>`
- `Gauge` is a reusable widget component
- SVG templates live inside component classes

**Requirements:**
- `Gauge` accepts: `value`, `max`, `color`, `label`
- `CityScreen` uses a factory for `BentoCard` elements
- Location icons are looked up from `Icons` registry

**Testing:**
- Test gauge percentage calculation
- Test gauge color application
- Test city grid renders all locations

#### Task 2.3: Create `LifeScreen.ts` and `InventoryScreen.ts`

**Current Problem:** These screens exist as methods in UIManager, not as components.

**Target State:**
- Both extend `BaseComponent<GameState>`
- Manage their own DOM structure
- Status chips, avatar, gauges are internal

**Testing:**
- Test status chip generation (Hungry, Starving, In Debt, etc.)
- Test inventory grid population
- Test owned/locked states

#### Task 2.4: Reduce `UIManager.ts` Scope

After extracting components, UIManager should become a thin orchestrator:

**Remaining Responsibilities:**
- Initialize components
- Subscribe to events
- Delegate rendering to components
- Manage modal instances

**Target Line Count:** < 200 lines

**Acceptance Criteria (Phase 2):**
- [ ] `UIManager.ts` is < 200 lines
- [ ] No `innerHTML` template strings in UIManager
- [ ] All screens are component classes
- [ ] `index.html` contains only `<div id="app"></div>` (or minimal shell)
- [ ] All tests pass

---

### Phase 3: Reactive State Binding

**Goal:** Components subscribe to the events they care about, reducing manual render calls.

#### Task 3.1: Add Subscription Support to `BaseComponent`

**Enhancement:**
- Components can subscribe to events during construction
- `render()` is called automatically when relevant events fire
- Components track their own subscriptions for cleanup

**Requirements:**
- `subscribe<T>(event: string, handler: (data: T) => void)`
- `unsubscribeAll()` for cleanup
- Consider a `connect(store)` pattern if appropriate

#### Task 3.2: Implement Granular Updates

**Current Problem:** Any state change triggers a full `render()` of the active screen.

**Target State:**
- HUD updates only on `cashChanged`, `locationChanged`, `timeChanged`
- CityScreen updates only on `locationChanged`
- InventoryScreen updates only on `inventoryChanged`

**Testing:**
- Test that HUD doesn't re-render when inventory changes
- Test that CityScreen doesn't re-render when cash changes

#### Task 3.3: Performance Baseline

**Goal:** Establish metrics for render performance.

**Requirements:**
- Add performance logging to `BaseComponent.render()`
- Measure time from state change to DOM update
- Establish acceptable thresholds (< 16ms for 60fps)

**Acceptance Criteria (Phase 3):**
- [ ] Components auto-update on relevant events
- [ ] Manual `render()` calls are eliminated from UIManager
- [ ] Performance metrics are logged in dev mode
- [ ] No unnecessary re-renders

---

### Phase 4: Testing Infrastructure (NEW)

**Goal:** Ensure all new components are testable and tested.

#### Task 4.1: Setup Component Testing Helpers

Create `tests/helpers/componentTestUtils.ts`:
- `renderInTestContainer(component)` - mounts component in isolated DOM
- `simulateClick(element)` - fires click events
- `simulateInput(element, value)` - fires input events
- `waitFor(predicate, timeout)` - async wait helper

#### Task 4.2: Add Visual Regression Baseline (Optional)

Consider adding a visual regression tool:
- Playwright or Percy for screenshot comparison
- Capture baseline screenshots of key screens
- Fail CI if visual changes occur

**Acceptance Criteria (Phase 4):**
- [ ] All components have corresponding test files
- [ ] Test coverage > 80% for new components
- [ ] `npm test` passes with no failures
- [ ] (Optional) Visual regression tests exist

---

## Consolidated Acceptance Criteria

### Definition of Done for Each Phase

| Phase | Must Have | Nice to Have |
|-------|-----------|--------------|
| **0: Audit** | All audits complete and documented | Diagram visualization of event flow |
| **1: Shell** | HUD self-renders, `index.html` reduced | StatusOrb extracted as component |
| **2: Templates** | UIManager < 200 lines, no innerHTML strings | ActionCard factory pattern |
| **3: Reactive** | Components auto-update, no manual renders | Performance metrics logged |
| **4: Testing** | 80% coverage on new components | Visual regression tests |

### Final Success Metrics

1. **`index.html` line count:** 314 → < 30 lines
2. **`UIManager.ts` line count:** 752 → < 200 lines
3. **`document.getElementById()` calls:** 50+ → < 10
4. **Test coverage for `src/ui/`:** Current → > 80%
5. **No runtime errors** from missing DOM elements

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Breaking existing functionality | Phase 0 audit ensures nothing is missed; test each phase |
| Visual regression | Manual testing after each phase; consider visual regression in Phase 4 |
| Over-engineering | Use factory functions for simple cases; don't force class pattern |
| Scope creep | Stick to phased approach; don't skip phases |

---

## Next Steps for the Junior Dev

1. **Start with Phase 0:** Create the audit documents. This will take 1-2 hours but save days of confusion.
2. **Commit after each task:** Small, atomic commits make rollback easy.
3. **Test visually:** After each phase, play the game end-to-end.
4. **Ask questions:** If a task is unclear, ask before implementing.

---

*Generated: 2026-02-22*
*Based on: `refactoring-plan-20260221.md` with enhancements*
