import EventBus, { UI_EVENTS } from '../EventBus.js';
import { JOBS } from '../data/jobs.js';
import { HUSTLES } from '../data/hustles.js';
import { COURSES } from '../data/courses.js';
import { CLERKS } from '../data/clerks.js';
import { SHOPPING_ITEMS } from '../data/items.js';
import Icons from './Icons.js';
import GameState from '../game/GameState.js';
import { ChoiceModal, PlayerStatsModal, IntelTerminalModal, TurnSummaryModal, GraduationModal } from './components/Modal.js';
import HUD from './components/HUD.js';
import CollegeDashboard from './components/CollegeDashboard.js';
import ScreenManager from './components/screens/ScreenManager.js';
import CityScreen from './components/screens/CityScreen.js';
import LifeScreen from './components/screens/LifeScreen.js';
import InventoryScreen from './components/screens/InventoryScreen.js';
import PlaceholderScreen from './components/screens/PlaceholderScreen.js';
import SystemScreen from './components/screens/SystemScreen.js';
import { createActionCardList } from './components/shared/ActionCard.js';
import { TurnSummary, Choice, LocationAction, Item, Course, Job, Clerk, Hustle } from '../models/types.js';
import { PersistenceService } from '../services/PersistenceService.js';

type ClerkRegistry = Record<string, Clerk>;

class UIManager {
    // Components
    private hud: HUD;
    private collegeDashboard: CollegeDashboard;
    private screenManager: ScreenManager;
    private cityScreen: CityScreen;
    private lifeScreen: LifeScreen;
    private inventoryScreen: InventoryScreen;
    private socialScreen: PlaceholderScreen;
    private menuScreen: SystemScreen;

    // Modals
    private choiceModal: ChoiceModal;
    private playerStatsModal: PlayerStatsModal;
    private intelTerminalModal: IntelTerminalModal;
    private turnSummaryModal: TurnSummaryModal;
    private graduationModal: GraduationModal;

    // State
    private gameState: GameState | null = null;
    private lastLocation: string | null = null;
    private lastPlayerId: number | null = null;
    private isSummaryShown: boolean = false;
    private dashboardToRestoreAfterEvent: string | null = null;
    private isRandomEventModalOpen: boolean = false;
    private loadingOverlay: HTMLElement | null;
    private trackedTimeouts: number[] = [];

    constructor() {
        // Initialize components
        this.hud = new HUD();
        this.collegeDashboard = new CollegeDashboard();
        this.screenManager = new ScreenManager();
        this.cityScreen = new CityScreen();
        this.lifeScreen = new LifeScreen();
        this.inventoryScreen = new InventoryScreen();
        this.socialScreen = new PlaceholderScreen('Social Feed', 'Comms system offline. Re-establishing connection with the grid...');
        this.menuScreen = new SystemScreen();

        // Mount HUD
        const appShell = document.querySelector('.app-shell') as HTMLElement;
        const newsTicker = document.querySelector('.news-ticker');
        const newsTickerContent = document.getElementById('news-ticker-content');
        if (appShell) {
            this.hud.mount(appShell);
            if (newsTicker && this.hud.getElement().parentElement === appShell) {
                appShell.insertBefore(this.hud.getElement(), newsTicker);
            }
        }
        if (newsTickerContent) {
            this.hud.setNewsTickerContent(newsTickerContent);
        }

        // Mount ScreenManager to app-shell (replaces the old content-area and tab-bar)
        if (appShell) {
            // Remove old content-area and tab-bar if they exist
            const oldContentArea = appShell.querySelector('.content-area');
            const oldTabBar = appShell.querySelector('.tab-bar');
            if (oldContentArea) oldContentArea.remove();
            if (oldTabBar) oldTabBar.remove();
            
            // Mount ScreenManager after news-ticker
            if (newsTicker) {
                newsTicker.after(this.screenManager.getElement());
            } else {
                this.screenManager.mount(appShell);
            }
        }

        this.screenManager.registerScreen('city', this.cityScreen);
        this.screenManager.registerScreen('life', this.lifeScreen);
        this.screenManager.registerScreen('inventory', this.inventoryScreen);
        this.screenManager.registerScreen('social', this.socialScreen);
        this.screenManager.registerScreen('menu', this.menuScreen);

        // Register tabs
        this.screenManager.registerTab('city', 'cityGrid', 'City');
        this.screenManager.registerTab('life', 'bioMetrics', 'Life');
        this.screenManager.registerTab('inventory', 'cyberDeck', 'Items');
        this.screenManager.registerTab('social', 'comms', 'Social');
        this.screenManager.registerTab('menu', 'system', 'Menu');

        // Set tab icons
        this.screenManager.setTabIcon('city', Icons.cityGrid(20, 'rgba(255, 255, 255, 0.5)'));
        this.screenManager.setTabIcon('life', Icons.bioMetrics(20, 'rgba(255, 255, 255, 0.5)'));
        this.screenManager.setTabIcon('inventory', Icons.cyberDeck(20, 'rgba(255, 255, 255, 0.5)'));
        this.screenManager.setTabIcon('social', Icons.comms(20, 'rgba(255, 255, 255, 0.5)'));
        this.screenManager.setTabIcon('menu', Icons.system(20, 'rgba(255, 255, 255, 0.5)'));

        // Initialize modals
        this.choiceModal = new ChoiceModal();
        this.playerStatsModal = new PlayerStatsModal();
        this.intelTerminalModal = new IntelTerminalModal();
        this.turnSummaryModal = new TurnSummaryModal();
        this.graduationModal = new GraduationModal();

        this.loadingOverlay = document.getElementById('loading-overlay');

        // Subscribe to events
        this.subscribeToEvents();

        // Listen for showLocationDashboard from CityScreen
        EventBus.subscribe('showLocationDashboard', (location: string) => {
            this.showLocationDashboard(location);
        });
    }

