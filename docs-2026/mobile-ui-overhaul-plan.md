# Mobile UI/UX Overhaul Plan: Cyberpunk Dashboard Evolution

This document outlines the detailed plan to transform the current "Jones in the Fast Lane" mobile interface into the high-fidelity, "app-like" Cyberpunk Dashboard aesthetic shown in the mockups.

## 1. Vision & Goal
The objective is to move away from a "board game on a web page" layout to a sleek, immersive mobile experience. We will adopt **Glassmorphism**, **Bento Grid** layouts, and **Character-Driven Interactions** to make the game feel premium and responsive.

## 2. Visual Critique: Current vs. Target

| Feature | Current Implementation | Mockup Target (Cyberpunk Dashboard) |
| :--- | :--- | :--- |
| **Aesthetic** | Flat glass panels, neon borders, high contrast. | Deep, translucent glass with inner glows, soft drop shadows, and vibrant neon accents on a deep violet/black background. |
| **Main Map** | Location is a text label; actions are buttons in a bottom bar. | **Bento Grid:** Each location is a distinct, colorful card with icons and travel info. |
| **HUD** | Top bar with "Location" and "Turn". | Integrated HUD: **Time Ring** around avatar, prominent **Cash**, and a live **News Ticker**. |
| **Interactions** | Generic modals with button lists. | **Clerk-Driven:** Modals feature clerk illustrations, speech bubbles, and detailed "Action Cards". |
| **Navigation** | Action buttons (Work, Shop) in the bottom bar. | **App Tabs:** City, Life, Inventory, Social, Menu. Actions move *into* the City/Location cards. |
| **Stats View** | Vertical cards for player stats. | **Life Dashboard:** Large circular progress gauges (Wealth, Happiness, Education, Career). |

---

## 3. Implementation Roadmap

### Phase 0: Groundwork & Asset Strategy
*   **Align with Existing Functionality:** This plan is a strategic evolution. All UI changes will be mapped to *existing* game mechanics (`travel`, `buyItem`, `takeCourse`) before any net-new features are considered. The primary goal is to replace generic `showChoiceModal` patterns with richer, context-specific interfaces.
*   **Icon & Asset Palette:** Establish the visual foundation.
    *   Audit existing Material Icons and identify gaps.
    *   Source or create a set of custom SVG icons for locations, items, and actions that align with the "Cyberpunk" aesthetic.
    *   Define a clear structure for storing and accessing these new assets.

### Phase 1: The App Shell & Navigation
*   **Persistent HUD:** Implement the top HUD with the player's avatar, a circular **Time Ring** (SVG-based), Cash balance, and the "Week" indicator.
*   **News Ticker:** Add a horizontally scrolling ticker at the top for game events (e.g., "Egg prices up 20%").
*   **Bottom Tab Bar:** Replace the current action buttons with 5 tabs: **City**, **Life**, **Inventory**, **Social**, and **Menu**.
    *   This requires a "View Switcher" in `GameView` to toggle between these screens.

### Phase 2: The City Map (Bento Grid) - Travel Reimagined
*   **Replace Travel Modal:** This phase directly replaces the generic `showChoiceModal` used for travel.
*   **Location Cards:** Redesign the "City" tab as a scrollable grid of Bento cards.
    *   Each card should show: Name, Icon, Travel Time, and a summary of what can be done there (e.g., "Work: -4 hrs, +$200").
    *   Clicking a card will directly invoke the `gameController.travel(destination)` command.
*   **Next Week FAB:** Add a prominent "Next Week" floating action button in the bottom right, active when the turn is ready to end.

### Phase 3: Character-Driven Interaction Modals - Richer Choices
*   **Replace Action Modals:** This phase replaces the `showChoiceModal` for buying items, taking courses, and other location-specific actions.
*   **Clerk Modals:** Update shop/university views.
    *   Include a circular clerk avatar and a speech bubble with context-sensitive text.
*   **Action Cards:** Replace simple buttons within modals with "Action Cards".
    *   Show the cost, requirements (with "Locked" states), and a clear "Apply" or "Buy" button.
    *   These cards will be the new interface for `buyItem`, `takeCourse`, etc.
    *   Use tactile animations (`scale(0.98)`) for these cards.

### Phase 4: Life Dashboard & Inventory
*   **Life Tab:** Implement the goals visualization using 4 large circular progress bars.
*   **Status Tags:** Add "Chips" for statuses like "Hungry" or "Well-Rested".
*   **Inventory Tab:** Create a grid of owned equipment (e.g., Computer, Fridge) with their bonuses clearly listed.

