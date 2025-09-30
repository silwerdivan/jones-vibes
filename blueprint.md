Here is a detailed, step-by-step blueprint for building the "Jones in the Fast Lane" MVP, broken down into a series of prompts for a code-generation LLM.

### **Project Blueprint & Phased Rollout**

The development is structured in five distinct phases, moving from the core data models to the final user-facing features. Each phase consists of small, incremental steps designed for test-driven development (TDD).

*   **Phase 1: Core Game State & Turn Mechanics.** The foundation of the game. We will define what a player is and how the game state is managed, including the fundamental turn cycle.
*   **Phase 2: Locations & Core Player Actions.** This phase brings the game world to life. We'll implement the primary locations and the actions players can take to change their stats—working, studying, and shopping.
*   **Phase 3: Advanced Mechanics & Game Loop.** Here we introduce more complex systems: banking, loans, interest, and efficiency upgrades. We will also implement the main game loop and the all-important win condition.
*   **Phase 4: User Interface.** With a fully functional game engine, we will build a simple browser-based UI to display game data and allow players to interact with the system. The focus is on clear separation between the game logic and the presentation layer.
*   **Phase 5: AI Opponent.** The final phase involves creating a simple but effective AI opponent that follows a predefined set of priorities, allowing for a single-player experience.

---

### **Phase 1: Core Game State & Turn Mechanics**

This phase lays the essential groundwork for the entire game. We'll start with the data structures that define the player and the overall game state, and then implement the basic turn-based time flow.

#### **Prompt 1.1: Player State**

```text
Goal: Create a `Player` class in JavaScript to manage an individual player's state.

Specifications:
1.  Use ES6 classes.
2.  The constructor should initialize a player with the following default values:
    -   `cash`: 0
    -   `savings`: 0
    -   `happiness`: 50 (starts at a neutral value out of 100)
    -   `educationLevel`: 0 (Represents no education)
    -   `careerLevel`: 0 (Represents unemployed)
    -   `time`: 24 (Initial hours for the first turn)
    -   `location`: "Home"
    -   `hasCar`: false
    -   `loan`: 0
3.  Include methods to modify these properties:
    -   `addCash(amount)`: Increases cash.
    -   `spendCash(amount)`: Decreases cash. Returns `false` if the player cannot afford the expense, `true` otherwise.
    -   `updateHappiness(points)`: Adds or subtracts points from happiness. Should cap happiness at 100 and floor at 0.
    -   `advanceEducation()`: Increments `educationLevel`.
    -   `advanceCareer()`: Increments `careerLevel`.
    -   `updateTime(hours)`: Subtracts hours from time.
    -   `setLocation(newLocation)`: Sets the player's location.
    -   `giveCar()`: Sets `hasCar` to true.
    -   `takeLoan(amount)`: Increases loan amount.
    -   `repayLoan(amount)`: Decreases loan amount.
    -   `deposit(amount)`: Moves cash to savings. Returns `false` if not enough cash.
    -   `withdraw(amount)`: Moves savings to cash. Returns `false` if not enough savings.

Testing:
-   Write a comprehensive test suite using a framework like Jest.
-   Verify that the constructor sets default values correctly.
-   Test each method to ensure it modifies the player's state as expected.
-   Include edge cases:
    -   `spendCash` when the player has insufficient funds.
    -   `updateHappiness` to ensure it doesn't go above 100 or below 0.
    -   `deposit` and `withdraw` with insufficient funds.
```

#### **Prompt 1.2: Game State Manager**

