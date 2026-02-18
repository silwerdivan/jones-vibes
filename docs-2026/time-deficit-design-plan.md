# Time Deficit System Design Plan

## Problem Statement
Players can become stuck when they lack sufficient time to complete mandatory "Travel Home" actions at turn end, resulting in soft-lock game states.

## Solution: Modernized Time Debt System
A penalty system where:
1. Uncompleted travel time becomes "time deficit"
2. Deficit deducts from next turn's starting time
3. Formula: `next_turn_time = 24 - deficit`
4. Implemented via new `timeDeficit` player property

## Key Components
1. **Player Property Tracking**:
   - Add `timeDeficit` to Player class
   - Persists between turns

2. **Turn End Logic**:
   - Detect travel time deficit
   - Calculate penalty for next turn

3. **Turn Start Logic**:
   - Apply time deficit penalty
   - Reset deficit for new turn

## Implementation Files
- `js/game/Player.js`: Add timeDeficit property
- `js/game/GameState.js`: Modify endTurn() logic
- `js/game/GameController.js`: Add UI notifications

## Player Experience
- Clear notifications about penalties
- Visual feedback for time deficits
- Maintains game balance while preventing soft-locks