class InputManager {
  /**
   * @param {GameController} gameController An instance of the GameController.
   */
  constructor(gameController) {
    this.gameController = gameController;
  }

  initialize() {
    const gameContainer = document.querySelector('.game-container');
    const eventType = 'ontouchstart' in window ? 'touchstart' : 'click';

    // Use a single listener on the parent container for efficiency.
    gameContainer.addEventListener(eventType, (event) => {
      // Find the closest parent element (or the element itself) with a data-action attribute.
      const target = event.target.closest('[data-action]');
      
      if (!target) {
        return; // Exit if the click was not on an actionable element.
      }

      const action = target.dataset.action;

      // Check if a method with this name exists on the controller.
      if (typeof this.gameController[action] === 'function') {
        // Call the corresponding method on the game controller.
        this.gameController[action]();
      } else {
        console.warn(`Action "${action}" is not defined on GameController.`);
      }
    });
  }
}

export default InputManager;
