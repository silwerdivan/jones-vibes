import { LOCATIONS, COURSES, SHOPPING_ITEMS } from './gameData.js'; // We need game data now

class GameController {
  // We need a reference to the view to show modals
  constructor(gameState, gameView) {
    this.gameState = gameState;
    this.gameView = gameView; // Store the view reference
  }

  'rest-end-turn'() {
    this.gameState.endTurn();
  }

  'work-shift'() {
    this.gameState.workShift();
  }

  'buy-car'() {
    this.gameState.buyCar();
  }

  // --- REFACTORED: Now opens a modal ---
  travel() {
    const currentPlayer = this.gameState.getCurrentPlayer();
    const availableDestinations = LOCATIONS.filter(loc => loc !== currentPlayer.location);
    
    this.gameView.showChoiceModal({
      title: 'Where to travel?',
      choices: availableDestinations.map(dest => ({
        text: dest,
        value: dest,
        // The action is a function that calls the GameState
        action: (destination) => this.gameState.travel(destination)
      }))
    });
  }
  
  // --- REFACTORED: Now opens a modal with an input ---
  deposit() {
    this.gameView.showChoiceModal({
      title: 'How much to deposit?',
      showInput: true,
      choices: [{
        text: 'Confirm Deposit',
        value: null,
        // The action now uses the amount from the input field
        action: (_, amount) => {
          if (amount && amount > 0) {
            this.gameState.deposit(amount);
          }
        }
      }]
    });
  }

  withdraw() {
    this.gameView.showChoiceModal({
      title: 'How much to withdraw?',
      showInput: true,
      choices: [{
        text: 'Confirm Withdraw',
        value: null,
        action: (_, amount) => {
          if (amount && amount > 0) {
            this.gameState.withdraw(amount);
          }
        }
      }]
    });
  }

  'take-loan'() {
    this.gameView.showChoiceModal({
      title: 'How much for loan?',
      showInput: true,
      choices: [{
        text: 'Confirm Loan',
        value: null,
        action: (_, amount) => {
          if (amount && amount > 0) {
            this.gameState.takeLoan(amount);
          }
        }
      }]
    });
  }

  'repay-loan'() {
    this.gameView.showChoiceModal({
      title: 'How much to repay?',
      showInput: true,
      choices: [{
        text: 'Confirm Repayment',
        value: null,
        action: (_, amount) => {
          if (amount && amount > 0) {
            this.gameState.repayLoan(amount);
          }
        }
      }]
    });
  }

  'buy-item'() {
    const currentPlayer = this.gameState.getCurrentPlayer();
    // For now, let's assume we can only buy items at the shopping mall
    // and the list of items is available.
    // A more robust implementation would check location and available items.
    this.gameView.showChoiceModal({
        title: 'What to buy?',
        choices: SHOPPING_ITEMS.map(item => ({
            text: `${item.name} ($${item.cost})`,
            value: item.name,
            action: (itemName) => this.gameState.buyItem(itemName)
        }))
    });
  }

  // --- REFACTORED: Example for taking a course ---
  'take-course'() {
    const nextCourse = this.gameState.getNextAvailableCourse();
    if (!nextCourse) {
      this.gameState.addLogMessage("No more courses available.");
      return;
    }
    
    this.gameView.showChoiceModal({
      title: 'Take a Course?',
      choices: [{
        text: `${nextCourse.name} ($${nextCourse.cost})`,
        value: nextCourse.id,
        action: (courseId) => this.gameState.takeCourse(courseId) // Assuming takeCourse is updated to take an ID
      }]
    });
  }
}

export default GameController;