```text
Goal: Create a `GameState` class to manage the overall game, including players and turn progression.

Pre-requisite: You will use the `Player` class from the previous step.

Specifications:
1.  Use an ES6 class.
2.  The constructor should accept a number of players (1 or 2).
3.  It should initialize:
    -   `players`: An array containing instances of the `Player` class.
    -   `currentPlayerIndex`: 0.
    -   `turn`: 1.
    -   A constant `DAILY_EXPENSE` set to 50.
4.  Implement a getter method `getCurrentPlayer()` that returns the player object for the current turn.
5.  Implement a method `endTurn()` which will:
    -   Get the current player.
    -   Deduct the `DAILY_EXPENSE` from the current player's cash.
    -   Reset the player's `time` to 24, but not exceeding the max of 48. (For now, just reset to 24; we'll add banking time later).
    -   Switch to the next player by updating `currentPlayerIndex`. If it's the last player, it should loop back to the first player and increment the `turn` counter.

Testing:
-   Write a new Jest test suite for `GameState`.
-   Test the constructor to ensure it creates the correct number of players.
-   Test `getCurrentPlayer()` to ensure it returns the correct player object.
-   Test the `endTurn()` method thoroughly:
    -   Verify that daily expenses are deducted from the correct player.
    -   Confirm that the player's time is reset to 24.
    -   Ensure `currentPlayerIndex` advances correctly and loops back after the last player.
    -   Check that the `turn` counter increments only after a full cycle of all players.
```

---

### **Phase 2: Locations & Core Player Actions**

Now that we have a state management system, we will define the game world and the primary actions players can take to progress toward the win condition.

#### **Prompt 2.1: Data Structures and Travel**

```text
Goal: Define the game's locations, jobs, courses, and items as data structures, and implement a travel mechanic.

Pre-requisite: You will be adding to the `GameState` class and using the `Player` class.

Specifications:
1.  **Data Definitions (Constants):** Create a new file, `gameData.js`, to store static game data. Export these as constants.
    -   `LOCATIONS`: An array of strings: ["Home", "Employment Agency", "Community College", "Shopping Mall", "Used Car Lot", "Bank"].
    -   `JOBS`: An array of objects, each with `level`, `title`, `wage`, `shiftHours`, and `educationRequired` (e.g., `{ level: 1, title: 'Dishwasher', wage: 8, shiftHours: 6, educationRequired: 0 }`).
    -   `COURSES`: An array of objects, each with `id`, `name`, `cost`, `time`, and `educationMilestone` (e.g., `{ id: 1, name: 'Intro to Business', cost: 500, time: 10, educationMilestone: 1 }`).
    -   `SHOPPING_ITEMS`: An array of objects, each with `name`, `cost`, and `happinessBoost`.
2.  **Travel Mechanic:** Add a method to the `GameState` class called `travelTo(destination)`.
    -   It should accept a destination string.
    -   Check if the destination is a valid location from the `LOCATIONS` constant. If not, throw an error.
    -   Get the current player. If their location is already the destination, do nothing.
    -   Calculate travel time: 2 hours if `hasCar` is false, 1 hour if true.
    -   Check if the player has enough `time` for the trip. If not, return a failure status (e.g., `{ success: false, message: 'Not enough time.' }`).
    -   If successful, deduct the travel time from the player's `time` and update their `location`. Return a success status.

Testing:
-   Write a Jest test suite for the `travelTo` method.
-   Test that a player can travel between two locations, and the correct amount of time is deducted.
-   Test the car functionality: travel time should be 1 hour if the player has a car.
-   Test that a player cannot travel if they lack sufficient time.
-   Test that trying to travel to an invalid location throws an error.
-   Test that traveling to the current location results in no change.
```

#### **Prompt 2.2: Working at the Employment Agency**

