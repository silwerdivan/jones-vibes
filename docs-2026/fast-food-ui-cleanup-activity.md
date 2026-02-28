# Activity: Fast Food UI Cleanup

## Summary
Execution of the plan to remove redundant "Browse Menu" and "Browse Items" buttons from location dashboards.

## Status
- [x] Research and confirm redundancy of "Browse Menu" at Fast Food.
- [x] Research and confirm redundancy of "Browse Items" at Shopping Mall.
- [x] Implement changes in `src/ui/UIManager.ts`.
- [x] Verify changes in-game and via unit tests.

## Change Log
### 2026-02-28
- Researched `UIManager.ts` and confirmed that `showLocationDashboard` is called automatically upon arrival at any location via `handleAutoArrival()`.
- Confirmed that `showLocationDashboard` for "Shopping Mall" and "Fast Food" already renders the action cards (items).
- Removed redundant "Browse Items" and "Browse Menu" buttons from `getLocationActions` in `src/ui/UIManager.ts`.
- Added unit tests in `tests/ui/UIManager.test.ts` to verify that these actions are no longer returned.
- Verified that all 242 tests pass.
