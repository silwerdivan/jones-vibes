# Plan: Fast Food UI Cleanup

## Objective
Remove the redundant "Browse Menu" button from the Fast Food location dashboard.

## Context
When a player arrives at the Fast Food location, the location dashboard is automatically displayed. This dashboard already contains the menu items available for purchase. The "Browse Menu" button currently present in the dashboard's action list simply re-triggers the same dashboard view, making it unnecessary and potentially confusing.

## Proposed Changes
### UI Layer
1.  [x] **`src/ui/UIManager.ts`**:
    *   Locate the `getLocationActions` method.
    *   Remove the action for `Fast Food` that adds the "Browse Menu" button.
    *   Similarly, evaluate if "Browse Items" at `Shopping Mall` is also redundant and remove it if so (to maintain consistency across similar interfaces).

## Verification Plan
### Manual Verification
1.  Navigate to the **Fast Food** location in the game.
2.  Confirm the menu items are visible.
3.  Confirm there is no "Browse Menu" button at the bottom of the modal.
4.  Repeat for the **Shopping Mall** and the "Browse Items" button.

### Automated Tests
1.  Verify that `UIManager.getLocationActions('Fast Food')` returns an empty array (or at least doesn't contain the "Browse Menu" action).
2.  Verify that items are still rendered when the dashboard is shown.
