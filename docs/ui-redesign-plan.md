# UI Redesign Plan: Jones in the Fast Lane

This document outlines an iterative plan for redesigning the user interface of "Jones in the Fast Lane," drawing heavily from the principles and guidelines established in `ui-ux-blueprint.md`. The approach focuses on building a modern, mobile-first, and app-like experience by starting with foundational design elements, then moving to individual components, and finally showcasing complete screen mockups.

## Phase 1: Foundation - Design System Elements

This phase establishes the core visual language and reusable styles for the application.

### Task 1.1: Establish CSS Variables for Design Tokens [COMPLETED]

**Objective:** Define a consistent set of CSS variables for colors, typography, spacing, and border-radii, making skinning and theming easier.

**Details:**
*   **Colors:**
    *   `--color-success-green: #00E676;` (Career/Money)
    *   `--color-energy-yellow: #FFD600;` (Time/Happiness)
    *   `--color-calm-blue: #2979FF;` (Education/Status)
    *   `--color-background-dark: #121212;` (Primary Dark Background)
    *   `--color-background-off-white: #F5F7FA;` (Primary Light Background - if applicable, for light mode variation)
    *   Define additional shades for hover/active states, text colors, and subtle accents.
*   **Typography:**
    *   `--font-family-primary: 'Inter', sans-serif;` or `'Plus Jakarta Sans', sans-serif;` (Need to import chosen font from Google Fonts or similar).
    *   `--font-size-base: 16px;`
    *   Define fluid typography scale using `clamp()` for headings, body text, and smaller labels.
*   **Spacing:**
    *   `--spacing-xs: 4px;`, `--spacing-sm: 8px;`, `--spacing-md: 16px;`, etc. (Consistent vertical and horizontal rhythm).
*   **Border Radius:**
    *   `--border-radius-sm: 8px;`, `--border-radius-md: 16px;`, `--border-radius-lg: 24px;` (Consistent rounded corners).
*   **Shadows:**
    *   Define subtle box shadows for depth, consistent with "Modern Neumorphism" or "Glassmorphism."

### Task 1.2: Base Button Styles & States [COMPLETED]

**Objective:** Create a set of universally applicable button styles with defined interactive states.

**Details:**
*   **Primary Button:**
    *   Rounded corners (`--border-radius-md` or `--border-radius-lg`).
    *   Vibrant background color (e.g., a primary accent color or a gradient).
    *   Clear, contrasting text.
    *   **States:**
        *   `Idle`: Default appearance.
        *   `Hover`: Subtle background change or shadow lift (for desktop).
        *   `Tapped/Active`: Slight scale-down (`transform: scale(0.98)`) for haptic feedback, subtle background change.
        *   `Disabled`: Greyed out, reduced opacity, `cursor: not-allowed;`.
        *   `Success`: Temporary change to `--color-success-green` background after a successful action (e.g., "Got the Job!" toast).
*   **Secondary/Ghost Button:**
    *   Outline or minimal background, used for less prominent actions.
    *   Similar state transitions as the primary button.
*   **Icon Button:**
    *   Circular or square buttons containing only an icon.

### Task 1.3: Input Field Styles [COMPLETED]

**Objective:** Design clean, modern input fields for text and numeric entry.

**Details:**
*   **Text Input:**
    *   Subtle background, clear border, rounded corners.
    *   Placeholder text styling.
    *   `Focus` state: Highlighted border or subtle glow.
*   **Numeric Input (e.g., for deposit/withdraw modals):**
    *   Similar base style to text input, potentially with stepper controls (`+/-` buttons) if needed.

### Task 1.4: Card/Panel Styles (Bento Grid / Glassmorphism) [COMPLETED]

**Objective:** Develop a reusable card component that incorporates Bento Grid principles and Glassmorphism effects.

**Details:**
*   **Base Card:**
    *   Rounded corners (`--border-radius-lg`).
    *   Subtle background (e.g., slightly lighter than `--color-background-dark`).
    *   Padding (`--spacing-md` or `--spacing-lg`).
    *   Subtle drop shadow.
