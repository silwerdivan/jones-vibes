# Visual Upgrade Plan: Jones in the Fastlane Vibes

**Version:** 1.0
**Date:** 2025-10-05
**Author:** Gemini

## 1. Overview & Goals

This document outlines the plan to execute a visual upgrade for the "Jones in the Fastlane Vibes" MVP. The primary goal is to move from a basic, unstyled presentation to a visually appealing and cohesive interface using plain HTML, CSS, and JavaScript, while adhering to the principles of **Structured Vibe Coding 2.0**.

The core challenge is to refactor a brownfield project withoutintroducing regressions, losing context, or engaging in unstructured "vibe coding." This plan directly addresses the pitfalls of context drift and brownfield context collapse by implementing a Test-Driven Refactoring (TDR) workflow, leveraging a **Model Context Protocol (MCP)** server for dynamic context management, and enforcing a deterministic, step-by-step execution via a `todo.md` and `blueprint.md`.

## 2. Required Inputs & Personas

To translate the subjective goal of "visual upgrade" into objective, executable tasks, specific input is required.

### 2.1. UX/UI Input: The Visual Specification

As the lead developer, I require a **Visual Specification** document from a UX/UI designer. This document is critical for establishing objective, testable criteria for the visual upgrade.

*   **File Name:** `visual-spec.md`
*   **Location:** Project root (`C:\Users\silwe\OneDrive\250927 Jones in the Fastlane Vibes\visual-spec.md`)
*   **Format:** Markdown
*   **Structure:**
    *   **Color Palette:** A list of primary, secondary, accent, and neutral colors with their hex codes (e.g., `--primary-color: #3B82F6;`).
    *   **Typography:** Definitions for font families (e.g., "Roboto, sans-serif"), sizes, and weights for headings, body text, and UI elements.
    *   **Layout & Spacing:** Rules for grid layout, spacing units (e.g., `1rem = 16px`), and container widths.
    *   **Component Styles:** Simple, text-based mockups or descriptions for key UI components (`game-container`, `scoreboard`, `player-stats`, `event-log`).
    *   **Iconography:** A list of required icons and their intended use (e.g., "Player Health: heart icon").

**Reasoning:** A detailed `visual-spec.md` transforms abstract aesthetic goals into a concrete contract. This allows for the creation of specific, failing tests (the "Red" in TDR) that can be passed by implementing the specified styles, making the entire process measurable and verifiable.

## 3. Architectural Approach: SVC 2.0 & MCP Integration

We will strictly follow the **Structured Vibe Coding 2.0** methodology.

### 3.1. Document-Driven Workflow

1.  **`spec.md` (Updated):** The existing `spec.md` will be updated to include the high-level goals from `visual-spec.md`.
2.  **`blueprint.md` (New):** A new blueprint will be created to translate the visual spec into an architectural and sequential plan. It will break down the refactoring into atomic tasks (e.g., "1. Create `css/style.css` and define CSS variables. 2. Refactor `index.html` to link the new stylesheet and apply new body classes.").
3.  **`todo.md` (New):** A new `todo.md` will be generated from the blueprint, serving as the execution checklist for the AI agent.

### 3.2. MCP Servers and Tooling Strategy

To combat context collapse, we will leverage a multi-layered tooling approach involving three distinct sets of tools:

*   **`serena`**: This is the primary toolset for all code and file manipulation. It offers low-level, granular control over the file system and code symbols via tools with the `serena__` prefix (e.g., `serena__find_symbol`).
*   **`nl.context7`**: A separate MCP server that provides tools for library documentation discovery. The `context7` MCP server exposes `resolve-library-id` and `get-library-docs`.
*   **`default_api`**: The built-in toolset of the Gemini CLI. It provides a set of general-purpose tools for file system operations, shell command execution, and web searches.

**Tool Prioritization Strategy:**

The agent will adhere to the following tool prioritization strategy:

1.  **`serena` First**: For any given task, the agent will first check if a `serena` tool is available and suitable for the job. This is the preferred toolset for all code-related tasks.
2.  **`context7` for Research**: The `context7` tools (`resolve-library-id` and `get-library-docs`) will be used specifically for research and discovery of library APIs and documentation.
3.  **`default_api` as Fallback**: The `default_api` tools will be used only if a suitable tool is not available in `serena` or `context7`.

**Reasoning:** This structured approach ensures that the most precise and context-aware tools (`serena`) are used for code manipulation, reducing the risk of errors. `context7` is used for its specific purpose of documentation retrieval, and `default_api` serves as a general-purpose fallback. This strategy is critical for safe, incremental refactoring in a brownfield project.

## 4. Test-Driven Refactoring (TDR) Strategy

