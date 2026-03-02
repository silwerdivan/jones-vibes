import { describe, it, expect, beforeEach } from 'vitest';
import GameState from '../src/game/GameState';
import TimeSystem from '../src/systems/TimeSystem';
import Player from '../src/game/Player';
import { SHOPPING_ITEMS } from '../src/data/items';

describe('Hypno-Screen Buff', () => {
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

    it('should increase morale by 10 without Hypno-Screen', () => {
        const player = gameState.getCurrentPlayer();
        player.happiness = 50;
        player.inventory = [];

        timeSystem.endTurn();

        // Baseline: Morale should increase by 10 (Rest)
        expect(player.happiness).toBe(60);
    });

    it('should increase morale by 11 with Hypno-Screen', () => {
        const player = gameState.getCurrentPlayer();
        player.happiness = 50;
        
        const hypnoScreen = SHOPPING_ITEMS.find(i => i.name === 'Hypno-Screen');
        expect(hypnoScreen).toBeDefined();
        player.inventory.push(hypnoScreen!);

        timeSystem.endTurn();

        // Hypno-Screen gives 10% bonus (11 total)
        expect(player.happiness).toBe(61);
    });
});
