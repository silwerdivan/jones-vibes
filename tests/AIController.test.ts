import { describe, it, expect, beforeEach, vi } from 'vitest';
import AIController from '../src/game/AIController';
import Player from '../src/game/Player';
import GameState from '../src/game/GameState';

describe('AIController Hunger awareness', () => {
    let aiController: AIController;
    let gameState: GameState;
    let player: Player;

    beforeEach(() => {
        aiController = new AIController();
        // Create a 2-player game where player 2 is AI
        gameState = new GameState(2, true);
        player = gameState.players[1]; // AI player
        player.cash = 1000;
        player.time = 24;
    });

    it('should prioritize traveling to Fast Food when hunger is high (>50)', () => {
        player.hunger = 60;
        player.location = 'Home';
        
        const nextAction = aiController.takeTurn(gameState, player);
        
        expect(nextAction.action).toBe('travel');
        expect(nextAction.params.destination).toBe('Fast Food');
    });

    it('should buy food when at Fast Food and hungry', () => {
        player.hunger = 60;
        player.location = 'Fast Food';
        
        const nextAction = aiController.takeTurn(gameState, player);
        
        expect(nextAction.action).toBe('buyItem');
        // AI should pick an effective food item
        expect(['Monolith Burger', 'Synth-Salad']).toContain(nextAction.params.itemName);
    });

    it('should not prioritize food if it cannot afford it', () => {
        player.hunger = 60;
        player.cash = 5; // Too poor for Monolith Burger ($10)
        player.location = 'Home';
        
        const nextAction = aiController.takeTurn(gameState, player);
        
        // Should fallback to Gain Wealth (traveling to Employment Agency) or other priorities
        // but definitely NOT travel to Fast Food to stare at burgers
        expect(nextAction.params?.destination).not.toBe('Fast Food');
    });
});
