import GameState from './game/GameState.js';
import GameController from './game/GameController.js';
import GameView from './ui.js';
import InputManager from './InputManager.js';

// The main entry point for the application.
function main() {
  // 1. Initialize the View first so it can listen for events immediately.
  const gameView = new GameView();

  // 2. Initialize the game's state.
  const gameState = new GameState(2, true); // 2 players, P2 is AI

  // 3. Initialize the controller, giving it access to the state.
  const gameController = new GameController(gameState);

  // 4. Initialize the input manager, giving it access to the controller.
  const inputManager = new InputManager(gameController);
  inputManager.initialize();

  // 5. Perform the initial render to show the starting state of the game.
  // This is the ONLY manual call to render.
  gameView.render(gameState);
}

// Start the game when the DOM is ready.
document.addEventListener('DOMContentLoaded', main);