```text
Goal: Implement the logic for a player to work at their current job.

Pre-requisite: You will be adding to the `GameState` class and using `gameData.js`.

Specifications:
1.  Add a method to `GameState` called `workShift()`.
2.  This method should:
    -   Get the current player and their location.
    -   Check if the player's location is "Employment Agency". If not, return a failure status.
    -   Find the highest-level job in the `JOBS` data that the player is qualified for based on their `educationLevel`. This is their "best available job". A player's `careerLevel` must be equal to or greater than the job's level to work it. *Correction from spec: Qualification is based on education, not career level.* A player can only work jobs up to their current `careerLevel` + 1, provided they meet the education requirement. Let's simplify for MVP: a player can work any job for which they meet the `educationRequired` level. The player's `careerLevel` will be determined by the highest job they've taken.
    -   Let's refine the logic: Create a helper method `getAvailableJobs(player)` that returns a list of jobs from `JOBS` where `player.educationLevel >= job.educationRequired`.
    -   In `workShift()`, call `getAvailableJobs`. If there are none, return a failure status.
    -   The player will automatically work the best job available to them. Find the highest-level job from the available list. Let's call this `jobToWork`.
    -   Check if the player has enough `time` for the `jobToWork.shiftHours`. If not, return a failure status.
    -   If successful:
        -   Deduct the `shiftHours` from the player's time.
        -   Calculate earnings (`jobToWork.wage` * `jobToWork.shiftHours`).
        -   Add the earnings to the player's cash.
        -   Update the player's `careerLevel` to `jobToWork.level` if it's an advancement.
        -   Return a success status with details of the work done.

Testing:
-   Write Jest tests for `workShift`.
-   Test that the player must be at the "Employment Agency".
-   Test that a player with no education can only work the "Dishwasher" job.
-   Test that after completing a course, a player can access the next level of job.
-   Test that working successfully deducts time, adds cash, and updates the career level.
-   Test that a player cannot work if they lack the required time.
```

#### **Prompt 2.3: Studying at the Community College**

```text
Goal: Implement the logic for a player to enroll in and complete a course.

Pre-requisite: `GameState` class and `gameData.js`.

Specifications:
1.  Add a method to `GameState` called `takeCourse(courseId)`.
2.  This method should:
    -   Get the current player and their location.
    -   Verify the player is at the "Community College".
    -   Find the course in the `COURSES` data by `courseId`.
    -   Check if the player has already achieved this `educationMilestone` (i.e., `player.educationLevel >= course.educationMilestone`). If so, return a failure status (they can't take it again).
    -   Check if the player is trying to take a course out of order (e.g., taking the 3rd course when their `educationLevel` is 0). The `course.educationMilestone` must be `player.educationLevel + 1`.
    -   Check if the player has enough cash for the `course.cost` and enough time for `course.time`.
    -   If all checks pass:
        -   Deduct the `cost` from cash and the `time` from time.
        -   Update the player's `educationLevel` to the `course.educationMilestone`.
        -   Return a success status.

Testing:
-   Write Jest tests for `takeCourse`.
-   Test that the player must be at the "Community College".
-   Test that a player cannot take a course they cannot afford (in time or money).
-   Test that a player cannot take a course they have already completed.
-   Test that a player must take courses in the correct sequential order.
-   Test that successful completion updates cash, time, and education level correctly.
```

#### **Prompt 2.4: Buying Happiness at the Shopping Mall**

```text
Goal: Implement the logic for a player to buy items to increase happiness.

Pre-requisite: `GameState` class and `gameData.js`.

Specifications:
1.  Add a method to `GameState` called `buyItem(itemName)`.
2.  This method should:
    -   Get the current player and their location.
    -   Verify the player is at the "Shopping Mall".
    -   Find the item in `SHOPPING_ITEMS` by its name.
    -   Check if the player has enough cash for the `item.cost`.
    -   If checks pass:
        -   Deduct the `cost` from cash.
        -   Increase the player's happiness by the `happinessBoost`.
        -   Return a success status.

Testing:
-   Write Jest tests for `buyItem`.
-   Test that the player must be at the "Shopping Mall".
-   Test that a player cannot buy an item they cannot afford.
-   Test that buying an item correctly deducts cash and adds happiness.
-   Verify that happiness is correctly capped at 100 using the `Player` class method.
```

---

### **Phase 3: Advanced Mechanics & Game Loop**

With the core actions in place, we'll add financial complexity, a major upgrade, and the overall game flow.

#### **Prompt 3.1: Bank Actions & Car Purchase**

