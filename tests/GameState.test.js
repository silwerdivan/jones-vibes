const GameState = require('../js/game/GameState');
const Player = require('../js/game/Player');

describe('GameState', () => {
    test('constructor should create a 1-player game', () => {
        const gameState = new GameState(1);
        expect(gameState.players.length).toBe(1);
        expect(gameState.players[0]).toBeInstanceOf(Player);
        expect(gameState.currentPlayerIndex).toBe(0);
        expect(gameState.turn).toBe(1);
    });

    test('constructor should create a 2-player game', () => {
        const gameState = new GameState(2);
        expect(gameState.players.length).toBe(2);
        expect(gameState.players[0]).toBeInstanceOf(Player);
        expect(gameState.players[1]).toBeInstanceOf(Player);
    });

    test('getCurrentPlayer should return the correct player', () => {
        const gameState = new GameState(2);
        expect(gameState.getCurrentPlayer()).toBe(gameState.players[0]);
        gameState.currentPlayerIndex = 1;
        expect(gameState.getCurrentPlayer()).toBe(gameState.players[1]);
    });

    test('endTurn should deduct expenses, reset time, and advance to next player', () => {
        const gameState = new GameState(2);
        const player1 = gameState.players[0];
        const initialCash = player1.cash;

        gameState.endTurn();

        expect(player1.cash).toBe(initialCash - gameState.DAILY_EXPENSE);
        expect(player1.time).toBe(24);
        expect(gameState.currentPlayerIndex).toBe(1);
        expect(gameState.turn).toBe(1);
    });

    test('endTurn should increment turn counter after all players have played', () => {
        const gameState = new GameState(2);
        gameState.endTurn(); // Player 1 ends turn
        gameState.endTurn(); // Player 2 ends turn

        expect(gameState.currentPlayerIndex).toBe(0);
        expect(gameState.turn).toBe(2);
    });
});