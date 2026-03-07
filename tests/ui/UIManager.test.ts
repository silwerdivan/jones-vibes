import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import UIManager from '../../src/ui/UIManager.js';
import EventBus from '../../src/EventBus.js';

describe('UIManager', () => {
    let uiManager: UIManager;
    let mockGameState: any;
    let mockPlayer: any;

    beforeEach(() => {
        EventBus.clearAll();
        document.body.innerHTML = `
            <div class="app-shell">
                <div class="news-ticker"><div id="news-ticker-content"></div></div>
            </div>
            <div id="loading-overlay" class="hidden"></div>
            <div id="choice-modal-overlay" class="hidden location-dashboard-overlay">
                <div id="choice-modal" class="location-dashboard">
                    <div class="swipe-indicator"><div class="swipe-bar"></div></div>
                    <header class="dashboard-header">
                        <div id="modal-clerk-container" class="clerk-container hidden">
                            <div class="clerk-avatar-wrapper"><div id="modal-clerk-avatar" class="clerk-avatar"></div></div>
                            <div class="speech-bubble">
                                <div id="modal-clerk-name" class="clerk-name">Clerk</div>
                                <p id="modal-clerk-message" class="clerk-message">Welcome!</p>
                            </div>
                        </div>
                        <div class="dashboard-header-row">
                            <h2 id="choice-modal-title" class="dashboard-title">Location Name</h2>
                            <button id="choice-modal-close" class="btn btn-icon btn-secondary modal-close-btn"><i class="material-icons">close</i></button>
                        </div>
                    </header>
                    <main class="dashboard-content">
                        <div id="choice-modal-content" class="dashboard-scroll-area"></div>
                        <div id="choice-modal-input" class="hidden bank-input-wrapper"><input type="number" id="modal-input-amount" /></div>
                        <div id="dashboard-secondary-actions" class="secondary-actions-row"></div>
                    </main>
                    <footer class="dashboard-footer"><div id="choice-modal-buttons" class="primary-actions-row"></div></footer>
                </div>
            </div>
            <div id="player-stats-modal-overlay" class="hidden"><div id="player-stats-modal"><button id="player-stats-modal-close"></button></div></div>
            <div id="intel-terminal-overlay" class="hidden"><button id="intel-terminal-close"></button><div><div id="terminal-entries"></div></div></div>
            <div id="turn-summary-modal" class="hidden"><div id="event-list"></div><div id="summary-subtitle"></div><div id="summary-credits-total"></div><div id="summary-sanity-total"></div><button id="btn-start-next-week"></button></div>
            <div id="graduation-modal" class="hidden"><div id="graduation-subtitle"></div><div id="graduated-degree-name"></div><div id="graduation-reward-text"></div><button id="btn-graduation-dismiss"></button></div>
        `;

        mockPlayer = {
            id: 1,
            location: 'Hab-Pod 404',
            time: 24,
            isAI: false,
            debt: 0,
            careerLevel: 0,
            wageMultiplier: 1
        };

        mockGameState = {
            getCurrentPlayer: vi.fn(() => mockPlayer),
            pendingTurnSummary: null,
            activeScreenId: 'city',
            activeLocationDashboard: null,
            activeChoiceContext: null,
            activeEvent: null,
            isAIThinking: false,
            players: [mockPlayer],
            log: []
        };

        uiManager = new UIManager();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('does not show a dashboard while a summary is open', () => {
        const spy = vi.spyOn(EventBus, 'publish');
        (uiManager as any).isSummaryShown = true;
        (uiManager as any).gameState = mockGameState;

        uiManager.showLocationDashboard('Cred-Debt Ctr');
        expect(spy).not.toHaveBeenCalledWith('dashboardSwitched', expect.anything());
    });

    it('allows Hab-Pod 404 to open even when time is depleted', () => {
        const spy = vi.spyOn(EventBus, 'publish');
        mockPlayer.time = 0;
        mockPlayer.location = 'Hab-Pod 404';
        (uiManager as any).gameState = mockGameState;

        uiManager.showLocationDashboard('Hab-Pod 404');
        expect(spy).toHaveBeenCalledWith('dashboardSwitched', { location: 'Hab-Pod 404' });
    });

    it('renders segmented Labor Sector panels with jobs first', () => {
        mockPlayer.time = 10;
        mockPlayer.location = 'Labor Sector';
        (uiManager as any).gameState = mockGameState;

        uiManager.showLocationDashboard('Labor Sector');

        const content = document.getElementById('choice-modal-content')!;
        expect(content.querySelector('.labor-sector-tab[data-tab="jobs"]')?.classList.contains('active')).toBe(true);
        expect(content.querySelector('.labor-sector-tab[data-tab="hustles"]')?.classList.contains('active')).toBe(false);
        expect(content.querySelector('.labor-sector-panel[data-panel="jobs"]')?.classList.contains('hidden')).toBe(false);
        expect(content.querySelector('.labor-sector-panel[data-panel="hustles"]')?.classList.contains('hidden')).toBe(true);
    });

    it('does not expose Work Shift as a secondary location action for Labor Sector', () => {
        const actions = uiManager.getLocationActions('Labor Sector');
        expect(actions).toHaveLength(0);
    });

    it('keeps View Inventory as the Mobility-Asset action', () => {
        const actions = uiManager.getLocationActions('Mobility-Asset');
        expect(actions).toHaveLength(1);
        expect(actions[0].label).toBe('View Inventory');
    });
    it('preserves the active dashboard when a random event modal closes', () => {
        const spy = vi.spyOn(EventBus, 'publish');
        mockPlayer.location = 'Labor Sector';
        mockGameState.activeLocationDashboard = 'Labor Sector';
        mockGameState.activeEvent = { id: 'local_fastfood_glitch' };
        (uiManager as any).gameState = mockGameState;

        uiManager.showRandomEventModal({
            title: 'Broken Auto-Chef',
            flavorText: 'Test event',
            choices: [{ text: 'Take it' }]
        }, vi.fn());

        (uiManager as any).choiceModal.hide();

        expect(spy).not.toHaveBeenCalledWith('dashboardSwitched', { location: null });
    });
});


