# Design Spec: Contextual Action System & Location Interaction

## 1. Overview
This specification details the removal of the legacy "Action Bar" and the "Travel" button, replacing them with a more intuitive, mobile-first **Contextual Action System**. This solves the "scrolling to find buttons" issue by bringing actions directly to the user's focus.

**Status:** Draft / Proposal  
**Priority:** High (UX Polish)  
**Target Platform:** Mobile-First Web (Vertical)

---

## 2. Problem Statement
*   **Redundancy:** The "Travel" button in the action bar is redundant because users can already travel by clicking Bento cards in the City grid.
*   **UX Friction:** The current `#game-controls` action bar sits at the bottom of the scrollable grid. After traveling to a location, users must often scroll down to find the "Work" or "Shop" buttons, which feels disjointed.
*   **Inconsistency:** Some locations (Bank, Agency) have multiple buttons, while others (Mall) open modals.

---

## 3. The New Interaction Flow

### 3.1 The Bento Grid as Navigation & Action
The City Bento Grid becomes the primary interface for both movement and interaction.

1.  **Travel (Not at Location):** Tapping a Bento card for a location where the player is *not* currently present triggers the `travel` command.
2.  **Interact (At Location):** Tapping the Bento card of the *current* location (marked as `.active`) immediately opens the interaction menu or modal for that location.

### 3.2 The "Quick-Action Tray" (The Bottom Drawer)
Instead of a static list of buttons at the bottom of the grid, we introduce a fixed **Quick-Action Tray** that floats above the Tab Bar.

*   **Visibility:** Only appears when the player is at a location that has available actions.
*   **Aesthetic:** Glassmorphism (`blur`, `rgba(255, 255, 255, 0.05)`) with a neon-cyan top border.
*   **Content:**
    *   **Left:** Location Name & Icon.
    *   **Right:** The "Primary Action" button.
*   **Complex Locations:** For locations with more than 2 actions (e.g., Bank), the tray should show a single "Manage [Location]" button that opens the **Clerk Modal** containing the specific Action Cards.

### 3.3 Primary Action Mapping
To ensure consistency, the following actions are mapped to the Tray:

| Location | Tray Action(s) | Interaction |
| :--- | :--- | :--- |
| **Home** | "Rest / End Turn" | Immediate Execution |
| **Employment Agency** | "Work Shift", "Apply" | Immediate (Work) / Modal (Apply) |
| **Community College** | "Browse Courses" | Opens Clerk Modal |
| **Shopping Mall** | "Browse Items" | Opens Clerk Modal |
| **Used Car Lot** | "View Inventory" | Opens Clerk Modal |
| **Bank** | "Financial Services" | Opens Clerk Modal |

---

## 4. Component Specification

### 4.1 HTML Structure Refactor
The `#game-controls` container should be moved out of the `.content-area` and placed as a fixed sibling to the `.tab-bar`.

```html
<!-- New Contextual Action Tray -->
<div id="contextual-action-tray" class="action-tray glass hidden">
    <div class="tray-location-info">
        <div id="tray-icon" class="tray-icon"></div>
        <div class="tray-text">
            <span class="tray-label">Current Location</span>
            <span id="tray-location-name" class="tray-value">Employment Agency</span>
        </div>
    </div>
    <div id="tray-actions" class="tray-buttons">
        <!-- Dynamically populated buttons -->
        <button class="btn btn-primary btn-sm" data-action="workShift">
            <i class="material-icons">work</i> Work Shift
        </button>
    </div>
</div>
```

### 4.2 CSS Specification (Fixed Tray)
```css
.action-tray {
    position: fixed;
    bottom: 70px; /* Right above the tab bar */
    left: 0;
    width: 100%;
    height: 70px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 var(--space-md);
    z-index: 150;
    border-top: 1px solid var(--neon-cyan);
    animation: slideUp 0.3s ease;
}

.tray-location-info {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
}

.tray-icon {
    width: 32px;
    height: 32px;
}

.tray-text {
    display: flex;
    flex-direction: column;
}

.tray-label {
    font-size: 8px;
    font-weight: 800;
    color: var(--neon-cyan);
    text-transform: uppercase;
    letter-spacing: 1px;
}

.tray-value {
    font-size: 14px;
    font-weight: 800;
}

.tray-buttons {
    display: flex;
    gap: var(--space-sm);
}

.btn-sm {
    padding: var(--space-sm) var(--space-md);
    flex-direction: row; /* Horizontal button for the tray */
    gap: 8px;
    font-size: 12px;
}

@keyframes slideUp {
    from { transform: translateY(100%); }
    to { transform: translateY(0); }
}
```

---

## 5. Handoff Tasks for Frontend Engineer

1.  **HTML Cleanup:**
    *   Remove `<div id="game-controls" class="action-bar">` and its contents from `index.html`.
    *   Add the new `#contextual-action-tray` structure just before the `<nav class="tab-bar">`.
2.  **CSS Implementation:**
    *   Add the `.action-tray` and `.tray-*` styles to `style.css`.
3.  **Logic Update (`js/ui.js`):**
    *   Update `renderCityGrid`:
        *   Modify the `onclick` for the active location card to trigger the primary action (e.g., if location is 'Shopping Mall', call `this.gameController.buyItem()`).
    *   Update `render()` / `updateActionButtons`:
        *   Instead of toggling `hidden` on the old `#game-controls` buttons, dynamically populate the `#tray-actions` container in the new tray.
        *   If the location is 'Home', the tray can show "Rest / End Turn".
    *   **Special Case (Home):** Maintain the FAB for "Next Week" as it's a high-impact turn-ending action, but the tray can still show "Rest" if time remains.
4.  **Refactoring:**
    *   Delete the "Travel" button logic entirely. Travel is now exclusively handled by clicking non-active Bento cards.

---
*Created by Lead UI/UX Designer - Feb 2026*