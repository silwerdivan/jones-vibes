## Relevant Files

-   `style.css` - Will be modified to add responsive media queries for mobile layouts, sticky action buttons, and full-screen modals.
-   `index.html` - Action buttons will be updated to use `data-action` attributes instead of IDs for the new input system.
-   `js/app.js` - Will be significantly refactored to remove direct event listeners and the `updateUI` callback, and to initialize the new `InputManager` and `GameView`.
-   `js/ui.js` - Will be transformed from a set of procedural functions into a `GameView` class that subscribes to state changes from an `EventBus`.
-   `js/GameController.js` - The dependency on the UI callback (`updateUICallback`) will be removed to decouple it from the view layer.
-   `js/GameState.js` - Will be modified to publish events via the `EventBus` whenever the game's state is changed.
-   `js/InputManager.js` - **New file.** This class will centralize all user input handling (clicks, touches) using an event delegation pattern.
-   `js/EventBus.js` - **New file.** A simple pub/sub module to allow the `GameState` and `GameView` to communicate without being directly linked.

### Notes

-   This refactor moves the application from a tightly coupled architecture to a modern, decoupled one-way data flow: `Input -> Controller -> State -> EventBus -> View`.
-   Pay close attention to the removal of old code in `app.js` and `GameController.js` to ensure the decoupling is complete.

## Tasks

-   [x] 1.0 Implement CSS-First Responsive Layout
    -   [x] 1.1 In `style.css`, add a `@media (max-width: 768px)` query to target mobile and tablet devices.
    -   [x] 1.2 Within the media query, change the `.main-grid`'s `grid-template-columns` to `1fr` and update `grid-template-areas` to stack the panels vertically in a logical order (e.g., player1, player2, info, actions, log).
    -   [x] 1.3 Implement a "sticky footer" for the `.action-buttons` on mobile. Inside the media query, set its `position` to `sticky`, `bottom` to `0`, and give it a background color and `z-index`.
    -   [x] 1.4 Add `padding-bottom` to the `.main-grid` in the mobile view to prevent the new sticky footer from overlapping the event log.
    -   [x] 1.5 Enhance the `#choice-modal` for mobile inside the media query, making it almost full-width (`width: 95vw`), and style its buttons to be full-width and vertically stacked for easier tapping.
    -   [x] 1.6 Increase the `padding` and `font-size` on buttons within the media query to create larger, more accessible touch targets, ensuring a `min-height` of at least `44px`.
-   [x] 2.0 Architect a Decoupled Input System with an InputManager
    -   [x] 2.1 Create a new file at `js/InputManager.js`.
    -   [x] 2.2 In `index.html`, replace the `id` attributes on all action buttons with corresponding `data-action` attributes (e.g., `id="btn-travel"` becomes `data-action="travel"`).
    -   [x] 2.3 In `js/InputManager.js`, create an `InputManager` class that accepts the `gameController` in its constructor.
    -   [x] 2.4 Implement an `initialize()` method in the `InputManager` that attaches a single event listener (`click`) to the `.game-container`. This handler will use event delegation to capture clicks on elements with a `data-action` attribute.
    -   [x] 2.5 In `js/app.js`, remove all existing `addEventListener` calls for the individual game action buttons.
    -   [x] 2.6 In `js/app.js`, import and instantiate the `InputManager`, passing it the `gameController`, and call its `initialize()` method.
-   [x] 3.0 Establish an EventBus for State Management (Observer Pattern)
    -   [x] 3.1 Create a new file at `js/EventBus.js`.
    -   [x] 3.2 Implement and export a simple `EventBus` object in this file containing `subscribe` and `publish` methods, as detailed in the PRD.
-   [x] 4.0 Integrate EventBus into Game Logic
    -   [x] 4.1 In `js/GameState.js`, import the `EventBus`.
    -   [x] 4.2 At the end of every method that modifies game state (e.g., `workShift`, `takeCourse`, `travelTo`, `endTurn`, etc.), add a call to `EventBus.publish('stateChanged', this)`.
    -   [x] 4.3 In `js/GameController.js`, remove the `updateUICallback` parameter from the constructor and delete all lines where it is called.
    -   [x] 4.4 Update the `GameController` instantiation in `js/app.js` to no longer pass the UI update function.
-   [x] 5.0 Refactor the UI to be a Reactive View Layer
    -   [x] 5.1 In `js/ui.js`, refactor the file's structure into a `GameView` class.
    -   [x] 5.2 Move the existing `render` function to be a method of the `GameView` class.
    -   [x] 5.3 In the `GameView` constructor, import the `EventBus` and subscribe to the `'stateChanged'` event. The callback for the subscription should be the `render` method (e.g., `EventBus.subscribe('stateChanged', (gameState) => this.render(gameState))`).
    -   [x] 5.4 In `js/app.js`, remove all direct calls to `updateUI()` or `render()`.
    -   [x] 5.5 In `js/app.js`, instantiate the new `GameView` class.
    -   [x] 5.6 After initializing all components, trigger the first paint by calling `gameView.render(gameController.gameState)` once to display the initial state.