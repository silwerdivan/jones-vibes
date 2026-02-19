# Design Spec: Location Dashboard Overhaul

## Status: Draft
**Date:** 2026-02-19  
**Role:** Lead UI/UX Designer  
**Target:** Frontend Engineer  

---

## 1. Problem Statement
The current "Contextual Action Tray" (floating bottom bar) feels disconnected from the game world. Traveling to a location doesn't feel immersive because the player remains on the city map with a small overlay. The dual-system of "Tray" vs "Modal" is confusing and redundant.

## 2. The Solution: The Location Dashboard
We are moving to a **Location-Centric UI**. When a player visits a location, they enter a dedicated "Dashboard" for that place.

### Key Principles:
- **Auto-Arrival:** Traveling to a location immediately triggers the Dashboard.
- **Unified Interface:** All actions (Primary lists like Jobs and Secondary actions like Work) live in one place.
- **Visual Depth:** Use Neumorphic cards on a frosted glass backdrop to create a "tactile dashboard" feel.
- **Direct Action:** Locations with only one action (e.g., The Park) show a simplified confirmation view immediately.

---

## 3. UI Structure (HTML/CSS)

### The Container (`#location-dashboard`)
- **Position:** Fixed, centered. Covers 95% of the screen (mobile-first).
- **Background:** `rgba(13, 0, 21, 0.85)` with `backdrop-filter: blur(20px)`.
- **Border:** 1px solid `var(--neon-cyan)` with a subtle outer glow.
- **Animation:** `slide-up` from the bottom on entry.

### Header (Clerk & Context)
- Displays the **Clerk Avatar**, **Name**, and **Greeting**.
- The location name is prominent.
- If no clerk exists (e.g., The Park), show a large location icon instead.

### Content Zone (The "Main Action")
- **List View:** Scrollable area for Jobs, Courses, or Shop Items.
- **Card Style:** Neumorphic "depressed" state for locked items, "elevated" state for available items.
- **Micro-interactions:** Hover/Touch-down should provide immediate visual feedback (glow increase).

### Action Footer (The "Quick Actions")
- A row of high-priority buttons at the bottom.
- **Primary Action:** (e.g., "Work Shift" or "Confirm") - High contrast gradient.
- **Leave Button:** (e.g., "Exit Location") - Outlined/Secondary style, but always present.

---

## 4. User Flow

1.  **Player clicks "Employment Agency" card in City Grid.**
2.  **System:** Travel logic executes → `locationChanged` event fired.
3.  **UI:** `Location Dashboard` opens automatically.
4.  **Dashboard View:** 
    - Center: Scrollable list of 5 Job openings.
    - Bottom: "Work Shift" (Primary if employed here) | "Leave Agency" (Secondary).
5.  **Player clicks "Leave":** Dashboard closes, revealing City Map again.

---

## 5. Design Tokens (The Neumorphic Language)

To achieve the "Cyberpunk Dashboard" look, we will use a "Soft-Light" Neumorphic approach. This requires specific variables for depth and elevation.

```css
:root {
    /* Neumorphic Elevation Levels */
    --nm-flat: 6px 6px 12px rgba(0, 0, 0, 0.4), 
               -6px -6px 12px rgba(255, 255, 255, 0.05);
               
    --nm-pressed: inset 4px 4px 8px rgba(0, 0, 0, 0.5), 
                  inset -4px -4px 8px rgba(255, 255, 255, 0.02);
                  
    --nm-glow-cyan: 0 0 15px rgba(0, 255, 255, 0.3);
    --nm-glow-pink: 0 0 15px rgba(255, 0, 255, 0.3);

    /* Animation Constants */
    --ease-out-expo: cubic-bezier(0.19, 1, 0.22, 1);
    --transition-speed: 0.3s;
}
```

## 6. Interaction Logic & "Juice"

