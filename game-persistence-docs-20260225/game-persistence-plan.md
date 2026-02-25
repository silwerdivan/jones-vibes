# Game Persistence Plan - 2026-02-25

## Goal
Implement a mechanism to save and load game state using `localStorage` to ensure the game is continuable across browser refreshes, especially on mobile devices. Provide a "Restart Game" option in the System Menu.

## Tasks
- [x] Implement serialization in `Player.ts` (toJSON/fromJSON)
- [ ] Implement serialization in `GameState.ts` (serialize/deserialize)
- [ ] Create `PersistenceService.ts` in `src/services/`
- [ ] Integrate auto-save into `GameState` or `main.ts` via `EventBus`
- [ ] Update `main.ts` to load existing save data on startup
- [ ] Replace `PlaceholderScreen` for "Menu" with a functional `SystemScreen`
- [ ] Add "Restart Game" functionality with confirmation modal in `SystemScreen`

## Strategy

### 1. Data Serialization Strategy
- **Player Serialization:** Enhance the `Player` class with a `toJSON()` method that outputs the `PlayerState` interface and a `static fromJSON(data)` method.
- **GameState Serialization:** Add a `serialize()` method to `GameState` that captures players, current turn, log history, and current player index.
- **Re-linking Systems:** Ensure `EconomySystem` and `TimeSystem` are re-injected after loading.

### 2. Persistence Service
- **Save:** Store JSON string in `localStorage` under `jones_fastlane_save`.
- **Load:** Retrieve and parse; return `null` if empty.
- **Clear:** Remove `localStorage` entry.

### 3. Auto-Save Integration
- Subscribe `PersistenceService` to `stateChanged` events for immediate background saves.

### 4. Smart Bootstrapping (`main.ts`)
- Check for existing save data before initializing a new game.
- If found, reconstruct `GameState` from JSON.

### 5. Functional System Menu
- Create `src/ui/components/screens/SystemScreen.ts`.
- Add "New Game" button with a confirmation modal.
- "New Game" clears persistence and reloads the application.

## Verification
- [ ] Verify state is preserved after browser refresh.
- [ ] Verify Intel Terminal (log) is preserved.
- [ ] Verify "New Game" resets all progress and clears storage.
