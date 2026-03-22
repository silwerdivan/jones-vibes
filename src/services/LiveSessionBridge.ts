import GameState from '../game/GameState';
import { GameStateState } from '../models/types';

export const LIVE_SESSION_BRIDGE_KEY = '__JONES_FASTLANE_SESSION__';

export interface LiveSessionBridge {
    getGameStateSnapshot(): GameStateState;
}

declare global {
    interface Window {
        __JONES_FASTLANE_SESSION__?: LiveSessionBridge;
    }
}

export function installLiveSessionBridge(gameState: GameState): void {
    if (typeof window === 'undefined') {
        return;
    }

    window[LIVE_SESSION_BRIDGE_KEY] = {
        getGameStateSnapshot: () => gameState.toJSON(),
    };
}
