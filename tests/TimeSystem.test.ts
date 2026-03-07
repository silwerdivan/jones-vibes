import { describe, it, expect, beforeEach, vi } from 'vitest';
import GameState from '../src/game/GameState';
import TimeSystem from '../src/systems/TimeSystem';
import EventBus from '../src/EventBus';

describe('TimeSystem', () => {
    let gameState: GameState;
    let timeSystem: TimeSystem;

    beforeEach(() => {
        gameState = new GameState(2, false);
        timeSystem = new TimeSystem(gameState);
        gameState.setTimeSystem(timeSystem);
        // Reset event bus
        (EventBus as any).events = {};
    });

    it('should clear UI state when turn ends', () => {
        // Setup some UI state
        gameState.activeLocationDashboard = 'Labor Sector';
        gameState.activeChoiceContext = { title: 'Test' };
        
        // End the turn
        timeSystem.endTurn();
        
        // Verify UI state is cleared
        expect(gameState.activeLocationDashboard).toBeNull();
        expect(gameState.activeChoiceContext).toBeNull();
    });

    it('should reset player location to Home when turn ends', () => {
        const player = gameState.getCurrentPlayer();
        player.location = 'Shopping Mall';
        
        timeSystem.endTurn();
        
        expect(player.location).toBe('Hab-Pod 404');
    });

    it('should handle weekly Burn Rate when turn ends', () => {
        const player = gameState.getCurrentPlayer();
        player.credits = 100; // Less than 150 (coffin-tube base)
        player.burnRate = 150;
        
        timeSystem.endTurn();
        
        // Paid what they could (100)
        // Debt (50) + 10% interest (5) = 55
        expect(player.credits).toBe(0);
        expect(player.debt).toBe(55);
        expect(player.hasCondition('SUBSCRIPTION_DEFAULT')).toBe(true);
    });

    it('should apply hunger penalty if hunger is high', () => {
        const player = gameState.getCurrentPlayer();
        player.hunger = 60;
        player.sanity = 50;
        player.credits = 150; // Cover Burn Rate
        
        timeSystem.endTurn();
        
        // Hunger increases by 20, penalty is applied if hunger > 50
        expect(player.hunger).toBe(80);
        // Ambient Stress: -10, Hunger penalty: -5, Cycle Recovery: +10. Total change: -5.
        expect(player.sanity).toBe(45);
    });

    it('should apply loan interest if player has a loan', () => {
        const player = gameState.getCurrentPlayer();
        player.loan = 1000;
        player.credits = 150; // Cover Burn Rate
        
        timeSystem.endTurn();
        
        // 10% interest
        expect(player.loan).toBe(1100);
    });

    it('should confirm sanity stays constant with ambient drain negating recovery', () => {
        const player = gameState.getCurrentPlayer();
        player.hunger = 0;
        player.sanity = 50;
        player.credits = 150; // Cover Burn Rate
        
        // End turn 1
        timeSystem.endTurn();
        // -10 Ambient Stress + 10 Cycle Recovery = 0 net change
        expect(player.sanity).toBe(50); 
        
        // End turn 2
        player.hunger = 0; // keep hunger low
        player.credits = 150; // Re-fund
        timeSystem.endTurn();
        expect(player.sanity).toBe(50);
    });

    it('should advance turn correctly', () => {
        expect(gameState.currentPlayerIndex).toBe(0);
        expect(gameState.turn).toBe(1);
        
        timeSystem.advanceTurn();
        
        expect(gameState.currentPlayerIndex).toBe(1);
        expect(gameState.turn).toBe(1);
        
        timeSystem.advanceTurn();
        
        expect(gameState.currentPlayerIndex).toBe(0);
        expect(gameState.turn).toBe(2);
    });
});
