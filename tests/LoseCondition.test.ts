import { describe, it, expect, beforeEach, vi } from 'vitest';
import GameState from '../src/game/GameState';
import Player from '../src/game/Player';
import EventBus from '../src/EventBus';

describe('Lose Condition Logic', () => {
    let gameState: GameState;
    let player: Player;

    beforeEach(() => {
        gameState = new GameState(1);
        player = gameState.players[0];
    });

    it('should NOT trigger game over on Turn 1 if player has not taken an action', () => {
        player.happiness = 0;
        gameState.checkLoseCondition(player);
        expect(gameState.gameOver).toBe(false);

        player.hunger = 100;
        gameState.checkLoseCondition(player);
        expect(gameState.gameOver).toBe(false);
    });

    it('should trigger game over if happiness reaches 0 after Turn 1 action', () => {
        player.happiness = 0;
        player.time = 23; // Simulate an action taken
        gameState.checkLoseCondition(player);
        expect(gameState.gameOver).toBe(true);
        expect(gameState.winner).toBeNull();
    });

    it('should trigger game over if hunger reaches 100 after Turn 1 action', () => {
        player.hunger = 100;
        player.time = 23; // Simulate an action taken
        gameState.checkLoseCondition(player);
        expect(gameState.gameOver).toBe(true);
        expect(gameState.winner).toBeNull();
    });

    it('should trigger game over if turn is > 1 even if time is 24', () => {
        gameState.turn = 2;
        player.happiness = 0;
        gameState.checkLoseCondition(player);
        expect(gameState.gameOver).toBe(true);
    });

    it('should publish gameOver event when losing', () => {
        const publishSpy = vi.spyOn(EventBus, 'publish');
        player.happiness = 0;
        player.time = 23;
        gameState.checkLoseCondition(player);
        
        expect(publishSpy).toHaveBeenCalledWith('gameOver', gameState);
    });
});
