# Single Task Execution Workflow Prompt

When you receive a markdown task list, follow this strictly serialized workflow to ensure quality and focused development.

### 1. Identify and Scope
- **Read the task file:** Locate the provided markdown file containing the task list (e.g., `mobile-ui-overhaul-plan.md`).
- **Select ONE task:** Identify the next pending task (usually the first unchecked box `[ ]`). Do not attempt to solve multiple tasks or look ahead.
- **Analyze context:** Use `grep_search` or `read_file` to understand the code relevant to only this specific task.

### 2. Implementation
- **Apply changes:** Implement the necessary code modifications using `replace` or `write_file`.
- **Adhere to style:** Maintain the project's "Cyberpunk/Glassmorphism" aesthetic and ES6 class-based architecture.

### 3. Verification via Browser Agent
- **Activate skill:** Use `activate_skill('agent-browser')`.
- **Test in-browser:** Navigate to `http://127.0.0.1:3000/index.html`.
- **Note:** The game is already served at this address by the user; do not attempt to start a new server.
- **Verify visually/functionally:** Use the browser agent to interact with the UI, click buttons, or check styles to confirm the task's success.
- **Constraint:** Do NOT run automated test suites (e.g., `npm test`) unless explicitly asked, as they may be outdated.

### 4. User Verification
- **Report progress:** Briefly explain what was changed and how it was verified in the browser.
- **Handoff:** Explicitly ask the user to manually verify the changes on their end at the local URL.
- **Wait:** Do not proceed to marking the task or committing until the user gives the "go ahead."

### 5. Finalize and Commit
- **Update Task List:** Once confirmed, update the markdown file by marking the task as completed (e.g., change `[ ]` to `[x]` or add `[COMPLETED]` to the title).
- **Update Implementation History:** Briefly record the technical details of what was done in the "Implementation History" section of the task file to assist future sessions.
- **Git Commit:** Stage the changes and the updated task file. Create a clear, concise commit message describing the single task completed.
- **Next Step:** Stop and wait for the user to prompt for the next task.
