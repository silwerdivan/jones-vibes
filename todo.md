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
    -   [x] Implement `repayLoan(amount)`.
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

-   [ ] **Implementation:**
    -   [ ] Create `js/game/gameData.js`.
    -   [ ] Define and export `LOCATIONS` array.
    -   [ ] Define and export `JOBS` array of objects.
    -   [ ] Define and export `COURSES` array of objects.
    -   [ ] Define and export `SHOPPING_ITEMS` array of objects.
    -   [ ] In `GameState.js`, implement the `travelTo(destination)` method.
    -   [ ] Add logic to calculate travel time based on `hasCar` property.
    -   [ ] Add checks for sufficient time to travel.
-   [ ] **Testing (`tests/GameState.test.js`):**
    -   [ ] Add new tests for `travelTo`.
    -   [ ] Test standard travel time deduction (2 hours).
    -   [ ] Test travel time deduction with a car (1 hour).
    -   [ ] Test that travel is blocked if time is insufficient.
    -   [ ] Test that an error is thrown for invalid destinations.

#### **2.2: Working at the Employment Agency**

-   [ ] **Implementation (`GameState.js`):**
    -   [ ] Implement the `workShift()` method.
    -   [ ] Add a check to ensure the player is at the "Employment Agency".
    -   [ ] Implement logic to find the best available job based on the player's `educationLevel`.
    -   [ ] Add a check for sufficient time to work the shift.
    -   [ ] Implement logic to add earnings, deduct time, and update `careerLevel` upon success.
-   [ ] **Testing (`tests/GameState.test.js`):**
    -   [ ] Add tests for `workShift`.
    -   [ ] Test location requirement.
    -   [ ] Test that a player with no education gets the level 1 job.
    -   [ ] Test that a player with sufficient education can access higher-level jobs.
    -   [ ] Test that time, cash, and career level are updated correctly after a shift.
    -   [ ] Test failure case when player lacks time for a shift.

#### **2.3: Studying at the Community College**

-   [ ] **Implementation (`GameState.js`):**
    -   [ ] Implement the `takeCourse(courseId)` method.
    -   [ ] Add a check to ensure the player is at the "Community College".
    -   [ ] Add logic to prevent taking a course out of order or one that is already completed.
    -   [ ] Add checks for sufficient cash and time.
    -   [ ] Implement logic to deduct cost/time and update `educationLevel`.
-   [ ] **Testing (`tests/GameState.test.js`):**
    -   [ ] Add tests for `takeCourse`.
    -   [ ] Test location requirement.
    -   [ ] Test failure cases for insufficient time or money.
    -   [ ] Test that courses must be taken in sequential order.
    -   [ ] Test that a completed course cannot be taken again.
    -   [ ] Test that player stats are updated correctly upon completion.

#### **2.4: Buying Happiness at the Shopping Mall**

-   [ ] **Implementation (`GameState.js`):**
    -   [ ] Implement the `buyItem(itemName)` method.
    -   [ ] Add a check to ensure the player is at the "Shopping Mall".
    -   [ ] Add a check for sufficient cash.
    -   [ ] Implement logic to deduct cost and add happiness.
-   [ ] **Testing (`tests/GameState.test.js`):**
    -   [ ] Add tests for `buyItem`.
    -   [ ] Test location requirement.
    -   [ ] Test failure case for insufficient cash.
    -   [ ] Test that cash is deducted and happiness is increased correctly.

---

### **Phase 3: Advanced Mechanics & Game Loop**

#### **3.1: Bank Actions & Car Purchase**

-   [ ] **Implementation (`GameState.js`):**
    -   [ ] Implement `deposit(amount)` with location check.
    -   [ ] Implement `withdraw(amount)` with location check.
    -   [ ] Implement `takeLoan(amount)` with location check and $2,500 total loan cap.
    -   [ ] Implement `repayLoan(amount)` with location check and sufficient cash check.
    -   [ ] Implement `buyCar()` with location check, cost check, and `hasCar` check.
-   [ ] **Testing (`tests/GameState.test.js`):**
    -   [ ] Test all bank actions require the player to be at the "Bank".
    -   [ ] Test loan cap logic.
    -   [ ] Test `buyCar` success and failure conditions.

#### **3.2: Interest Calculation**

-   [ ] **Implementation (`GameState.js`):**
    -   [ ] Refactor the `endTurn()` method.
    -   [ ] Add logic to calculate and add 1% interest on savings to the player ending their turn.
    -   [ ] Add logic to calculate and add 5% interest on loan balance to the player ending their turn.
-   [ ] **Testing (`tests/GameState.test.js`):**
    -   [ ] Update `endTurn` tests.
    -   [ ] Create a player with both savings and a loan.
    -   [ ] Test that `endTurn` correctly applies interest to both balances.
    -   [ ] Test that a player with zero savings/loan is unaffected.

