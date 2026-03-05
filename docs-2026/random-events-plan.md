# Plan: Random Events System Implementation

This document outlines the tasks required to implement the "Random Events Deck" as described in `random-events-design.md`.

## 1. Models and Types
- [ ] Define `ConditionEffect` type (e.g., `WAGE_MULTIPLIER`, `TRAVEL_TIME_MODIFIER`, `STUDY_EFFICIENCY`, `HAPPINESS_TICK`).
- [ ] Define `GameCondition` interface in `src/models/types.ts`.
- [ ] Define `RandomEvent` interface in `src/models/types.ts`.
- [ ] Update `PlayerState` to include `activeConditions`.
- [ ] Update `GameStateState` to include `eventHistory` (last fired timestamps/turns).

## 2. Data Definition
- [ ] Create `src/data/conditions.ts` with baseline condition definitions.
- [ ] Create `src/data/randomEvents.ts` with the 7 starter events (Global, Local, Consequence).

## 3. Core Logic: Event Manager
- [ ] Create `src/game/EventManager.ts`.
- [ ] Implement `checkTriggers(type, context)` method.
- [ ] Implement `evaluatePrerequisites(event, player)` logic.
- [ ] Implement `applyChoice(event, choiceIndex, player)` logic.
- [ ] Implement `tickConditions(player)` to handle duration decay and removal.

## 4. GameState & Systems Integration
- [ ] Update `Player.ts` to manage `activeConditions` and provide modified stats (e.g., `getTravelTime()`).
- [ ] Update `GameState.ts` to initialize `EventManager` and persist its state.
- [ ] Hook `EventManager.tickConditions()` into the `TimeSystem` end-of-turn logic.
- [ ] Hook `EventManager.checkTriggers('arrival')` into `GameState.travel()`.
- [ ] Hook `EventManager.checkTriggers('weekStart')` into `TimeSystem.nextTurn()` (for Monday 00:00).

## 5. UI Implementation
- [ ] Update `UIManager.ts` to support displaying `RandomEvent` modals.
- [ ] Update `HUD.ts` to display active conditions as status icons with tooltips.
- [ ] Enhance `Modal.ts` if necessary to support the "Dilemma" format (flavor text + multiple choices).

## 6. Starter Events Implementation
- [ ] Implement `global_transit_strike`.
- [ ] Implement `global_stimulus_windfall`.
- [ ] Implement `local_fastfood_glitch`.
- [ ] Implement `local_college_blackmarket`.
- [ ] Implement `local_bank_glitch`.
- [ ] Implement `state_low_happiness_burnout`.
- [ ] Implement `state_high_happiness_flow`.

## 7. Testing & Validation
- [ ] Create `tests/EventManager.test.ts` for unit testing the logic.
- [ ] Create `tests/Conditions.test.ts` to verify stat modifiers work as expected.
- [ ] Perform manual playtesting to ensure event frequency and "emotional target" (Calculated Tension) are met.

---
**Status:** 0% Complete
**Lead:** Gemini CLI
