### **UI Testing Plan for Jones in the Fast Lane**

This plan outlines a suite of UI tests to be implemented for the existing application to create a safety net for future development and bug fixing.

**1. Testing Framework**

*   **Framework:** Jest with Testing Library

**2. Test Suites**

*   **Suite: Game Initialization and Player Status**
    *   **Description:** Tests to ensure the game loads correctly, player information is displayed, and the UI reflects the initial game state.
    *   **Test Cases:**
        *   - [x] **It should display the main game title.**
            *   *Verifies that the `<h1>` heading "Jones in the Fast Lane" is visible on page load.*
        *   - [x] **It should render both player status panels.**
            *   *Verifies that the panels for "Player 1" and "Player 2 (AI)" are present in the document.*
        *   - [x] **It should display the correct initial stats for both players.**
            *   *Verifies that initial values for Cash, Savings, Loan, Happiness, etc., are all rendered correctly as '0' or their default state.*
        *   - [x] **It should highlight Player 1 as the current player on an initial load.**
            *   *Verifies that the Player 1 panel has the `current-player` class and the Player 2 panel does not.*
        *   - [x] **It should display the correct initial location and turn.**
            *   *Verifies that the "Current Location" is "Home" and the "Turn" is "1".*
        *   - [x] **It should display the game log section.**
            *   *Verifies that the "Game Log" container is rendered.*

*   **Suite: Player Actions and UI Updates**
    *   **Description:** Tests for core player actions and ensures the UI updates accordingly after each action.
    *   **Test Cases:**
        *   - [x] **It should update player stats when an action is performed.**
            *   *Simulates a player action (e.g., working a shift) and verifies that the cash and time displays are updated in the correct player\'s panel.*
        *   - [x] **It should switch the highlighted player after a turn ends.**
            *   *Verifies that after the "Rest / End Turn" button is clicked, the `current-player` class moves from the Player 1 panel to the Player 2 panel.*
        *   - [x] **It should add a message to the game log after an action.**
            *   *Verifies that performing an action (e.g., traveling) adds a new entry to the game log display.*
        *   - [x] **It should update the turn counter after a full round.**
            *   *Verifies that after both Player 1 and the AI end their turns, the "Turn" counter increments to "2".*

*   **Suite: Location-Specific Controls**
    *   **Description:** Tests to ensure the correct action buttons are visible based on the player's current location.
    *   **Test Cases:**
        *   - [x] **It should only show the 'Travel' and 'End Turn' buttons at 'Home'.**
            *   *Verifies that at the start of the turn (location: Home), only the travel and end turn buttons are visible.*
        *   - [ ] **It should show the 'Work Shift' button at the 'Employment Agency'.**
            *   *Simulates traveling to the "Employment Agency" and verifies that the "Work Shift" button becomes visible.*
        *   - [ ] **It should show the 'Take Course' button at the 'Community College'.**
            *   *Simulates traveling to the "Community College" and verifies that the "Take Course" button becomes visible.*
        *   - [ ] **It should show the 'Buy Item' button at the 'Shopping Mall'.**
            *   *Simulates traveling to the "Shopping Mall" and verifies that the "Buy Item" button becomes visible.*
        *   - [ ] **It should show all bank-related buttons at the 'Bank'.**
            *   *Simulates traveling to the "Bank" and verifies that the "Deposit", "Withdraw", "Take Loan", and "Repay Loan" buttons are all visible.*

*   **Suite: User Input Modals**
    *   **Description:** Tests for the functionality of the dynamically appearing modals for choices and number inputs.
    *   **Test Cases:**
        *   - [ ] **It should display the travel choice modal when the 'Travel' button is clicked.**
            *   *Verifies that clicking "Travel" creates and displays a modal with the title "Travel to..." and a list of location buttons.*
        *   - [ ] **It should display the item choice modal when the 'Buy Item' button is clicked.**
            *   *Simulates going to the Shopping Mall, clicks "Buy Item", and verifies a modal appears with a list of items to buy.*
        *   - [ ] **It should display the number input modal for bank actions.**
            *   *Simulates going to the Bank, clicks "Deposit", and verifies a modal appears with a number input field and "Confirm" button.*
        *   - [ ] **It should close the modal when 'Cancel' is clicked.**
            *   *Verifies that clicking the "Cancel" button on any modal removes it from the DOM.*

*   **Suite: Game Over State**
    *   **Description:** Tests to ensure the UI correctly reflects the game's end state.
    *   **Test Cases:**
        *   - [ ] **It should display a 'Game Over' message in the log when a player wins.**
            *   *Mocks a game state where a player has met the win conditions, triggers the check, and verifies the log shows a "Game Over! Player X wins!" message.*
        *   - [ ] **It should disable all action buttons when the game is over.**
            *   *Verifies that after the game ends, all buttons inside the `game-controls` div become disabled.*