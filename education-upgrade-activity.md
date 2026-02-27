# Education Upgrade Activity Log

## 2026-02-27 - Phase 1 Complete: Data & Model Updates

### Completed Tasks

#### Task 1.1: Update `src/models/types.ts`
- Added `educationCredits` and `educationCreditsGoal` to `PlayerState`.
- Added `requiredCredits` to `Course` interface.

#### Task 1.2: Update `src/data/courses.ts`
- Redefined courses as Degrees (Associate's, Bachelor's, etc.) with `requiredCredits`:
  - Associate's (Level 1): 50 Credits
  - Bachelor's (Level 2): 120 Credits
  - Master's (Level 3): 250 Credits
  - Professional Cert (Level 4): 400 Credits
  - Expert Specialization (Level 5): 600 Credits
- Set `time` for all courses to 8 hours (consistent with proposed study session duration).

#### Task 1.3: Update `src/game/Player.ts`
- Added `educationCredits` (default 0) and `educationCreditsGoal` (default 50) to `Player` class.
- Updated `toJSON()` and `fromJSON()` to handle persistence of new fields.
- Added `addEducationCredits(amount: number)` and `setEducationGoal(goal: number)` methods.

### Verification
- `npm run build`: Success
- `npm test`: 222 tests passed (all existing tests)

### Next Steps
- Phase 2: Game Logic Updates (Implement `study()` method and Graduation logic)