    private isRehydrated: boolean = false;

    private rehydrate(gameState: GameState): void {
        console.log('Rehydrating UI from state...');
        
        // 1. Restore active screen
        if (gameState.activeScreenId) {
            this.switchScreen(gameState.activeScreenId);
        }

        // 2. Restore active location dashboard
        if (gameState.activeLocationDashboard) {
            this.showLocationDashboard(gameState.activeLocationDashboard);
        }

        // 3. Restore active choice modal
        if (gameState.activeChoiceContext) {
            this.showChoiceModal(gameState.activeChoiceContext);
        }

        // 4. Restore active graduation modal
        if (gameState.activeGraduation) {
            this.graduationModal.showGraduation(gameState.activeGraduation.player, gameState.activeGraduation.course);
        }

        // 5. Restore AI thinking state
        if (gameState.isAIThinking) {
            this.showLoading();
        }
    }

    private setTrackedTimeout(callback: () => void, delay: number): void {
        const timeoutId = window.setTimeout(() => {
            this.trackedTimeouts = this.trackedTimeouts.filter(id => id !== timeoutId);
            callback();
        }, delay);
        this.trackedTimeouts.push(timeoutId);
    }

    private clearTrackedTimeouts(): void {
        this.trackedTimeouts.forEach(id => window.clearTimeout(id));
        this.trackedTimeouts = [];
    }