### Phase 5: "Oh What a Weekend!" Transition
*   **Turn Summary:** Implement a full-screen modal between turns.
*   **Event Cards:** Display a vertical list of cards for rent, food, and random events with color-coded impacts (Red for expenses, Green for gains).

---

## 4. Technical Strategy
1.  **CSS Variables:** Update `style.css` with the refined palette (Magenta, Cyan, Green) and glass effects.
2.  **View Layer Refactor:** Enhance `GameView` to handle multiple "Screens" (tabs) instead of just one main layout.
3.  **SVG Components:** Leverage the existing `ClockVisualization` but adapt it into the HUD's circular Time Ring.
4.  **Componentization:** Create reusable CSS classes for `.bento-card`, `.action-card`, and `.gauge-container`.

## 5. Next Steps
1.  Start with the **HUD & Bottom Nav** to establish the "App" structure.
2.  Transition the "City" view to the **Bento Grid**.
3.  Implement the **Life Dashboard**.

---

## 6. Task List

### Phase 0: Groundwork
- [x] Audit existing Material Icons and identify gaps for Cyberpunk aesthetic. [COMPLETED]
- [x] Source or create custom SVG icons for locations, items, and actions. [COMPLETED]
- [x] Establish directory structure for new UI assets. [COMPLETED]

### Phase 1: App Shell
- [x] Update `style.css` with Cyberpunk palette and glassmorphism variables. [COMPLETED]
- [ ] Implement Persistent HUD (Avatar, Time Ring, Cash, Week).
- [ ] Implement News Ticker component.
- [ ] Implement Bottom Tab Bar (City, Life, Inventory, Social, Menu).
- [ ] Implement "View Switcher" in `GameView` to toggle screens.

### Phase 2: City Map
- [ ] Redesign City tab as a scrollable grid of Bento cards.
- [ ] Map Bento card clicks to `gameController.travel()`.
- [ ] Add "Next Week" Floating Action Button (FAB).

### Phase 3: Character-Driven Modals
- [ ] Implement Clerk Modals with avatars and speech bubbles.
- [ ] Implement Action Cards for buying items, taking courses, etc.
- [ ] Replace `showChoiceModal` usage with new Clerk/Action Card interfaces.
- [ ] Add tactile animations to Action Cards.

### Phase 4: Life & Inventory
- [ ] Implement Life Tab with 4 circular progress gauges.
- [ ] Implement Status Tags (Chips) for player statuses.
- [ ] Implement Inventory Tab grid for owned equipment.

### Phase 5: Turn Transitions
- [ ] Implement full-screen Turn Summary modal.
- [ ] Implement color-coded Event Cards for the summary.

---

## 7. Implementation History

### Phase 0: Groundwork
- **Audit existing Material Icons [2026-02-16]:**
    - Audited `index.html` and `style.css` for current Material Icon usage.
    - Cross-referenced `js/game/gameData.js` to identify specific icon requirements for all game locations.
    - Produced `docs-2026/icon-audit-results.md` which maps 12 existing icons to Cyberpunk-themed replacements and identifies 15+ new icon gaps for the Tab Bar, Life Dashboard, and Bento Grid.
- **Source or create custom SVG icons [2026-02-16]:**
    - Created `js/ui/Icons.js` as a central ES6 module registry for custom SVG icons.
    - Implemented 22 high-fidelity SVG icons with customizable size and color, covering utility (chevron, close), actions (standby, cyber-chip), navigation (city-grid, bio-metrics), and locations (apartment, agency).
    - Verified icon rendering and aesthetic consistency using a dedicated `test-icons.html` preview page.
- **Establish directory structure for new UI assets [2026-02-16]:**
    - Created `assets/ui/icons`, `assets/ui/illustrations`, and `assets/ui/branding` to organize future high-fidelity visual components.

### Phase 1: App Shell
- **Update `style.css` with Cyberpunk palette [2026-02-16]:**
    - Updated `:root` CSS variables with the new Cyberpunk palette (Neon Pink, Cyan, Green, Yellow, Blue, Red).
    - Defined refined glassmorphism tokens (`--glass-surface`, `--glass-blur`, `--glass-shadow`, `--glass-glow`).
    - Applied these new variables to `.glass`, `.card`, and `.btn` classes to enforce the new aesthetic (depth, inner glows, vibrant borders).
