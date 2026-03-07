import { describe, it, expect, beforeEach, vi } from 'vitest';
import GameState from '../src/game/GameState';
import Player from '../src/game/Player';
import { HUSTLES } from '../src/data/hustles';
import EventBus, { UI_EVENTS, STATE_EVENTS } from '../src/EventBus';

describe('Hustle System', () => {
    let gameState: GameState;
    let player: Player;

    beforeEach(() => {
        gameState = new GameState(1);
        player = gameState.getCurrentPlayer();
        player.setLocation('Labor Sector');
        player.setTime(24);
        player.updateSanity(100);
        player.credits = 100;
        
        // Mock Math.random to avoid flaky risk checks
        vi.spyOn(Math, 'random').mockReturnValue(0.5); // 0.5 is safe for 0.15 risk
    });

    it('should execute a hustle successfully', () => {
        const hustle = HUSTLES[0]; // Donate Blood-Plasma: 50 reward, 5 sanity cost, 2 time cost
        const initialCredits = player.credits;
        const initialSanity = player.sanity;
        const initialTime = player.time;

        const result = gameState.executeHustle(hustle.id);

        expect(result).toBe(true);
        expect(player.credits).toBe(initialCredits + hustle.reward);
        expect(player.sanity).toBe(initialSanity - hustle.sanityCost);
        expect(player.time).toBe(initialTime - hustle.timeCost);
    });

    it('should fail if not in Labor Sector', () => {
        player.setLocation('Hab-Pod 404');
        const hustle = HUSTLES[0];
        
        const result = gameState.executeHustle(hustle.id);
        
        expect(result).toBe(false);
    });

    it('should fail if insufficient time', () => {
        player.setTime(1);
        const hustle = HUSTLES[0]; // Costs 2
        
        const result = gameState.executeHustle(hustle.id);
        
        expect(result).toBe(false);
    });

    it('should trigger consequence when risk is hit', () => {
        const hustle = HUSTLES[0]; // Donate Blood-Plasma: 0.15 risk
        vi.spyOn(Math, 'random').mockReturnValue(0.01); // Risk hit!
        
        const triggerSpy = vi.spyOn(gameState.eventManager, 'triggerEventById');
        
        gameState.executeHustle(hustle.id);
        
        expect(triggerSpy).toHaveBeenCalledWith(hustle.consequenceId, gameState);
    });

    it('should publish state change events', () => {
        const hustle = HUSTLES[0];
        const publishSpy = vi.spyOn(EventBus, 'publish');
        
        gameState.executeHustle(hustle.id);
        
        expect(publishSpy).toHaveBeenCalledWith(STATE_EVENTS.CREDITS_CHANGED, expect.anything());
        expect(publishSpy).toHaveBeenCalledWith(STATE_EVENTS.TIME_CHANGED, expect.anything());
        expect(publishSpy).toHaveBeenCalledWith(STATE_EVENTS.SANITY_CHANGED, expect.anything());
    });
});
