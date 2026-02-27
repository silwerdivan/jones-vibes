# Refactoring Regression Analysis - 2026-02-23

## Executive Summary
Recent refactoring efforts (Phases 1-3) successfully decoupled the UI into components and introduced a granular state event system. However, several visual and functional regressions were introduced due to strict dependencies on legacy HTML IDs and a lack of proper event cleanup in the `BaseComponent` architecture.

---

## 1. Visual Regressions: Status Orbs & Avatars

### Finding
The status orbs in the HUD and player avatars in the Life screen have lost their specific neon styling (glows, gradients, and active states).

### Root Cause
`style.css` contains highly specific ID selectors for player-specific styling:
- `#orb-p1.active`, `#orb-p2.active` (Glow colors)
- `#hud-avatar-p1`, `#hud-avatar-p2` (Gradients)

The refactored `HUD.ts` and `LifeScreen.ts` components create these elements dynamically using `tagName` and `className` but **do not assign the required IDs**. Instead, they use data attributes (e.g., `[data-orb="p1"]`) for logic, which the CSS does not recognize for these specific styles.

---

## 2. Functional Regressions: Tab Bar & Screen Navigation

### Finding
The tab bar buttons for "Social" and "Menu" do not work, and clicking them produces no visual feedback or screen switch.

### Root Cause
1. **Unregistered Screens**: `UIManager.ts` registers 5 tabs (`city`, `life`, `inventory`, `social`, `menu`) but only registers 3 corresponding screen components. When `ScreenManager` attempts to switch to `social` or `menu`, it finds no component and (correctly) warns in the console, resulting in no action.
2. **Shadow DOM Duplication**: `ScreenManager.ts` creates its own `content-area` and `tab-bar` inside its container. While `UIManager` removes the "old" ones from `index.html`, any CSS that relies on these elements being direct children of `.app-shell` (or specific nesting levels) may be subtly broken.

---

## 3. UI Regression: "Rest / End Turn" Button

### Finding
The "Rest / End Turn" button in the Home dashboard has lost its prominent styling or "primary" visual weight.

### Root Cause
In the legacy `index.html`, this button was part of a static structure. It is now dynamically generated via `UIManager.getLocationActions()` and added to the `ChoiceModal` as a "secondary button" (even if marked primary). The CSS selector for the Home-specific "End Turn" button might be missing or the `ChoiceModal`'s button container doesn't provide the same layout context as the old dashboard.

---

## 4. Architectural Critical Issue: Memory/Event Leak

### Finding
`BaseComponent.unsubscribeAll()` does not actually stop events from firing.

### Root Cause
The `EventBus.ts` implementation **lacks an `unsubscribe` method**.
- `BaseComponent.ts` tracks subscriptions in an array and "clears" them on unmount.
- However, since there is no way to remove a listener from `EventBus`, the stale handlers remain active in the global `EventBus.events` object.
- **Impact**: Every time a screen is remounted or a component is recreated, a *new* listener is added. The old ones persist, leading to duplicate renders, memory leaks, and "ghost" behavior where hidden screens still react to state changes.

---

## 5. Recommendation Plan

### Phase A: CSS/ID Alignment
- [x] Modify `HUD.ts` and `LifeScreen.ts` to restore critical IDs (`#orb-p1`, etc.).
- [x] Update `style.css` to prefer class-based or data-attribute selectors where possible to avoid ID coupling.

### Phase B: EventBus Hardening
- [x] Implement `unsubscribe(eventName, callback)` in `EventBus.ts`.
- [x] Update `BaseComponent.ts` to properly call `EventBus.unsubscribe()` for every tracked subscription during `unmount()`.

### Phase C: Screen Completeness
- [x] Register placeholder/empty components for "Social" and "Menu" to ensure the Tab Bar remains functional.
- [x] Audit `UIManager.ts` to ensure "Primary" actions in the dashboard are rendered with higher visual priority than "Secondary" actions.