### Arrival Transition:
- **Trigger:** `travel()` complete.
- **Action:** Dashboard slides from `translateY(100%)` to `0` over `0.5s` using `--ease-out-expo`.
- **Feedback:** A low-frequency "thud" sound and a brief `backdrop-filter` blur intensity pulse.

### Button Interaction:
- **Normal:** `--nm-flat`.
- **Active (Pressed):** `--nm-pressed` + `scale(0.98)`.
- **Validation:** On successful action (e.g., buying an item), the button should flash its accent color (Cyan/Green).

---

## 7. Structural Reference (HTML for Engineer)

The `#choice-modal-overlay` will be repurposed as the `#location-dashboard-overlay`.

```html
<div id="choice-modal-overlay" class="hidden location-dashboard-overlay">
    <div id="choice-modal" class="location-dashboard">
        <!-- Swipe Indicator for Mobile -->
        <div class="swipe-indicator"><div class="swipe-bar"></div></div>
        
        <header class="dashboard-header">
            <div id="modal-clerk-container" class="clerk-container hidden">
                <div class="clerk-avatar-wrapper">
                    <div id="modal-clerk-avatar" class="clerk-avatar"></div>
                </div>
                <div class="speech-bubble">
                    <div id="modal-clerk-name" class="clerk-name">Clerk</div>
                    <p id="modal-clerk-message" class="clerk-message">Welcome!</p>
                </div>
            </div>
            <h2 id="choice-modal-title" class="dashboard-title">Location Name</h2>
        </header>

        <main class="dashboard-content">
            <div id="choice-modal-content" class="dashboard-scroll-area">
                <!-- Action Cards go here -->
            </div>
            
            <!-- Contextual Input (e.g., Bank amount) -->
            <div id="choice-modal-input" class="hidden bank-input-wrapper">
                <label for="modal-input-amount">CREDITS</label>
                <input type="number" id="modal-input-amount" placeholder="0">
            </div>
        </main>

        <footer class="dashboard-footer">
            <div id="choice-modal-buttons" class="primary-actions-row">
                <!-- Primary Action Buttons -->
            </div>
            
            <div id="dashboard-secondary-actions" class="secondary-actions-row">
                <!-- Contextual secondary actions (e.g. Work Shift) -->
            </div>

            <button id="modal-cancel-button" class="btn btn-leave">
                <i class="material-icons">logout</i>
                <span>Leave Location</span>
            </button>
        </footer>
    </div>
</div>
```

---

## 8. Visual Blueprint (CSS for Engineer)

```css
/* Container & Depth */
.location-dashboard {
    background: var(--bg-deep);
    border: 1px solid var(--glass-border);
    border-top: 2px solid var(--neon-cyan);
    box-shadow: var(--nm-flat), 0 0 30px rgba(0, 255, 255, 0.1);
    display: flex;
    flex-direction: column;
    max-height: 90vh;
    padding: var(--space-lg);
    border-radius: var(--radius-xl) var(--radius-xl) 0 0;
}

/* Card Depth (Lists) */
.action-card {
    background: var(--bg-deep);
    box-shadow: var(--nm-flat);
    margin-bottom: var(--space-md);
    border: 1px solid transparent;
    transition: all var(--transition-speed) var(--ease-out-expo);
}

.action-card:hover {
    box-shadow: var(--nm-flat), var(--nm-glow-cyan);
    transform: translateY(-2px);
}

.action-card.locked {
    box-shadow: var(--nm-pressed);
    opacity: 0.6;
}

/* Footer & Buttons */
.dashboard-footer {
    border-top: 1px solid var(--glass-border);
    padding-top: var(--space-md);
    margin-top: auto;
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
}

.btn-leave {
    background: transparent;
    border: 1px solid var(--neon-red);
    color: var(--neon-red);
    width: 100%;
    margin-top: var(--space-md);
    opacity: 0.8;
}

.btn-leave:active {
    box-shadow: var(--nm-pressed);
}
```
