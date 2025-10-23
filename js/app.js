import GameState from './game/GameState.js';
import GameController from './game/GameController.js';
import GameView from './ui.js';
import InputManager from './InputManager.js';

// The main entry point for the application.
function main() {
  // GameState can be initialized first
  const gameState = new GameState(2, true); // 2 players, P2 is AI

  // The View needs the Controller to create choice callbacks, but the Controller
  // needs the View to show modals. We solve this by creating them and then linking them.
  let gameController; // Declare upfront

  // 1. Initialize the View, passing a reference to the future controller.
  const gameView = new GameView(gameController);

  // 2. Initialize the controller, giving it access to the state AND the view.
  gameController = new GameController(gameState, gameView);

  // 3. NOW, assign the fully-built controller to the view.
  gameView.gameController = gameController;

  // 4. Initialize the input manager, giving it access to the controller.
  const inputManager = new InputManager(gameController);
  inputManager.initialize();

  // 5. Perform the initial render.

}

// Start the game when the DOM is ready.
document.addEventListener('DOMContentLoaded', main);