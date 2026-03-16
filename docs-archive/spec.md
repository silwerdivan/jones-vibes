# Detailed Specification: Jones in the Fast Lane (MVP)

## I. Core Game Structure

*   **Platform:** Browser-based Game.
*   **Player Modes:** Local **'Hotseat' Multiplayer** (2-player) and **Single-Player vs. AI**.
*   **Game Objective:** First player to **simultaneously** achieve all four metrics wins.

| Metric | Target Value | Notes |
| :--- | :--- | :--- |
| **Wealth** | **\$10,000** | Must be **cash on hand**. Savings do not count toward this goal. |
| **Happiness** | **80 points** | Out of a maximum score of 100. |
| **Education** | **"Completed Community College"** | Achieved by completing the 3 courses. |
| **Career** | **"Junior Manager" (Level 4)** | Highest job level in the MVP. |

## II. Time & Economy Mechanics

| Mechanic | Detail |
| :--- | :--- |
| **Time Unit** | **Hours** |
| **Turn Time** | Player starts each turn with **24 Hours**. |
| **Max Time Bank** | **48 Hours** (Can carry over 24 unused Hours). |
| **Daily Expense** | **\$50** per turn/day. |
| **Resting** | Ends turn, adds 24 hours to any remaining time (up to the 48-hour maximum), and **deducts the Daily Expense**. If a player cannot pay, an Overdue Bills amount is tracked. |

## III. Map & Locations

The game board features 6 interactive locations:

| Location | Core Action / Function |
| :--- | :--- |
| **Home** | Start/End turn, replenish Time, pay Daily Expense. |
| **Employment Agency** | Look for and work jobs (Gain Wealth/Career). |
| **Community College** | Enroll in and attend courses (Gain Education). |
| **Shopping Mall** | Purchase consumables (Gain Happiness). |
| **Used Car Lot** | Purchase the **Used Sedan** for efficiency. |
| **Bank** | Deposit/Withdraw, Take Out/Pay Back Loans (Manage Wealth). |

## IV. Progression Mechanics Detail

### 1. Career (Employment Agency)

*   Working requires a single trip to the location and consumes the full Standard Shift Length.

| Career Level | Job Title | Hourly Wage | Standard Shift (Hours) | Requirements |
| :---: | :---: | :---: | :---: | :---: |
| **1** | Dishwasher | \$8 / hour | 6 Hours | None |
| **2** | Retail Clerk | \$12 / hour | 7 Hours | 1 Completed Course (Any) |
| **3** | Office Assistant | \$16 / hour | 8 Hours | 2 Completed Courses (Any) |
| **4** | **Junior Manager** | \$20 / hour | 8 Hours | **Completed Community College** |

### 2. Education (Community College)

*   Courses are **one-time** purchases and time commitments.

| Course Name | Cost (\$) | Time to Complete (Hours) | Milestone Gained |
| :---: | :---: | :---: | :---: |
| Intro to Business | \$500 | 10 | Completed 1st Course (Milestone 1) |
| Marketing Fundamentals | \$750 | 15 | Completed 2nd Course (Milestone 2) |
| **Financial Accounting** | \$1,000 | 20 | **Completed Community College** (Milestone 3) |
| Business Law | \$1,250 | 25 | Completed 4th Course (Milestone 4) |
| Advanced Management | \$1,500 | 30 | Completed 5th Course (Milestone 5) |

### 3. Happiness (Shopping Mall)

*   Items are **consumable** (one-time use) and provide an immediate, permanent boost to Happiness score.

| Category | Item Name | Cost (\$) | Happiness Boost (Points) |
| :---: | :---: | :---: | :---: |
| Entertainment | New Video Game | \$150 | +15 Points |
| Luxury | Designer Watch | \$400 | +30 Points |
| Personal Care | Spa Day Voucher | \$600 | +40 Points |

### 4. Travel & Efficiency (Used Car Lot)

| Travel Method | Time Cost Per Trip (Between Locations) | Purchase Cost |
| :--- | :--- | :--- |
| **On Foot** | **2 Hours** | N/A |
| **Used Sedan** | **1 Hour** | **\$3,000** (One-time purchase) |

### 5. Finance (Bank)

*   **Bank Actions:** Deposit Cash, Withdraw Cash, Take Out Loan, Pay Back Loan.
*   **Maximum Loan:** **\$2,500**.
*   **Interest:** Applied at the start of every turn/day (Compounded Daily/Per Turn).
    *   Savings: **+1%** on total savings.
    *   Loan: **+5%** on outstanding balance.

## V. AI Opponent (Single Player Mode)

*   **Personality:** "The Balanced Climber" - follows a simple, fixed, balanced priority list.

| Priority | Action | Condition to Act |
| :---: | :--- | :--- |
| **1 (Highest)** | **Pay Bills/Loan** | If Overdue Bills exist or Loan is at max amount. |
| **2** | **Gain Wealth** | If cash on hand is **below \$1,000**. |
| **3** | **Advance Education** | If enough cash/time and next required course is not complete. |
| **4** | **Boost Happiness** | If Happiness is **below 50**. |
| **5** | **Increase Efficiency** | Buy **Used Sedan** if cash is **>\$3,500** and car is not owned. |
| **6 (Lowest)** | **Work** | If none of the above are met, work the highest-level job available. |

## VI. User Interface (UI) Requirements

Three essential, persistent UI components must be visible at all times:

### 1. The Player Status Panel (Persistent)
*   **Displays:** Current Player Indicator, **Cash on Hand**, **Total Savings**, **Happiness Score** (X/100), **Education Milestone**, and **Current Job Title/Level**.