#### **3.3: Win Condition and Game Loop**

-   [ ] **Implementation (`GameState.js`):**
    -   [ ] Implement the `checkWinCondition(player)` method with all four required metrics.
-   [ ] **Implementation (`GameController.js`):**
    -   [ ] Create the `GameController` class in `js/game/GameController.js`.
    -   [ ] Implement constructor to hold a `GameState` instance.
    -   [ ] Implement `handleAction(actionType, params)` to route calls to the `GameState`.
    -   [ ] After each successful action, call `checkWinCondition`.
    -   [ ] Add `gameOver` and `winner` properties to the controller.
-   [ ] **Testing:**
    -   [ ] In `GameState.test.js`, add comprehensive tests for `checkWinCondition`.
    -   [ ] Create `tests/GameController.test.js`.
    -   [ ] Test that `handleAction` correctly calls methods on `GameState`.
    -   [ ] Test that a winning move correctly sets the `gameOver` flag in the controller.

---

### **Phase 4: User Interface**

#### **4.1: Basic HTML and UI Rendering**

-   [ ] **HTML (`index.html`):**
    -   [ ] Create the main container divs (`#player1-status-panel`, `#player2-status-panel`, `#game-controls`, etc.).
    -   [ ] Add placeholder elements with IDs for all player stats (`#p1-cash`, `#p1-happiness`, etc.).
    -   [ ] Add placeholder buttons for all possible actions.
-   [ ] **JavaScript (`ui.js`):**
    -   [ ] Create the `render(gameState)` function.
    -   [ ] Write DOM manipulation code to update player status panels with data from `gameState`.
    -   [ ] Write code to update the Time Tracker and Location display.
    -   [ ] Implement logic to visually highlight the current player.
    -   [ ] Implement logic to show/hide location-specific action buttons.
-   [ ] **Integration (`app.js`):**
    -   [ ] Instantiate `GameState` and `GameController`.
    -   [ ] Write an `updateUI()` function that calls `render()`.
    -   [ ] Call `updateUI()` once to render the initial game state.

#### **4.2: Wiring UI Controls**

-   [ ] **JavaScript (`app.js`):**
    -   [ ] Add `DOMContentLoaded` event listener.
    -   [ ] Get references to all interactive HTML elements (buttons, inputs).
    -   [ ] Add `click` event listeners to all action buttons.
    -   [ ] Each listener should call `gameController.handleAction()` with the correct parameters.
    -   [ ] After every action, call `updateUI()` to refresh the screen.
    -   [ ] Add a log entry to the UI after each action.
    -   [ ] Add logic to disable controls and show a victory message when `gameController.gameOver` is true.

---

### **Phase 5: AI Opponent**

#### **5.1: AI Decision Making**

-   [ ] **Implementation (`AIController.js`):**
    -   [ ] Create the `AIController` class.
    -   [ ] Implement the `takeTurn(gameState, player)` method.
    -   [ ] Implement the priority list as a series of `if/else if` statements.
        -   [ ] Priority 1: Pay Loan.
        -   [ ] Priority 2: Gain Wealth.
        -   [ ] Priority 3: Advance Education.
        -   [ ] Priority 4: Boost Happiness.
        -   [ ] Priority 5: Increase Efficiency (Buy Car).
        -   [ ] Priority 6: Catch-all (Work).
    -   [ ] Ensure the method returns a valid action object (e.g., `{ action: 'travel', params: { ... } }`).
-   [ ] **Testing (`tests/AIController.test.js`):**
    -   [ ] For each priority, create a specific mock player state and verify the `takeTurn` method returns the expected action.

#### **5.2: Integrating the AI into the Game Loop**

-   [ ] **Implementation (`app.js` and `GameController.js`):**
    -   [ ] Add logic to start the game in "Single Player" mode, marking player 2 as an AI.
    -   [ ] In `GameController`, after a human player's turn ends, check if the new current player is an AI.
    -   [ ] If the current player is an AI, create a loop that:
        -   [ ] Calls the `AIController.takeTurn()`.
        -   [ ] Executes the returned action via `handleAction()`.
        -   [ ] Calls `updateUI()` to show the AI's move.
        -   [ ] Uses a small delay (`setTimeout`) between AI actions for better UX.
    -   [ ] The AI's turn loop should continue until it runs out of time or chooses to end its turn.
-   [ ] **Final Playthrough:**
    -   [ ] Play a full game against the AI from start to finish.
    -   [ ] Check for bugs, logical errors in AI decisions, and UI glitches.
    -   [ ] Ensure the win condition is triggered correctly for both the player and the AI.