# Gemini CLI Bug Fixing Workflow

This document outlines the structured workflow I will follow to identify, fix, and verify bugs. It is designed to be rigorous, repeatable, and aligned with software engineering best practices, drawing inspiration from Test-Driven Development (TDD) to avoid context drift and ensure high-quality, verifiable changes.

## 1. The Bug Fixing Workflow: A Test-Driven Approach

I will follow a methodical, five-step process called **Test-Driven Bug Fixing (TDBF)**. This ensures that every fix is directly tied to a verifiable outcome and does not introduce regressions.

### Step 1: Understand & Reproduce (The "Red" Phase)

*   **Goal:** To create a failing test case that precisely reproduces the reported bug.
*   **My Actions:**
    1.  **Analyze the Bug Report:** I will start with the user-provided description of the bug, including expected vs. actual behavior.
    2.  **Explore the Codebase:** Using my file system and search tools, I will identify the relevant sections of the code (functions, classes, components) that are likely responsible for the bug.
    3.  **Write a Failing Test:** I will navigate to the project's test suite and write a new, specific unit or integration test that codifies the bug report. This test will fail because the bug is present.
*   **Why this is crucial:** A failing test is an objective, unambiguous confirmation of the bug. It provides a clear target for the fix and serves as a safety net to prevent future regressions of the same issue. It transforms a subjective problem description into a concrete engineering goal.

### Step 2: Implement the Fix (The "Green" Phase)

*   **Goal:** To write the minimum amount of code necessary to make the failing test pass.
*   **My Actions:**
    1.  With the failing test as my guide, I will modify the application code to correct the logic.
    2.  I will focus *only* on the changes required to fix the bug, avoiding unrelated refactoring or feature additions.
*   **Why this is crucial:** This step is tightly scoped to ensure the change is small, atomic, and directly addresses the bug. It prevents "context drift" where the scope of work expands unintentionally.

### Step 3: Verify the Solution

*   **Goal:** To confirm that the fix has solved the bug and has not introduced any new problems.
*   **My Actions:**
    1.  I will run the *entire* test suite (not just the new test case).
*   **Why this is crucial:** This step ensures two things: the new test now passes (the bug is fixed), and all existing tests still pass (no regressions were introduced). A complete "green" test run is the primary indicator of a successful fix.

### Step 4: Refactor

*   **Goal:** To clean up and improve the code related to the fix without changing its functionality.
*   **My Actions:**
    1.  Now that the fix is verified, I will review the code I wrote and the surrounding areas.
    2.  I will make improvements, such as enhancing readability, adhering to project coding conventions, or removing any redundancy introduced by the fix.
    3.  After refactoring, I will run the test suite again to guarantee that my cleanup did not alter the behavior.
*   **Why this is crucial:** This separates the act of "making it work" from "making it right." It ensures the codebase remains clean, maintainable, and easy for human developers to understand, which is a core principle of production-grade engineering.

### Step 5: Commit and Document

*   **Goal:** To integrate the verified fix into the project's version control history.
*   **My Actions:**
    1.  I will use `git` to stage the changes.
    2.  I will analyze the existing `git log` to match the project's commit message style (e.g., conventional commits).
    3.  I will write a clear, descriptive commit message that explains the *what* and the *why* of the fix.
*   **Why this is crucial:** A well-documented commit history is essential for team collaboration, debugging future issues, and understanding the evolution of the project. Automating this step reduces friction and maintains a consistent workflow.

---

## 2. Required Tools, Resources, and Prompts

To execute this workflow effectively, I require access to specific tools, project resources, and clear prompting conventions.

### Tools (My Current Capabilities)

*   **`read_file` / `read_many_files`:**
    *   **Need:** To read application code, tests, and configuration files.
    *   **Why:** Essential for gaining the necessary context to understand the bug and the existing system architecture.
*   **`write_file` / `replace`:**
    *   **Need:** To add new test files and apply targeted code changes for the fix.
    *   **Why:** These are the primary tools for implementing the fix and writing the initial failing test. `replace` is preferred for its precision.
*   **`search_file_content` / `glob`:**
    *   **Need:** To locate relevant code, find test files, and understand the project structure.
    *   **Why:** Allows for efficient exploration and discovery within the codebase, which is critical for quickly identifying the source of a bug.
*   **`run_shell_command`:**
    *   **Need:** To execute the test suite (e.g., `npm test`), run linters, and execute `git` commands for version control.
    *   **Why:** This is the backbone of the verification and commit steps. It allows me to interact with the project's established development and CI/CD workflows.

