**Persona:**

You are a senior frontend developer with expertise in refactoring legacy code, implementing modern design systems, and practicing test-driven development (TDD). You have a keen eye for visual detail and a strategic mindset for breaking down complex tasks into manageable, decoupled steps.

**Context:**

I have an existing Minimum Viable Product (MVP) of a browser-based game created with HTML, CSS, and JavaScript. I need to perform a significant visual upgrade. The goal is to match the look and feel of a new design I have, which is represented in the provided `docs/visual-upgrade-index.html` and `docs/visual-upgrade.css` files. The current game's code is functional but lacks a robust structure and modern styling. Existing UI tests are in place but may not be comprehensive enough for this refactoring effort.

**Task:**

Your primary task is to create a high-level, step-by-step plan to refactor the existing MVP game's HTML and CSS to align with the new visual design. The JavaScript functionality should remain unchanged, but the HTML structure and CSS will need considerable updates.

To achieve this, you will:

1.  **Analyze and Compare:** First, analyze the HTML structure of the current MVP game and compare it with the target structure in `visual-upgrade-index.html`. Note the key differences in layout, semantic elements, and componentization.

2.  **Develop a High-Level Plan:** Based on your analysis, create a strategic, step-by-step plan for the visual upgrade. This plan should be broken down into logical, high-level stages.

3.  **Incorporate Test-Driven Refactoring:** The entire plan must be framed around a test-driven refactoring approach. For each step, you need to consider the existing UI tests.

4.  **Identify New Testing Requirements:** As part of the plan, explicitly identify where the current test suite is likely insufficient and list the new UI tests that will need to be written *before* starting the refactoring of a particular component or section.

5.  **Design Decoupled Steps:** Structure the plan so that the steps are as decoupled as possible, minimizing the risk of one change breaking another. For example, refactoring the main game board might be a separate step from refactoring the score display.

6.  **Manage Dependencies:** If some steps are inherently dependent on others, your plan must acknowledge this. For a dependent step, you should include a sub-task to adapt it based on the outcome of the preceding step.

7.  **Recommend Next Steps:** Conclude your plan by stating whether the high-level steps are sufficient or if a more detailed breakdown into smaller, more granular tasks is necessary for a successful implementation.

**Constraints & Requirements:**

*   **Output Format:** The final output must be a well-structured markdown file, using checklists for steps and sub-steps.
*   **Focus:** The plan should focus solely on the HTML and CSS refactoring. Do not modify the game's JavaScript logic.
*   **Clarity over Speed:** The plan should prioritize a safe and systematic refactoring process over a quick one.
*   **Be Mindful of Inconsistencies:** Acknowledge that the new design is not a one-to-one replacement. Your plan should account for adapting the existing structure to the new design's principles, not just copying and pasting.

**Example of a High-Level Step in the Plan:**

**Step 3: Refactor the Main Game Grid**

*   **Objective:** Update the HTML structure and CSS of the game grid to match the new design's flexbox or grid layout and styling.
*   **Dependency:** This step can be performed independently of the header and footer refactoring.
*   **Pre-Refactoring Test Plan:**
    *   Write a new snapshot test for the current game grid component to capture its existing structure and state.
    *   Write new functional UI tests to assert that game pieces can still be placed correctly in the grid after the refactoring.
*   **Refactoring Actions:**
    1.  Replace the existing table-based layout with a more modern `div`-based grid structure.
    2.  Apply the new CSS classes from `docs/visual-upgrade.css` related to the grid container and its cells.
    3.  Ensure all existing `data-attributes` or IDs used by the JavaScript for game logic are preserved on the new HTML elements.
*   **Post-Refactoring Validation:**
    *   Run all new and existing tests to ensure they pass.
    *   Visually verify the new grid layout and styling against `docs/visual-upgrade-index.html`.

Please proceed with generating the high-level plan in a markdown format.