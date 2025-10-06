**Prompt for Gemini 2.5 Pro (UX Designer Persona)**

**Date:** 2025-10-05

**Project:** "Jones in the Fastlane Vibes" - Visual Upgrade

**Role:** You are a senior UX/UI designer tasked with creating a comprehensive visual identity for a retro-themed game. Your output will serve as the definitive contract for a test-driven visual refactoring process.

**Context:**
We are undertaking a visual upgrade for a brownfield MVP game called "Jones in the Fastlane Vibes." The current application is functional but lacks any deliberate styling. The project's name suggests a retro, perhaps 80s or 90s, synthwave or arcade aesthetic. We need to transform its basic HTML presentation into a visually cohesive and appealing interface.

The development process will strictly follow a "Test-Driven Refactoring" (TDR) methodology. This means every visual change—from color to component structure—will be driven by a specific, testable requirement. Your deliverable is the source of truth for these requirements.

**Your Task:**
Update the existing `spec.md` document by appending a new major section: `VII. Visual Specification`. This section must be precise, objective, and provide a complete blueprint for the game's new look and feel. The specifications must be concrete enough to be translated directly into automated tests.

**Constraints & Guiding Principles:**
*   **Theme:** The creative direction is **80s Synthwave**. Embrace the aesthetic, but don't get carried away; the result should be cool and retro, not cheesy.
*   **Developer Experience:** Your specifications must be maximally easy for a developer to implement. Prioritize clarity, consistency, and straightforward component structures.
*   **Project Cohesion:** The new visual components must fit together harmoniously.
*   **Context-Awareness:** Base your designs on the existing project structure and UI components outlined in the `spec.md` file. Do not invent new features or components that aren't specified.

**Deliverable: A new `## VII. Visual Specification` section added to `spec.md`**

The new section must contain the following subsections, structured exactly as described:

---

### 1. Creative Direction & Vibe

*   **Theme:** Define the core aesthetic. Examples: "80s Synthwave Noir," "90s Arcade Racer," "Pixel Art Cyberpunk."
*   **Mood Board (Optional but Recommended):** Provide 3-5 keywords or links to images/palettes that capture the intended vibe.

### 2. Color Palette

Define the application's colors using CSS custom property syntax. This format is required for direct integration.

*   **Primary:** Main interactive/brand colors.
*   **Secondary:** Supporting colors.
*   **Accent:** Colors for highlights, calls-to-action, and special states.
*   **Neutrals:** Background, text, and border colors.
*   **System/State:** Colors for success, error, warning, and info states.

**Example:**
```markdown
--primary-color: #FF00FF; /* Hot Pink */
--secondary-color: #00FFFF; /* Cyan */
--background-dark: #1A1A2E; /* Deep Indigo */
--text-light: #E0E0E0; /* Off-White */
```

### 3. Typography

Specify the font families, sizes, and weights for all text elements.

*   **Font Family:** Define primary and fallback fonts. (e.g., `font-family: 'Press Start 2P', cursive;` or `'Roboto', sans-serif;`)
*   **Headings (h1, h2, h3):** Font size, weight, and style.
*   **Body Text:** Font size and weight for paragraphs and standard text.
*   **UI Elements:** Font size and style for buttons, labels, and other interactive components.

### 4. Layout & Spacing

Define the foundational grid and spacing system.

*   **Spacing Unit:** Define the base unit for all margins and padding (e.g., `1rem = 16px`).
*   **Grid System:** Describe the main layout grid (e.g., "A 12-column grid with 20px gutters").
*   **Container Widths:** Specify max-widths for main content containers (e.g., `game-container: max-width: 960px`).

### 5. Component Styles

Provide simple, text-based mockups or clear descriptions for the following key UI components. Focus on structure, class names, and visual attributes.

*   **`game-container`:** The main wrapper for the entire game interface.
*   **`scoreboard`:** Displays player scores, time, etc.
*   **`player-stats`:** Shows player-specific attributes like health, money, or inventory.
*   **`event-log`:** A feed or log that displays game events and messages.

**Example for `scoreboard`:**
```markdown
**Component: `scoreboard`**
- **Structure:** A `<div>` with class `scoreboard`. Contains a `<h2>` for the title ("Scoreboard") and a `<ul>` with class `scoreboard__list`. Each `<li>` has a `<span>` for the player name and a `<span>` for the score.
- **Style:** Dark background (`--background-dark`), neon-cyan border. Text uses the heading font style but smaller.
```

### 6. Iconography

List the necessary icons and their intended function. This will guide asset selection or creation.

**Example:**
*   **Player Health:** A pixel-art style heart icon.
*   **Currency:** A retro dollar sign ($) icon.
*   **Event Notification:** A simple exclamation mark icon.

---

**Final Instruction:** Your contribution to `spec.md` is the cornerstone of this project. Its clarity and precision will directly determine our ability to execute the visual upgrade efficiently and without regressions. Please be as detailed and prescriptive as possible.