    private subscribeToEvents(): void {
        EventBus.subscribe('aiThinkingStart', () => this.showLoading());
        EventBus.subscribe('aiThinkingEnd', () => this.hideLoading());

        EventBus.subscribe('modalHidden', (data: { modalId: string }) => {
            if (data.modalId === 'choice-modal-overlay') {
                this.clearTrackedTimeouts();
                this.choiceModal.setExtraClass(null);
                this.choiceModal.showCancelButton(true);
                const shouldPreserveDashboard = this.isRandomEventModalOpen;
                this.isRandomEventModalOpen = false;
                if (!shouldPreserveDashboard) {
                    this.dashboardToRestoreAfterEvent = null;
                    EventBus.publish('dashboardSwitched', { location: null });
                }
                EventBus.publish('choiceModalSwitched', null);
            }
        });

        EventBus.subscribe('stateChanged', (gameState: GameState) => {
            this.gameState = gameState;

            // Perform one-time rehydration if we haven't yet
            if (!this.isRehydrated) {
                this.isRehydrated = true;
                this.rehydrate(gameState);
            }

            // Handle modal visibility based on state for live updates
            // If both are null, it means no dashboard or choice modal should be open
            if (!gameState.activeLocationDashboard && !gameState.activeChoiceContext && !gameState.activeEvent) {
                if (this.choiceModal.isVisible()) {
                    this.hideModal();
                }
            }

            // Re-open the location dashboard after random events once the modal is gone.
            if (!this.choiceModal.isVisible() && !gameState.activeEvent && !gameState.pendingTurnSummary && !this.isSummaryShown) {
                const dashboardToShow = gameState.activeLocationDashboard || this.dashboardToRestoreAfterEvent;
                if (dashboardToShow) {
                    this.dashboardToRestoreAfterEvent = null;
                    this.isRandomEventModalOpen = false;
                    this.showLocationDashboard(dashboardToShow);
                }
            }

            // Components now auto-update via granular event subscriptions
            // Only handle auto-arrival and pending summary logic here
            this.handleAutoArrival();

            if (gameState.pendingTurnSummary && !this.isSummaryShown) {
                const currentPlayer = gameState.getCurrentPlayer();
                if (!currentPlayer.isAI) {
                    this.showTurnSummary(gameState.pendingTurnSummary);
                }
            }
        });

        EventBus.subscribe('turnEnded', (summary: TurnSummary) => {
            const currentPlayer = this.gameState!.getCurrentPlayer();
            if (!currentPlayer.isAI) {
                this.showTurnSummary(summary);
            } else {
                // Auto-advance for AI turns after a brief delay
                setTimeout(() => {
                    EventBus.publish(UI_EVENTS.ADVANCE_TURN);
                }, 500);
            }
        });

        EventBus.subscribe('graduation', (data: { player: any, course: any }) => {
            if (!data.player.isAI) {
                this.graduationModal.showGraduation(data.player, data.course);
            }
        });

        EventBus.subscribe('showPlayerStats', (playerIndex: number) => this.showPlayerStatsModal(playerIndex));
        EventBus.subscribe('showIntelTerminal', () => this.showIntelTerminal());

        EventBus.subscribe('randomEventTriggered', (data: { event: any, callback: (choiceIndex: number) => void }) => {
            this.showRandomEventModal(data.event, data.callback);
        });

        EventBus.subscribe(UI_EVENTS.RESTART_GAME, () => {
            this.choiceModal.setupClerk(null, this.gameState!);
            this.choiceModal.clearContent();
            this.choiceModal.showInput(false);
            
            this.choiceModal.addPrimaryButton('Restart', () => {
                PersistenceService.clearGame();
                window.location.reload();
            });
            
            this.choiceModal.addSecondaryButton('Cancel', 'close', false, () => {
                this.choiceModal.hide();
            });
            
            this.choiceModal.show({ title: 'Restart Simulation?' });
        });

        EventBus.subscribe('addToLog', () => {
            EventBus.publish(UI_EVENTS.REQUEST_STATE_REFRESH);
        });
    }

    showIntelTerminal() {
        if (!this.gameState) return;
        this.intelTerminalModal.updateEntries(this.gameState.log);
        this.intelTerminalModal.show();
    }

    hideIntelTerminal() {
        this.intelTerminalModal.hide();
    }

    showChoiceModal({ title, choices, showInput = false }: { title: string, choices: Choice[], showInput?: boolean }) {
        const location = this.gameState ? this.gameState.getCurrentPlayer().location : null;
        const clerk = location ? (CLERKS as ClerkRegistry)[location] : null;

        // Publish event for persistence
        EventBus.publish('choiceModalSwitched', { title, choices, showInput });

        this.choiceModal.setupClerk(clerk, this.gameState!);
        this.choiceModal.clearContent();
        this.choiceModal.showInput(showInput);

        if (location === 'Consumpt-Zone' || location === 'Sustenance Hub' || location === 'Ripperdoc Clinic') {
            const filteredItems = SHOPPING_ITEMS.filter(item => item.location === location);
            this.renderActionCards('shopping', filteredItems);
                } else if (location === 'Cognitive Re-Ed') {
                    this.collegeDashboard.render(this.gameState!);
                    this.choiceModal.setContent(this.collegeDashboard.getElement());
                } else {
                    choices.forEach(choice => {                this.choiceModal.addPrimaryButton(choice.text, (amount) => {
                    this.choiceModal.hide();
                    if (choice.actionId) {
                        const payload = (choice.value !== undefined && choice.value !== null) ? choice.value : amount;
                        EventBus.publish(UI_EVENTS[choice.actionId], payload);
                    } else if (choice.action) {
                        choice.action(choice.value, amount);
                    }
                });
            });
        }

        this.choiceModal.show({ title });
    }

