# Jones in the Fast Lane (MVP) - TODO Checklist

This checklist breaks down the development of the "Jones in the Fast Lane" MVP into small, manageable tasks. Follow the phases in order to ensure a stable, incremental build process.

---

### **Phase 0: Project Setup**

-   [x] Initialize a new project directory (`git init`).
-   [x] Initialize Node.js project (`npm init -y`).
-   [x] Install a testing framework (e.g., Jest: `npm install --save-dev jest`).
-   [x] Configure Jest (create `jest.config.js` or add to `package.json`).
-   [x] Create project file structure:
    -   `index.html`
    -   `js/`
        -   `app.js` (main entry point)
        -   `ui.js` (UI rendering and event handling)
        -   `game/`
            -   `Player.js`
            -   `GameState.js`
            -   `GameController.js`
            -   `AIController.js`
            -   `gameData.js`
    -   `tests/`
        -   `Player.test.js`
        -   `GameState.test.js`
        -   `GameController.test.js`
        -   `AIController.test.js`

---

### **Phase 1: Core Game State & Turn Mechanics**

#### **1.1: Player State (`Player.js`)**

-   [x] **Implementation:**
    -   [x] Create the `Player` class in `js/game/Player.js`.
    -   [x] Implement the constructor to initialize all default player properties (`cash`, `savings`, `happiness`, etc.).
    -   [x] Implement `addCash(amount)`.
    -   [x] Implement `spendCash(amount)` with failure condition.
    -   [x] Implement `updateHappiness(points)` with min/max caps (0/100).
    -   [x] Implement `advanceEducation()`.
    -   [x] Implement `advanceCareer()`.
    -   [x] Implement `updateTime(hours)`.
    -   [x] Implement `setLocation(newLocation)`.
    -   [x] Implement `giveCar()`. 
    -   [x] Implement `takeLoan(amount)`.
    -   [x] Implement `repayLoan(amount)` with failure condition.
    -   [x] Implement `deposit(amount)` with failure condition.
    -   [x] Implement `withdraw(amount)` with failure condition.
-   [x] **Testing (`tests/Player.test.js`):**
    -   [x] Write a test to verify the constructor sets all default values correctly.
    -   [x] Test `spendCash` for both successful and failed (insufficient funds) transactions.
    -   [x] Test `updateHappiness` to ensure it does not go above 100 or below 0.
    -   [x] Test `deposit` and `withdraw` methods for success and failure cases.
    -   [x] Write tests for all other state-modifying methods to ensure they work as expected.

#### **1.2: Game State Manager (`GameState.js`)**

-   [x] **Implementation:**
    -   [x] Create the `GameState` class in `js/game/GameState.js`.
    -   [x] Implement the constructor to initialize `players` array, `currentPlayerIndex`, and `turn`.
    -   [x] Implement the `getCurrentPlayer()` getter method.
    -   [x] Implement the initial `endTurn()` method:
        -   [x] It should deduct the `DAILY_EXPENSE`.
        -   [x] It should reset the current player's time to 24.
        -   [x] It should advance `currentPlayerIndex` and the `turn` counter correctly.
-   [x] **Testing (`tests/GameState.test.js`):**
    -   [x] Test the constructor for both 1-player and 2-player modes.
    -   [x] Test that `getCurrentPlayer()` returns the correct player object.
    -   [x] Test `endTurn()` to verify expense deduction, time reset, and correct turn advancement for a 2-player game.
    -   [x] Test that the `turn` counter increments only after all players have completed their turn.

---

### **Phase 2: Locations & Core Player Actions**

#### **2.1: Data Structures and Travel**

-   [x] **Implementation:**
    -   [x] Create `js/game/gameData.js`.
    -   [x] Define and export `LOCATIONS` array.
    -   [x] Define and export `JOBS` array of objects.
    -   [x] Define and export `COURSES` array of objects.
    -   [x] Define and export `SHOPPING_ITEMS` array of objects.
    -   [x] In `GameState.js`, implement the `travelTo(destination)` method.
    -   [x] Add logic to calculate travel time based on `hasCar` property.
    -   [x] Add checks for sufficient time to travel.
-   [x] **Testing (`tests/GameState.test.js`):**
    -   [x] Add new tests for `travelTo`.
    -   [x] Test standard travel time deduction (2 hours).
    -   [x] Test travel time deduction with a car (1 hour).
    -   [x] Test that travel is blocked if time is insufficient.
    -   [x] Test that an error is thrown for invalid destinations.

#### **2.2: Working at the Employment Agency**

-   [x] **Implementation (`GameState.js`):**
    -   [x] Implement the `workShift()` method.
    -   [x] Add a check to ensure the player is at the "Employment Agency".
    -   [x] Implement logic to find the best available job based on the player's `educationLevel`.
    -   [x] Add a check for sufficient time to work the shift.
    -   [x] Implement logic to add earnings, deduct time, and update `careerLevel` upon success.
