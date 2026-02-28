# AI Education Fix Plan

## Goal
Fix the bug where AI entities (and human players) are automatically enrolled in subsequent education courses upon graduation, bypassing tuition costs and enrollment time. Ensure AI correctly prioritizes enrollment and attending lectures.

## Tasks
- [x] Update `GameState._checkGraduation` so it resets `educationCreditsGoal` to 0 upon graduation instead of setting it to the next course's required credits.
- [x] Ensure `AIController.ts` handles the updated enrollment check correctly.
- [x] Ensure `CollegeDashboard.ts` and other UI components handle the updated enrollment logic cleanly.
- [x] Write tests to verify AI and humans must pay tuition and enroll for each degree.
