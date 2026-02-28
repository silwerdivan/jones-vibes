# Enrollment Bug Fix Plan

## Issue Description
Users are getting stuck after completing the 1st course because the system automatically enrolls them in the subsequent course for free. This bypasses the enrollment UI (where they would normally pay tuition) and immediately shows the study UI. However, this is unintended behavior as players must pay for subsequent courses.

## Root Cause
In `src/game/GameState.ts`, the `_checkGraduation` method automatically sets the player's `educationCreditsGoal` to the required credits of the *next* course (`futureCourse.requiredCredits`). This causes the UI in `CollegeDashboard.ts` to evaluate `isEnrolled` as `true`, skipping the enrollment phase.

## Tasks

- [x] **Task 1: Fix GameState Graduation Logic**
  - Modify `src/game/GameState.ts`.
  - In `_checkGraduation()`, when a player graduates, their `educationCreditsGoal` should be reset to `0` instead of `futureCourse.requiredCredits`.

- [x] **Task 2: Update Tests**
  - Update `tests/EducationSystem.test.ts`.
  - Fix the expectation in the graduation test so `player.educationCreditsGoal` is expected to be `0` instead of `120`.
  - Ensure all tests pass.

- [x] **Task 3: Final Verification**
  - Run `npm test` and `npm run build` to ensure everything is correct.
