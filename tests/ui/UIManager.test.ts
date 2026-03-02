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
            location: 'Hab-Pod 404',
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
            
            uiManager.showLocationDashboard('Cred-Debt Ctr');
            
            // dashboardSwitched should NOT be published
            expect(spy).not.toHaveBeenCalledWith('dashboardSwitched', expect.anything());
        });

        it('should NOT show dashboard if pendingTurnSummary exists', () => {
            const spy = vi.spyOn(EventBus, 'publish');
            
            mockGameState.pendingTurnSummary = { totalIncome: 100 } as any;
            (uiManager as any).gameState = mockGameState;
            
            uiManager.showLocationDashboard('Cred-Debt Ctr');
            
            expect(spy).not.toHaveBeenCalledWith('dashboardSwitched', expect.anything());
        });

        it('should NOT show dashboard for non-Hab-Pod 404 location if player has no time', () => {
            const spy = vi.spyOn(EventBus, 'publish');
            
            mockPlayer.time = 0;
            mockPlayer.location = 'Cred-Debt Ctr';
            (uiManager as any).gameState = mockGameState;
            
            uiManager.showLocationDashboard('Cred-Debt Ctr');
            
            expect(spy).not.toHaveBeenCalledWith('dashboardSwitched', expect.anything());
        });

        it('SHOULD show dashboard for Hab-Pod 404 even if player has no time', () => {
            const spy = vi.spyOn(EventBus, 'publish');
            
            mockPlayer.time = 0;
            mockPlayer.location = 'Hab-Pod 404';
            (uiManager as any).gameState = mockGameState;
            
            uiManager.showLocationDashboard('Hab-Pod 404');
            
            expect(spy).toHaveBeenCalledWith('dashboardSwitched', { location: 'Hab-Pod 404' });
        });

        it('SHOULD show dashboard if time > 0 and no summary', () => {
            const spy = vi.spyOn(EventBus, 'publish');
            
            mockPlayer.time = 10;
            (uiManager as any).gameState = mockGameState;
            
            uiManager.showLocationDashboard('Cred-Debt Ctr');
            
            expect(spy).toHaveBeenCalledWith('dashboardSwitched', { location: 'Cred-Debt Ctr' });
        });
    });

    describe('handleAutoArrival', () => {
        it('should NOT trigger dashboard if player has no time', () => {
            vi.useFakeTimers();
            const showSpy = vi.spyOn(uiManager, 'showLocationDashboard');
            
            mockPlayer.time = 0;
            mockPlayer.location = 'Cred-Debt Ctr';
            (uiManager as any).gameState = mockGameState;
            (uiManager as any).lastLocation = 'Hab-Pod 404';
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
            mockPlayer.location = 'Cred-Debt Ctr';
            (uiManager as any).gameState = mockGameState;
            (uiManager as any).lastLocation = 'Hab-Pod 404';
            (uiManager as any).lastPlayerId = 1;
            
            (uiManager as any).handleAutoArrival();
            
            vi.advanceTimersByTime(300);
            expect(showSpy).toHaveBeenCalledWith('Cred-Debt Ctr');
            vi.useRealTimers();
        });

        it('SHOULD trigger dashboard when arriving at Hab-Pod 404 mid-turn', () => {
            vi.useFakeTimers();
            const showSpy = vi.spyOn(uiManager, 'showLocationDashboard');
            
            mockPlayer.time = 5;
            mockPlayer.location = 'Hab-Pod 404';
            (uiManager as any).gameState = mockGameState;
            (uiManager as any).lastLocation = 'Cred-Debt Ctr';
            (uiManager as any).lastPlayerId = 1;
            
            (uiManager as any).handleAutoArrival();
            
            vi.advanceTimersByTime(300);
            expect(showSpy).toHaveBeenCalledWith('Hab-Pod 404');
            vi.useRealTimers();
        });
    });

    describe('getLocationActions', () => {
        it('should return "Rest / End Turn" for Hab-Pod 404', () => {
            const actions = uiManager.getLocationActions('Hab-Pod 404');
            expect(actions).toHaveLength(1);
            expect(actions[0].label).toBe('Rest / End Turn');
        });

        it('should return "Work Shift" for Labor Sector', () => {
            const actions = uiManager.getLocationActions('Labor Sector');
            expect(actions).toHaveLength(1);
            expect(actions[0].label).toBe('Work Shift');
        });

        it('should return empty array for Cognitive Re-Ed', () => {
            const actions = uiManager.getLocationActions('Cognitive Re-Ed');
            expect(actions).toHaveLength(0);
        });

        it('should NOT return "Browse Items" for Shopping Mall (redundant)', () => {
            const actions = uiManager.getLocationActions('Shopping Mall');
            const browseAction = actions.find(a => a.label === 'Browse Items');
            expect(browseAction).toBeUndefined();
        });

        it('should NOT return "Browse Menu" for Sustenance Hub (redundant)', () => {
            const actions = uiManager.getLocationActions('Sustenance Hub');
            const browseAction = actions.find(a => a.label === 'Browse Menu');
            expect(browseAction).toBeUndefined();
        });

        it('should return "View Inventory" for Used Car Lot', () => {
            const actions = uiManager.getLocationActions('Used Car Lot');
            expect(actions).toHaveLength(1);
            expect(actions[0].label).toBe('View Inventory');
        });
    });
});
