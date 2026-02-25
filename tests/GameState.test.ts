import { describe, it, expect, beforeEach } from 'vitest';
import GameState from '../src/game/GameState';
import Player from '../src/game/Player';

describe('GameState Serialization', () => {
    let gameState: GameState;

    beforeEach(() => {
        gameState = new GameState(2, true); // 2 players, 2nd is AI
    });

    it('should serialize to JSON correctly', () => {
        gameState.turn = 5;
        gameState.currentPlayerIndex = 1;
        gameState.players[0].cash = 100;
        gameState.players[1].cash = 200;
        gameState.addLogMessage('Test message', 'info');

        const json = gameState.toJSON();

        expect(json.turn).toBe(5);
        expect(json.currentPlayerIndex).toBe(1);
        expect(json.players.length).toBe(2);
        expect(json.players[0].cash).toBe(100);
        expect(json.players[1].cash).toBe(200);
        expect(json.players[1].isAI).toBe(true);
        expect(json.log.length).toBe(1);
        expect(json.log[0].text).toBe('Test message');
        expect(json.isPlayer2AI).toBe(true);
    });

    it('should deserialize from JSON correctly', () => {
        gameState.turn = 10;
        gameState.currentPlayerIndex = 0;
        gameState.players[0].cash = 500;
        gameState.players[1].cash = 1000;
        gameState.players[1].isAI = true;
        gameState.addLogMessage('Another test message', 'success');
        
        const json = gameState.toJSON();
        const newGameState = GameState.fromJSON(json);

        expect(newGameState.turn).toBe(10);
        expect(newGameState.currentPlayerIndex).toBe(0);
        expect(newGameState.players.length).toBe(2);
        expect(newGameState.players[0].cash).toBe(500);
        expect(newGameState.players[1].cash).toBe(1000);
        expect(newGameState.players[1].isAI).toBe(true);
        expect(newGameState.log.length).toBe(1);
        expect(newGameState.log[0].text).toBe('Another test message');
        expect(newGameState.aiController).toBeDefined();
    });

    it('should handle winner serialization', () => {
        gameState.gameOver = true;
        gameState.winner = gameState.players[0];

        const json = gameState.toJSON();
        expect(json.winnerId).toBe(gameState.players[0].id);

        const newGameState = GameState.fromJSON(json);
        expect(newGameState.gameOver).toBe(true);
        expect(newGameState.winner).toBeDefined();
        expect(newGameState.winner?.id).toBe(gameState.players[0].id);
    });

    it('should serialize and deserialize pendingTurnSummary correctly', () => {
        const summary = {
            player: 1,
            playerName: 'Player 1',
            week: 1,
            events: [{
                type: 'income',
                label: 'Test',
                value: 100,
                unit: '$',
                icon: 'money'
            }],
            totals: {
                cashChange: 100,
                happinessChange: 0
            }
        };

        gameState.pendingTurnSummary = summary;

        const json = gameState.toJSON();
        expect(json.pendingTurnSummary).toEqual(summary);

        const newGameState = GameState.fromJSON(json);
        expect(newGameState.pendingTurnSummary).toEqual(summary);
    });

    it('should persist activeScreenId and activeLocationDashboard', () => {
        gameState.activeScreenId = 'inventory';
        gameState.activeLocationDashboard = 'Bank';
        
        const json = gameState.toJSON();
        expect(json.activeScreenId).toBe('inventory');
        expect(json.activeLocationDashboard).toBe('Bank');
        
        const restored = GameState.fromJSON(json);
        expect(restored.activeScreenId).toBe('inventory');
        expect(restored.activeLocationDashboard).toBe('Bank');
    });
});
