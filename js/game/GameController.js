import { LOCATIONS, COURSES, SHOPPING_ITEMS } from './gameData.js'; // We need game data now

class GameController {
  // We need a reference to the view to show modals
  constructor(gameState, gameView) {
    this.gameState = gameState;
    this.gameView = gameView; // Store the view reference
  }

  restEndTurn() {
    this.gameState.endTurn();
  }

  workShift() {
    this.gameState.workShift();
  }

  buyCar() {
    this.gameState.buyCar();
  }

  travel() {
    const currentPlayer = this.gameState.getCurrentPlayer();
    const availableDestinations = LOCATIONS.filter(loc => loc !== currentPlayer.location);
    
    this.gameView.showChoiceModal({
      title: 'Where to travel?',
      choices: availableDestinations.map(dest => ({
        text: dest,
        value: dest,
        action: (destination) => this.gameState.travel(destination)
      }))
    });
  }
  
  deposit() {
    this.gameView.showChoiceModal({
      title: 'How much to deposit?',
      showInput: true,
      choices: [{
        text: 'Confirm Deposit',
        value: null,
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

  takeLoan() {
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

  repayLoan() {
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

  buyItem() {
    const currentPlayer = this.gameState.getCurrentPlayer();
    this.gameView.showChoiceModal({
        title: 'What to buy?',
        choices: SHOPPING_ITEMS.map(item => ({
            text: `${item.name} ($${item.cost})`,
            value: item.name,
            action: (itemName) => this.gameState.buyItem(itemName)
        }))
    });
  }

  takeCourse() {
    const nextCourse = this.gameState.getNextAvailableCourse();
    if (!nextCourse) {
      this.gameState.addLogMessage("No more courses available.", 'warning');
      return;
    }
    
    this.gameView.showChoiceModal({
      title: 'Take a Course?',
      choices: [{
        text: `${nextCourse.name} ($${nextCourse.cost})`,
        value: nextCourse.id,
        action: (courseId) => this.gameState.takeCourse(courseId)
      }]
    });
  }
}

export default GameController;