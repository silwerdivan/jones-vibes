class GameController {
  constructor(gameState) {
    this.gameState = gameState;
  }

  'rest-end-turn'() {
    this.gameState.endTurn();
  }

  travel() {
    // This will likely need a parameter, which the input manager doesn't currently support.
    // For now, we'll have to hardcode or prompt.
    // Let's assume for now the GameState will handle the destination.
    this.gameState.travel();
  }

  'work-shift'() {
    this.gameState.workShift();
  }

  'take-course'() {
    // This will also need a parameter for which course to take.
    this.gameState.takeCourse();
  }

  'buy-item'() {
    // This will also need a parameter for which item to buy.
    this.gameState.buyItem();
  }

  deposit() {
    // This will also need a parameter for the amount.
    this.gameState.deposit();
  }

  withdraw() {
    // This will also need a parameter for the amount.
    this.gameState.withdraw();
  }

  'take-loan'() {
    // This will also need a parameter for the amount.
    this.gameState.takeLoan();
  }

  'repay-loan'() {
    // This will also need a parameter for the amount.
    this.gameState.repayLoan();
  }

  'buy-car'() {
    this.gameState.buyCar();
  }
}

export default GameController;