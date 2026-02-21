import { LOCATIONS, LocationName } from '../data/locations.js';
import { SHOPPING_ITEMS } from '../data/items.js';
import GameState from './GameState.js';
import UIManager from '../ui/UIManager.js';

class GameController {
  public gameState: GameState;
  public uiManager: UIManager;

  // We need a reference to the view to show modals
  constructor(gameState: GameState, uiManager: UIManager) {
    this.gameState = gameState;
    this.uiManager = uiManager; // Store the view reference
  }

  restEndTurn() {
    this.gameState.endTurn();
  }

  advanceTurn() {
    this.gameState.advanceTurn();
  }

  workShift() {
    this.gameState.workShift();
  }

  buyCar() {
    this.uiManager.showChoiceModal({
      title: 'Buy a Car?',
      choices: [{
        text: 'Buy Hovercar ($3,000)',
        value: null,
        action: () => this.gameState.buyCar()
      }]
    });
  }

  travel(destination?: string) {
    if (destination) {
      this.gameState.travel(destination as LocationName);
      return;
    }
    const currentPlayer = this.gameState.getCurrentPlayer();
    const availableDestinations = LOCATIONS.filter(loc => loc !== currentPlayer.location);
    
    this.uiManager.showChoiceModal({
      title: 'Where to travel?',
      choices: availableDestinations.map(dest => ({
        text: dest,
        value: dest,
        action: (dest: string) => this.gameState.travel(dest as LocationName)
      }))
    });
  }
  
  deposit() {
    this.uiManager.showChoiceModal({
      title: 'How much to deposit?',
      showInput: true,
      choices: [{
        text: 'Confirm Deposit',
        value: null,
        action: (_: any, amount: number | null) => {
          if (amount && amount > 0) {
            this.gameState.deposit(amount);
          }
        }
      }]
    });
  }

  withdraw() {
    this.uiManager.showChoiceModal({
      title: 'How much to withdraw?',
      showInput: true,
      choices: [{
        text: 'Confirm Withdraw',
        value: null,
        action: (_: any, amount: number | null) => {
          if (amount && amount > 0) {
            this.gameState.withdraw(amount);
          }
        }
      }]
    });
  }

  takeLoan() {
    this.uiManager.showChoiceModal({
      title: 'How much for loan?',
      showInput: true,
      choices: [{
        text: 'Confirm Loan',
        value: null,
        action: (_: any, amount: number | null) => {
          if (amount && amount > 0) {
            this.gameState.takeLoan(amount);
          }
        }
      }]
    });
  }

  repayLoan() {
    this.uiManager.showChoiceModal({
      title: 'How much to repay?',
      showInput: true,
      choices: [{
        text: 'Confirm Repayment',
        value: null,
        action: (_: any, amount: number | null) => {
          if (amount && amount > 0) {
            this.gameState.repayLoan(amount);
          }
        }
      }]
    });
  }

  buyItem() {
    this.uiManager.showChoiceModal({
        title: 'What to buy?',
        choices: SHOPPING_ITEMS.map(item => ({
            text: `${item.name} ($${item.cost})`,
            value: item.name,
            action: (itemName: string) => this.gameState.buyItem(itemName)
        }))
    });
  }

  takeCourse() {
    const nextCourse = this.gameState.getNextAvailableCourse();
    if (!nextCourse) {
      this.gameState.addLogMessage("No more courses available.", 'warning');
      return;
    }
    
    this.uiManager.showChoiceModal({
      title: 'Take a Course?',
      choices: [{
        text: `${nextCourse.name} ($${nextCourse.cost})`,
        value: nextCourse.id,
        action: (courseId: string) => this.gameState.takeCourse(parseInt(courseId, 10))
      }]
    });
  }

  applyForJob(jobLevel?: number) {
    if (jobLevel !== undefined) {
      // Called from modal with specific job level
      const success = this.gameState.applyForJob(jobLevel);
      // The GameState.applyForJob method already handles logging and event publishing
      return success;
    } else {
      // Called from button click - show modal
      this.uiManager.showJobApplicationModal();
      return false;
    }
  }
}

export default GameController;