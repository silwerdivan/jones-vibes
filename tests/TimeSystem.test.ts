import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import GameState from '../src/game/GameState';
import TimeSystem from '../src/systems/TimeSystem';
import EventBus from '../src/EventBus';

describe('TimeSystem', () => {
    let gameState: GameState;
    let timeSystem: TimeSystem;

    beforeEach(() => {
        vi.useFakeTimers();
        EventBus.clearAll();
        gameState = new GameState(2, false);
        timeSystem = new TimeSystem(gameState);
        gameState.setTimeSystem(timeSystem);
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('should clear UI state when turn ends', () => {
        gameState.activeLocationDashboard = 'Labor Sector';
        gameState.activeChoiceContext = { title: 'Test' };

        timeSystem.endTurn();

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
        player.credits = 100;
        player.burnRate = 150;

        timeSystem.endTurn();

        expect(player.credits).toBe(0);
        expect(player.debt).toBe(55);
        expect(player.hasCondition('SUBSCRIPTION_DEFAULT')).toBe(true);
    });

    it('should apply hunger penalty if hunger is high', () => {
        const player = gameState.getCurrentPlayer();
        player.hunger = 60;
        player.sanity = 50;
        player.credits = 150;

        timeSystem.endTurn();

        // Initial 60 + 20 = 80 (Exhaustion Protocol: -15 Sanity)
        expect(player.hunger).toBe(80);
        // 50 (init) - 15 (exhaustion) - 10 (ambient) + 5 (rest) = 30
        expect(player.sanity).toBe(30);
    });

    it('should apply loan interest if player has a loan', () => {
        const player = gameState.getCurrentPlayer();
        player.loan = 1000;
        player.credits = 150;

        timeSystem.endTurn();

        expect(player.loan).toBe(1100);
    });

    it('should confirm sanity decreases due to net-negative passive loop', () => {
        const player = gameState.getCurrentPlayer();
        player.hunger = 0;
        player.sanity = 50;
        player.credits = 150;

        timeSystem.endTurn();
        // 50 (init) - 10 (ambient) + 5 (rest) = 45
        expect(player.sanity).toBe(45);

        player.hunger = 0;
        player.credits = 150;
        timeSystem.endTurn();
        // 45 - 10 + 5 = 40
        expect(player.sanity).toBe(40);
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

    it('should not auto-finalize the turn again when burnout happens during end-turn condition ticks', () => {
        const player = gameState.getCurrentPlayer();
        const endTurnSpy = vi.spyOn(timeSystem, 'endTurn');
        const tickSpy = vi.spyOn(gameState.eventManager, 'tickConditions').mockImplementation(() => {
            gameState.handleBurnout(player);
        });

        player.credits = 150;

        timeSystem.endTurn();
        vi.advanceTimersByTime(1500);

        expect(tickSpy).toHaveBeenCalled();
        expect(endTurnSpy).toHaveBeenCalledTimes(1);
        expect(gameState.pendingTurnSummary).not.toBeNull();
        expect(player.hasCondition('TRAUMA_REBOOT')).toBe(true);
        expect(gameState.isEndingTurn).toBe(false);
    });
});
