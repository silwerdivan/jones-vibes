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

    it('should increase sanity by 10 without Hypno-Screen', () => {
        const player = gameState.getCurrentPlayer();
        player.sanity = 50;
        player.credits = 150; // Cover Burn Rate
        player.inventory = [];

        timeSystem.endTurn();

        // Baseline: Sanity should stay at 50 because -10 Ambient Stress negates +10 Cycle Rest
        expect(player.sanity).toBe(50);
    });

    it('should increase sanity by 11 with Hypno-Screen', () => {
        const player = gameState.getCurrentPlayer();
        player.sanity = 50;
        player.credits = 225; // Cover Burn Rate + Maintenance
        
        const hypnoScreen = SHOPPING_ITEMS.find(i => i.name === 'Hypno-Screen');
        expect(hypnoScreen).toBeDefined();
        player.inventory.push(hypnoScreen!);

        timeSystem.endTurn();

        // Hypno-Screen gives 10% bonus on Cycle Rest (11 total)
        // Combined with -10 Ambient Stress, net is +1
        expect(player.sanity).toBe(51);
    });
});
