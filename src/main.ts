import GameState from './game/GameState.js';
import GameController from './game/GameController.js';
import UIManager from './ui/UIManager.js';
import InputManager from './InputManager.js';
import EventNotificationManager from './ui/EventNotificationManager.js';
import EconomySystem from './systems/EconomySystem.js';
import TimeSystem from './systems/TimeSystem.js';
import EventBus, { UI_EVENTS } from './EventBus.js';
import { PersistenceService } from './services/PersistenceService.js';

// The main entry point for the application.
function main() {
  // 1. Try to load existing game state, otherwise instantiate a new one.
  const savedData = PersistenceService.loadGame();
  let gameState: GameState;

  if (savedData) {
    console.log('Loading saved game state...');
    gameState = GameState.fromJSON(savedData);
  } else {
    console.log('Starting new game...');
    gameState = new GameState(2, true); // 2 players, P2 is AI.
  }

  // 2. Instantiate Systems.
  const economySystem = new EconomySystem(gameState);
  const timeSystem = new TimeSystem(gameState);
  
  gameState.setEconomySystem(economySystem);
  gameState.setTimeSystem(timeSystem);

  // 3. Setup System Event Routing (Task 4.3)
  EventBus.subscribe(UI_EVENTS.REST_END_TURN, () => timeSystem.endTurn());
  EventBus.subscribe(UI_EVENTS.ADVANCE_TURN, () => timeSystem.advanceTurn());
  EventBus.subscribe(UI_EVENTS.BANK_DEPOSIT, (amount: number) => economySystem.deposit(amount));
  EventBus.subscribe(UI_EVENTS.BANK_WITHDRAW, (amount: number) => economySystem.withdraw(amount));
  EventBus.subscribe(UI_EVENTS.BANK_LOAN, (amount: number) => economySystem.takeLoan(amount));
  EventBus.subscribe(UI_EVENTS.BANK_REPAY, (amount: number) => economySystem.repayLoan(amount));
  EventBus.subscribe(UI_EVENTS.BUY_ITEM, (itemName: string) => economySystem.buyItem(itemName));
  EventBus.subscribe(UI_EVENTS.BUY_CAR, () => economySystem.buyCar());

  // 4. Instantiate UIManager.
  const uiManager = new UIManager(); // UIManager constructor runs here, subscribes to stateChanged

  // 4.1 Switch to the persisted active screen if available
  if (gameState.activeScreenId) {
    uiManager.switchScreen(gameState.activeScreenId);
  }

  // 4.2 Restore active location dashboard if available
  if (gameState.activeLocationDashboard) {
    setTimeout(() => {
        uiManager.showLocationDashboard(gameState.activeLocationDashboard!);
    }, 100);
  }

  // 5. Instantiate GameController, passing it the gameState, uiManager and system instances.
  const gameController = new GameController(gameState, uiManager, economySystem, timeSystem);

  // 6. Instantiate EventNotificationManager.
  new EventNotificationManager();

  // 7. Instantiate InputManager, passing it the gameController.
  const inputManager = new InputManager(gameController);

  // 8. Call inputManager.initialize().
  inputManager.initialize();

  // --- Auto-Save Setup ---
  EventBus.subscribe('stateChanged', (state: GameState) => {
    PersistenceService.saveGame(state.toJSON());
  });

  // --- FIX: Manually trigger the first render after everything is set up ---
  gameState.publishCurrentState();

  // Resume AI turn if it's an AI's turn and no summary is pending
  const currentPlayer = gameState.getCurrentPlayer();
  if (currentPlayer.isAI && !gameState.pendingTurnSummary && !gameState.gameOver) {
      console.log('Resuming AI turn...');
      EventBus.publish('aiThinkingStart');
      setTimeout(() => {
          gameState.processAITurn();
      }, 1000);
  }
}

// Start the game when the DOM is ready.
document.addEventListener('DOMContentLoaded', main);