*   **Glassmorphism Variation:**
    *   Apply `backdrop-filter: blur(Xpx);` to the card background for translucent effect.
    *   Requires a background image/gradient behind it to be visible.

### Task 1.5: Basic Icon Styling

**Objective:** Ensure icons are consistently sized and colored.

**Details:**
*   Utilize a chosen icon library (e.g., Font Awesome, Material Icons) or create custom SVG icons.
*   Define `size` and `color` CSS variables for icons to ensure consistency.
*   Focus on a "thick-line" or "3D-flat" style as per blueprint.

## Phase 2: Core Components - Individual UI Elements

This phase focuses on developing specific, reusable UI components based on the design system elements.

### Task 2.1: Top HUD Elements

**Objective:** Design and implement the persistent status bar elements.

**Details:**
*   **Container:** Fixed position at the top of the viewport, responsive width, potentially glassmorphic background.
*   **Cash Balance:**
    *   Large, bold typography, using `--color-success-green` for positive, `--color-energy-yellow` for neutral, and potentially red for negative.
    *   Micro-animation for counter ticking up/down when value changes.
*   **Week Number:**
    *   Clear, legible text.
*   **Time Ring (Circular Progress Bar):**
    *   SVG-based or CSS `conic-gradient` circular progress bar.
    *   Around a placeholder avatar.
    *   Depletes as time passes/actions are taken.
    *   Micro-animation for progress updates.

### Task 2.2: Bottom Navigation Bar

**Objective:** Create the primary navigation element for mobile-first interaction.

**Details:**
*   **Container:** Fixed position at the bottom of the viewport, `backdrop-filter: blur()` for glassmorphism effect.
*   **Items:**
    *   Five distinct icons with labels: City, Life, Inventory, Social/Leaderboard, Menu.
    *   **States:**
        *   `Idle`: Default icon/text color.
        *   `Active`: Highlighted icon/text color (e.g., `--color-calm-blue`), potentially a subtle indicator bar.
*   Ensure `env(safe-area-inset-bottom)` is used for safe area handling on mobile devices.

### Task 2.3: Location Cards

**Objective:** Design the interactive Bento-style cards for the City Map.

**Details:**
*   **Base Card:** Use styles from Task 1.4.
*   **Content:**
    *   Building Name (prominent).
    *   Icon representing the location.
    *   "Travel Time" indicator (e.g., `-10 mins`), possibly styled subtly.
    *   Variations for different locations (e.g., "Socket City," "Monolith Burger," "University").
*   **Interactive States:** `Hover` (desktop), `Tapped` (mobile) to indicate interactability.

### Task 2.4: Quick Action Button (FAB)

**Objective:** Implement the "Next Week" floating action button.

**Details:**
*   **Button Style:** Use a primary button style (Task 1.2), but with a prominent, possibly circular shape.
*   **Placement:** Fixed in the bottom right corner of the screen.
*   **States:**
    *   `Idle`: Default appearance.
    *   `Active`: Full opacity and interactable.
    *   `Disabled`: Greyed out, reduced opacity when time is not low or action is not available.

### Task 2.5: Modal/Overlay Structure

**Objective:** Create a reusable overlay component for in-game interactions.

**Details:**
*   **Background:** Full-screen overlay with a semi-transparent dark background.
*   **Modal Container:** Centered on screen, rounded corners, glassmorphic effect (`backdrop-filter: blur()`).
*   **Header:** Space for a character illustration and speech bubble.
*   **Close Button:** Prominent "X" or "Done" button.
*   **Responsive:** Ensure it scales gracefully on different screen sizes.

### Task 2.6: Selection List Items (within Modals)

**Objective:** Design clear rows for displaying choices within interaction pop-ups.

**Details:**
*   **Row Structure:**
    *   Icon (left), Item Name (left), Cost/Requirement (right), Buy/Action Button (right).
