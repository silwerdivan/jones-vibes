# Implementation Plan: Feature 1 - EULA Initialization Screen

## 1. Overview
This plan outlines the steps to implement the mandatory "OmniLife OS" EULA screen for new games. This screen replaces a standard start button with a dystopian corporate agreement where players select starting buffs/debuffs disguised as legal clauses.

## 2. Dev Tasks

### Task 1: Data Structure & Clause Definitions
- [x] Create `src/data/eula.ts` to store the EULA boilerplate text and clause definitions.
- [x] Define the 4 clauses with their associated state mutators:
  - [x] **Clause A (Micro-Stimulus):** `Money +200`, `Bio-Deficit +40`
  - [x] **Clause B (Grindset):** `Hours +6` (Turn 1 only), `Morale -20`
  - [x] **Clause C (Data-Harvest):** Inventory `+Omni-Terminal`, Global `wageMultiplier = 0.9`
  - [x] **Clause D (Liquidity):** `Money +500`, `Bank Debt +500`

### Task 2: Build the EULA UI Component (`EulaModal.ts`)
- [x] Create a new UI component `src/ui/components/EulaModal.ts`.
- [x] Implement layout:
  - [x] A scrollable text container for the EULA legal text.
  - [x] A form section with 4 optional checkboxes for the clauses.
  - [x] A primary `[I ACCEPT]` button, initialized with the `disabled` attribute.
- [x] Implement interactivity:
  - [x] Add an `onScroll` listener to the EULA text container.
  - [x] Remove the `disabled` state from the accept button when the user scrolls to the bottom (e.g., `scrollTop + clientHeight >= scrollHeight - 10`).
- [x] (Optional) Implement a typewriter effect for the EULA text to enhance the dystopian vibe.

### Task 3: Intercept Game Initialization (`main.ts`)
- [x] Modify the startup flow in `src/main.ts`.
- [x] Pause the activation of the game loop when initializing a **new game** (no save data found).
- [x] Render the `EulaModal` over the app shell.
- [x] Wait for the `onAccept` event from the modal before proceeding to Phase 6 (Activating Simulation).

### Task 4: Apply State Mutators & Edge Case Handling
- [ ] Upon EULA acceptance, evaluate the checked clauses and apply the net changes to the newly created `GameState` for Player 1.
- [ ] Ensure the `wageMultiplier` from Clause C is stored persistently so it survives reloads.
- [ ] Implement **Edge Case Mitigation ("Turn 1 Death"):**
  - [ ] Ensure that Game Over condition checks (e.g., Morale dropping below 0, Bio-Deficit hitting 100) do NOT trigger immediately upon initialization.
  - [ ] The player must be allowed to take at least one action before these penalties force a game over.

### Task 5: UI/Economy Updates for Clauses
- [ ] **Clause C (Wage Multiplier):** Update `EconomySystem` or Job logic to multiply earned wages by `0.9` if this clause is active.
- [ ] Update the UI (e.g., the Job Board or Life Screen) to visually indicate the reduced wage (e.g., striking through the original wage and showing the new one in red).
- [ ] **Clause B (Turn 1 Hours):** Ensure the `+6` hours only applies to the very first turn and resets normally afterwards.

## 3. Validation Strategy
- [ ] Start a new game and verify the EULA screen appears.
- [ ] Verify the `[I ACCEPT]` button is disabled until scrolled to the bottom.
- [ ] Select different combinations of clauses and verify the starting stats match the expected math.
- [ ] Reload the page immediately after accepting the EULA and verify the chosen stats persist via `SessionStorage`.
- [ ] Select Clauses A and B to verify the "Turn 1 Death" edge case is handled gracefully.