-   [x] **Testing (`tests/GameState.test.js`):**
    -   [x] Add tests for `workShift`.
    -   [x] Test location requirement.
    -   [x] Test that a player with no education gets the level 1 job.
    -   [x] Test that a player with sufficient education can access higher-level jobs.
    -   [x] Test that time, cash, and career level are updated correctly after a shift.
    -   [x] Test failure case when player lacks time for a shift.

#### **2.3: Studying at the Community College**

-   [x] **Implementation (`GameState.js`):**
    -   [x] Implement the `takeCourse(courseId)` method.
    -   [x] Add a check to ensure the player is at the "Community College".
    -   [x] Add logic to prevent taking a course out of order or one that is already completed.
    -   [x] Add checks for sufficient cash and time.
    -   [x] Implement logic to deduct cost/time and update `educationLevel`.
-   [x] **Testing (`tests/GameState.test.js`):**
    -   [x] Add tests for `takeCourse`.
    -   [x] Test location requirement.
    -   [x] Test failure cases for insufficient time or money.
    -   [x] Test that courses must be taken in sequential order.
    -   [x] Test that a completed course cannot be taken again.
    -   [x] Test that player stats are updated correctly upon completion.

#### **2.4: Buying Happiness at the Shopping Mall**

-   [x] **Implementation (`GameState.js`):**
    -   [x] Implement the `buyItem(itemName)` method.
    -   [x] Add a check to ensure the player is at the "Shopping Mall".
    -   [x] Add a check for sufficient cash.
    -   [x] Implement logic to deduct cost and add happiness.
-   [x] **Testing (`tests/GameState.test.js`):**
    -   [x] Add tests for `buyItem`.
    -   [x] Test location requirement.
    -   [x] Test failure case for insufficient cash.
    -   [x] Test that cash is deducted and happiness is increased correctly.
    -   [x] Verify that happiness is correctly capped at 100 using the `Player` class method.

---

### **Phase 3: Advanced Mechanics & Game Loop**

#### **3.1: Bank Actions & Car Purchase**

-   [x] **Implementation (`GameState.js`):**
    -   [x] Implement `deposit(amount)` with location check.
    -   [x] Implement `withdraw(amount)` with location check.
    -   [x] Implement `takeLoan(amount)` with location check and $2,500 total loan cap.
    -   [x] Implement `repayLoan(amount)` with location check and sufficient cash check.
    -   [x] Implement `buyCar()` with location check, cost check, and `hasCar` check.
-   [x] **Testing (`tests/GameState.test.js`):**
    -   [x] Test all bank actions require the player to be at the "Bank".
    -   [x] Test loan cap logic.
    -   [x] Test `buyCar` success and failure conditions.

#### **3.2: Interest Calculation**

-   [x] **Implementation (`GameState.js`):**
    -   [x] Refactor the `endTurn()` method.
    -   [x] Add logic to calculate and add 1% interest on savings to the player ending their turn.
    -   [x] Add logic to calculate and add 5% interest on loan balance to the player ending their turn.
-   [x] **Testing (`tests/GameState.test.js`):**
    -   [x] Update `endTurn` tests.
    -   [x] Create a player with both savings and a loan.
    -   [x] Test that `endTurn` correctly applies interest to both balances.
    -   [x] Test that a player with zero savings/loan is unaffected.

#### **3.3: Win Condition and Game Loop**

-   [x] **Implementation (`GameState.js`):**
    -   [x] Implement the `checkWinCondition(player)` method with all four required metrics.
-   [x] **Implementation (`GameController.js`):**
    -   [x] Create the `GameController` class in `js/game/GameController.js`.
    -   [x] Implement constructor to hold a `GameState` instance.
    -   [x] Implement `handleAction(actionType, params)` to route calls to the `GameState`.
    -   [x] After each successful action, call `checkWinCondition`.
    -   [x] Add `gameOver` and `winner` properties to the controller.
-   [x] **Testing:**
    -   [x] In `GameState.test.js`, add comprehensive tests for `checkWinCondition`.
    -   [x] Create `tests/GameController.test.js`.
    -   [x] Test that `handleAction` correctly calls methods on `GameState`.
    -   [x] Test that a winning move correctly sets the `gameOver` flag in the controller.
    -   [x] Write an *initial* integration test that simulates a multi-step turn (e.g., `travel` then `work`) to confirm the controller correctly wires actions together.

#### **3.4: Automated End-to-End Scenario Test (CRITICAL STEP)**

-   [ ] **Testing (`tests/Scenario.test.js`):**
    -   [ ] Create a new test file: `tests/Scenario.test.js`.
    -   [ ] Implement the "First Promotion" scenario test case.
    -   [ ] This test should use **only** the `GameController.handleAction()` method to simulate a multi-turn game sequence involving:
        -   [ ] Player 1 taking a loan.
        -   [ ] Player 1 taking a course.
        -   [ ] Player 1 ending their turn.
        -   [ ] Player 2 ending their turn.
        -   [ ] Player 1 working their new, higher-level job.
    -   [ ] **Ensure this entire scenario test passes before proceeding to the UI.** This validates that the complete backend game engine is integrated and working correctly.

