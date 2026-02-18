# Design Spec: Intel Terminal & HUD Integration
**Author:** Lead UI/UX Designer  
**Status:** Pending Implementation  
**Target:** Mobile-First Cyberpunk Dashboard

## 1. Problem Statement
The current Game Log is a persistent card on the `screen-city` view. 
- **UX Issue:** As the log grows, it pushes core action buttons off-screen, requiring excessive scrolling.
- **Aesthetic Issue:** A static list of text clashes with the "High-Tech Dashboard" aesthetic of the Bento Grid.

## 2. The Solution: "The Intel Feed"
Move the log into a dedicated, high-immersion **Intel Terminal** (Modal/Drawer) and provide immediate feedback via **Ephemeral Toasts**.

### A. HUD Integration (The Trigger)
- **Element:** Add a Terminal Button to the HUD (Top Right).
- **Icon:** `material-icons: terminal`.
- **Badge:** A neon-red (`--neon-red`) pulsing notification badge showing the count of unread events.
- **Logic:** Clicking the icon opens the Full-Screen Terminal Overlay and resets the badge.

### B. The Intel Terminal Overlay
- **Structure:** A glassmorphism overlay (`#intel-terminal-overlay`) with a slide-up animation.
- **Visual Style:**
    - **Background:** `rgba(13, 0, 21, 0.95)` with `backdrop-filter: blur(20px)`.
    - **Typography:** Use `var(--font-family-mono)` (VT323) for all entries.
    - **Scanlines:** A CSS overlay with a repeating linear gradient to simulate a CRT monitor.
    - **Categorization:**
        - `log-success`: Neon Green (`#00E676`)
        - `log-error`: Neon Red (`#FF5252`)
        - `log-warning`: Neon Yellow (`#FFD600`)
        - `log-info`: Neon Cyan (`#00FFFF`)

### C. Ephemeral Toasts (Immediate Feedback)
- **System:** Utilize `EventNotificationManager.js`.
- **Behavior:** 
    - When an event occurs (e.g., "Paid $50 for Rent"), a toast slides in from the bottom of the screen (above the Tab Bar).
    - **Duration:** 3.5 seconds.
    - **Interaction:** Swiping the toast away clears it; tapping it opens the full Intel Terminal.

## 3. Implementation Tasks for Frontend Engineer

### HTML Updates (`index.html`)
1. Remove `<div class="event-log card glass">` from the `screen-city`.
2. Update the `.hud-right` container to include the `#hud-terminal-trigger`.
3. Ensure `#game-log-modal-overlay` is styled according to the "Terminal" visual specs.

### CSS Updates (`style.css`)
1. Create `.terminal-text` class using `font-family: 'VT323'`.
2. Add the `.scanline` animation to the log modal.
3. Style the `.terminal-badge` with a `ping` animation (standard CSS keyframes).

### JS Updates (`js/ui.js` & `js/ui/EventNotificationManager.js`)
1. **EventBus:** Listen for `gameEvent` to trigger the Toast.
2. **State:** Track an `unreadEvents` counter in `GameView`.
3. **Modal:** Ensure `showGameLogModal()` renders the full history in chronological order (newest at bottom, auto-scroll to end).

## 4. Expected UX Outcome
The main City view remains clean and focused on the Bento Grid. The user is alerted to changes via discreet toasts, and can "deep dive" into the full event history only when desired, maintaining the "Cyberpunk Operator" immersion.