*   **Buy/Action Button:** Use primary button styles (Task 1.2), ensuring "press" animation.
*   **Requirement Indicators:**
    *   If requirements are not met (e.g., insufficient money, education), the Buy button should be `Disabled` (Task 1.2).
    *   Display a "Locked" icon or subtle text explaining the unmet requirement.

### Task 2.7: Character & Goals Screen: Circular Gauges

**Objective:** Implement the visual progress indicators for player goals.

**Details:**
*   **SVG-based or CSS `conic-gradient`:** Four large circular gauges for Wealth, Happiness, Education, Career.
*   **Labels:** Clear labels for each goal.
*   **Progress Animation:** Smooth transition of the gauge fill when progress changes.
*   **Color-coding:** Use the respective brand colors (`--color-success-green`, `--color-energy-yellow`, `--color-calm-blue`) for each gauge.

### Task 2.8: Character & Goals Screen: Status Tags

**Objective:** Create small, informative chips to display player statuses.

**Details:**
*   **Chip Style:** Small, rounded rectangle with subtle background and clear text.
*   **Content:** Examples like "Hungry," "Well-Rested," "Manager Level."
*   **Variations:** Different background/text colors for various status types (e.g., red for negative, green for positive).

### Task 2.9: Turn Transition Modal ("Oh What a Weekend!")

**Objective:** Design the full-screen modal for displaying end-of-week events.

**Details:**
*   **Full-screen overlay:** With a distinct background (potentially a synthwave-inspired gradient).
*   **Scrolling List:** Vertical scrolling list of event cards.
*   **Event Card:**
    *   Similar to general card style (Task 1.4), but perhaps slightly simpler.
    *   Content: Event description, financial impact (e.g., `$-150`), and potentially an icon.
*   **Summary Section:** Clearly display "Net change in cash" and "Net change in happiness" at the bottom of the modal.

### Task 2.10: Notification Systems

**Objective:** Implement visual feedback and notification elements.

**Details:**
*   **Toast Notifications:**
    *   Small, temporary pop-up at the top of the screen.
    *   Rounded corners, subtle background.
    *   Clear message (e.g., "Got the Job!", "Too tired to study!").
    *   Auto-dismiss after a few seconds.
*   **Notification Badge:**
    *   Small red dot positioned on the "Menu" tab icon when new updates are available.
*   **Live Ticker (Conceptual):**
    *   A subtle, horizontally scrolling text area at the top of the Map screen.
    *   For in-game economy changes (e.g., "Egg prices up 20% at Z-Mart!").

## Phase 3: Screen Mockups / Showcases

Once individual elements and components are developed and refined, this phase involves assembling them into complete screen mockups to visualize the new UI.

### Task 3.1: City Map Screen Mockup

**Objective:** Combine Top HUD, Location Cards (Bento Grid), and the FAB into a complete screen.

**Details:**
*   Integrate Task 2.1, 2.3, and 2.4.
*   Demonstrate the responsive layout for desktop and mobile.

### Task 3.2: Interaction Pop-up Mockup (e.g., University Shop)

**Objective:** Showcase an interaction modal with header, character, and selection list.

**Details:**
*   Integrate Task 2.5 and 2.6.
*   Showcase both interactable and disabled list items.

### Task 3.3: Character & Goals Screen Mockup

**Objective:** Display the player's dashboard view.

**Details:**
*   Integrate Task 2.7 and 2.8.
*   Include a placeholder for the "Apparition/Clothes" preview.

### Task 3.4: "Oh What a Weekend!" Modal Mockup

**Objective:** Present the full-screen turn transition experience.

**Details:**
*   Integrate Task 2.9.
*   Show multiple event cards and the summary section.

---

This iterative plan ensures a systematic approach to the UI redesign, allowing for focused development and review of each element before integration into full screens. It aims to achieve the "Modern Neumorphism" / "Glassmorphism" aesthetic with a strong mobile-first focus, providing a truly app-like experience for "Jones in the Fast Lane."
