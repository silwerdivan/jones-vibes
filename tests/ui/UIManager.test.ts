import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import UIManager from '../../src/ui/UIManager.js';
import GameState from '../../src/game/GameState.js';
import Player from '../../src/game/Player.js';
import EventBus from '../../src/EventBus.js';

describe('UIManager', () => {
    let uiManager: UIManager;
    let mockGameState: any;
    let mockPlayer: any;

    beforeEach(() => {
        // Setup DOM
        document.body.innerHTML = `
            <div class="app-shell">
                <div class="news-ticker">
                    <div id="news-ticker-content"></div>
                </div>
            </div>
            <div id="loading-overlay" class="hidden"></div>
        `;

        // Mock GameState and Player
        mockPlayer = {
            id: 1,
            location: 'Home',
            time: 24,
            isAI: false
        };

        mockGameState = {
            getCurrentPlayer: vi.fn(() => mockPlayer),
            pendingTurnSummary: null,
            activeScreenId: 'city',
            activeLocationDashboard: null,
            activeChoiceContext: null,
            isAIThinking: false,
            players: [mockPlayer],
            log: []
        };

        // Instantiate UIManager
        uiManager = new UIManager();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('showLocationDashboard', () => {
        it('should NOT show dashboard if isSummaryShown is true', () => {
            const spy = vi.spyOn(EventBus, 'publish');
            
            // Access private property for testing
            (uiManager as any).isSummaryShown = true;
            (uiManager as any).gameState = mockGameState;
            
            uiManager.showLocationDashboard('Bank');
            
            // dashboardSwitched should NOT be published
            expect(spy).not.toHaveBeenCalledWith('dashboardSwitched', expect.anything());
        });

        it('should NOT show dashboard if pendingTurnSummary exists', () => {
            const spy = vi.spyOn(EventBus, 'publish');
            
            mockGameState.pendingTurnSummary = { totalIncome: 100 } as any;
            (uiManager as any).gameState = mockGameState;
            
            uiManager.showLocationDashboard('Bank');
            
            expect(spy).not.toHaveBeenCalledWith('dashboardSwitched', expect.anything());
        });

        it('should NOT show dashboard for non-Home location if player has no time', () => {
            const spy = vi.spyOn(EventBus, 'publish');
            
            mockPlayer.time = 0;
            mockPlayer.location = 'Bank';
            (uiManager as any).gameState = mockGameState;
            
            uiManager.showLocationDashboard('Bank');
            
            expect(spy).not.toHaveBeenCalledWith('dashboardSwitched', expect.anything());
        });

        it('SHOULD show dashboard for Home even if player has no time', () => {
            const spy = vi.spyOn(EventBus, 'publish');
            
            mockPlayer.time = 0;
            mockPlayer.location = 'Home';
            (uiManager as any).gameState = mockGameState;
            
            uiManager.showLocationDashboard('Home');
            
            expect(spy).toHaveBeenCalledWith('dashboardSwitched', { location: 'Home' });
        });

        it('SHOULD show dashboard if time > 0 and no summary', () => {
            const spy = vi.spyOn(EventBus, 'publish');
            
            mockPlayer.time = 10;
            (uiManager as any).gameState = mockGameState;
            
            uiManager.showLocationDashboard('Bank');
            
            expect(spy).toHaveBeenCalledWith('dashboardSwitched', { location: 'Bank' });
        });
    });

    describe('handleAutoArrival', () => {
        it('should NOT trigger dashboard if player has no time', () => {
            vi.useFakeTimers();
            const showSpy = vi.spyOn(uiManager, 'showLocationDashboard');
            
            mockPlayer.time = 0;
            mockPlayer.location = 'Bank';
            (uiManager as any).gameState = mockGameState;
            (uiManager as any).lastLocation = 'Home';
            (uiManager as any).lastPlayerId = 1;
            
            (uiManager as any).handleAutoArrival();
            
            vi.runAllTimers();
            expect(showSpy).not.toHaveBeenCalled();
            vi.useRealTimers();
        });

        it('SHOULD trigger dashboard if player has time and moved to new location', () => {
            vi.useFakeTimers();
            const showSpy = vi.spyOn(uiManager, 'showLocationDashboard');
            
            mockPlayer.time = 5;
            mockPlayer.location = 'Bank';
            (uiManager as any).gameState = mockGameState;
            (uiManager as any).lastLocation = 'Home';
            (uiManager as any).lastPlayerId = 1;
            
            (uiManager as any).handleAutoArrival();
            
            vi.advanceTimersByTime(300);
            expect(showSpy).toHaveBeenCalledWith('Bank');
            vi.useRealTimers();
        });

        it('SHOULD trigger dashboard when arriving at Home mid-turn', () => {
            vi.useFakeTimers();
            const showSpy = vi.spyOn(uiManager, 'showLocationDashboard');
            
            mockPlayer.time = 5;
            mockPlayer.location = 'Home';
            (uiManager as any).gameState = mockGameState;
            (uiManager as any).lastLocation = 'Bank';
            (uiManager as any).lastPlayerId = 1;
            
            (uiManager as any).handleAutoArrival();
            
            vi.advanceTimersByTime(300);
            expect(showSpy).toHaveBeenCalledWith('Home');
            vi.useRealTimers();
        });
    });
});
