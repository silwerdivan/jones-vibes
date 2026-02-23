# UI Regression Investigation - 2026-02-23

## Executive Summary
This document outlines the root causes for the reported UI regressions following the recent refactoring attempt. The issues are primarily due to component-level CSS conflicts and layout changes rather than missing code.

---

## 1. Screen Visibility (Life, Items, Social, Menu)
The reported issue where clicking these buttons doesn't show content is a **functional bug** caused by the new component architecture's "Double-Hiding" conflict.

### Root Cause: Double-Hiding
*   **Conflict:** `ScreenManager.ts` wraps each screen in a `<section class="screen hidden">`. Simultaneously, the components themselves (e.g., `LifeScreen.ts`, `InventoryScreen.ts`) are initialized with the `hidden` class in their constructors.
*   **Impact:** When a tab is clicked, `ScreenManager` removes the `hidden` class from the **wrapper**, but the **inner component** remains hidden. Since `.screen.hidden` is defined as `display: none !important`, the content is never rendered to the user.
*   **ID Collision:** Both the wrapper and the component use the same ID (e.g., `#screen-life`), which is invalid HTML and can cause unpredictable CSS behavior.

---

## 2. "Rest / End Turn" Button Regressions
The "Rest / End Turn" button has lost its prominent styling due to a shift in layout context and missing CSS classes.

### Root Cause: Layout & Context
*   **Grid Constraint:** The button is now rendered inside the `ChoiceModal` footer using the `.primary-actions-row` class. This container uses a **two-column grid** (`grid-template-columns: 1fr 1fr`). On screens wider than 400px, the "Rest" button only occupies 50% of the width, diminishing its visual weight.
*   **FAB Class Mismatch:** The Floating Action Button (FAB) that appears when the player is at Home is assigned the ID `fab-next-week` but is given the generic class `fab hidden`. The CSS specifically targets `.fab-next-week` for its neon-green gradient and circular styling, so the FAB appears as a default button.
*   **New Style Implementation:** The class `.btn-rest` was successfully added to the CSS with high specificity, but its impact is limited by the surrounding grid container mentioned above.

---

## 3. Component Status Audit
The investigation confirms that no core logic was accidentally deleted, but some screens have been intentionally transitioned to placeholders.

| Screen | Type | Current Status | Content Summary |
| :--- | :--- | :--- | :--- |
| **City** | Functional | Active | Bento grid of locations and contextual FAB. |
| **Life** | Functional | **Broken (Hidden)** | 4 Circular Gauges (Wealth, Happiness, Education, Career). |
| **Items** | Functional | **Broken (Hidden)** | Essentials Grid and Home Assets Grid. |
| **Social** | Placeholder | Active | "Comms system offline" message. |
| **Menu** | Placeholder | Active | "System settings are locked" message. |

---

## 4. Key Architectural Changes
*   **HUD Button Removal:** The persistent "End Turn" button in the HUD has been intentionally removed. The action is now contextual (available only when at Home) via the Location Dashboard (Modal) or the FAB.
*   **Component Encapsulation:** Screens are now fully encapsulated components. The visibility issue is a side effect of transitioning from static HTML to this dynamic model without reconciling the legacy `hidden` class logic.

---

## 5. Next Steps Recommendation
1. [x] **Remove `hidden` from Component Constructors:** Let `ScreenManager` handle visibility exclusively via the wrapper section.
2. [x] **Fix FAB Class:** Update `CityScreen.ts` to apply the `.fab-next-week` class instead of just the ID.
3. [x] **Adjust Modal Footer Layout:** Modify the `primary-actions-row` to allow a single button to span the full width if no other primary actions are present.
