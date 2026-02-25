import { GameStateState } from '../models/types';

const SAVE_KEY = 'jones_fastlane_save';

/**
 * Service to handle persistence of game state to localStorage.
 */
export class PersistenceService {
    /**
     * Saves the current game state to localStorage.
     * @param state The serializable game state.
     */
    static saveGame(state: GameStateState): void {
        try {
            const serializedState = JSON.stringify(state);
            localStorage.setItem(SAVE_KEY, serializedState);
        } catch (error) {
            console.error('Failed to save game state:', error);
        }
    }

    /**
     * Loads the game state from localStorage.
     * @returns The parsed game state or null if no save exists.
     */
    static loadGame(): GameStateState | null {
        try {
            const serializedState = localStorage.getItem(SAVE_KEY);
            if (!serializedState) return null;
            return JSON.parse(serializedState) as GameStateState;
        } catch (error) {
            console.error('Failed to load game state:', error);
            return null;
        }
    }

    /**
     * Removes the saved game state from localStorage.
     */
    static clearGame(): void {
        try {
            localStorage.removeItem(SAVE_KEY);
        } catch (error) {
            console.error('Failed to clear game state:', error);
        }
    }

    /**
     * Checks if a saved game exists in localStorage.
     * @returns True if a save exists, false otherwise.
     */
    static hasSave(): boolean {
        try {
            return localStorage.getItem(SAVE_KEY) !== null;
        } catch (error) {
            return false;
        }
    }
}
