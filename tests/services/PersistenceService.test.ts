import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PersistenceService } from '../../src/services/PersistenceService';
import { GameStateState } from '../../src/models/types';

describe('PersistenceService', () => {
    const mockState: GameStateState = {
        players: [
            {
                id: 1,
                cash: 1000,
                savings: 500,
                happiness: 50,
                educationLevel: 1,
                careerLevel: 1,
                time: 10,
                location: 'Home',
                hasCar: false,
                loan: 0,
                inventory: [],
                hunger: 0,
                timeDeficit: 0,
                weeklyIncome: 0,
                weeklyExpenses: 0,
                weeklyHappinessChange: 0,
                isAI: false,
                name: 'Player 1'
            }
        ],
        currentPlayerIndex: 0,
        turn: 5,
        gameOver: false,
        winnerId: null,
        log: [],
        isPlayer2AI: false
    };

    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
    });

    it('should save game state to localStorage', () => {
        PersistenceService.saveGame(mockState);
        const saved = localStorage.getItem('jones_fastlane_save');
        expect(saved).toBe(JSON.stringify(mockState));
    });

    it('should load game state from localStorage', () => {
        localStorage.setItem('jones_fastlane_save', JSON.stringify(mockState));
        const loaded = PersistenceService.loadGame();
        expect(loaded).toEqual(mockState);
    });

    it('should return null if no save exists', () => {
        const loaded = PersistenceService.loadGame();
        expect(loaded).toBeNull();
    });

    it('should clear game state from localStorage', () => {
        localStorage.setItem('jones_fastlane_save', JSON.stringify(mockState));
        PersistenceService.clearGame();
        expect(localStorage.getItem('jones_fastlane_save')).toBeNull();
    });

    it('should check if save exists', () => {
        expect(PersistenceService.hasSave()).toBe(false);
        localStorage.setItem('jones_fastlane_save', JSON.stringify(mockState));
        expect(PersistenceService.hasSave()).toBe(true);
    });

    it('should handle errors during save', () => {
        const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
            throw new Error('Quota exceeded');
        });
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        PersistenceService.saveGame(mockState);

        expect(consoleSpy).toHaveBeenCalledWith('Failed to save game state:', expect.any(Error));
        
        setItemSpy.mockRestore();
        consoleSpy.mockRestore();
    });

    it('should handle errors during load', () => {
        vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
            throw new Error('Read error');
        });
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        const loaded = PersistenceService.loadGame();

        expect(loaded).toBeNull();
        expect(consoleSpy).toHaveBeenCalledWith('Failed to load game state:', expect.any(Error));
        
        consoleSpy.mockRestore();
    });
});
