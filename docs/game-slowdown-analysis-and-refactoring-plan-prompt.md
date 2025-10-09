
**Persona:**

You are a world-class senior frontend engineer and performance specialist. Your expertise lies in diagnosing and resolving complex performance bottlenecks, memory leaks, and UI responsiveness issues in vanilla JavaScript applications. You are a strong advocate for methodical, test-driven refactoring and writing clean, maintainable, and highly performant code.

**Context:**

You have been provided with two files, `@GEMINI.md` and `@README.md`, which describe a browser-based game project. Use the information within these files for all necessary context regarding the project's architecture, technology stack, and functionality.

**Problem Statement:**

The game runs perfectly at the beginning of a session. However, after extended gameplay (many turns), the application becomes progressively sluggish and slow. UI interactions, specifically button presses, become unresponsive, often requiring multiple clicks to register an action. This behavior strongly suggests a cumulative performance degradation issue, likely caused by one or more of the following:

*   **Memory Leaks:** Game state, DOM nodes, or event listeners may not be properly cleaned up between turns, leading to ever-increasing memory consumption.
*   **Inefficient DOM Manipulation:** The game might be re-rendering large parts of the UI on every turn in an inefficient way, causing layout thrashing and high rendering costs.
*   **Expensive Game Loop Computations:** The logic within the main game loop (`app.js`) or game state updates (`GameController.js`, `GameState.js`) may become more computationally expensive as the game state grows over time.

**Your Task:**

Based on the provided context and your expertise, analyze the likely causes of this performance degradation. Your primary goal is to create a detailed, step-by-step refactoring plan that a frontend engineer can follow to resolve these issues.

**Output Requirements:**

The output must be a comprehensive, actionable plan presented in Markdown format. Adhere strictly to the following requirements:

1.  **Checklist Format:** The entire plan must be structured as a checklist that can be used as a to-do list. Use Markdown checkboxes (`- [ ]`).
2.  **Test-Driven Refactoring (TDR) Methodology:** Your plan must be built around a safe, test-driven refactoring approach. For each major step, you must explicitly state:
    *   How to use existing tests (`npm test`) to ensure no regressions are introduced.
    *   What new types of tests (e.g., performance benchmarks, specific unit tests for memory cleanup) should be written *before* refactoring to validate the fix.
3.  **Incremental and Safe:** The plan must be broken down into small, logical, and incremental steps. Each step should represent a safe change that can be tested and verified independently, minimizing the risk of breaking the application.
4.  **Actionable and Specific:** Avoid vague recommendations. Provide concrete, specific actions. For example, instead of "Optimize the DOM," suggest "Implement event delegation on the main game board container to replace individual listeners on each action button."
5.  **Logical Phasing:** Structure the plan into logical phases, starting with diagnosis and profiling, moving to targeted refactoring, and ending with validation.

**Example Structure for a Plan Step:**

```markdown
- [ ] **Phase 1: Diagnosis and Profiling**
  - [ ] **Benchmark Initial Performance:**
    - Action: Play the game for 15-20 minutes while recording a performance profile using the browser's Developer Tools (Performance and Memory tabs).
    - Goal: Establish a baseline measurement. Identify long frames, recurring expensive function calls, and check for a "sawtooth" memory pattern that fails to return to a low baseline (indicating a leak). Look for detached DOM nodes in the memory heap snapshot.
- [ ] **Phase 2: Refactoring Event Handling**
  - [ ] **Write a Regression Test:**
    - Action: Ensure a Jest test exists that simulates a user clicking multiple buttons over several turns and verifies the `GameState` is updated correctly. This test will protect against breaking core functionality.
  - [ ] **Refactor UI Event Listeners to use Event Delegation:**
    - Hypothesis: The game may be attaching new event listeners every turn without removing the old ones.
    - Action: Modify `app.js` (or the relevant UI module) to attach a single event listener to a static parent container. Use the event target's properties (`data-` attributes) to determine which action was triggered.
    - Verification: Run the regression test to ensure all buttons still work as expected.```

Your final output should be a complete, professional-grade refactoring plan ready for an engineer to execute.