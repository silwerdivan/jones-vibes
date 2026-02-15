### PHASE 1: VISUAL DECOMPOSITION (The Descriptive Style Guide)

**1. The "Universe" (Background & Atmosphere)**
*   **Visual Target:** A deep, immersive dark mode. Think "Cyberpunk Dashboard."
*   **CSS Description:**
    *   **Background:** A deep violet/black radial gradient. Center is slightly lighter (`#1A0433`) fading to pitch black/deep purple at edges (`#0D0015`).
    *   **Texture:** A subtle "scanline" or "noise" overlay is *removed* in favor of a clean, high-fidelity look, but a very faint background glow behind active elements is desired.

**2. The "Glass" Material (Cards & Panels)**
*   **Visual Target:** Translucent, frosted glass panels that float above the background.
*   **CSS Description:**
    *   **Background:** `rgba(255, 255, 255, 0.05)` (Very low opacity white) or `rgba(0, 0, 0, 0.3)` (Dark tint).
    *   **Blur:** `backdrop-filter: blur(12px);` (Heavy frost effect).
    *   **Border:** `1px solid rgba(255, 255, 255, 0.1)` (Subtle white rim) or colored borders for active states.
    *   **Shape:** `border-radius: 16px;` (Modern rounded corners).
    *   **Shadow:** `0 4px 30px rgba(0, 0, 0, 0.1)` (Soft drop shadow).

**3. The "Neon" Accents (Status & Interactive)**
*   **Visual Target:** glowing borders and text to indicate status without the "retro pixel" look.
*   **CSS Description:**
    *   **Primary Brand:** **Hot Magenta** (`#FF00FF`) for primary actions/buttons.
    *   **Secondary Brand:** **Electric Cyan** (`#00FFFF`) for secondary info/borders.
    *   **Active Player Glow:** A strong **Neon Green** (`#00E676`) border (`2px solid`) with a matching outer glow (`box-shadow: 0 0 15px #00E676`) around the active player's card.
    *   **Inactive Player:** Dimmed opacity (`0.7`) with a neutral or cyan border.

**4. Typography**
*   **Visual Target:** Clean, readable, app-like sans-serif.
*   **CSS Description:**
    *   **Font Family:** `'Plus Jakarta Sans'` or `'Inter'` (Google Fonts).
    *   **Weights:** **800** (ExtraBold) for headers/cash amounts, **500** (Medium) for labels.
    *   **Colors:** Pure White (`#FFFFFF`) for primary text, Light Grey (`#E0E0E0`) for labels.

---

### PHASE 2: THE MASTER PLAN (Iterative Roadmap)

#### Task 1: The Foundation (Global Variables & Reset)
**Objective:** Wipe the retro styles and define the "Glass" design tokens.
*   **Directives:**
    1.  **Import Fonts:** Add `'Plus Jakarta Sans'` from Google Fonts.
    2.  **Define CSS Variables (`:root`):**
        *   Colors: `--bg-deep`, `--glass-surface`, `--glass-border`, `--neon-pink`, `--neon-cyan`, `--neon-green`.
        *   Spacing: `--space-xs` (4px) to `--space-xl` (32px).
        *   Radius: `--radius-lg` (16px), `--radius-xl` (24px).
    3.  **Global Reset:** Apply `box-sizing: border-box`, remove default margins. Set `body` background to the deep violet gradient.
    4.  **Typography Reset:** Apply the new font family globally. Remove `text-shadow` artifacts.

#### Task 2: Layout & Shell (Mobile-First Structure) [COMPLETED]
**Objective:** Construct the "App Shell" - Header, Scrollable Content, Bottom Nav.
*   **Directives:**
    1.  [x] **Container:** Create a central `.app-shell` max-width container (e.g., 480px for mobile focus, centered on desktop) with `height: 100vh` and `overflow: hidden`.
    2.  [x] **Top Bar (Header):** Fixed height, glass background. Contains the "Week/Turn" counter and "Location" label.
    3.  [x] **Main Content (`main`):** `flex: 1`, `overflow-y: auto`. This is where the Player Cards and Action Grids will live.
    4.  [x] **Bottom Nav (Actions):** Fixed at bottom. Glass background. Replace the current wrapped button list with a structured **Icon Bar** (e.g., Travel, Work, Shop, Bank).

#### Task 3: The Component Library (Cards & Buttons) [COMPLETED]
**Objective:** Style the specific UI elements using the Glass/Neon tokens.
*   **Directives:**
    1.  [x] **Player Cards:** Style `#player-1` and `#player-2` as **Glass Cards**.
        *   Layout: Flex row or grid.
        *   Active State: Apply the **Neon Green** border/glow when class `.active` is present.
    2.  [x] **Stats Grid:** Inside cards, align icons (💰, 🏦, 😊) with values using Flexbox. Use large font for values, small for labels.
    3.  [x] **Bento Grid (Actions):** Convert the `.action-buttons` container into a CSS Grid (2 columns).
    4.  [x] **Buttons:**
        *   [x] `.btn-primary`: Linear Gradient (Magenta to Purple), White Text, Shadow.
        *   [x] `.btn-secondary`: Transparent background, Cyan Border, Cyan Text (Glass button).

#### Task 4: Interactive Overlays (Modals & Polish)
**Objective:** Replace standard browser interactions with immersive overlays.
*   **Directives:**
    1.  **Modal Backdrop:** `rgba(0, 0, 0, 0.8)` + `backdrop-filter: blur(5px)`.
    2.  **Modal Content:** Centered Glass Card, sliding in from bottom (mobile) or center (desktop).
    3.  **Input Fields:** Transparent background, bottom border only (`2px solid rgba(255,255,255,0.3)`), white text.
    4.  **Clock Visualization:** Ensure the SVG clock fits the new modern theme (adjust stroke colors to match variables).
