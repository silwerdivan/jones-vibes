import GameController from './game/GameController.js';

class InputManager {
  private gameController: GameController;

  /**
   * @param {GameController} gameController An instance of the GameController.
   */
  constructor(gameController: GameController) {
    this.gameController = gameController;
  }

  initialize() {
    const appShell = document.querySelector('.app-shell');
    if (!appShell) return;

    const eventType = 'ontouchstart' in window ? 'touchstart' : 'click';

    // Use a single listener on the parent container for efficiency.
    appShell.addEventListener(eventType, (event) => {
      // Find the closest parent element (or the element itself) with a data-action attribute.
      const target = (event.target as HTMLElement).closest('[data-action]') as HTMLElement;
      
      if (!target) {
        return; // Exit if the click was not on an actionable element.
      }

      const action = target.dataset.action;
      if (!action) return;

      // Check if a method with this name exists on the controller.
      if (typeof (this.gameController as any)[action] === 'function') {
        // Call the corresponding method on the game controller.
        (this.gameController as any)[action]();
      } else {
        console.warn(`Action "${action}" is not defined on GameController.`);
      }
    });
  }
}

export default InputManager;
