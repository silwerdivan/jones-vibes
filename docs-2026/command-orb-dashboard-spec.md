# Design Spec: The "Command-Orb" Dashboard (Mobile-First)

## 1. Overview
This specification details the transition from the legacy "Mobile Card" layout to a streamlined, app-like "Command-Orb" HUD. This overhaul solves the issue of vertical screen crowding while introducing deep visibility into AI opponent statistics.

**Status:** Ready for Implementation  
**Priority:** High (UX Core)  
**Target Platform:** Vertical Mobile Web

---

## 2. The Core UX Shift
*   **Legacy (To Be Removed):** Bulky `#mobile-stats` cards and desktop-remnant `.player-panel` cards.
*   **New Design:** Interactive "Status Orbs" moved into the fixed HUD.
*   **Result:** The **Bento Grid (Locations)** moves to the top of the content area, making the primary game loop (movement/actions) the immediate focus upon screen load.

---

## 3. Component Specification: The "Status Orbs"

### 3.1 Visual Language
The HUD will house a dual-orb container in the top-left section.

| Feature | Player 1 (User) | Player 2 (AI) |
| :--- | :--- | :--- |
| **Primary Color** | Neon Pink (`--neon-pink`) | Neon Cyan (`--neon-cyan`) |
| **Label** | "P1" or Avatar | "AI" |
| **Glow Effect** | Pink Pulse (when active) | Cyan Pulse (when active) |
| **Ring Metric** | Time Remaining (24h loop) | Time Remaining (24h loop) |

### 3.2 Interaction Logic
*   **The Ring:** A circular SVG stroke that depletes clockwise as "Time" is spent.
*   **Orb Tap (P1):** Triggers the `PlayerStatsModal` for the user.
*   **Orb Tap (AI):** Triggers the `PlayerStatsModal` for the AI (addresses user request).
*   **Turn Transition:** 
    *   The active player's orb scales to `1.15x`.
    *   The active player's orb gains a high-intensity neon glow.
    *   The inactive player's orb fades to `0.4` opacity.

---

## 4. Visual Handoff (Technical Blueprint)

### 4.1 HTML Structure (Header Refactor)
```html
<div class="hud-status-orbs">
    <div id="orb-p1" class="status-orb active">
        <!-- SVG Ring Container -->
        <div id="hud-time-ring-p1" class="time-ring-container"></div>
        <div class="orb-avatar" id="hud-avatar-p1">P1</div>
    </div>
    
    <div id="orb-p2" class="status-orb inactive">
        <div id="hud-time-ring-p2" class="time-ring-container"></div>
        <div class="orb-avatar" id="hud-avatar-p2">AI</div>
    </div>
</div>
```

### 4.2 CSS Specification (Glassmorphism & Neon)
```css
.hud-status-orbs {
    display: flex;
    gap: 12px;
    align-items: center;
}

.status-orb {
    position: relative;
    width: 52px;
    height: 52px;
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.status-orb.inactive {
    opacity: 0.4;
    filter: grayscale(0.5);
    transform: scale(0.9);
}

.status-orb.active {
    opacity: 1;
    filter: grayscale(0);
    transform: scale(1.1);
    box-shadow: 0 0 20px var(--active-neon-glow);
}

.orb-avatar {
    position: absolute;
    inset: 4px; /* Space for the ring */
    background: var(--glass-surface);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 800;
    font-size: 12px;
    z-index: 2;
}
```

---

## 5. Animation & Game Feel (Juice)
1.  **The "Turn Switch" Pulse:** When turn changes, the newly active orb should perform a "heartbeat" pulse (scale `1.1` to `1.2` and back) once.
2.  **Spending Time:** When an action costs time, the SVG ring should animate its `stroke-dashoffset` smoothly over `500ms`.
3.  **Modal "Glass" Slide:** The stats modal must slide from `translateY(100%)` to `0` with a heavy blur backdrop to maintain the Cyberpunk Dashboard aesthetic.

---

## 6. Handoff Tasks for Frontend Engineer
1.  **Cleanup:** Remove `#mobile-stats` and all desktop `.player-panel` blocks from `index.html`.
2.  **Implementation:** Replace the single avatar in `.hud-left` with the `.hud-status-orbs` container.
3.  **Logic Update:** 
    *   Update `ui.js` to handle two instances of `ClockVisualization` in the HUD.
    *   Bind click events to `orb-p1` and `orb-p2` to call `showPlayerStatsModal(index)`.
    *   Update the `render()` loop to toggle the `.active` class on the orbs based on `gameState.currentPlayerIndex`.
4.  **Layout Reset:** Ensure `city-bento-grid` is the first element in the scrollable content area.

---
*Created by Lead UI/UX Designer - Feb 2026*