### Resources (From the Project Environment)

*   **A Clear Bug Report:**
    *   **Need:** A prompt containing a detailed description of the bug, steps to reproduce, expected behavior, and actual behavior.
    *   **Why:** This is the starting point and primary specification for the entire task.
*   **An Existing Test Suite:**
    *   **Need:** A functional testing framework and a suite of existing tests.
    *   **Why:** The TDBF workflow is impossible without it. It provides the foundation for writing the new failing test and verifying the fix.
*   **Project Documentation (`README.md`, etc.):**
    *   **Need:** Information on how to run the test suite and other relevant build/verification commands.
    *   **Why:** Every project has its own specific commands. This documentation is required to correctly use the `run_shell_command` tool.
*   **Access to Version Control (`git`):**
    *   **Need:** Ability to run `git log` and `git add`/`commit`.
    *   **Why:** To follow project conventions for commit messages and to finalize the workflow by integrating the fix.

### Prompts (From the User)

*   **System Prompt (Initial Setup):**
    *   **Need:** A one-time instruction that sets the overall goal and constraints.
    *   **Example:** "You are an expert software engineer. Your task is to fix bugs using a strict Test-Driven Bug Fixing workflow. You must always start by writing a failing test."
    *   **Why:** This establishes the "rules of engagement" and locks in the methodical approach, preventing me from taking shortcuts.
*   **User Prompts (Task-Specific):**
    *   **Need:** Clear, single-instruction prompts that guide me through the TDBF steps.
    *   **Examples:**
        1.  **Initiation:** "Fix this bug: [Clear Bug Report]."
        2.  **Confirmation:** After I propose a change, a simple "Yes, proceed" or "Approved."
    *   **Why:** This maintains a "human-in-the-loop" for critical decisions (like code modification and commits) while allowing me to execute each step of the workflow autonomously.

---

## 3. Advanced Capabilities via an MCP Server

The following outlines a suite of ideal, high-level tools and resources that could be provided via an MCP server. These capabilities would allow me to move beyond simple file-based context and perform much deeper, more efficient analysis, directly addressing the "brownfield context collapse" challenge.

### Ideal MCP Custom Tools

*   **/get_code_graph `function_name`**:
    *   **Need:** A tool that returns a dependency graph for a given function, showing what functions call it and what functions it calls.
    *   **Why:** This would provide immediate, deep context about the impact of a change. I could instantly see which parts of the application would be affected by a fix, allowing me to anticipate side effects and write more comprehensive tests.
*   **/get_test_coverage `--file <path>`**:
    *   **Need:** A tool that reports the current test coverage percentage for a specific file or function.
    *   **Why:** This would allow me to assess the risk of a change. If a file has low coverage, I know I need to be extra cautious and potentially add more tests than just the one that reproduces the bug.
*   **/find_similar_code `--snippet <code>`**:
    *   **Need:** A tool that performs a semantic search to find other code snippets in the project that have similar logic, even if they are not textually identical.
    *   **Why:** Bugs often have siblings. If a logical error exists in one place, it likely exists elsewhere. This tool would enable me to find and fix all instances of a bug pattern at once, dramatically improving the thoroughness of my work.

### Ideal MCP Resources

*   **`resource://project/ast`**:
    *   **Need:** An MCP resource that exposes the entire codebase as a queryable Abstract Syntax Tree (AST).
    *   **Why:** This would be a transformative resource. Instead of simple text searches, I could perform precise structural queries like, "Find all API calls that are not inside a try/catch block" or "List all loops that modify the `gameState` object." This allows for a much deeper and more accurate analysis of the code's structure and potential flaws.
*   **`resource://project/git_blame`**:
    *   **Need:** An MCP resource that provides `git blame` information for any given file or line range.
    *   **Why:** Understanding *why* a line of code was written is crucial for fixing it correctly. Accessing blame information would give me historical context, showing who wrote the code and their original commit message, which can reveal the original intent.

### MCP-Enhanced Prompts

With these advanced tools, the user's prompts could evolve from simple commands to high-level strategic direction.

*   **Example Prompt:** "Bug: The player's score sometimes doubles unexpectedly. Use `/get_code_graph` on the `updateScore` function, check its context with `git_blame`, and analyze the logic to find the root cause. Then, use `/find_similar_code` to ensure no other parts of the application suffer from the same logic error."
*   **Why:** This style of prompting would allow the user to delegate the entire investigation strategy to me. I could then use the powerful MCP tools to execute that strategy, report my findings, and propose a comprehensive fix far more efficiently than by reading files one by one.