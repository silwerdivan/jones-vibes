# Visual Upgrade Refactoring Plan

## 1. Introduction

This document outlines a strategic, test-driven plan to refactor the HTML and CSS of the "Jones in the Fast Lane" MVP to match the new, modern retro-themed design. The primary goal is to replace the visual layer without altering the existing JavaScript functionality.

## 2. High-Level Analysis of Changes

A comparison between the current `index.html` and the target `visual-upgrade-index.html` reveals significant structural and stylistic differences:

- [ ] **Layout:** The new design uses a more structured, semantic layout with `<header>`, `<main>`, and distinct `<div>` containers for each UI section, styled via an external CSS file. The current MVP uses a single grid and inline styles.
- [ ] **Component Structure:** Each UI component (Player Panel, Info Panel, etc.) has a new internal structure. For example, player stats have moved from simple `<p>` tags to a `<div>` structure with `stat-item`, `stat-label`, and `stat-value` classes.
- [ ] **Styling:** The new design employs a sophisticated, retro-futuristic aesthetic using custom fonts, a specific color palette, and effects like text shadows and animations, all defined in `visual-upgrade.css`.
- [ ] **JavaScript Hooks (IDs):** The current HTML relies heavily on specific IDs for DOM manipulation (e.g., `p1-cash`, `game-controls`). The new HTML structure omits these. **A critical task will be to re-apply these IDs to the new elements to ensure the game logic remains functional.**

## 3. Pre-Refactoring Preparation: Test Suite Enhancement

The existing UI test suite is functional but insufficient for a visual refactor. Before any code is changed, the test suite must be enhanced.

- [x] **Objective:** To create a safety net that can detect unintended structural and visual regressions.
- [x] **New Test Requirements:**
    - [x] **Implement Snapshot Testing:** For each major UI component (Player Panels, Info Panel, Actions, Log), create a Jest snapshot test. This will capture the initial HTML structure and serve as a baseline.
    - [x] **Write a "Current State" Visual Test:** Create a new test file that:
        - [x] Asserts the presence of the main containers (`player1-status-panel`, `game-controls`, etc.).
        - [x] Checks for the `current-player` class on the active player's panel.
        - [x] This test will initially pass and will be the first to be adapted during the refactoring.

## 4. Step-by-Step Refactoring Plan

These steps are designed to be performed sequentially and atomically.

### Step 1: Main Layout and Stylesheet Integration

- [x] **Objective:** Replace the old layout and inline styles with the new external stylesheet and primary HTML structure.
- [x] **Dependency:** This is the foundational step and must be completed first.
- [x] **Pre-Refactoring Test Plan:**
    - [x] Write a snapshot test for the entire `<body>` content to capture the current structure.
- [x] **Refactoring Actions:**
    - [x] Create `style.css` in the root directory and copy the content from `docs/visual-upgrade.css` into it.
    - [x] In `index.html`, remove the existing `<style>` block from the `<head>`.
    - [x] Add the Google Fonts `preconnect` links and the new stylesheet `<link>` to the `<head>`.
    - [x] Replace the `<h1>` and `<div id="game-container">` with the new top-level structure:
        ```html
        <div class="game-container">
            <header class="game-title">
                <h1>JONES IN THE FAST LANE</h1>
            </header>
            <main class="main-grid">
                <!-- Existing panels will go here in the next steps -->
            </main>
        </div>
        ```
    - [x] Move the existing player, info, controls, and log panels inside the new `<main class="main-grid">` tag for now. The page will look broken, but this is expected.
- [x] **Post-Refactoring Validation:**
    - [x] Update the initial snapshot test. The new snapshot should reflect the new container structure.
    - [x] Visually verify that the new background color and header font are applied. The layout will be incorrect, but the styles should be loading.

### Step 2: Refactor Player Panels

- [ ] **Objective:** Update the player status panels to the new HTML structure and styling, while preserving JavaScript functionality.
- [ ] **Pre-Refactoring Test Plan:**
    - [ ] Write a snapshot test for the `player1-status-panel` component.
