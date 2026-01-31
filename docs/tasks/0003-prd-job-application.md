<think>
The user has provided answers to my clarifying questions about the job application feature. They want me to now generate a PRD based on these answers. Let me organize what they've told me:

1. Main goal: Give player more control over job selection instead of automatic assignment
2. Job application process: Click "Apply for Job" button, shows ALL jobs (not filtered by education), player sees all options to add challenge
3. Education level: YES, keep as primary factor for eligibility (but don't filter the display - show all, then check on apply)
4. Regression concerns: Yes, isolate from existing workShift. WorkShift should show message when unemployed, otherwise do normal logic
5. Workflow: 
   - Add "Apply for Job" button at Employment Agency
   - Click opens modal with all available jobs
   - All jobs always available to view
6. When applying: Immediately assign if qualifies, notify player
7. Cost: Want it to work like original Jones in the Fast Lane (user doesn't remember, but if it did cost time, they want same behavior)
8. No qualifying jobs: Show message that player doesn't qualify based on education
9. Regression: Auto assignment falls away, tests outdated, can't think of other risks

Now I need to generate a PRD based on this information. The user wants the document saved as something like `0001-prd-job-application.md`.

Key points for the PRD:
- Introduction: Player needs to apply for jobs instead of automatic assignment
- Goals: Give player control, add strategy element, allow learning
- User Stories: As a player, I want to...
- Functional Requirements: Specific things the system must do
- Non-Goals: What it won't do
- Design Considerations: UI/UX (modal, button placement)
- Technical Considerations: Isolate logic, preserve education-based eligibility
- Success Metrics: How to measure success
- Open Questions: Anything still unclear

Let me draft this PRD now. I should NOT ask more questions - I should generate the PRD based on the answers provided.
</think>

# Product Requirements Document: Job Application Feature

## Introduction

Currently, when a player clicks "Work Shift" at the Employment Agency, they automatically receive a job based on their education level. This feature introduces a deliberate application step that gives players more agency and strategic control over their career path. Instead of automatic job assignment, players will now explicitly apply for jobs from a complete list of available positions, adding discovery and challenge to the gameplay experience.

## Goals

- **Enable Player Agency:** Allow players to actively choose which job to pursue rather than having it assigned automatically.
- **Increase Strategic Depth:** Force players to learn job requirements through experimentation (by viewing all jobs, then discovering which ones they qualify for upon application).
- **Maintain Education-Based Progression:** Preserve the existing logic where education level determines job eligibility, ensuring the game's progression system remains intact.
- **Prevent Regression:** Isolate the new job application logic from the existing `workShift()` method to avoid unintended side effects.

## User Stories

- **As a player**, I want to see all available jobs at the Employment Agency so I can plan my education goals and understand what positions I'm working toward.
- **As a player**, I want to apply for a specific job and receive immediate feedback on whether I qualified based on my education level.
- **As a player**, I want to know when I'm unemployed and understand why I don't qualify for certain jobs.
- **As a player**, I want to work at a job I've applied for by clicking "Work Shift" without needing to reapply each turn.

## Functional Requirements

1. **Add "Apply for Job" Button at Employment Agency**
   - The button must appear only when the player is at the Employment Agency location.
   - The button must be visible alongside other location-specific actions (similar to the existing "Work Shift" button).

2. **Display Modal with All Available Jobs**
   - When the player clicks "Apply for Job," a modal must open displaying all jobs from the JOBS array.
   - Each job listing must show: job title, wage per hour, shift hours, and education requirement.
   - The modal must NOT filter jobs by the player's current education level (all jobs visible to encourage exploration).

3. **Job Application Logic**
   - When the player selects a job to apply for, the system must check if the player's education level meets the job's `educationRequired` threshold.
   - If the player qualifies, the job must be immediately assigned to the player, and a success message must be logged (e.g., "Congratulations! You've been hired as [Job Title]").
   - If the player does not qualify, an error message must be logged stating the job requires a higher education level.
   - The job application must NOT cost the player any time (applying is instant).

4. **Preserve Employment Status After Application**
   - Once a player has applied for and been accepted into a job, that job becomes their current employment until they lose it or apply for a different position.
   - The player's `careerLevel` must be updated to reflect the job's level.

5. **Modify "Work Shift" Behavior**
   - If the player is unemployed (no job assigned), clicking "Work Shift" must display an error message: "[Player Name] must apply for a job first."
   - If the player has an active job, "Work Shift" must function as it currently does: deduct time, add earnings, and log the action.

6. **Handle Cases Where Player Doesn't Qualify**
   - If a player attempts to apply for a job but their education level is insufficient for ALL available jobs, the modal must display a message: "You don't qualify for any available jobs. Increase your education level to unlock new positions."
   - The modal must close without assignment.

7. **Isolation from Existing Logic**
   - The new "Apply for Job" flow must not modify or depend on the existing `workShift()` method.
   - The job eligibility check logic (already present in `_getAvailableJobs()`) may be reused but must not be altered.
   - All new code must reside in a new method (e.g., `applyForJob()`) on the GameState class and corresponding controller method.

## Non-Goals (Out of Scope)

- Adding complexity to job availability (e.g., random job rotations, limited positions, or time-based availability).
- Introducing interview mechanics or skill-based job matching.
- Allowing players to apply for multiple jobs simultaneously or queue applications.
- Adding penalties or consequences for failed job applications.
- Implementing job dismissal or unemployment mechanics (players keep their job until they apply elsewhere).

## Design Considerations

**UI/UX:**
- The "Apply for Job" button should follow the existing design language (neon styling, cyan/magenta theme, retro VT323 font).
- The job application modal should match the existing choice modal pattern used for travel, shopping, and banking.
- Each job option in the modal should be clearly labeled with the title, wage, shift hours, and education requirement.
- Success and error messages should use the existing log message categories (`success`, `error`, `warning`, `info`).

**Mobile Considerations:**
- The modal must be responsive and fill the screen on mobile devices (consistent with existing modals).
- Buttons should have adequate touch targets (minimum 44px height).

## Technical Considerations

**Code Organization:**
- Create a new method `applyForJob(jobLevel)` in `GameState.js` that handles the application logic.
- Create a corresponding `applyForJob()` method in `GameController.js` that triggers the modal.
- Reuse the existing `_getAvailableJobs()` method to validate education requirements.
- Do NOT modify the existing `workShift()` method's core logic; only add an unemployed state check.
- **No Time Cost:** Ensure `applyForJob()` does not call `deductTime()` on the player.
- **Event Logging:** All job application attempts (success, failure) must publish to the `gameEvent` EventBus for display in the notification system and game log.
- **Job Persistence:** Store the player's current job assignment (use `careerLevel` or a separate `currentJob` field if needed) such that it persists across turns until explicitly changed by a new application.

**Data Model:**
- Add a property `currentJobLevel` to the Player class to track the player's current job assignment (default: `0` for unemployed).
- Alternatively, use the existing `careerLevel` property (clarify with team if this should represent current job or highest job achieved).

**Potential Regression Risks:**
- **AI Controller Update Required:** The `AIController.takeTurn()` method must be modified to call `applyForJob()` before `workShift()`. Without this change, the AI will encounter errors when attempting to work without a job.
- Verify that the `getNextAvailableCourse()` and other education-based checks still work correctly.
- Test that the event notification system correctly logs all job-related messages.

**Edge Cases to Handle:**
- Player attempts to apply while already employed (should be allowed; reassign to new job).
- Player has education level but no jobs qualify (already covered in Functional Requirement 6).
- Player applies for the same job twice (should succeed and reset any relevant state).

## Success Metrics

- Players successfully apply for and receive job assignments without errors.
- No regression in existing "Work Shift" functionality for employed players.
- Job application messages are correctly logged and displayed to the player.
- The modal displays all jobs (regardless of player education level) without filtering.
- Error messages clearly communicate why a player doesn't qualify for a job.
- No unintended side effects on education progression, earnings, or AI behavior.

## Open Questions (Resolved)

1. **Current Job vs. Highest Job Achieved**
   - **Question:** Should `careerLevel` represent the player's current job, or should we track current and highest separately? (Current implementation treats it as highest achieved.)
   - **Answer:** Keep the current implementation as-is. `careerLevel` will continue to represent the highest job achieved.

2. **Job Loss Mechanic**
   - **Question:** Is there a scenario where a player loses their job (e.g., due to game over conditions)? Should we prepare for this?
   - **Answer:** No job loss mechanic for now. This will be explored in a later iteration.

3. **Multiple Job Applications Per Turn**
   - **Question:** Can a player apply for multiple jobs in a single turn, or is there a limit?
   - **Answer:** No limit. Players may apply for multiple jobs in a single turn if they have time remaining. Each application immediately reassigns their current job.

4. **Original Jones Timing**
   - **Question:** You mentioned wanting to match the original Jones in the Fast Lane regarding time cost. Can you confirm whether job application should cost time (0 hours suggested) or if you'd like to research the original game's mechanics?
   - **Answer:** Research confirms that the original Jones in the Fast Lane does NOT cost time to apply for a job. **Implementation requirement: Job application must be instant with no time deduction.**

5. **AI Player Behavior**
   - **Question:** Does the AI controller need special logic to handle the new application requirement, or does it already apply for jobs implicitly?
   - **Answer:** Yes, the AI controller will need to be updated to handle the new application requirement. The AI must call `applyForJob()` before calling `workShift()` to avoid "unemployed" errors. This is a **required change** to prevent regression in AI behavior.

6. **Job Application Event Logging**
   - **Question:** Should the job application process also log an event in the game log to provide traceability of the player's career decisions?
   - **Answer:** Yes. All job application outcomes (successful applications, rejections due to insufficient education) must be logged with appropriate message categories (`success`, `error`, `warning`).

7. **Job Persistence Across Turns**
   - **Question:** After application, will the job remain active for multiple turns or only until the next time the player works?
   - **Answer:** The job will remain active across multiple turns until the player applies for a different job. Players do not need to reapply each turn.

8. **Testing Strategy**
   - **Question:** While tests are currently outdated, should a strategy be planned for testing this new feature in future iterations to catch potential regressions?
   - **Answer:** No formal testing strategy required at this time. Manual testing during development is sufficient.