We will adapt the existing Jest testing framework for TDR. The focus will be on **structural and style contract testing**, not just functional logic.

1.  **Red Phase:** For each `todo` item, we will first write a failing test.
    *   **Example:** To refactor the scoreboard, we'll add a test to `tests/Scenario.test.js` (or a new `tests/ui.test.js`) that:
        1.  Renders the initial HTML into the test DOM (e.g., using `jsdom`).
        2.  Asserts that the scoreboard element (`#scoreboard`) now has the class `scoreboard--modern` as defined in the `blueprint.md`.
        3.  Asserts that the old class (if any) has been removed.
        4.  This test will fail because the class doesn't exist yet.

2.  **Green Phase:** The AI agent, using the MCP tools to understand the context, will be prompted to modify `index.html` and `css/style.css` to make the test pass. The agent will use `run_shell_command('npm test')` to verify its changes.

3.  **Refactor Phase:** Once the test is green, the agent can be prompted to clean up related code, such as removing old, now-unused CSS classes. The `/find_js_references` tool will be crucial here to ensure a CSS change doesn't break a JavaScript-based interaction.

**Reasoning:** TDR provides an objective measure of success for each atomic change. It prevents regressions and ensures that the visual upgrade is implemented exactly as specified in the blueprint.

## 5. Step-by-Step Execution Workflow

The entire process will be broken down into the following sequential steps, managed via `todo.md`.

1.  **Step 1: Setup & Baseline**
    *   Create `visual-spec.md` (Input from UX).
    *   Create `visual-upgrade-plan.md` (this file).
    *   Ensure `nl.context7` and `serena` MCP servers are configured and available.
    *   Create `blueprint.md` and `todo.md` for the visual upgrade.
    *   Create a baseline test that captures the current state (snapshot test) to ensure no functional regressions occur.

2.  **Step 2: CSS Foundation**
    *   **TODO-1:** Create `css/style.css`.
    *   **TODO-2:** Populate `css/style.css` with CSS variables (colors, fonts, spacing) from `visual-spec.md`.
    *   **TODO-3:** Update `index.html` to link `css/style.css`.
    *   **TDR:** Write a test to assert the stylesheet link exists.

3.  **Step 3: Main Layout Refactoring**
    *   **TODO-4:** Refactor the main container in `index.html` to use new layout classes (e.g., `<div class="game-container">`).
    *   **TDR:** Write a test asserting the new class and DOM structure.
    *   **Commit:** Once tests pass, commit changes with a message like `feat(ui): refactor main game layout`.

4.  **Step 4: Component-by-Component Refactoring**
    *   Iterate through each UI component (`scoreboard`, `player-stats`, `event-log`, etc.) as a separate `TODO` item.
    *   For each component:
        1.  **Red:** Write a failing structural test.
        2.  **Green:** Use the AI agent with MCP tools to implement the new HTML structure and CSS styles.
        3.  **Verify:** Run `npm test`.
        4.  **Refactor:** Clean up old styles/scripts.
        5.  **Commit:** Commit the atomic change.

5.  **Step 5: Final Review & Cleanup**
    *   **TODO-X:** Run a final pass with a tool like `/find_unused_css_classes` to remove any remaining dead code.
    *   Perform a full manual visual review against `visual-spec.md`.
    *   Ensure all tests are passing.
    *   Push the final changes to the remote repository.

## 6. File Manifest

### New Files:
*   `C:\Users\silwe\OneDrive\250927 Jones in the Fastlane Vibes\visual-upgrade-plan.md`
*   `C:\Users\silwe\OneDrive\250927 Jones in the Fastlane Vibes\visual-spec.md`
*   `C:\Users\silwe\OneDrive\250927 Jones in the Fastlane Vibes\css\style.css` (assuming a new `css` directory)
*   `C:\Users\silwe\OneDrive\250927 Jones in the Fastlane Vibes\tests\ui.test.js` (for UI-specific structural tests)

### Modified Files:
*   `C:\Users\silwe\OneDrive\250927 Jones in the Fastlane Vibes\spec.md`
*   `C:\Users\silwe\OneDrive\250927 Jones in the Fastlane Vibes\blueprint.md`
*   `C:\Users\silwe\OneDrive\250927 Jones in the Fastlane Vibes\todo.md`
*   `C:\Users\silwe\OneDrive\250927 Jones in the Fastlane Vibes\index.html`
*   `C:\Users\silwe\OneDrive\250927 Jones in the Fastlane Vibes\js\ui.js`
*   `C:\Users\silwe\OneDrive\250927 Jones in the Fastlane Vibes\package.json`
*   `C:\Users\silwe\OneDrive\250927 Jones in the Fastlane Vibes\tests\Scenario.test.js`
