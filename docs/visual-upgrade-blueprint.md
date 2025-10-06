# Blueprint: Visual Upgrade

## 1. Architectural Overview

This blueprint outlines the technical steps to refactor the game's UI according to the `spec.md`. The approach is to first establish a CSS foundation with variables and basic styles, then refactor the HTML structure, and finally style each component individually. This ensures a clean separation of concerns and an incremental, testable workflow.

A new directory `css` will be created to house the stylesheet. The main `index.html` will be modified to link this stylesheet and its structure will be updated to match the new component-based design.

## 2. Sequential Plan

### Phase 1: CSS Foundation

1.  **Create Stylesheet:**
    *   Create a new directory: `css`.
    *   Create a new file within it: `css/style.css`.
2.  **Define CSS Variables:**
    *   In `css/style.css`, create a `:root` block.
    *   Add all color variables as defined in `spec.md#VII.2`.
3.  **Define Base Typography & Layout Styles:**
    *   In `css/style.css`, define global styles for `body`, headings (`h1`, `h2`, `h3`), and paragraphs.
    *   Set the `font-family` for headings to `'Press Start 2P', cursive`.
    *   Set the `font-family` for the body and UI elements to `'Roboto Mono', monospace`.
    *   Apply `background-color: var(--background-dark)` and `color: var(--text-light)` to the `body`.
4.  **Link Stylesheet:**
    *   Modify `index.html` to include `<link rel="stylesheet" href="css/style.css">` in the `<head>`.

### Phase 2: Main Layout & HTML Structure Refactoring

1.  **Refactor `game-container`:**
    *   In `index.html`, identify the main container element. If it doesn't exist, create one.
    *   Assign it the ID `game-container`.
    *   Style `game-container` in `css/style.css` with `max-width`, `margin`, `padding`, `border`, and `box-shadow` as specified. Add a placeholder for the synthwave grid background.
2.  **Create Component Shells:**
    *   Inside `#game-container`, create the primary structural `div` elements for the main UI components as defined in `spec.md#VI` and `spec.md#VII.5`.
    *   `<div id="player-status-panel"></div>`
    *   `<div id="opponent-status-panel"></div>`
    *   `<div id="time-movement-tracker"></div>`
    *   `<div id="event-log"></div>`
    *   (Note: The existing UI elements from the unstyled version will need to be moved into these new containers in the next phase).

### Phase 3: Component-by-Component Implementation

For each component, the task is to move the existing HTML elements (or create new ones) into the new structure and apply the specified styles.

1.  **Implement `player-status-panel`:**
    *   **HTML:** Move the existing player status elements into `#player-status-panel`. Structure them as a `<h3>` for the title and a `<ul>` for the stats, as per the spec.
    *   **CSS:** In `css/style.css`, add styles for `#player-status-panel` (background, border, padding).
2.  **Implement `opponent-status-panel`:**
    *   **HTML:** Move opponent status elements into `#opponent-status-panel`. Structure with a `<h3>` and four `div`s for progress bars.
    *   **CSS:** Add styles for `#opponent-status-panel` and the progress bars.
3.  **Implement `time-movement-tracker`:**
    *   **HTML:** Move time/movement elements into `#time-movement-tracker`. Ensure the `<button id="end-turn-btn">` is present.
    *   **CSS:** Add styles for the container and the distinct `end-turn-btn`.
4.  **Implement `event-log`:**
    *   **HTML:** Move the event log elements into `#event-log`. Structure with a `<h3>` and a `<ul>`.
    *   **CSS:** Add styles for the container, including `min-height` and `overflow-y`.

### Phase 4: Iconography & Final Polish

1.  **Integrate Icons:**
    *   Identify locations in the HTML where icons are needed (e.g., next to stat labels).
    *   Add placeholder `<span>` elements with classes like `icon icon-wealth`, `icon icon-happiness`, etc.
    *   (Note: Sourcing the actual icon assets is a separate task, but the structure will be in place).
2.  **Review and Refine:**
    *   Perform a final review of the UI against the `spec.md`.
    *   Adjust spacing, alignment, and colors as needed to ensure visual cohesion.
