# Fast Food Modal Upgrade Activity

## Current Status
- Initialized plan to keep the Fast Food modal open for multiple purchases.
- Modified `src/ui/UIManager.ts` to keep the choice modal open after purchasing an item at "Fast Food". It now refreshes the dashboard via `showLocationDashboard('Fast Food')` after a short delay, allowing for multiple consecutive purchases.

