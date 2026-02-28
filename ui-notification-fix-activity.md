# UI Notification Fix Activity Log

- **Status:** Implemented CSS and Logic changes.
- **Changes:**
    - Updated `style.css` to move `.event-notification-strip` to the top (below HUD).
    - Added `pointer-events: none` to the strip and `pointer-events: auto` to its text.
    - Simplified `EventNotificationManager.ts` to always append to `.app-shell` and removed legacy `game-controls` logic.
- **Next Task:** Final verification of clickable buttons while notification is active.
