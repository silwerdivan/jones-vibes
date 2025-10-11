### **Instructions for Frontend Engineer**

Please address the bug detailed above by adhering to the following best practices, in line with our project's development conventions.

**1. Test-Driven Development (TDD) Approach:**

*   **Write a Failing Test:** Before writing any implementation code, navigate to the `tests/` directory and create a new test case that specifically reproduces this bug. This test should fail, demonstrating the presence of the bug.
*   **Write the Minimum Code to Pass:** Write only the necessary code to make the new test (and all existing tests) pass.
*   **Refactor:** Once the tests are passing, refactor your code for clarity, performance, and maintainability, ensuring all tests continue to pass.

**2. Code and Style Consistency:**

*   Ensure your solution aligns with the project's existing modern JavaScript (ES6 modules) and class-based architecture.
*   Maintain the established coding style for consistency across the codebase.

**3. Documentation Review:**

*   Before starting, please consult the relevant documentation in the `docs/` directory. The `spec.md` may contain details on intended game mechanics that are relevant to this bug.

**4. Final Verification:**

*   After implementing the fix, run the entire test suite using the `npm test` command to confirm that your changes have not introduced any regressions.
*   Manually verify the fix by following the "Steps to Reproduce" in a browser to ensure the issue is fully resolved.