    showLocationDashboard(location: string) {
        if (!this.gameState) return;

        // Skip showing the dashboard if a summary or event is active
        if (this.isSummaryShown || this.gameState.pendingTurnSummary || this.gameState.activeEvent) {
            return;
        }

        const player = this.gameState.getCurrentPlayer();
        
        // For locations other than 'Home', skip showing the dashboard if the player has no time remaining.
        // This prevents "flashing" the clerk view right before the auto-end turn logic kicks in.
        if (location !== 'Hab-Pod 404' && player.time <= 0) {
            return;
        }

        // Publish event for persistence
        EventBus.publish('dashboardSwitched', { location });

        this.choiceModal.setExtraClass('location-dashboard');

        const clerk = (CLERKS as ClerkRegistry)[location];

        this.choiceModal.setupClerk(clerk, this.gameState!);
        this.choiceModal.clearContent();
        this.choiceModal.showInput(false);

        if (location === 'Labor Sector') {
            this.choiceModal.setContent(this.createLaborSectorDashboard(player));
        } else if (location === 'Cognitive Re-Ed') {
            this.collegeDashboard.render(this.gameState!);
            this.choiceModal.setContent(this.collegeDashboard.getElement());
        } else if (location === 'Consumpt-Zone' || location === 'Sustenance Hub' || location === 'Ripperdoc Clinic') {
            const filteredItems = SHOPPING_ITEMS.filter(item => item.location === location);
            this.renderActionCards('shopping', filteredItems);
        }

        const actions = this.getLocationActions(location);
        actions.forEach(action => {
            this.choiceModal.addSecondaryButton(action.label, action.icon, action.primary, (e) => {
                this.choiceModal.hide();
                action.onClick(e);
            }, action.className);
        });

        if (location === 'Cred-Debt Ctr') {
            this.choiceModal.showInput(true);

            const bankActions = [
                { text: 'Deposit', value: 'deposit', action: (amount: number) => EventBus.publish(UI_EVENTS.BANK_DEPOSIT, amount) },
                { text: 'Withdraw', value: 'withdraw', action: (amount: number) => EventBus.publish(UI_EVENTS.BANK_WITHDRAW, amount) },
                { text: 'Take Loan', value: 'loan', action: (amount: number) => EventBus.publish(UI_EVENTS.BANK_LOAN, amount) },
                { text: 'Repay Loan', value: 'repay', action: (amount: number) => EventBus.publish(UI_EVENTS.BANK_REPAY, amount) }
            ];

            if (player.debt > 0) {
                bankActions.push({ 
                    text: 'Pay Debt', 
                    value: 'pay_debt', 
                    action: (amount: number) => EventBus.publish(UI_EVENTS.BANK_PAY_DEBT, amount) 
                });
            }

            bankActions.forEach(choice => {
                this.choiceModal.addSecondaryButton(choice.text, 'payments', false, (e) => {
                    const amount = this.choiceModal.getInputValue();

                    if (choice.value === 'deposit' || choice.value === 'repay' || choice.value === 'pay_debt') {
                        this.spawnFeedback(e.currentTarget as HTMLElement, `-₡${amount}`, 'error');
                    } else {
                        this.spawnFeedback(e.currentTarget as HTMLElement, `+₡${amount}`, 'success');
                    }

                    choice.action(amount);
                    this.setTrackedTimeout(() => {
                        if (this.gameState?.activeLocationDashboard === 'Cred-Debt Ctr') {
                            this.showLocationDashboard('Cred-Debt Ctr');
                        }
                    }, 100);
                });
            });
        }

        this.choiceModal.show({ title: location });
    }

