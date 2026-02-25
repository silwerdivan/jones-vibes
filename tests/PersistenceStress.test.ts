import { describe, it, expect, beforeEach } from 'vitest';
import GameState from '../src/game/GameState';
import Player from '../src/game/Player';
import { UI_EVENTS } from '../src/EventBus';

describe('Persistence Stress Test', () => {
    let gameState: GameState;

    beforeEach(() => {
        // Start with a standard 2-player game (1 Human, 1 AI)
        gameState = new GameState(2, true);
    });

    /**
     * Helper to simulate a "browser refresh" by serializing and deserializing.
     */
    const simulateRefresh = (state: GameState): GameState => {
        const json = state.toJSON();
        return GameState.fromJSON(json);
    };

    it('Scenario 1: Standard Mid-Game State', () => {
        // Setup complex mid-game state
        gameState.turn = 15;
        gameState.currentPlayerIndex = 0;
        
        const p1 = gameState.players[0];
        p1.cash = 1250;
        p1.savings = 5000;
        p1.happiness = 65;
        p1.educationLevel = 2;
        p1.careerLevel = 3;
        p1.time = 12;
        p1.setLocation('Employment Agency');
        p1.hasCar = true;
        p1.loan = 2000;
        p1.inventory = [{ name: 'Computer', cost: 800, happinessBoost: 10, type: 'asset', location: 'Electronics Store' }];
        
        gameState.addLogMessage('Player 1 is doing great!', 'success');
        gameState.activeScreenId = 'city';
        gameState.activeLocationDashboard = null;

        const restored = simulateRefresh(gameState);

        expect(restored.turn).toBe(15);
        expect(restored.currentPlayerIndex).toBe(0);
        expect(restored.players[0].cash).toBe(1250);
        expect(restored.players[0].savings).toBe(5000);
        expect(restored.players[0].inventory.length).toBe(1);
        expect(restored.players[0].location).toBe('Employment Agency');
        expect(restored.activeScreenId).toBe('city');
        expect(restored.activeLocationDashboard).toBeNull();
    });

    it('Scenario 2: Inside a Location Dashboard', () => {
        gameState.currentPlayerIndex = 0;
        gameState.players[0].setLocation('Bank');
        gameState.activeScreenId = 'city';
        gameState.activeLocationDashboard = 'Bank';

        const restored = simulateRefresh(gameState);

        expect(restored.players[0].location).toBe('Bank');
        expect(restored.activeLocationDashboard).toBe('Bank');
        expect(restored.activeScreenId).toBe('city');
    });

    it('Scenario 3: Active Choice Modal (Bank Action)', () => {
        gameState.currentPlayerIndex = 0;
        gameState.players[0].setLocation('Bank');
        gameState.activeScreenId = 'city';
        gameState.activeLocationDashboard = 'Bank';
        
        // Simulate a choice modal being open
        gameState.activeChoiceContext = {
            title: 'Deposit Money',
            showInput: true,
            choices: [
                { text: 'Deposit', value: 500, actionId: 'BANK_DEPOSIT' },
                { text: 'Cancel', action: () => { console.log('Cancelled'); } }
            ]
        };

        const restored = simulateRefresh(gameState);

        expect(restored.activeChoiceContext).not.toBeNull();
        expect(restored.activeChoiceContext.title).toBe('Deposit Money');
        expect(restored.activeChoiceContext.showInput).toBe(true);
        expect(restored.activeChoiceContext.choices.length).toBe(2);
        
        // Verify actionId persisted, but anonymous function was stripped (safety)
        expect(restored.activeChoiceContext.choices[0].actionId).toBe('BANK_DEPOSIT');
        expect(restored.activeChoiceContext.choices[1].action).toBeUndefined();
    });

    it('Scenario 4: AI Thinking State', () => {
        gameState.currentPlayerIndex = 1; // AI Turn
        gameState.isAIThinking = true;
        gameState.activeScreenId = 'city';
        
        const restored = simulateRefresh(gameState);

        expect(restored.currentPlayerIndex).toBe(1);
        expect(restored.isAIThinking).toBe(true);
        expect(restored.players[1].isAI).toBe(true);
    });

    it('Scenario 5: Pending Turn Summary (Week End)', () => {
        const summary = {
            player: 1,
            playerName: 'Player 1',
            week: 4,
            events: [
                { type: 'expense', label: 'Rent', value: 400, unit: '$', icon: 'home' },
                { type: 'income', label: 'Salary', value: 800, unit: '$', icon: 'money' }
            ],
            totals: {
                cashChange: 400,
                happinessChange: -5
            }
        };

        gameState.pendingTurnSummary = summary;
        gameState.activeScreenId = 'life'; // Usually summary is shown on life screen or as modal

        const restored = simulateRefresh(gameState);

        expect(restored.pendingTurnSummary).not.toBeNull();
        expect(restored.pendingTurnSummary?.week).toBe(4);
        expect(restored.pendingTurnSummary?.events.length).toBe(2);
        expect(restored.pendingTurnSummary?.totals.cashChange).toBe(400);
    });

    it('Scenario 6: Game Over State', () => {
        gameState.gameOver = true;
        gameState.winner = gameState.players[0];
        gameState.activeScreenId = 'city';

        const restored = simulateRefresh(gameState);

        expect(restored.gameOver).toBe(true);
        expect(restored.winner?.id).toBe(gameState.players[0].id);
    });

    it('Scenario 7: Multiple Refreshes in Succession', () => {
        // Verify that state doesn't degrade over multiple serialization cycles
        gameState.players[0].cash = 777;
        gameState.activeLocationDashboard = 'Fast Food';
        
        let currentState = gameState;
        for (let i = 0; i < 5; i++) {
            currentState = simulateRefresh(currentState);
        }

        expect(currentState.players[0].cash).toBe(777);
        expect(currentState.activeLocationDashboard).toBe('Fast Food');
    });

    it('Scenario 8: Empty/Default State', () => {
        const freshState = new GameState(1);
        const restored = simulateRefresh(freshState);

        expect(restored.players.length).toBe(1);
        expect(restored.turn).toBe(1);
        expect(restored.activeScreenId).toBe('city');
        expect(restored.activeLocationDashboard).toBeNull();
        expect(restored.activeChoiceContext).toBeNull();
    });
});
