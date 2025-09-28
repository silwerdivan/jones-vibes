import GameState from '../js/game/GameState.js';
import Player from '../js/game/Player.js';

jest.mock('../js/game/Player.js'); // Mock the Player class

describe('GameState', () => {
    let gameState;

    beforeEach(() => {
        // Reset the mock before each test
        Player.mockClear();
        // Mock Player constructor to return a simple object for testing
        Player.mockImplementation(() => {
            const player = {
                cash: 1000,
                time: 24,
                spendCash: jest.fn(),
                updateTime: jest.fn(hours => {
                    player.time += hours; // Correctly update the player's time
                }),
                // Add other player properties and methods as needed for tests
            };
            return player;
        });
    });

    // Test 1: Constructor - 1 player
    test('constructor initializes with 1 player correctly', () => {
        gameState = new GameState(1);
        expect(gameState.players.length).toBe(1);
        expect(gameState.currentPlayerIndex).toBe(0);
        expect(gameState.turn).toBe(1);
        expect(gameState.DAILY_EXPENSE).toBe(50);
        expect(Player).toHaveBeenCalledTimes(1);
    });

    // Test 2: Constructor - 2 players
    test('constructor initializes with 2 players correctly', () => {
        gameState = new GameState(2);
        expect(gameState.players.length).toBe(2);
        expect(gameState.currentPlayerIndex).toBe(0);
        expect(gameState.turn).toBe(1);
        expect(gameState.DAILY_EXPENSE).toBe(50);
        expect(Player).toHaveBeenCalledTimes(2);
    });

    // Test 3: Constructor - invalid number of players
    test('constructor throws error for invalid number of players', () => {
        expect(() => new GameState(0)).toThrow("Game can only be played with 1 or 2 players.");
        expect(() => new GameState(3)).toThrow("Game can only be played with 1 or 2 players.");
    });

    // Test 4: getCurrentPlayer()
    test('getCurrentPlayer returns the correct player', () => {
        gameState = new GameState(2);
        const player1 = gameState.players[0];
        expect(gameState.getCurrentPlayer()).toBe(player1);

        gameState.currentPlayerIndex = 1;
        const player2 = gameState.players[1];
        expect(gameState.getCurrentPlayer()).toBe(player2);
    });

    // Test 5: endTurn() - expense deduction and time reset
    test('endTurn deducts daily expense and resets time for current player', () => {
        gameState = new GameState(1);
        const currentPlayer = gameState.getCurrentPlayer();
        currentPlayer.cash = 1000; // Set initial cash for testing
        currentPlayer.time = 10; // Set initial time for testing

        gameState.endTurn();

        expect(currentPlayer.spendCash).toHaveBeenCalledWith(gameState.DAILY_EXPENSE);
        expect(currentPlayer.updateTime).toHaveBeenCalledWith(14); // 24 - 10 = 14
    });

    // Test 6: endTurn() - currentPlayerIndex advancement (2 players)
    test('endTurn advances currentPlayerIndex and loops back for 2 players', () => {
        gameState = new GameState(2);

        // Player 1's turn
        expect(gameState.currentPlayerIndex).toBe(0);
        gameState.endTurn();
        // Should be Player 2's turn
        expect(gameState.currentPlayerIndex).toBe(1);
        expect(gameState.turn).toBe(1); // Turn should not increment yet

        gameState.endTurn();
        // Should loop back to Player 1's turn
        expect(gameState.currentPlayerIndex).toBe(0);
        expect(gameState.turn).toBe(2); // Turn should increment after full cycle
    });

    // Test 7: endTurn() - turn counter increments correctly (1 player)
    test('endTurn increments turn counter correctly for 1 player', () => {
        gameState = new GameState(1);

        expect(gameState.turn).toBe(1);
        gameState.endTurn();
        expect(gameState.turn).toBe(2);
        gameState.endTurn();
        expect(gameState.turn).toBe(3);
    });

    // Test 8: endTurn() - time reset does not exceed 48 (max time)
    test('endTurn resets player time to 24, not exceeding 48', () => {
        gameState = new GameState(1);
        const currentPlayer = gameState.getCurrentPlayer();
        currentPlayer.time = 40; // Player has more than 24 hours

        gameState.endTurn();
        // Should reset to 24, meaning updateTime is called with 24 - 40 = -16
        // The Player.js updateTime method should handle the actual cap, but we test the input here.
        expect(currentPlayer.updateTime).toHaveBeenCalledWith(24 - 40);
    });
});
