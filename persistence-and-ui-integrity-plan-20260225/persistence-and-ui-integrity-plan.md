# Plan: Persistence & UI Integrity Overhaul

## Overview
Currently, game persistence is "data-complete" but "UI-volatile." While the underlying stats are saved, the user's visual context (active screen, open dashboards) is lost on refresh. This plan moves the game toward a **State-Driven UI** where the interface is a reflection of the persisted `GameState`, rather than a collection of transient modals.

## Stage 1: UI State Synchronization (The "Quick Wins")
**Goal:** Ensure the player returns to the same screen and location dashboard after a refresh.

- [x] **Task 1.1: Persist Active Screen**
    - Add `activeScreenId` to `GameStateState`.
    - Update `ScreenManager` to publish an event when a screen is switched.
    - Update `GameState` to store and serialize the `activeScreenId`.
    - Update `main.ts` to tell `ScreenManager` which screen to show on startup.
- [x] **Task 1.2: Persist Location Dashboard**
    - Add `activeLocationDashboard` (string | null) to `GameStateState`.
    - Update `UIManager` to set this value when `showLocationDashboard(location)` is called.
    - Update `UIManager` bootstrapping to re-open the dashboard if a value exists in the state.
- [ ] **Task 1.3: Include "Home" in Dashboard System**
    - Currently, "Home" is a special case using a FAB.
    - Standardize Home as a dashboard-capable location to allow the "Rest" action to persist/restore just like "Work" or "Shop".

## Stage 2: Data-Driven Modals (Structural Refinement)
**Goal:** Solve the "stuck" state caused by transient modals with non-serializable callbacks.

- [ ] **Task 2.1: Formalize "Choice" Actions**
    - Instead of passing anonymous functions to `showChoiceModal`, create an `ActionRegistry` or use string-based action IDs.
    - This allows the `GameState` to say "The player is currently choosing a [BankAction]" without needing to serialize a Javascript function.
- [ ] **Task 2.2: Refactor ChoiceModal Persistence**
    - Add `activeChoiceContext` to `GameState`.
    - If a refresh occurs during a "Confirm Loan" choice, the UI should be able to reconstruct that specific modal view from the data.

## Stage 3: Robust Bootstrapping & AI Continuity
**Goal:** Eliminate race conditions during game startup.

- [ ] **Task 3.1: Unified Initialization Flow**
    - Refactor `main.ts` to ensure `UIManager` and all systems are fully registered before the first `stateChanged` event is fired.
- [ ] **Task 3.2: AI State Recovery**
    - Ensure AI "thinking" states and turn transitions are fully resumable (expanding on the recent bugfix).

## Stage 4: Testing & Validation
- [ ] **Task 4.1: Persistence Stress Test**
    - Create a test suite that simulates refreshes at every major interaction point (Travel, Work, Bank, Shopping).
- [ ] **Task 4.2: UI Integrity Audit**
    - Verify that no "gatekeeper" UI elements (modals that block progress) can be bypassed or lost via a browser refresh.

## Summary of Architectural Change
Instead of `UIManager` managing its own visibility state, it will become a **subscriber** to the `GameState`'s view properties. 
**Current:** `User clicks -> UI shows modal -> Modal has callback.`
**Future:** `User clicks -> State updates (activeLocation) -> UI reacts to State -> UI triggers intent.`
