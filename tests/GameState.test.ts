import { describe, it, expect, beforeEach } from 'vitest';
import GameState from '../src/game/GameState';
import Player from '../src/game/Player';
import { EventManager } from '../src/game/EventManager';
import EventBus from '../src/EventBus';

describe('GameState Serialization', () => {
    let gameState: GameState;

    beforeEach(() => {
        EventBus.clearAll();
        gameState = new GameState(2, true); // 2 players, 2nd is AI
    });

    it('should serialize to JSON correctly', () => {
        gameState.turn = 5;
        gameState.currentPlayerIndex = 1;
        gameState.players[0].credits = 100;
        gameState.players[1].credits = 200;
        gameState.addLogMessage('Test message', 'info');

        const json = gameState.toJSON();

        expect(json.turn).toBe(5);
        expect(json.currentPlayerIndex).toBe(1);
        expect(json.players.length).toBe(2);
        expect(json.players[0].credits).toBe(100);
        expect(json.players[1].credits).toBe(200);
        expect(json.players[1].isAI).toBe(true);
        expect(json.log.length).toBe(1);
        expect(json.log[0].text).toBe('Test message');
        expect(json.isPlayer2AI).toBe(true);
    });

    it('should deserialize from JSON correctly', () => {
        gameState.turn = 10;
        gameState.currentPlayerIndex = 0;
        gameState.players[0].credits = 500;
        gameState.players[1].credits = 1000;
        gameState.players[1].isAI = true;
        gameState.addLogMessage('Another test message', 'success');
        
        const json = gameState.toJSON();
        const newGameState = GameState.fromJSON(json);

        expect(newGameState.turn).toBe(10);
        expect(newGameState.currentPlayerIndex).toBe(0);
        expect(newGameState.players.length).toBe(2);
        expect(newGameState.players[0].credits).toBe(500);
        expect(newGameState.players[1].credits).toBe(1000);
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
                unit: '₡',
                icon: 'money'
            }],
            totals: {
                creditsChange: 100,
                sanityChange: 0
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

    it('should correctly serialize and deserialize activeChoiceContext', () => {
        const choiceContext = {
            title: 'Test Choice',
            showInput: true,
            choices: [
                { text: 'Option 1', value: 1, actionId: 'TRAVEL' as any },
                { text: 'Option 2', action: () => {} }
            ]
        };
        
        gameState.activeChoiceContext = choiceContext;
        
        const json = gameState.toJSON();
        
        // Functions should be stripped
        expect(json.activeChoiceContext.choices[1].action).toBeUndefined();
        expect(json.activeChoiceContext.choices[0].actionId).toBe('TRAVEL');
        expect(json.activeChoiceContext.title).toBe('Test Choice');
        
        const restored = GameState.fromJSON(json);
        expect(restored.activeChoiceContext.title).toBe('Test Choice');
        expect(restored.activeChoiceContext.choices.length).toBe(2);
        expect(restored.activeChoiceContext.choices[0].text).toBe('Option 1');
    });

    it('should persist event history and player conditions', () => {
        const eventId = 'test_event_123';
        gameState.eventManager = new EventManager([eventId]);
        
        const condition = {
            id: 'TEST_COND',
            name: 'Test',
            description: 'Test',
            remainingDuration: 10,
            effects: []
        };
        gameState.players[0].addCondition(condition);
        
        const json = gameState.toJSON();
        expect(json.eventHistory).toContain(eventId);
        expect(json.players[0].activeConditions[0].id).toBe('TEST_COND');
        
        const restored = GameState.fromJSON(json);
        expect(restored.eventManager.getHistory()).toContain(eventId);
        expect(restored.players[0].activeConditions[0].id).toBe('TEST_COND');
    });
});

describe('Burnout Logic', () => {
    let gameState: GameState;
    let player: Player;

    beforeEach(() => {
        EventBus.clearAll();
        gameState = new GameState(1);
        player = gameState.players[0];
    });

    it('should trigger handleBurnout when sanity reaches 0', () => {
        player.credits = 1000;
        player.time = 24;
        
        // Trigger burnout
        player.updateSanity(-100);

        expect(player.sanity).toBe(0);
        expect(player.time).toBe(0);
        expect(player.credits).toBe(500); // 1000 - 500 medical fee
        expect(player.hasCondition('TRAUMA_REBOOT')).toBe(true);
        expect(gameState.log[0].text).toContain('Forced Reboot complete');
        expect(gameState.log[1].text).toContain('BURNOUT DETECTED');
    });

    it('should charge partial medical fee if credits are insufficient', () => {
        player.credits = 200;
        player.updateSanity(-100);

        expect(player.credits).toBe(0); // Took all 200
        expect(player.hasCondition('TRAUMA_REBOOT')).toBe(true);
    });

    it('should reduce max energy threshold when TRAUMA_REBOOT is active', () => {
        player.updateSanity(-100);
        
        expect(player.hasCondition('TRAUMA_REBOOT')).toBe(true);
        
        const maxEnergy = player.getModifiedStat('MAX_ENERGY', 100);
        expect(maxEnergy).toBe(80); // 100 * 0.8
        
        // Check lose condition with reduced max energy
        player.hunger = 80;
        player.time = 23;
        gameState.checkLoseCondition(player);
        expect(gameState.gameOver).toBe(true);
    });

    it('should NOT trigger burnout if sanity is above 0', () => {
        player.time = 24;
        player.updateSanity(-10);
        
        expect(player.sanity).toBe(40);
        expect(player.time).toBe(24);
        expect(player.hasCondition('TRAUMA_REBOOT')).toBe(false);
    });
});

describe('Labor Modifiers', () => {
    let gameState: GameState;
    let player: Player;

    beforeEach(() => {
        EventBus.clearAll();
        gameState = new GameState(1);
        player = gameState.players[0];
        player.location = 'Labor Sector';
        player.careerLevel = 1; // Sanitation-T3 (8 credits/hour, 6 hours = 48 base)
        player.time = 24;
    });

    it('should apply WAGE_MULTIPLIER to workShift earnings', () => {
        player.credits = 0;
        // Apply 20% bonus (FAVOR_WITH_BOSS style)
        player.addCondition({
            id: 'BONUS',
            name: 'Bonus',
            description: 'Bonus',
            remainingDuration: 24,
            effects: [{ type: 'WAGE_MULTIPLIER', value: 1.2 }]
        });

        gameState.workShift();

        // Base: 8 * 6 = 48
        // Multiplier: 1.2
        // Total: 48 * 1.2 = 57.6 -> 58 (rounded)
        expect(player.credits).toBe(58);
    });

    it('should apply WORK_EFFICIENCY to workShift earnings', () => {
        player.credits = 0;
        // Apply 15% efficiency (Adrenaline Pump style)
        player.addCondition({
            id: 'EFFICIENCY',
            name: 'Efficiency',
            description: 'Efficiency',
            remainingDuration: 24,
            effects: [{ type: 'WORK_EFFICIENCY', value: 1.15 }]
        });

        gameState.workShift();

        // Base: 8 * 6 = 48
        // Efficiency: 1.15
        // Total: 48 * 1.15 = 55.2 -> 55 (rounded)
        expect(player.credits).toBe(55);
    });

    it('should apply both multipliers multiplicatively', () => {
        player.credits = 0;
        // WAGE_MULTIPLIER: 1.2, WORK_EFFICIENCY: 1.3 (BIO_SYNC)
        player.addCondition({
            id: 'BIO_SYNC',
            name: 'Bio-Sync',
            description: 'Bio-Sync',
            remainingDuration: 24,
            effects: [
                { type: 'WAGE_MULTIPLIER', value: 1.2 },
                { type: 'WORK_EFFICIENCY', value: 1.3 }
            ]
        });

        gameState.workShift();

        // Base: 48
        // Total: 48 * 1.2 * 1.3 = 74.88 -> 75 (rounded)
        expect(player.credits).toBe(75);
    });
});