```text
Goal: Implement the remaining location actions: banking and buying a car.

Pre-requisite: `GameState` class and `Player` class.

Specifications:
1.  **Bank Actions:** Create the following methods in `GameState`:
    -   `deposit(amount)`: Player must be at the "Bank". Calls the player's `deposit` method.
    -   `withdraw(amount)`: Player must be at the "Bank". Calls the player's `withdraw` method.
    -   `takeLoan(amount)`: Player must be at the "Bank". The total loan (`player.loan` + `amount`) cannot exceed $2,500. If valid, adds the amount to the player's cash and loan balance.
    -   `repayLoan(amount)`: Player must be at the "Bank". Player must have enough cash. The repayment cannot be more than the outstanding loan. Deducts from cash and loan balance.
2.  **Car Purchase:** Create a method `buyCar()` in `GameState`.
    -   Player must be at the "Used Car Lot".
    -   The cost is $3,000. Check if the player has enough cash and does not already own a car (`hasCar` is false).
    -   If successful, deduct the cash and call the player's `giveCar()` method.

Testing:
-   Write Jest tests for all new methods.
-   Ensure all actions require the player to be at the correct location.
-   Test bank actions: successful deposits/withdrawals, preventing over-withdrawal.
-   Test loan logic: prevent taking a loan over the $2,500 cap, successful repayments, preventing over-repayment.
-   Test `buyCar`: check for sufficient cash, prevent buying if a car is already owned, and verify player state is updated correctly.
```

#### **Prompt 3.2: Interest Calculation**

```text
Goal: Integrate interest calculation into the turn cycle.

Pre-requisite: `GameState` class.

Specifications:
1.  Refactor the `endTurn()` method in `GameState`. The logic for daily expenses and interest should happen at the *start* of a player's turn.
2.  Create a new method `startTurn()`. This method will be called by the game loop before a player can take actions.
3.  The `startTurn()` method should:
    -   Get the current player.
    -   **Apply Interest:**
        -   Calculate savings interest: `player.savings * 0.01` (1%). Add this to savings.
        -   Calculate loan interest: `player.loan * 0.05` (5%). Add this to the loan balance.
    -   **Deduct Daily Expense:**
        -   Deduct the `DAILY_EXPENSE` ($50) from the player's cash.
    -   **Replenish Time:**
        -   Reset the player's `time` to 24. For now, we will ignore banking time over 24 hours. Let's simplify the spec: resting at home resets time to 24. Other actions consume time. When a turn ends and a new one begins for that player, their time is what was left over, plus 24, capped at 48. Let's stick to the original spec for simplicity: resting at Home (which ends the turn) replenishes time to 24.
4.  Modify `endTurn()`: It should now *only* be responsible for advancing `currentPlayerIndex` and the `turn` counter. The core "daily update" logic is now in `startTurn()`. This sets up a clearer game loop: `startTurn` -> Player Actions -> `endTurn`. For the MVP, we can combine them again.
5.  **Let's simplify and revert to the original spec:** Modify the `endTurn()` method. When a player rests at home, this method is called.
    -   It should first apply interest (1% on savings, 5% on loan) to the player whose turn is ending.
    -   Then, deduct the $50 `DAILY_EXPENSE`.
    -   Then, reset their `time` to 24.
    -   Finally, advance to the next player.

Testing:
-   Update the Jest test suite for `GameState`.
-   Create a scenario where a player has both savings and a loan.
-   Call `endTurn()` and verify that:
    -   Savings have increased by exactly 1%.
    -   The loan balance has increased by exactly 5%.
    -   $50 has been deducted from cash.
    -   Time has been reset to 24.
    -   The turn has advanced to the next player.
```

#### **Prompt 3.3: Win Condition and Game Loop**

