// js/app.js

import { GameState } from './game/GameState.js';
import { GameController } from './game/GameController.js';
import { render } from './ui.js';

// Initialize GameState and GameController
const gameState = new GameState();
const gameController = new GameController(gameState);

// Function to update the UI
function updateUI() {
    render(gameController.gameState);
}

// Initial render of the UI
document.addEventListener('DOMContentLoaded', () => {
    updateUI();
});