    private createLaborSectorDashboard(player: any): HTMLElement {
        const container = document.createElement('div');
        container.className = 'labor-sector-dashboard';

        const segmented = document.createElement('div');
        segmented.className = 'labor-sector-segmented';

        const jobsTab = document.createElement('button');
        jobsTab.type = 'button';
        jobsTab.className = 'labor-sector-tab active';
        jobsTab.dataset.tab = 'jobs';
        jobsTab.textContent = 'Jobs';

        const hustlesTab = document.createElement('button');
        hustlesTab.type = 'button';
        hustlesTab.className = 'labor-sector-tab';
        hustlesTab.dataset.tab = 'hustles';
        hustlesTab.textContent = 'Hustles';

        segmented.appendChild(jobsTab);
        segmented.appendChild(hustlesTab);
        container.appendChild(segmented);

        const panels = document.createElement('div');
        panels.className = 'labor-sector-panels';

        const jobsPanel = document.createElement('section');
        jobsPanel.className = 'labor-sector-panel';
        jobsPanel.dataset.panel = 'jobs';
        jobsPanel.appendChild(this.createWorkShiftCard(player));

        const jobsHeader = document.createElement('h3');
        jobsHeader.className = 'dashboard-section-header';
        jobsHeader.textContent = 'Career Protocols';
        jobsPanel.appendChild(jobsHeader);

        const jobCards = this.renderActionCardList('jobs', JOBS);
        jobCards.classList.add('labor-list');
        jobsPanel.appendChild(jobCards);

        const hustlesPanel = document.createElement('section');
        hustlesPanel.className = 'labor-sector-panel hidden';
        hustlesPanel.dataset.panel = 'hustles';

        const hustlesHeader = document.createElement('h3');
        hustlesHeader.className = 'dashboard-section-header';
        hustlesHeader.textContent = 'Unsanctioned Hustles';
        hustlesPanel.appendChild(hustlesHeader);

        const hustlesHint = document.createElement('p');
        hustlesHint.className = 'labor-sector-hint';
        hustlesHint.textContent = 'Shorter than a full shift. Better burst credits, worse sanity and risk.';
        hustlesPanel.appendChild(hustlesHint);

        const currentTurn = this.gameState?.turn || 1;
        const availableHustles = HUSTLES.filter(hustle => {
            if (hustle.availabilityChance === undefined) return true;
            // Simple deterministic check based on turn + string length
            const pseudoRandom = (Math.sin(currentTurn * 12.9898 + hustle.id.length * 78.233) * 43758.5453) % 1;
            const positiveRandom = Math.abs(pseudoRandom);
            return positiveRandom < hustle.availabilityChance;
        });

        const hustleCards = this.renderActionCardList('hustles', availableHustles);
        hustleCards.classList.add('labor-list');
        hustlesPanel.appendChild(hustleCards);

        panels.appendChild(jobsPanel);
        panels.appendChild(hustlesPanel);
        container.appendChild(panels);

        const togglePanel = (target: 'jobs' | 'hustles') => {
            jobsTab.classList.toggle('active', target === 'jobs');
            hustlesTab.classList.toggle('active', target === 'hustles');
            jobsPanel.classList.toggle('hidden', target !== 'jobs');
            hustlesPanel.classList.toggle('hidden', target !== 'hustles');
        };

        jobsTab.addEventListener('click', () => togglePanel('jobs'));
        hustlesTab.addEventListener('click', () => togglePanel('hustles'));

        return container;
    }

    private createWorkShiftCard(player: any): HTMLElement {
        const card = document.createElement('section');
        card.className = 'labor-shift-card';

        const currentJob = JOBS.find(job => job.level === player.careerLevel) || null;
        if (!currentJob) {
            card.innerHTML = `
                <div>
                    <p class="labor-sector-kicker">CURRENT SHIFT</p>
                    <h3 class="labor-sector-title">No active job yet.</h3>
                    <p class="labor-sector-hint">Apply for a role below to unlock repeatable shift income.</p>
                </div>
            `;

            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'btn btn-secondary labor-shift-button';
            button.disabled = true;
            button.textContent = 'Secure a Job First';
            card.appendChild(button);
            return card;
        }

        const earnings = Math.round(currentJob.wage * currentJob.shiftHours * player.wageMultiplier);
        card.innerHTML = `
            <div>
                <p class="labor-sector-kicker">CURRENT SHIFT</p>
                <h3 class="labor-sector-title">${currentJob.title}</h3>
                <p class="labor-sector-hint">${currentJob.shiftHours}CH shift. Projected payout: +₡${earnings}.</p>
            </div>
        `;

        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'btn btn-primary labor-shift-button';
        button.innerHTML = '<i class="material-icons">work</i><span>Work Shift</span>';
        button.addEventListener('click', (e) => {
            this.spawnFeedback(e.currentTarget as HTMLElement, `+₡${earnings}`, 'success');
            EventBus.publish(UI_EVENTS.WORK_SHIFT);
            this.setTrackedTimeout(() => {
                if (this.gameState?.activeLocationDashboard === 'Labor Sector') {
                    this.showLocationDashboard('Labor Sector');
                }
            }, 1000);
        });
        card.appendChild(button);

        return card;
    }