```text
Goal: Create the main game loop and a function to check for the win condition.

Pre-requisite: `GameState` class.

Specifications:
1.  **Win Condition Check:** Create a method in `GameState` called `checkWinCondition(player)`.
    -   It should accept a player object.
    -   It must return `true` only if all four of the following conditions are met simultaneously:
        -   `player.cash >= 10000`
        -   `player.happiness >= 80`
        -   `player.educationLevel >= 3` (Corresponds to "Completed Community College")
        -   `player.careerLevel >= 4` (Corresponds to "Junior Manager")
    -   Otherwise, it should return `false`.
2.  **Game Loop Stub:** Create a new class or object, `GameController`.
    -   It should be initialized with a `GameState` instance.
    -   It will manage the flow of the game.
    -   Create a method `handleAction(actionType, params)`. This will be the single entry point for all player actions (e.g., `handleAction('travel', { destination: 'Bank' })`).
    -   Inside this method, call the appropriate `GameState` method (e.g., `this.gameState.travelTo(params.destination)`).
    -   After every successful action, it should call `checkWinCondition` for the current player. If it returns true, set a flag `gameOver` to true and store the winner.
    -   When the `endTurn` action is called, it should also handle advancing the turn in the `GameState`.

Testing:
-   Write Jest tests for `checkWinCondition`. Create player states that meet none, some, and all of the conditions to verify its accuracy.
-   Write Jest tests for the `GameController`.
-   Simulate a series of actions (travel, work, end turn) and check that the `GameState` is updated correctly.
-   Create a test where a player performs an action that meets the final win condition, and verify that the `gameOver` flag is set correctly.
-   **Integration Tests for `GameController`**
    -   Create `tests/GameController.test.js`.
    -   Write a test that simulates a multi-step turn:
        1.  Instantiate `GameController`.
        2.  Call `handleAction('travel', { destination: 'Employment Agency' })`.
        3.  Assert the player's location is now 'Employment Agency' and time has been deducted.
        4.  Call `handleAction('workShift', {})`.
        5.  Assert the player's cash has increased, time has been further deducted, and career level is now 1.
    -   This test proves that the controller correctly modifies the state through a sequence of actions.
```

---

### **Phase 4: User Interface**

Now we connect our tested game engine to a simple, functional user interface.

#### **Prompt 4.1: Basic HTML and UI Rendering**

```text
Goal: Create the HTML structure and a JavaScript function to render the game state.

Pre-requisite: A fully functional `GameController` and `GameState` from previous steps.

Specifications:
1.  **HTML:** Create an `index.html` file.
    -   It should have distinct `<div>` sections for:
        -   `#player1-status-panel`
        -   `#player2-status-panel` (or `#ai-status-panel`)
        -   `#game-controls`
        -   `#location-info`
        -   `#log` (A simple log to show game messages)
    -   Each player panel should have elements with unique IDs to display all player stats (e.g., `#p1-cash`, `#p1-happiness`).
    -   The game controls section should have buttons for actions (e.g., a "Rest/End Turn" button).
2.  **JavaScript:** Create a `ui.js` file.
    -   Create a `render(gameState)` function.
    -   This function takes the entire `gameState` object as an argument.
    -   It populates all the HTML elements with the current data: player stats, current location, hours remaining, etc.
    -   It should visually highlight the panel of the current player.
    -   It should dynamically show/hide action buttons based on the player's current location. For example, the "Work Shift" button only appears if `player.location` is "Employment Agency".
3.  **Integration:** In a main `app.js` file:
    -   Initialize the `GameController` and `GameState`.
    -   Create a main loop function `updateUI()` that calls `render(gameController.gameState)`.
    -   Call `updateUI()` once at the start to render the initial state.

Task:
-   Write the HTML file.
-   Write the JavaScript `render` function that correctly updates the UI based on a mock `GameState` object.
-   Write the `app.js` to tie them together. No event listeners yet.
```

#### **Prompt 4.2: Wiring UI Controls**

```text
Goal: Connect the UI buttons to the `GameController` to allow player interaction.

Pre-requisite: The HTML and rendering function from the previous step.

