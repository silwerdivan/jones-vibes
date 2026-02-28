# Home Modal Fix Plan

## The Issue
The Home modal does not appear automatically when the player visits the Home location mid-turn, unless their time is up. This requires the player to click the Home bento card again to rest or end their turn, which is poor UX.

## The Cause
In `src/ui/UIManager.ts`, the `handleAutoArrival` method contains logic to automatically show the location dashboard (modal) when arriving at a new location. 
There is a specific exclusion for the 'Home' location:
`if (isNewLocation && !isNewTurn && !currentPlayer.isAI && currentPlayer.location !== 'Home' && currentPlayer.time > 0)`

The comment above it states: `// We skip "Home" to prevent accidental end-turn clicks at the start of a turn`.
However, the `!isNewTurn` check already prevents the modal from appearing at the start of a turn. Therefore, the `currentPlayer.location !== 'Home'` check is redundant for that purpose and incorrectly prevents the modal from showing when the player intentionally travels to Home during their turn.

## Phase 1: Game Logic Updates
- [x] **Update `src/ui/UIManager.ts`**:
    - Remove `&& currentPlayer.location !== 'Home'` from the `handleAutoArrival` condition.
    - Keep `!isNewTurn` to ensure the modal doesn't pop up right when a new turn starts.
- [x] **Verify Home modal appears mid-turn**:
    - Ensure that traveling to Home during a turn triggers the dashboard.

## Phase 2: Testing
- [x] **Update Unit Tests**:
    - Modify `tests/ui/UIManager.test.ts` to verify that `showLocationDashboard` is called when arriving at Home mid-turn.
- [x] **Run All Tests**:
    - Execute `npm test` to ensure no regressions.
