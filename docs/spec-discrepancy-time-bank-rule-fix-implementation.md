**Your Role:** You are a senior frontend software engineer specializing in Test-Driven Development (TDD) and refactoring. Your task is to diagnose and fix a critical bug in the "Jones in the Fast Lane" game by correcting its core time-keeping logic and ensuring data consistency.

**The Project Context:** You have full access to the project's source code (including game logic and data files) and the official `spec.md`.

**The Core Problem:** A user reported an error: "Not enough time to take Business Law. You need 25 hours." Initially, this seemed impossible. However, the project's specification has since been clarified to resolve a contradiction.

**Crucial Update from the Specification:** The `Resting` mechanic has been corrected and is the source of truth. The new rule is:
> **Resting:** Ends turn, adds 24 hours to any remaining time (up to the 48-hour maximum), and **deducts the Daily Expense**.

**Your Hypothesis:** The bug likely stems from two interconnected issues:
1.  **Faulty Implementation:** The game's current `endTurn` or `rest` function is likely not implementing the time-banking mechanic correctly. It is probably resetting the player's time to 24 hours instead of adding to the remainder.
2.  **Data Inconsistency:** The "Business Law" course itself is not listed in the official specification's Education table. Its existence in the game's data files represents a deviation from the spec.

**Your Mission:** Using a strict Test-Driven Development methodology, you must investigate both the faulty logic and the data inconsistency.

**Required Steps & Methodology:**

1.  **Analyze and Verify the Core Logic:**
    *   Review the existing implementation of the game's turn-ending/resting function.
    *   Compare its behavior directly against the corrected `Resting` rule in the `spec.md`.

2.  **Write Failing Tests for the Core Mechanic:**
    *   Create a new test suite for the `endTurn` (or equivalent) function.
    *   Write a specific, failing test case that proves the time-banking logic is broken. For example: "A player ending a turn with 10 hours remaining should start their next turn with 34 hours (10 + 24)."
    *   Write another failing test to verify the 48-hour cap. For example: "A player ending a turn with 30 hours should start their next turn with 48 hours, not 54."

3.  **Refactor and Fix the Game Logic:**
    *   Modify the `endTurn` function's implementation until all your new and pre-existing tests pass.

4.  **Address the Data Inconsistency:**
    *   Once the time-banking mechanic is fixed, turn your attention to the `Business Law` course.
    *   Since this course is not in the `spec.md`, it should be removed from the `gameData.js` file to align the implementation with the official specification.

**Required Output Format:**

Please structure your final report as follows:

**1. Analysis and Diagnosis:**
*   A brief summary confirming that the implemented turn-ending logic contradicts the corrected specification.
*   A statement identifying the "Business Law" course as non-compliant with the spec.

**2. Test-Driven Refactoring Process:**

*   **Step 1: Write Failing Tests.**
    *   Provide the new test cases you wrote for the time-banking and time-capping logic. Explain why they were expected to fail.

*   **Step 2: Implement the Logic Fix.**
    *   Show the "before" and "after" code for the game's turn-ending/resting function. Explain the changes made.

*   **Step 3: Implement the Data Fix.**
    *   Show the modification to the `gameData.js` file, illustrating the removal of the non-spec "Business Law" course.

**3. Final Verification and Recommendation:**
*   Confirm that all tests (new and pre-existing) now pass.
*   State that the core time-banking mechanic is now fixed and the game data is aligned with the specification.
*   Conclude that the original user-reported bug is now impossible, as both the faulty logic that prevented reaching 25+ hours and the invalid course requiring it have been resolved.