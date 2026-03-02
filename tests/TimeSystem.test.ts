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

    it('should handle daily expenses when turn ends', () => {
        const player = gameState.getCurrentPlayer();
        player.cash = 100;
        gameState.DAILY_EXPENSE = 50;
        
        timeSystem.endTurn();
        
        expect(player.cash).toBe(50);
    });

    it('should apply hunger penalty if hunger is high', () => {
        const player = gameState.getCurrentPlayer();
        player.hunger = 60;
        player.happiness = 50;
        
        timeSystem.endTurn();
        
        // Hunger increases by 20, penalty is applied if hunger > 50
        expect(player.hunger).toBe(80);
        // Base rest: +10, Hunger penalty: -5. Total change: +5.
        expect(player.happiness).toBe(55);
    });

    it('should apply loan interest if player has a loan', () => {
        const player = gameState.getCurrentPlayer();
        player.loan = 1000;
        
        timeSystem.endTurn();
        
        // 10% interest
        expect(player.loan).toBe(1100);
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