- [ ] **Refactoring Actions:**
    - [ ] Replace the content of `<div id="player1-status-panel" class="player-panel">` with the new structure from the target design.
    - [ ] **Crucially, re-apply the original IDs to the new stat `<span>` elements.**
        ```html
        <!-- Example for Player 1 Cash -->
        <div class="stat-item">
            <span class="stat-label">Cash:</span>
            <span id="p1-cash" class="stat-value currency">$0</span>
        </div>
        ```
    - [ ] Do the same for all stats for both Player 1 and Player 2, ensuring IDs like `p1-savings`, `p2-happiness`, etc., are in the correct new locations.
    - [ ] Update the `id` of the main panel `div` from `player-1` to `player1-status-panel` to match the original.
- [ ] **Post-Refactoring Validation:**
    - [ ] Update the component snapshot test.
    - [ ] Run the `GameInitialization.test.js` and `PlayerActions.test.js` suites. They should pass, confirming that stats are still being updated correctly.
    - [ ] Visually verify the new player panel styling.

### Step 3: Refactor Info & Actions Panels

- [ ] **Objective:** Update the location/turn info panel and the game controls panel.
- [ ] **Pre-Refactoring Test Plan:**
    - [ ] Write snapshot tests for the `#location-info` and `#game-controls` components.
- [ ] **Refactoring Actions:**
    - [ ] Replace `<div id="location-info">` with the new `<div class="info-panel">` structure. Re-apply the `id="current-location"` and `id="game-turn"` to the new `<span>` elements that will hold these values.
    - [ ] Replace `<div id="game-controls">` with the new `<div class="actions-panel">` structure.
    - [ ] Move the existing action buttons inside the new `<div class="action-buttons">`. **Preserve all original button IDs** (e.g., `btn-travel`, `btn-work-shift`).
- [ ] **Post-Refactoring Validation:**
    - [ ] Update the component snapshot tests.
    - [ ] Run the `LocationControls.test.js` and `PlayerActions.test.js` suites. They should pass, confirming buttons appear/disappear and actions still work.
    - [ ] Visually verify the new panel styling.

### Step 4: Refactor Event Log

- [ ] **Objective:** Update the game log to match the new design.
- [ ] **Pre-Refactoring Test Plan:**
    - [ ] Write a snapshot test for the `#log` component.
- [ ] **Refactoring Actions:**
    - [ ] Replace `<div id="log" data-testid="game-log">` with the new `<div class="event-log">` structure.
    - [ ] **Keep the `data-testid="game-log"` attribute on the new outer `div`**.
    - [ ] The JS currently appends messages directly to the log container. The new design has a `log-content` child `div`. The `updateLog` function in `ui.js` may need a minor tweak to target this new child element. This is the only potential JS change required.
- [ ] **Post-Refactoring Validation:**
    - [ ] Update the component snapshot test.
    - [ ] Run the `PlayerActions.test.js` suite. The test for logging should pass (with the minor JS tweak if necessary).
    - [ ] Visually verify the new log styling.

### Step 5: Style the Modals

- [ ] **Objective:** Apply the new retro theme to the pop-up modals, which are not present in the static target design.
- [ ] **Pre-Refactoring Test Plan:**
    - [ ] The `UserInputModals.test.js` suite already provides a good functional test base.
    - [ ] Write a snapshot test for an open modal.
- [ ] **Refactoring Actions:**
    - [ ] Add new CSS rules to `style.css` for `#choice-modal-overlay` and `#choice-modal`.
    - [ ] Style the modal background, text, and buttons to match the overall aesthetic (e.g., use the same fonts, color palette, and button styling as the `actions-panel`).
- [ ] **Post-Refactoring Validation:**
    - [ ] Update the modal snapshot test.
    - [ ] Run the `UserInputModals.test.js` suite to ensure modals are still functional.
    - [ ] Visually verify that modals now match the new design aesthetic.

## 5. Conclusion and Next Steps

This high-level plan breaks the visual refactor into manageable, test-driven stages. By focusing on one component at a time and ensuring tests pass before moving on, we can systematically and safely apply the new design.

The steps provided are sufficient for a senior developer to begin implementation. No more granular breakdown is necessary at this stage, but it is crucial to follow the testing and ID preservation strategy outlined in each step to avoid breaking game functionality.