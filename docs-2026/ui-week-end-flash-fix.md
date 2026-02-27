# Plan: Prevent UI Flashing at End of Week

## Problem
When a player travels to a location and that move consumes their last remaining time, the location's dashboard modal (clerk view) briefly "flashes" before being superseded by the "Oh what a weekend!" turn summary modal. This is caused by overlapping timers and state change triggers:
1. `GameState.travel()` updates the location and deducts time, then publishes `stateChanged`.
2. `UIManager` handles `stateChanged` and calls `handleAutoArrival()`, which triggers `showLocationDashboard()` after a 300ms delay.
3. `GameState` also calls `_checkAutoEndTurn()`, which triggers the end-turn logic (and the summary modal) after a 1000ms delay.

## Proposed Solution
Modify `src/ui/UIManager.ts` to be more discerning about when it shows the location dashboard:
1. **In `handleAutoArrival`**: Add a check to only trigger the dashboard if `currentPlayer.time > 0`.
2. **In `showLocationDashboard`**: 
   - Skip showing the dashboard if `isSummaryShown` is true or if there is a `pendingTurnSummary` in the game state.
   - For locations other than 'Home', skip showing the dashboard if the player has no time remaining.

## Implementation Plan
1. **Modify `src/ui/UIManager.ts`**:
   - Update `showLocationDashboard(location: string)` to include the new guard clauses.
   - Update `handleAutoArrival()` to include the time check.

## Verification Strategy
### Manual Testing
- **Scenario 1: Travel exhausts time.** Travel to a location where `travelTime == remainingTime`. Verify that the dashboard does NOT appear and the Turn Summary appears after the usual delay.
- **Scenario 2: Action exhausts time.** Perform an action (like "Work Shift") that exhausts time. Verify that the dashboard does not "refresh" or reappear unnecessarily.
- **Scenario 3: Travel to Home.** Travel to 'Home' with zero time. Verify that the Home dashboard (which allows manual turn end) still behaves correctly or is superseded by the auto-end turn.

### Automated Testing
- Review `tests/ui/components/screens/CityScreen.test.ts` and other UI tests to ensure no regressions in travel handling.
