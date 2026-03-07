# Phase 7: Labor Flow Stability and Hustle Relevance

## Summary

Phase 7 tightens the Labor Sector loop so it survives edge-case stress states and feels worth engaging with. The player-facing goal is to remove frustrating state loss around end-of-week burnout and random-event interruptions, while making hustles read and play like deliberate emergency cash tools instead of trap buttons.

## Tasks

### 1. Stabilize turn finalization under burnout and condition ticks
- [x] `src/game/GameState.ts`
  - [x] Guard auto-end-turn scheduling while a turn is already finalizing or a turn summary is pending.
- [x] `src/systems/TimeSystem.ts`
  - [x] Mark turn finalization boundaries so burnout during end-turn processing cannot recurse into another `endTurn()`.
- [x] `tests/TimeSystem.test.ts`
  - [x] Cover the regression where burnout fires during end-turn condition processing.

### 2. Restore Labor Sector flow after random events
- [x] `src/ui/UIManager.ts`
  - [x] Preserve the Labor Sector dashboard context across random-event modal dismissal.
  - [x] Restore the dashboard after the player resolves a Labor Sector event choice.
- [x] `tests/ui/UIManager.test.ts`
  - [x] Verify random-event modal closure does not clear the active dashboard context.
- [x] `tests/e2e/labor-sector-glitch.spec.ts`
  - [x] Verify Labor Sector reopens after resolving a Labor Sector random event.

### 3. Reframe hustles as emergency burst-credit tools
- [x] `src/data/hustles.ts`
  - [x] Rebalance hustle payouts and downside so they beat entry-level shift pay on credits per hour but stay costly in sanity and risk.
- [x] `src/ui/UIManager.ts`
  - [x] Update Labor Sector copy to explain when hustles are strategically useful.
- [x] `tests/HustleBalance.test.ts`
  - [x] Replace the old “strictly worse than jobs” assumption with tests for burst-pay positioning and harsher downsides.

## Validation Checklist

- [x] `npm test -- tests/TimeSystem.test.ts tests/ui/UIManager.test.ts tests/HustleBalance.test.ts`
- [x] `npm run test:e2e -- tests/e2e/labor-sector-glitch.spec.ts`
- [x] Reproduced and fixed the Labor Sector event-choice flow so the dashboard reopens without another city-card click.
- [x] Search for deprecated terminology returns 0 results where applicable.

## Lessons To Capture

- Event-modal restoration logic needs to survive subscriber ordering, not just the happy-path state snapshot.
- End-turn safety checks should live at the turn-controller boundary, not only on the action that drained time or sanity.
- Hustle balance needs to communicate a specific use case in the UI or players will correctly treat it as noise.
