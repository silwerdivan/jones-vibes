# Phase 9: Hustle Depth & High-Variance Risk/Reward

## Summary

Phase 9 transitions the "Hustle" mechanic from a desperate fallback into a viable, high-risk/high-reward "Scavenger" progression path. By introducing "Heat" (diminishing returns and increasing risk for repeated actions), "Big Score" opportunities, and specialized street-life gear, we amplify the "Claustrophobic Ambition" and "Poverty Trap" themes.

## Tasks

### 1. Implement Hustle "Heat" System
- [x] `src/models/types.ts`: Add `hustleHeat` to `PlayerState`.
- [x] `src/game/Player.ts`: Initialize and serialize `hustleHeat`.
- [x] `src/game/GameState.ts`: Apply heat math (penalty to reward, bonus to risk) and increment heat in `executeHustle()`.
- [x] `src/systems/TimeSystem.ts`: Decay `hustleHeat` by 1 per turn.

### 2. Implement "Big Score" Hustle Opportunities
- [x] `src/models/types.ts`: Add `availabilityChance` to `Hustle` type.
- [x] `src/data/hustles.ts`: Add `Data Snatch` ($300) and `Getaway Driver` ($800) with low availability chances.
- [x] `src/ui/UIManager.ts`: Filter hustles in `createLaborSectorDashboard` based on turn-based pseudo-randomness.

### 3. Implement Scavenger Progression Items
- [x] `src/data/items.ts`: Add `Filtered-Respirator`, `Blood-Scrubber`, and `Burner-Comm`.
- [x] `src/game/GameState.ts`: Update `executeHustle()` to apply modifiers from these items (risk reduction, sanity cost reduction, heat reduction).
- [x] `src/ui/Icons.ts`: Add missing SVG icons for new scavenger items.

### 4. Empirical Validation & UI Integration
- [x] `src/ui/components/shared/ActionCard.ts`: Update Hustle UI to show Heat tags, Risk percentages, and adjusted rewards.
- [x] `tests/simulate-economy.test.ts`: Add a "Hustler" AI behavior that prioritizes Big Scores and Scavenger items.
- [x] `tests/HustleBalance.test.ts`: Update assertions for new reward values.
- [x] `tests/HypnoScreen.test.ts` & `tests/TimeSystem.test.ts`: Update sanity expectations for new ambient drain/recovery values.

## Validation Checklist

- [x] `npm run simulate:economy` validates that Scavenger AI reaches target baseline wealth parity with Job-Seeker, but with higher variance.
- [x] `npm run test` passes (specifically unit tests for `GameController` heat math and item modifiers).
- [x] Behavioral verification confirms "Heat" UI updates and "Big Score" appearance rates.
- [x] Terminology sweep ensures no "bad job" language remains.

## Lessons To Capture

- "Heat" effectively discourages spamming a single hustle without feeling overly punitive, as players can switch between Plasma and Scrap to let heat decay.
- "Big Scores" provide the intended "Ruthless Empowerment" dopamine hit when they appear and succeed.
- Scavenger items create a meaningful early-game credit sink that feels like an investment in a "career" alternative to labor.