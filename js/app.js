import GameState from './game/GameState.js';
import GameController from './game/GameController.js';
import GameView from './ui.js';
import InputManager from './InputManager.js';
import EventNotificationManager from './ui/EventNotificationManager.js';

// The main entry point for the application.
function main() {
  // 1. Instantiate GameState.
  const gameState = new GameState(2, true); // 2 players, P2 is AI.

  // 2. Instantiate GameView.
  const gameView = new GameView(); // GameView constructor runs here, subscribes to stateChanged

  // 3. Instantiate GameController, passing it the gameState and gameView instances.
  const gameController = new GameController(gameState, gameView);

  // Expose gameController globally for EventNotificationManager
  window.gameController = gameController;

  // 4. Instantiate EventNotificationManager.
  const eventNotificationManager = new EventNotificationManager();

  // 5. Instantiate InputManager, passing it the gameController.
  const inputManager = new InputManager(gameController);

  // 6. Call inputManager.initialize().
  inputManager.initialize();

  // --- FIX: Manually trigger the first render after everything is set up ---
  gameState.publishCurrentState();
}

// Start the game when the DOM is ready.
document.addEventListener('DOMContentLoaded', main);