    spawnFeedback(element: HTMLElement, text: string, type: string) {
        const rect = element.getBoundingClientRect();
        const particle = document.createElement('div');
        particle.className = `feedback-particle log-${type}`;
        particle.textContent = text;
        particle.style.left = `${rect.left + rect.width / 2}px`;
        particle.style.top = `${rect.top}px`;
        document.body.appendChild(particle);
        setTimeout(() => particle.remove(), 800);
    }

    hideModal() {
        this.clearTrackedTimeouts();
        this.choiceModal.hide();
    }

    showJobApplicationModal() {
        this.showLocationDashboard('Labor Sector');
    }

    private renderActionCardList(type: 'jobs' | 'college' | 'shopping' | 'hustles', data: any[]): HTMLElement {
        const player = this.gameState ? this.gameState.getCurrentPlayer() : null;
        
        return createActionCardList(type, data, {
            player,
            onClick: (item, feedbackText, feedbackType) => {
                const cardElement = document.activeElement as HTMLElement;
                if (cardElement) {
                    this.spawnFeedback(cardElement.closest('.action-card') as HTMLElement, feedbackText, feedbackType);
                }
                
                if (type === 'jobs') {
                    const job = item as Job;
                    EventBus.publish(UI_EVENTS.APPLY_JOB, job.level);
                    this.setTrackedTimeout(() => {
                        if (this.gameState?.activeLocationDashboard === 'Labor Sector') {
                            this.showLocationDashboard('Labor Sector');
                        }
                    }, 100);
                } else if (type === 'hustles') {
                    const hustle = item as Hustle;
                    EventBus.publish(UI_EVENTS.HUSTLE_EXECUTE, hustle.id);
                    this.setTrackedTimeout(() => {
                        if (this.gameState?.activeLocationDashboard === 'Labor Sector') {
                            this.showLocationDashboard('Labor Sector');
                        }
                    }, 100);
                } else if (type === 'college') {
                    const course = item as Course;
                    EventBus.publish(UI_EVENTS.TAKE_COURSE, course.id);
                    this.choiceModal.hide();
                } else if (type === 'shopping') {
                    const shoppingItem = item as Item;
                    EventBus.publish(UI_EVENTS.BUY_ITEM, shoppingItem.name);
                    
                    if (shoppingItem.location === 'Sustenance Hub') {
                        // Keep modal open for Fast Food purchases
                        this.setTrackedTimeout(() => {
                            if (this.gameState?.activeLocationDashboard === 'Sustenance Hub') {
                                this.showLocationDashboard('Sustenance Hub');
                            }
                        }, 100);
                    } else {
                        this.choiceModal.hide();
                    }
                }
            }
        });
    }

    renderActionCards(type: 'jobs' | 'college' | 'shopping', data: any[]) {
        const cardList = this.renderActionCardList(type, data);
        this.choiceModal.setContent(cardList);
    }

    showPlayerStatsModal(playerIndex: number) {
        if (!this.gameState || !this.gameState.players[playerIndex - 1]) return;
        const player = this.gameState.players[playerIndex - 1];
        this.playerStatsModal.update(player, COURSES, JOBS, playerIndex);
        this.playerStatsModal.show();
    }

    hidePlayerStatsModal() {
        this.playerStatsModal.hide();
    }

    showLoading() {
        this.loadingOverlay?.classList.remove('hidden');
        document.body.classList.add('loading-active');
    }

    hideLoading() {
        this.loadingOverlay?.classList.add('hidden');
        document.body.classList.remove('loading-active');
    }

    showTurnSummary(summary: TurnSummary) {
        this.isSummaryShown = true;
        this.turnSummaryModal.update(summary, () => {
            if ((window as any).navigator && (window as any).navigator.vibrate) {
                (window as any).navigator.vibrate(10);
            }
            this.isSummaryShown = false;
            this.turnSummaryModal.hide();
            EventBus.publish(UI_EVENTS.ADVANCE_TURN);
        });
        this.turnSummaryModal.show();
    }

