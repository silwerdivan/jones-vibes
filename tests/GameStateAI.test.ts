import { describe, it, expect, beforeEach, vi } from 'vitest';
import GameState from '../src/game/GameState';
import Player from '../src/game/Player';
import AIController from '../src/game/AIController';
import EconomySystem from '../src/systems/EconomySystem';

describe('GameState AI Logic', () => {
    let gameState: GameState;
    let economySystem: EconomySystem;

    beforeEach(() => {
        vi.useFakeTimers();
        gameState = new GameState(2, true); // 2 players, 2nd is AI
        economySystem = new EconomySystem(gameState);
        gameState.setEconomySystem(economySystem);
    });

    it('should allow AI one more decision after traveling if time is 0', () => {
        const aiPlayer = gameState.players[1];
        aiPlayer.time = 2; // Exactly enough for one travel (no car)
        aiPlayer.location = 'Hab-Pod 404';
        aiPlayer.hunger = 35;
        aiPlayer.cash = 100;

        // Mock AI controller to return travel then buyItem
        const takeTurnSpy = vi.spyOn(gameState.aiController!, 'takeTurn');
        
        // First call: travel to Sustenance Hub
        // Second call: buyItem
        // Third call: pass (or whatever AI does when done)

        gameState.currentPlayerIndex = 1; // AI's turn
        gameState.processAITurn();

        // Should have called travel
        expect(takeTurnSpy).toHaveBeenCalledTimes(1);
        
        // Fast forward setTimeout
        vi.runAllTimers();

        // After travel, time should be 0, but it should have called takeTurn AGAIN
        expect(aiPlayer.time).toBe(0);
        expect(aiPlayer.location).toBe('Sustenance Hub');
        expect(takeTurnSpy).toHaveBeenCalledTimes(2);
        
        // Check if second call was buyItem
        const secondAction = takeTurnSpy.mock.results[1].value;
        expect(secondAction.action).toBe('buyItem');

        // Fast forward again for the buyItem result
        vi.runAllTimers();

        // Now it should have ended the turn
        expect(gameState.isAIThinking).toBe(false);
    });

    it('should NOT allow AI another decision if action was NOT travel and time is 0', () => {
        const aiPlayer = gameState.players[1];
        aiPlayer.time = 6; // Matching Dishwasher shiftHours
        aiPlayer.location = 'Labor Sector';
        aiPlayer.careerLevel = 1; // Has a job
        
        // Mock AI to work shift
        const takeTurnSpy = vi.spyOn(gameState.aiController!, 'takeTurn');

        gameState.currentPlayerIndex = 1;
        gameState.processAITurn();

        vi.runAllTimers();

        expect(aiPlayer.time).toBe(0); // 6 - 6 = 0
        // Should NOT have called takeTurn again because it wasn't a 'travel' action
        expect(takeTurnSpy).toHaveBeenCalledTimes(1);
        expect(gameState.isAIThinking).toBe(false);
    });
});
