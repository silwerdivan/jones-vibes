import GameState from './game/GameState.js';
import GameController from './game/GameController.js';
import UIManager from './ui/UIManager.js';
import InputManager from './InputManager.js';
import EventNotificationManager from './ui/EventNotificationManager.js';

// The main entry point for the application.
function main() {
  // 1. Instantiate GameState.
  const gameState = new GameState(2, true); // 2 players, P2 is AI.

  // 2. Instantiate UIManager.
  const uiManager = new UIManager(); // UIManager constructor runs here, subscribes to stateChanged

  // 3. Instantiate GameController, passing it the gameState and uiManager instances.
  const gameController = new GameController(gameState, uiManager);

  // 4. Instantiate EventNotificationManager.
  new EventNotificationManager();

  // 5. Instantiate InputManager, passing it the gameController.
  const inputManager = new InputManager(gameController);

  // 6. Call inputManager.initialize().
  inputManager.initialize();

  // --- FIX: Manually trigger the first render after everything is set up ---
  gameState.publishCurrentState();
}

// Start the game when the DOM is ready.
document.addEventListener('DOMContentLoaded', main);