class InputManager {
  constructor(gameController) {
    this.gameController = gameController;
  }

  initialize() {
    const gameContainer = document.querySelector('.game-container');
    if (gameContainer) {
      gameContainer.addEventListener('click', this._handleEvent.bind(this));
    } else {
      console.error('Game container not found. InputManager cannot initialize.');
    }
  }

  _handleEvent(event) {
    const target = event.target;
    const actionElement = target.closest('[data-action]');

    if (actionElement) {
      const action = actionElement.dataset.action;
      this._handleAction(action, event);
    }
  }

  _handleAction(action, event) {
    console.log(`Action: ${action}, Event:`, event);
    // This is where the gameController will be used to perform actions
    // For now, just logging the action.
  }
}

export default InputManager;