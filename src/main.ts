import GameState from './game/GameState.js';
import GameController from './game/GameController.js';
import UIManager from './ui/UIManager.js';
import InputManager from './InputManager.js';
import EventNotificationManager from './ui/EventNotificationManager.js';
import EconomySystem from './systems/EconomySystem.js';
import TimeSystem from './systems/TimeSystem.js';
import EventBus, { UI_EVENTS } from './EventBus.js';
import { PersistenceService } from './services/PersistenceService.js';
import EulaModal from './ui/components/EulaModal.js';
import { EULA_CLAUSES } from './data/eula.js';

/**
 * Unified Initialization Flow
 */
function main() {
  console.group('Game Initialization');

  // PHASE 1: Data Preparation
  const savedData = PersistenceService.loadGame();
  let gameState: GameState;
  const isNewGame = !savedData;

  if (savedData) {
    console.log('PHASE 1: Loading saved game state...');
    gameState = GameState.fromJSON(savedData);
  } else {
    console.log('PHASE 1: Starting new game...');
    gameState = new GameState(2, true); // 2 players, P2 is AI.
  }

  // PHASE 2: System Registration
  console.log('PHASE 2: Registering Systems...');
  const economySystem = new EconomySystem(gameState);
  const timeSystem = new TimeSystem(gameState);
  
  gameState.setEconomySystem(economySystem);
  gameState.setTimeSystem(timeSystem);

  // PHASE 3: Event Routing
  console.log('PHASE 3: Setting up Event Routing...');
  EventBus.subscribe(UI_EVENTS.REST_END_TURN, () => timeSystem.endTurn());
  EventBus.subscribe(UI_EVENTS.ADVANCE_TURN, () => timeSystem.advanceTurn());
  EventBus.subscribe(UI_EVENTS.BANK_DEPOSIT, (amount: number) => economySystem.deposit(amount));
  EventBus.subscribe(UI_EVENTS.BANK_WITHDRAW, (amount: number) => economySystem.withdraw(amount));
  EventBus.subscribe(UI_EVENTS.BANK_LOAN, (amount: number) => economySystem.takeLoan(amount));
  EventBus.subscribe(UI_EVENTS.BANK_REPAY, (amount: number) => economySystem.repayLoan(amount));
  EventBus.subscribe(UI_EVENTS.BUY_ITEM, (itemName: string) => economySystem.buyItem(itemName));
  EventBus.subscribe(UI_EVENTS.BUY_CAR, () => economySystem.buyCar());

  // PHASE 4: Manager & UI Initialization
  console.log('PHASE 4: Initializing Managers & UI...');
  const uiManager = new UIManager();
  const gameController = new GameController(gameState, uiManager, economySystem, timeSystem);
  new EventNotificationManager();
  const inputManager = new InputManager(gameController);
  inputManager.initialize();

  // PHASE 5: Persistence Logic
  console.log('PHASE 5: Setting up Persistence...');
  EventBus.subscribe('stateChanged', (state: GameState) => {
    PersistenceService.saveGame(state.toJSON());
  });

  const activateSimulation = () => {
    // PHASE 6: Activation
    console.log('PHASE 6: Activating Simulation...');
    // This triggers UIManager.rehydrate() via the stateChanged subscription
    gameState.publishCurrentState();

    // Resume AI turn if it was thinking when saved
    if (gameState.isAIThinking && !gameState.gameOver) {
        console.log('Resuming AI thinking...');
        // UIManager.rehydrate already called showLoading() via stateChanged publish
        setTimeout(() => {
            gameState.processAITurn();
        }, 1000);
    } else {
        // Fallback: Resume AI turn if it's an AI's turn and no summary is pending
        const currentPlayer = gameState.getCurrentPlayer();
        if (currentPlayer.isAI && !gameState.pendingTurnSummary && !gameState.gameOver) {
            console.log('Resuming AI turn...');
            EventBus.publish('aiThinkingStart');
            setTimeout(() => {
                gameState.processAITurn();
            }, 1000);
        }
    }
    console.groupEnd();
    console.log('Simulation ready.');
  };

  if (isNewGame) {
    console.log('PHASE 5.5: Intercepting for EULA...');
    const eulaModal = new EulaModal();
    document.body.appendChild(eulaModal.getElement());
    eulaModal.show();

    EventBus.subscribe('eulaAccepted', (data: { selectedClauseIds: string[] }) => {
      console.log('EULA accepted with clauses:', data.selectedClauseIds);
      
      // Task 4: Apply State Mutators
      const player1 = gameState.players[0];
      data.selectedClauseIds.forEach(id => {
        const clause = EULA_CLAUSES.find(c => c.id === id);
        if (clause) {
          clause.apply(player1);
          gameState.addLogMessage(`Clause ${id} activated: ${clause.title}`, 'success');
        }
      });
      
      eulaModal.hide();
      setTimeout(() => {
        eulaModal.getElement().remove();
        activateSimulation();
      }, 500); // Small delay for hide animation
    });
  } else {
    activateSimulation();
  }
}

// Start the game when the DOM is ready.
document.addEventListener('DOMContentLoaded', main);