# AI Hunger Fix Plan (2026-02-26)

## Problem Statement
The AI player frequently incurs hunger penalties (happiness -5) and turn-end hunger increases (+20) because of a misalignment between its decision threshold and the game's mechanics.

### Root Causes
1.  **Threshold Mismatch**: AI seeking food at `hunger > 40`. `TimeSystem.endTurn` adds +20 hunger. If AI ends turn at 31-50 hunger, it exceeds 50 (penalty threshold) before the next turn starts.
2.  **Premature Turn Termination**: `GameState.handleAIAction` ends the AI turn immediately if `player.time === 0`. This prevents the AI from eating (a 0-cost action) if the `travel` to the Fast Food location consumed all remaining time.
3.  **Inconsistent Time Costs**: `AIController` assumes `buyItem` and `buyCar` take time, but `EconomySystem` doesn't enforce this. However, `travel` *does* cost time (1-2 hours), triggering the termination bug.
4.  **Forced Home Reset**: Every turn ends with a reset to 'Home', making travel to food mandatory and time-consuming.

## Proposed Fixes

### 1. Update `AIController.ts`
- Lower hunger threshold from 40 to **30**.
- Remove redundant `time >= 2` checks for "instant" actions (repaying loans, buying food, buying items) when the player is already at the target location.
- Use dynamic `travelTime` (1 or 2 hours) for logic checks.

### 2. Update `GameState.ts`
- Modify `handleAIAction` to allow the AI one additional decision cycle even if `player.time === 0`. This allows the AI to perform a 0-cost action (like eating or banking) at its current location before the turn ends.

### 3. Update `EconomySystem.ts`
- Update `buyCar` to deduct **4 hours** of time, matching the AI's expectations and general game balance.

### 4. Verification
- Update `tests/AIController.test.ts` to verify the 30-threshold logic and "at-location" instant actions.
- Manual verification of AI turn flow to ensure eating occurs even after a final travel action.
