# step List Management

Guidelines for managing step lists in markdown files to track progress on completing a PRD

## step Implementation
- **One step at a time:** Do **NOT** start the next step until you ask the user for permission and they say "yes" or "y"
- **Completion protocol:**  
  1. When you finish a **step**, immediately mark it as completed by changing `[ ]` to `[x]`.
  2. If **all** items underneath a parent step are done, follow this sequence:
    - **Clean up**: Remove any temporary files and temporary code before committing
  3. Once all the step items are marked completed and changes have been committed, mark the **step** as completed.
- Stop after each step and wait for the user's go‑ahead.

## step List Maintenance

1. **Update the step list as you work:**
   - Mark steps and substeps as completed (`[x]`) per the protocol above.
   - Add new steps as they emerge.

## AI Instructions

When working with step lists, the AI must:

1. Regularly update the step list file after finishing any significant work.
2. Follow the completion protocol:
   - Mark the **step** `[x]` once **all** its items are done.
3. Add newly discovered steps.
5. Before starting work, check which step is next.
6. After implementing a step, update the file and then pause for user approval.