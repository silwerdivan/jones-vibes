# UI Notification Fix Activity Log

- **Status:** Researched layout.
- **Findings:**
    - `.event-notification-strip` is at `bottom: 160px`.
    - `location-dashboard` (ChoiceModal) buttons are at the bottom of the screen.
    - `game-controls` ID mentioned in `EventNotificationManager.ts` is not found in the codebase, suggesting it's a legacy reference.
    - Moving the strip to the top (below HUD) or significantly higher from the bottom is recommended.
- **Next Task:** Update `style.css` to move `.event-notification-strip` to a non-blocking position.
