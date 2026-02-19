# Design Specification: The Fast Food Fix
**Status:** Ready for Engineering Implementation
**Goal:** Resolve the "Food Invisibility" UX issue by introducing a dedicated "Fast Food" node.

## 1. Data Structure Updates (`js/game/gameData.js`)
*   **New Location:** Add `"Fast Food"` to `LOCATIONS`.
*   **New Clerk:** 
    *   Key: `"Fast Food"`
    *   Name: `"Chip"`
    *   Message: `"Welcome to Monolith Burger! Big bites for big dreams. What can I get you?"`
    *   Icon: `"clerk"` (Use existing clerk icon for now).
*   **New Items:** Add to `SHOPPING_ITEMS`:
    *   `{ name: 'Monolith Burger', cost: 10, happinessBoost: 5, type: 'essential', hungerReduction: 40 }`
    *   `{ name: 'Synth-Salad', cost: 12, happinessBoost: 8, type: 'essential', hungerReduction: 30 }`

## 2. Logic Implementation (`js/game/GameState.js`)
*   **Item Handling:** Update `buyItem(itemName)` to check for a `hungerReduction` property on the item.
*   **Code Change (Conceptual):**
    ```javascript
    if (item.hungerReduction) {
        currentPlayer.hunger = Math.max(0, currentPlayer.hunger - item.hungerReduction);
    }
    ```
*   **Cleanup:** Remove the hardcoded `item.name === 'Coffee'` hunger logic in favor of the new property-based system.

## 3. Visual Specifications (`style.css` / `js/ui.js`)
*   **Bento Grid Icon:**
    *   Location: "Fast Food"
    *   Icon: Material Icon `restaurant` or `lunch_dining`.
    *   Color Theme: **Neon Orange** (`#FF9100`).
*   **Action Tray:**
    *   When at "Fast Food", the primary action button should be `"Browse Menu"`.
    *   Trigger `showChoiceModal` with the items available at the Fast Food location.

---
**Lead Designer Note:** This change aligns the game with the player's mental model and provides a clear survival destination.