### 2. The Time & Movement Tracker (Persistent)
*   **Displays:** **Hours Remaining** (X Hours Left), **Car Status** (Owned/Not Owned), **Current Location**, and a clear, always-visible **End Turn/Rest Button**.

### 3. The Opponent Status Panel (Persistent)
*   **Displays:** Opponent's Name (Player 2 or AI), and a set of four simple **Progress Indicators** (bars/icons) showing their progress towards the four Wealth, Happiness, Education, and Career goals. *(Note: Specific cash/score numbers are hidden, only progress is shown.)*

## VII. Visual Specification

### 1. Creative Direction & Vibe

*   **Theme:** 80s Synthwave Grid
*   **Mood Board Keywords:** Neon Grid, Retro-Futurism, Outrun, Chrome, Palm Trees at Sunset.

### 2. Color Palette

The following colors will be defined as CSS custom properties for easy use throughout the application.

```css
:root {
  --primary-color: #FF00FF; /* Hot Pink */
  --secondary-color: #00FFFF; /* Cyan */
  --accent-color: #F7B801; /* Gold/Yellow */
  --background-dark: #1A1A2E; /* Deep Indigo */
  --background-light: #2A2A4E; /* Lighter Indigo */
  --text-light: #E0E0E0; /* Off-White */
  --text-dark: #1A1A2E; /* Deep Indigo */
  --border-color: #00FFFF; /* Cyan */
  --success-color: #00FF7F; /* Spring Green */
  --error-color: #FF4136; /* Red */
  --warning-color: #FFD700; /* Gold */
  --info-color: #00BFFF; /* Deep Sky Blue */
}
```

### 3. Typography

*   **Font Family:**
    *   **Headings:** `'Press Start 2P', cursive;` (A retro, pixelated font for a distinct arcade feel).
    *   **Body & UI:** `'Roboto Mono', monospace;` (A clean, readable monospaced font that complements the retro-tech aesthetic).
*   **Headings (h1, h2, h3):**
    *   `h1`: `2.5rem`, `font-weight: 400`, `text-transform: uppercase`, `letter-spacing: 2px`, `color: var(--primary-color)`.
    *   `h2`: `1.8rem`, `font-weight: 400`, `text-transform: uppercase`, `color: var(--secondary-color)`.
    *   `h3`: `1.2rem`, `font-weight: 400`, `text-transform: uppercase`, `color: var(--text-light)`.
*   **Body Text:** `1rem`, `font-weight: 400`, `line-height: 1.6`, `color: var(--text-light)`.
*   **UI Elements (Buttons, Labels):** `1rem`, `font-weight: 700`, `text-transform: uppercase`.

### 4. Layout & Spacing

*   **Spacing Unit:** The base unit is `8px`. All margins and paddings will be multiples of this unit (e.g., `8px`, `16px`, `24px`).
*   **Grid System:** The main UI will be organized into a flexible 3-column layout for the primary status panels, allowing for easy adaptation to different screen sizes.
*   **Container Widths:**
    *   `game-container`: `max-width: 1200px`, `margin: 0 auto`, `padding: 16px`.

### 5. Component Styles

#### `game-container`
*   **Structure:** A `<div>` with the ID `game-container`. This will be the main wrapper for the entire game interface.
*   **Style:** `background-color: var(--background-dark)`; `border: 2px solid var(--border-color)`; `box-shadow: 0 0 15px var(--border-color)`. A subtle, repeating synthwave grid background image should be applied.

#### `player-status-panel`
*   **Corresponds to:** "The Player Status Panel"
*   **Structure:** A `<div>` with ID `player-status-panel`. It contains a `<h3>` for the current player's name (e.g., "Player 1") and a `<ul>` of stats. Each `<li>` contains a `<span>` for the label (e.g., "Cash:") and a `<span>` for the value.
*   **Style:** `background-color: var(--background-light)`; `border: 1px solid var(--secondary-color)`; `padding: 16px`.

#### `opponent-status-panel`
*   **Corresponds to:** "The Opponent Status Panel"
*   **Structure:** A `<div>` with ID `opponent-status-panel`. Contains a `<h3>` for the opponent's name and four progress bars, one for each of the four winning metrics. Each progress bar is a `<div>` with a nested `<div>` to indicate progress percentage.
*   **Style:** Same as `player-status-panel`. The progress bar fill should use `var(--primary-color)`.

#### `time-movement-tracker`
*   **Corresponds to:** "The Time & Movement Tracker"
*   **Structure:** A `<div>` with ID `time-movement-tracker`. It will contain labeled values for "Hours Remaining," "Car Status," and "Current Location." It must also contain a prominent `<button>` with the ID `end-turn-btn`.
*   **Style:** `background-color: var(--background-light)`; `border: 1px solid var(--secondary-color)`; `padding: 16px`; `text-align: center`.
*   **Button Style:** The `end-turn-btn` should be styled to stand out, using `background-color: var(--accent-color)` and `color: var(--text-dark)`. On hover, it should have a subtle glow effect.

#### `event-log`
*   **Structure:** A `<div>` with ID `event-log`. It contains a `<h3>` title ("Event Log") and a `<ul>` where new game events are added as `<li>` elements. The list should be ordered with the most recent event at the top.
*   **Style:** `background-color: var(--background-light)`; `border: 1px solid var(--secondary-color)`; `padding: 16px`; `min-height: 150px`; `overflow-y: auto`.

### 6. Iconography

Simple, pixel-art or neon-style icons should be used to represent key stats, enhancing visual recognition.

*   **Wealth:** A pixel-art dollar sign ($).
*   **Happiness:** A retro smiley face icon `:)`.
*   **Education:** A graduation cap icon.
*   **Career:** A briefcase icon.
*   **Time:** An hourglass or digital clock icon.
*   **Car:** An 8-bit style car icon.
