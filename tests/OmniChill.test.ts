import { describe, it, expect, beforeEach } from 'vitest';
import GameState from '../src/game/GameState';
import TimeSystem from '../src/systems/TimeSystem';
import Player from '../src/game/Player';
import { SHOPPING_ITEMS } from '../src/data/items';

describe('Omni-Chill Buff', () => {
    let gameState: GameState;
    let timeSystem: TimeSystem;

    beforeEach(() => {
        gameState = new GameState();
        timeSystem = new TimeSystem(gameState);
        // Ensure we have at least one player
        if (gameState.players.length === 0) {
            gameState.players.push(new Player(1));
        }
    });

    it('should increase hunger by 20 without Omni-Chill', () => {
        const player = gameState.getCurrentPlayer();
        player.hunger = 0;
        player.inventory = [];

        timeSystem.endTurn();

        expect(player.hunger).toBe(20);
    });

    it('should increase hunger by 10 with Omni-Chill', () => {
        const player = gameState.getCurrentPlayer();
        player.hunger = 0;
        
        const omniChill = SHOPPING_ITEMS.find(i => i.name === 'Omni-Chill');
        expect(omniChill).toBeDefined();
        player.inventory.push(omniChill!);

        timeSystem.endTurn();

        expect(player.hunger).toBe(10);
    });
});