---

### **Phase 4: User Interface**

#### **4.0: Project Structure & Module Setup**

-   [ ] **HTML (`index.html`):**
    -   [ ] Ensure the main script tag is set to `type="module"`: `<script type="module" src="js/app.js"></script>`.
-   [ ] **JavaScript (All `.js` files):**
    -   [ ] Go through all game logic files (`Player.js`, `GameState.js`, `GameController.js`, etc.).
    -   [ ] Add `export default class ...` or `export const ...` to each file.
    -   [ ] Add `import` statements at the top of files where dependencies are needed (e.g., `import Player from './Player.js';`).
-   [ ] **Verification:**
    -   [ ] Open `index.html` in a browser. Verify that the page loads (even if blank) with **zero errors** in the developer console.

-   [ ] **4.1: Basic HTML and UI Rendering**
    -   [ ] **HTML (`index.html`):**
        -   [ ] Create the main container divs and placeholder elements for all stats and controls.
    -   [ ] **JavaScript (`ui.js` & `app.js`):**
        -   [ ] Create the `render(gameState)` function in `ui.js`.
        -   [ ] In `app.js`, instantiate the game and call `render()` once to display the initial state.

-   [ ] **4.2: Wiring UI Controls**
    -   [ ] **JavaScript (`app.js`):**
        -   [ ] Add event listeners to all action buttons.
        -   [ ] Connect button clicks to `gameController.handleAction()`.
        -   [ ] Ensure the UI is re-rendered after every action.
        -   [ ] Implement the game-over UI state (victory message, disabled buttons).

#### **4.1: Basic HTML and UI Rendering**

-   [x] **HTML (`index.html`):**
    -   [x] Create the main container divs (`#player1-status-panel`, `#player2-status-panel`, `#game-controls`, etc.).
    -   [x] Add placeholder elements with IDs for all player stats (`#p1-cash`, `#p1-happiness`, etc.).
    -   [x] Add placeholder buttons for all possible actions.
-   [x] **JavaScript (`ui.js`):**
    -   [x] Create the `render(gameState)` function.
    -   [x] Write DOM manipulation code to update player status panels with data from `gameState`.
    -   [x] Write code to update the Time Tracker and Location display.
    -   [x] Implement logic to visually highlight the current player.
    -   [x] Implement logic to show/hide location-specific action buttons.
-   [x] **Integration (`app.js`):**
    -   [x] Instantiate `GameState` and `GameController`.
    -   [x] Write an `updateUI()` function that calls `render()`.
    -   [x] Call `updateUI()` once to render the initial game state.

#### **4.2: Wiring UI Controls**

-   [x] **JavaScript (`app.js`):**
    -   [x] Add `DOMContentLoaded` event listener.
    -   [x] Get references to all interactive HTML elements (buttons, inputs).
    -   [x] Add `click` event listeners to all action buttons.
    -   [x] Each listener should call `gameController.handleAction()` with the correct parameters.
    -   [x] After every action, call `updateUI()` to refresh the screen.
    -   [x] Add a log entry to the UI after each action.
    -   [x] Add logic to disable controls and show a victory message when `gameController.gameOver` is true.

---

### **Phase 5: AI Opponent**

#### **5.1: AI Decision Making**

-   [x] **Implementation (`AIController.js`):**
    -   [x] Create the `AIController` class.
    -   [x] Implement the `takeTurn(gameState, player)` method.
    -   [x] Implement the priority list as a series of `if/else if` statements.
        -   [x] Priority 1: Pay Loan.
        -   [x] Priority 2: Gain Wealth.
        -   [x] Priority 3: Advance Education.
        -   [x] Priority 4: Boost Happiness.
        -   [x] Priority 5: Increase Efficiency (Buy Car).
        -   [x] Priority 6: Catch-all (Work).
    -   [x] Ensure the method returns a valid action object (e.g., `{ action: 'travel', params: { ... } }`).
-   [x] **Testing (`tests/AIController.test.js`):**
    -   [x] For each priority, create a specific mock player state and verify the `takeTurn` method returns the expected action.

#### **5.2: Integrating the AI into the Game Loop**

-   [x] **Implementation (`app.js` and `GameController.js`):**
    -   [x] Add logic to start the game in "Single Player" mode, marking player 2 as an AI.
    -   [x] In `GameController`, after a human player's turn ends, check if the new current player is an AI.
    -   [x] If the current player is an AI, create a loop that:
        -   [x] Calls the `AIController.takeTurn()`.
        -   [x] Executes the returned action via `handleAction()`.
        -   [x] Calls `updateUI()` to show the AI's move.
        -   [x] Uses a small delay (`setTimeout`) between AI actions for better UX.
    -   [x] The AI's turn loop should continue until it runs out of time or chooses to end its turn.
-   [ ] **Final Playthrough:**
    -   [ ] Play a full game against the AI from start to finish.
    -   [ ] Check for bugs, logical errors in AI decisions, and UI glitches.
    -   [ ] Ensure the win condition is triggered correctly for both the player and the AI.