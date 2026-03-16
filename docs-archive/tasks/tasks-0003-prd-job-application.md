```markdown
## Relevant Files

- `js/game/GameState.js`  
  Handles core game logic; will house the new `applyForJob()` method.

- `js/game/GameController.js`  
  Acts as the intermediary between UI and game logic; will add a new controller method to trigger the job application flow and open a modal.

- `js/ui.js`  
  Displays the modal containing all available jobs, gathers user selection, and calls the controller’s `applyForJob()` method.

- `js/game/AIController.js`  
  Updates AI logic to handle job application if the AI is unemployed.

- `js/game/gameData.js`  
  Already contains the `JOBS` array used to display information in the application modal. May be referenced for job details.

- `js/game/Player.js`  
  May need an additional property for current job assignment if we prefer not to reuse `careerLevel`.

- `js/ui/EventNotificationManager.js`  
  For success or error messages relating to job applications.

### Notes

- New UI elements (button, modal) must adhere to the existing styling in `style.css`.  
- Since sub-task 1.3 in the parent tasks requires a new job application modal, ensure new DOM elements meet accessibility guidelines (ARIA labels, focus management, etc.).

## Tasks

- [x] 1.0 Add "Apply for Job" UI at the Employment Agency
  - [x] 1.1 Insert a new button labeled "Apply for Job" where "Work Shift" is visible at the Employment Agency.
  - [x] 1.2 Show the button only if the player is physically located at the Employment Agency (similar to the other location-specific actions).
  - [x] 1.3 Implement a modal that displays a list of all possible jobs, including title, wage, shift hours, and required education.

- [x] 2.0 Implement New "applyForJob()" Method in GameState
  - [x] 2.1 Create a method `applyForJob(jobLevel)` that sets the player's current job if qualified, or shows an error if the player lacks the required education.
  - [x] 2.2 Log a success event to EventBus when the player is assigned the job. Log an error event if not qualified.
  - [x] 2.3 Make the method "instant" (no `deductTime`).

- [x] 3.0 Modify "workShift()" to Respond Appropriately When Unemployed
  - [x] 3.1 Detect if the player has no active job. If unemployed, display an error message: "[player name] must apply for a job first."
  - [x] 3.2 Preserve existing logic if the player has a job.

- [x] 4.0 Integrate Application Workflow Into AIController
  - [x] 4.1 Update AI logic to call `applyForJob()` before calling `workShift()` if the AI is unemployed.
  - [x] 4.2 Prevent the AI from attempting to work if not currently employed; avoid error spam.

- [x] 5.0 Handle Notifications & Logging for Job Application Outcomes
  - [x] 5.1 Display a "Congratulations…" success message in the notification strip and log.
  - [x] 5.2 Display an "Insufficient education…" error message if the player does not qualify.

- [x] 6.0 Connect UI to Game Logic via GameController
  - [x] 6.1 Add a new `controller.applyForJob()` method that, when called from the modal, invokes `gameState.applyForJob(selectedJobLevel)`.
  - [x] 6.2 Ensure the new UI modal calls this controller method with the correct `jobLevel`, retrieved from the jobs list.
  - [x] 6.3 Confirm that logging is triggered at the `GameState` level, and the UI's success/error messages appear as expected.
```