    hideTurnSummary() {
        this.isSummaryShown = false;
        this.turnSummaryModal.hide();
    }

    private handleAutoArrival(): void {
        if (!this.gameState) return;

        const currentPlayer = this.gameState.getCurrentPlayer();

        // Auto-arrival logic - show dashboard when arriving at a new location
        // We skip "Hab-Pod 404" to prevent accidental end-turn clicks at the start of a turn
        const isNewTurn = this.lastPlayerId !== null && this.lastPlayerId !== currentPlayer.id;
        const isNewLocation = this.lastLocation !== null && this.lastLocation !== currentPlayer.location;

        if (isNewLocation && !isNewTurn && !currentPlayer.isAI && currentPlayer.time > 0) {
            this.setTrackedTimeout(() => {
                this.showLocationDashboard(currentPlayer.location);
            }, 300);
        }

        this.lastLocation = currentPlayer.location;
        this.lastPlayerId = currentPlayer.id;
    }

    // Legacy render method - components now auto-update via granular event subscriptions
    render(gameState: GameState): void {
        // This method is kept for backward compatibility but components
        // now subscribe to granular events for automatic updates
        this.gameState = gameState;
        this.handleAutoArrival();
    }

    getLocationActions(location: string): LocationAction[] {
        const actions: LocationAction[] = [];

        switch (location) {
            case 'Hab-Pod 404':
                actions.push({
                    label: 'Rest / End Turn',
                    icon: 'bedtime',
                    primary: true,
                    className: 'btn-rest',
                    onClick: () => EventBus.publish(UI_EVENTS.REST_END_TURN)
                });
                break;
            case 'Labor Sector':
                break;
            case 'Cognitive Re-Ed':
                break;
            case 'Mobility-Asset':
                actions.push({
                    label: 'View Inventory',
                    icon: 'directions_car',
                    primary: true,
                    onClick: () => EventBus.publish(UI_EVENTS.BUY_CAR)
                });
                break;
            case 'Cred-Debt Ctr':
                // Financial services actions (Deposit, Withdraw, etc.) are added 
                // separately in showLocationDashboard to handle the contextual input.
                break;
        }

        return actions;
    }

    showBankModal() {
        this.showLocationDashboard('Cred-Debt Ctr');
    }

    showRandomEventModal(event: any, callback: (choiceIndex: number) => void) {
        if (!this.gameState) return;
        this.isRandomEventModalOpen = true;
        this.dashboardToRestoreAfterEvent = this.gameState.activeLocationDashboard || (event.type === 'Local' ? this.gameState.getCurrentPlayer().location : null);
        
        // Publish event for persistence
        EventBus.publish('choiceModalSwitched', { 
            title: event.title, 
            choices: event.choices.map((c: any) => ({ text: c.text })) 
        });

        this.choiceModal.setupClerk(null, this.gameState);
        this.choiceModal.clearContent();
        this.choiceModal.showInput(false);
        
        const content = document.createElement('div');
        content.className = 'random-event-content';
        content.innerHTML = `
            <div class="event-flavor" style="margin-bottom: 20px; line-height: 1.5; color: rgba(255, 255, 255, 0.9);">
                ${event.flavorText}
            </div>
        `;
        this.choiceModal.setContent(content);

        event.choices.forEach((choice: any, index: number) => {
            this.choiceModal.addPrimaryButton(choice.text, () => {
                const dashboardToRestore = this.dashboardToRestoreAfterEvent;
                this.choiceModal.hide();
                callback(index);

                if (dashboardToRestore) {
                    this.setTrackedTimeout(() => {
                        if (!this.choiceModal.isVisible() && !this.gameState?.activeEvent && !this.gameState?.pendingTurnSummary) {
                            this.dashboardToRestoreAfterEvent = null;
                            this.isRandomEventModalOpen = false;
                            this.showLocationDashboard(dashboardToRestore);
                        }
                    }, 50);
                }
            });
        });

        this.choiceModal.show({ title: event.title });
    }

    switchScreen(screenId: string): void {
        this.screenManager.switchScreen(screenId);
    }
}

export default UIManager;