Specifications:
1.  In `app.js`, add event listeners to all the action buttons.
2.  When a button is clicked, it should call the `gameController.handleAction()` method with the correct action type and parameters.
    -   Example: The "Travel to Bank" button calls `gameController.handleAction('travel', { destination: 'Bank' })`.
    -   Example: The "Work Shift" button calls `gameController.handleAction('workShift', {})`.
    -   Example: The "End Turn" button calls `gameController.handleAction('endTurn', {})`.
3.  The `handleAction` method in `GameController` should return the result of the action (success/failure and a message).
4.  After every call to `handleAction`, regardless of the result:
    -   Log the result message to the `#log` div.
    -   Call the `render()` function again to update the entire UI with the new game state.
5.  If the `gameOver` flag is set in the `GameController`, display a victory message and disable all action buttons.

Task:
-   Add event listeners for all possible game actions.
-   Ensure the UI is re-rendered after every single action.
-   Implement the game-over state in the UI.
```

---

### **Phase 5: AI Opponent**

Finally, we'll implement the logic for the AI to enable single-player mode.

#### **Prompt 5.1: AI Decision Making**

```text
Goal: Create an AI player that can make decisions based on a fixed priority list.

Pre-requisite: A complete `GameController`.

Specifications:
1.  Create an `AIController` class.
2.  It should have one primary method: `takeTurn(gameState, player)`. This method will decide what action the AI should take.
3.  Implement the "Balanced Climber" logic inside `takeTurn`. The function should be a series of `if/else if` checks based on the AI player's current state:
    -   **Pay Loan:** If `player.loan` is > $2000, and the player is not at the Bank, travel to the Bank. If at the Bank, repay as much of the loan as possible.
    -   **Gain Wealth:** If `player.cash` < $1000, and not at the Employment Agency, travel there. If at the Employment Agency, `workShift`.
    -   **Advance Education:** If the player can afford the next course (`player.educationLevel + 1`) and is not at the Community College, travel there. If at the college, `takeCourse`.
    -   **Boost Happiness:** If `player.happiness` < 50, and not at the Shopping Mall, travel there. If at the mall, buy the most expensive item they can afford.
    -   **Increase Efficiency:** If `player.cash` > $3500 and `player.hasCar` is false, and not at the Used Car Lot, travel there. If there, `buyCar`.
    -   **Catch-all:** If none of the above conditions are met, travel to the Employment Agency and `workShift`.
4.  The `takeTurn` method should return an action object that the `GameController` can understand, e.g., `{ action: 'travel', params: { destination: 'Bank' } }`. The AI will perform one action at a time. The turn should be a sequence of these decisions until it runs out of time, at which point it should choose to `endTurn`.

Task:
-   Write the `AIController` class with the `takeTurn` method.
-   Write Jest tests for the `takeTurn` method. For each priority, create a specific player state and verify that the AI chooses the correct action. For example, give the AI low cash and check that it decides to go to work.

#### **Prompt 5.2: Integrating the AI into the Game Loop**

```text
Goal: Integrate the AI opponent into the main game loop for single-player mode.

Pre-requisite: A working `AIController` and `GameController`.

Specifications:
1.  Modify the `GameController` and `app.js` to handle a single-player mode. When the game starts, if it's a single-player game, the second player should be marked as an AI.
2.  Modify the `GameController`'s `endTurn` logic. After a human player ends their turn, if the new `currentPlayer` is an AI, trigger the AI's turn.
3.  When it's the AI's turn, the `GameController` should repeatedly:
    -   Call the `aiController.takeTurn()` method to get the AI's next desired action.
    -   Execute that action using `handleAction()`.
    -   Update the UI after each action so the human player can see what the AI is doing (add a small delay, e.g., `setTimeout(..., 500)`, between AI actions).
    -   Continue until the AI runs out of time or decides to `endTurn`.
4.  Once the AI's turn is over, control should pass back to the human player.

Task:
-   Update the main game loop to check if the current player is an AI.
-   Implement the logic to automatically execute the AI's turn action-by-action.
-   Ensure the UI updates between each AI action to provide a visible turn.
-   The game should now be fully playable in a 1-Player vs. AI "hotseat" mode.```