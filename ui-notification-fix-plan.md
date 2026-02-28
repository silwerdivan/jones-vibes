# UI Notification Fix Plan

## Problem
The `event-notification-strip` (popups appearing after actions) is positioned at `bottom: 160px`, which places it directly over the interactive action buttons in the `game-controls` area. Since the strip captures click events and has a high z-index, it prevents users from performing consecutive actions quickly.

## Tasks
- [x] Research the exact height and position of `game-controls` to find a safe "non-blocking" zone.
- [x] Update `style.css` to move `.event-notification-strip` to a non-blocking position (e.g., top of the screen or just above the HUD).
- [x] Modify `EventNotificationManager.ts` if necessary to change how the strip is inserted into the DOM.
- [x] Add `pointer-events: none` to the strip container and `pointer-events: auto` to the text/button inside it (if we want to allow clicks through the transparent parts).
- [ ] Verify fix by ensuring action buttons are clickable even while a notification is visible.
