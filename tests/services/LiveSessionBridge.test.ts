import { afterEach, describe, expect, it } from 'vitest';
import GameState from '../../src/game/GameState';
import {
    installLiveSessionBridge,
    LIVE_SESSION_BRIDGE_KEY,
} from '../../src/services/LiveSessionBridge';

describe('LiveSessionBridge', () => {
    afterEach(() => {
        delete window[LIVE_SESSION_BRIDGE_KEY];
    });

    it('exposes the current game state to browser automation', () => {
        const gameState = new GameState(2, true);
        gameState.turn = 7;
        gameState.players[0].credits = 616;

        installLiveSessionBridge(gameState);

        const snapshot = window[LIVE_SESSION_BRIDGE_KEY]?.getGameStateSnapshot();
        expect(snapshot?.turn).toBe(7);
        expect(snapshot?.players[0].credits).toBe(616);
    });

    it('returns fresh snapshots after the live game state changes', () => {
        const gameState = new GameState(1, false);
        installLiveSessionBridge(gameState);

        gameState.players[0].sanity = 35;
        gameState.pendingTurnSummary = {
            player: 1,
            week: 7,
            playerName: 'Player 1',
            events: [],
            totals: {
                creditsChange: -330,
                sanityChange: 20,
            },
        };

        const snapshot = window[LIVE_SESSION_BRIDGE_KEY]?.getGameStateSnapshot();
        expect(snapshot?.players[0].sanity).toBe(35);
        expect(snapshot?.pendingTurnSummary?.week).toBe(7);
        expect(snapshot?.pendingTurnSummary?.totals.sanityChange).toBe(20);
    });
});
