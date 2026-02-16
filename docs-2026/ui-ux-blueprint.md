This guide provides a blueprint for a modern, mobile-first social simulation game inspired by *Jones in the Fast Lane*. Built with HTML, CSS, and JS, the design moves away from the 1991 "board game" look and toward a sleek, "app-like" interface similar to *BitLife* or *Monopoly GO*, utilizing modern trends like **Bento Grids**, **Glassmorphism**, and **Haptic Feedback Design**.

---

### 1. Visual Style & Design Language
To make the game feel like a premium mobile app rather than a webpage, use these design principles:

*   **Aesthetic:** **"Modern Neumorphism"** or **"Glassmorphism."** Use rounded corners ($16px–24px$), subtle drop shadows for depth, and translucent blurred backgrounds for overlays.
*   **Color Palette:** A vibrant, high-contrast palette. 
    *   *Success Green:* #00E676 (Career/Money)
    *   *Energy Yellow:* #FFD600 (Time/Happiness)
    *   *Calm Blue:* #2979FF (Education/Status)
    *   *Background:* Soft Dark (#121212) or Clean Off-White (#F5F7FA).
*   **Typography:** Use a clean, sans-serif variable font like **Inter** or **Plus Jakarta Sans**. Use bold, large weights for currency and progress.
*   **HTML/CSS Stack:** Use `flexbox` and `grid` for layouts. Leverage `backdrop-filter: blur()` for modern overlays and `CSS Variables` for easy skinning (Dark/Light mode).

---

### 2. Core Navigation Architecture
The app should utilize a **Bottom Navigation Bar** for primary actions, keeping everything within thumb-reach.

*   **Tab 1: City (The Map):** The main gameplay area.
*   **Tab 2: Life (Stats):** Detailed breakdown of education, career, and happiness.
*   **Tab 3: Inventory:** Owned items (fridge, computer, clothes).
*   **Tab 4: Social/Leaderboard:** Multiplayer rankings or Jones's progress.
*   **Tab 5: Menu:** Settings, Save/Load, and **Updates**.

---

### 3. Detailed Screen Breakdown

#### A. The City Map (Main Screen)
Instead of a literal board, use a **Scrollable Grid of Cards** or an **Isometric Map**.
*   **Elements:** 
    *   **Top HUD:** Persistent status bar showing **Cash Balance**, **Week Number**, and a **Time Ring** (a circular progress bar around your avatar that depletes as you act).
    *   **Location Cards:** Bento-style cards for "Socket City," "Monolith Burger," etc. Each card shows the "Travel Time" (e.g., `-10 mins`).
    *   **Quick Action Button:** A "Next Week" floating action button (FAB) in the bottom right, only active when time is low.

#### B. Interaction Pop-ups (The "Shop" Experience)
When you enter a building (e.g., the University), an overlay appears rather than a new page.
*   **Elements:**
    *   **Header:** Character illustration of the clerk with a speech bubble (humorous text).
    *   **Selection List:** Clean rows with icons. 
        *   *Item Name* (Left)
        *   *Cost/Requirement* (Right)
        *   *Buy Button:* Large, tactile button with a "press" animation.
    *   **Requirement Indicators:** If you don't have enough money or education, the "Apply" button is greyed out with a "Locked" icon.

#### C. Character & Goals Screen
A "Dashboard" view of your life.
*   **Elements:**
    *   **Goal Progress:** Four large circular gauges (Wealth, Happiness, Education, Career).
    *   **Status Tags:** Small chips like "Hungry," "Well-Rested," or "Manager Level."
    *   **Apparition/Clothes:** A preview of your avatar showing what they are currently wearing.

#### D. "Oh What a Weekend!" (Turn Transition)
A full-screen modal that appears between weeks.
*   **Design:** A vertical scrolling list of "events" that happened.
    *   *Example:* Card 1: "You went to the theater." ($-150$). Card 2: "Your rent was due." ($-500$).
    *   **Summary:** Net change in cash and happiness.

---

### 4. Functional & Notification Systems

#### A. In-App Update Notifications
*   **The "What's New" Modal:** On first launch after an update, show a glassmorphic modal with bullet points and emojis.
*   **Notification Badge:** A small red dot on the "Menu" tab when a new game version or seasonal event is live.
*   **Live Ticker:** A subtle "News Ticker" at the top of the Map screen for in-game economy changes (e.g., "Egg prices up 20% at Z-Mart!").

#### B. Feedback & State
*   **Toast Notifications:** Small pop-ups at the top for immediate feedback (e.g., "Got the Job!", "Too tired to study!").
*   **Haptic Simulation:** Use CSS `active` states with slight scale-down (`transform: scale(0.98)`) to make buttons feel "clicky."

---

### 5. UI Designer Hand-off Checklist
Provide the designer with these specific requirements for a "fully functional" app:

1.  **Responsive Layouts:** Design for 19.5:9 (iPhone/modern Android) but ensure it works on 16:9.
2.  **State Styles:** Define `Idle`, `Tapped`, `Disabled`, and `Success` states for all buttons.
3.  **Icon Set:** A consistent "thick-line" or "3D-flat" icon set for food, jobs, and degrees.
4.  **Empty States:** What does the Inventory look like when you own nothing? (Include a "Go Shopping" shortcut).
5.  **Micro-animations:** Transitions for the "Time Ring" depleting and the "Money" counter ticking up/down.

### 6. HTML/CSS Implementation Tips
*   **Container:** Use `height: 100vh; overflow: hidden;` to lock the app feel and prevent browser scrolling.
*   **Map Scroll:** Use `display: grid;` for the city layout and `overflow-y: auto;` for the map area.
*   **Safe Areas:** Use CSS `env(safe-area-inset-bottom)` to ensure the bottom nav bar isn't cut off by the phone's "home bar."