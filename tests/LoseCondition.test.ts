import { describe, it, expect, beforeEach, vi } from 'vitest';
import GameState from '../src/game/GameState';
import Player from '../src/game/Player';
import EventBus from '../src/EventBus';

describe('Lose Condition Logic', () => {
    let gameState: GameState;
    let player: Player;

    beforeEach(() => {
        EventBus.clearAll();
        gameState = new GameState(1);
        player = gameState.players[0];
    });

    it('should NOT trigger game over on Turn 1 if player has not taken an action', () => {
        player.sanity = 0;
        gameState.checkLoseCondition(player);
        expect(gameState.gameOver).toBe(false);

        player.hunger = 100;
        gameState.checkLoseCondition(player);
        expect(gameState.gameOver).toBe(false);
    });

    it('should NOT trigger game over if sanity reaches 0 after Turn 1 action', () => {
        player.time = 23; // Simulate an action taken
        player.updateSanity(-100); // Trigger burnout
        gameState.checkLoseCondition(player);
        expect(gameState.gameOver).toBe(false);
        expect(player.time).toBe(0);
        expect(player.hasCondition('TRAUMA_REBOOT')).toBe(true);
    });

    it('should trigger game over if hunger reaches 100 after Turn 1 action', () => {
        player.time = 23; // Simulate an action taken
        player.hunger = 100;
        gameState.checkLoseCondition(player);
        expect(gameState.gameOver).toBe(true);
        expect(gameState.winner).toBeNull();
    });

    it('should NOT trigger game over on Turn 1 if player has Clause B (30 hours) and still has >= 24 hours', () => {
        player.time = 30; // Clause B active
        player.updateSanity(-100); // Trigger burnout
        gameState.checkLoseCondition(player);
        expect(gameState.gameOver).toBe(false);
        expect(player.time).toBe(0);

        player.time = 25; // Took an action, but still in grace period
        player.hunger = 100;
        gameState.checkLoseCondition(player);
        expect(gameState.gameOver).toBe(false);

        player.time = 23; // Dropped below threshold
        player.hunger = 100;
        gameState.checkLoseCondition(player);
        expect(gameState.gameOver).toBe(true);
    });

    it('should NOT trigger game over if turn is > 1 if sanity is 0', () => {
        gameState.turn = 2;
        player.updateSanity(-100); // Trigger burnout
        gameState.checkLoseCondition(player);
        expect(gameState.gameOver).toBe(false);
        expect(player.time).toBe(0);
    });

    it('should trigger game over if hunger reaches 100 and turn > 1', () => {
        gameState.turn = 2;
        player.hunger = 100;
        gameState.checkLoseCondition(player);
        expect(gameState.gameOver).toBe(true);
    });

    it('should publish gameOver event when losing due to hunger', () => {
        const publishSpy = vi.spyOn(EventBus, 'publish');
        player.hunger = 100;
        player.time = 23;
        gameState.checkLoseCondition(player);
        
        expect(publishSpy).toHaveBeenCalledWith('gameOver', gameState);
    });
});
