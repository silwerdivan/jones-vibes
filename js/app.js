import GameController from './game/GameController.js';
import AIController from './game/AIController.js';

import GameView from './ui.js';
import { LOCATIONS, SHOPPING_ITEMS } from './game/gameData.js';
import InputManager from './InputManager.js';

// Initialize GameState and GameController
const aiController = new AIController();
export const gameController = new GameController(2, aiController);

// Initial render of the UI
document.addEventListener('DOMContentLoaded', () => {
    const gameView = new GameView();
    const inputManager = new InputManager(gameController);
    inputManager.initialize();
    gameView.render(gameController.gameState);
});
