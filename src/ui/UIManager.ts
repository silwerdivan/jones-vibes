import EventBus, { UI_EVENTS } from '../EventBus.js';
import { JOBS } from '../data/jobs.js';
import { COURSES } from '../data/courses.js';
import { CLERKS } from '../data/clerks.js';
import { SHOPPING_ITEMS } from '../data/items.js';
import Icons from './Icons.js';
import GameState from '../game/GameState.js';
import { ChoiceModal, PlayerStatsModal, IntelTerminalModal, TurnSummaryModal } from './components/Modal.js';
import HUD from './components/HUD.js';
import ScreenManager from './components/screens/ScreenManager.js';
import CityScreen from './components/screens/CityScreen.js';
import LifeScreen from './components/screens/LifeScreen.js';
import InventoryScreen from './components/screens/InventoryScreen.js';
import PlaceholderScreen from './components/screens/PlaceholderScreen.js';
import SystemScreen from './components/screens/SystemScreen.js';
import { createActionCardList } from './components/shared/ActionCard.js';
import { TurnSummary, Choice, LocationAction, Item, Course, Job, IconRegistry, Clerk } from '../models/types.js';
import { PersistenceService } from '../services/PersistenceService.js';

type ClerkRegistry = Record<string, Clerk>;

class UIManager {
    // Components
    private hud: HUD;
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

    // State
    private gameState: GameState | null = null;
    private lastLocation: string | null = null;
    private lastPlayerId: number | null = null;
    private isSummaryShown: boolean = false;
    private loadingOverlay: HTMLElement | null;

    constructor() {
        // Initialize components
        this.hud = new HUD();
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

        // 4. Restore AI thinking state
        if (gameState.isAIThinking) {
            this.showLoading();
        }
    }

    private subscribeToEvents(): void {
        EventBus.subscribe('aiThinkingStart', () => this.showLoading());
        EventBus.subscribe('aiThinkingEnd', () => this.hideLoading());

        EventBus.subscribe('modalHidden', (data: { modalId: string }) => {
            if (data.modalId === 'choice-modal-overlay') {
                EventBus.publish('dashboardSwitched', { location: null });
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

            // Components now auto-update via granular event subscriptions
            // Only handle auto-arrival and pending summary logic here
            this.handleAutoArrival();

            if (gameState.pendingTurnSummary && !this.isSummaryShown) {
                this.showTurnSummary(gameState.pendingTurnSummary);
            }
        });

        EventBus.subscribe('turnEnded', (summary: TurnSummary) => {
            this.showTurnSummary(summary);
        });

        EventBus.subscribe('showPlayerStats', (playerIndex: number) => this.showPlayerStatsModal(playerIndex));
        EventBus.subscribe('showIntelTerminal', () => this.showIntelTerminal());

        EventBus.subscribe(UI_EVENTS.RESTART_GAME, () => {
            this.choiceModal.setupClerk(null, Icons as unknown as IconRegistry);
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

        this.choiceModal.setupClerk(clerk, Icons as unknown as IconRegistry);
        this.choiceModal.clearContent();
        this.choiceModal.showInput(showInput);

        if (location === 'Shopping Mall' || location === 'Fast Food') {
            const filteredItems = SHOPPING_ITEMS.filter(item => item.location === location);
            this.renderActionCards('shopping', filteredItems);
        } else if (location === 'Community College') {
            this.renderActionCards('college', COURSES);
        } else {
            choices.forEach(choice => {
                this.choiceModal.addPrimaryButton(choice.text, (amount) => {
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

        // Publish event for persistence
        EventBus.publish('dashboardSwitched', { location });

        const player = this.gameState.getCurrentPlayer();
        const clerk = (CLERKS as ClerkRegistry)[location];

        this.choiceModal.setupClerk(clerk, Icons as unknown as IconRegistry);
        this.choiceModal.clearContent();
        this.choiceModal.showInput(false);

        if (location === 'Employment Agency') {
            this.renderActionCards('jobs', JOBS);
        } else if (location === 'Community College') {
            this.renderActionCards('college', COURSES);
        } else if (location === 'Shopping Mall' || location === 'Fast Food') {
            const filteredItems = SHOPPING_ITEMS.filter(item => item.location === location);
            this.renderActionCards('shopping', filteredItems);
        }

        const actions = this.getLocationActions(location);
        actions.forEach(action => {
            this.choiceModal.addSecondaryButton(action.label, action.icon, action.primary, (e) => {
                if (action.label === 'Work Shift') {
                    const job = JOBS.find(j => j.level === player.careerLevel);
                    if (job) {
                        this.spawnFeedback(e.currentTarget as HTMLElement, `+$${job.wage * 8}`, 'success');
                    }
                }

                if (action.label !== 'Work Shift') {
                    this.choiceModal.hide();
                }
                action.onClick(e);

                if (action.label === 'Work Shift') {
                    setTimeout(() => {
                        this.showLocationDashboard(location);
                    }, 100);
                }
            }, action.className);
        });

        if (location === 'Bank') {
            this.choiceModal.showInput(true);

            const bankActions = [
                { text: 'Deposit', value: 'deposit', action: (amount: number) => EventBus.publish(UI_EVENTS.BANK_DEPOSIT, amount) },
                { text: 'Withdraw', value: 'withdraw', action: (amount: number) => EventBus.publish(UI_EVENTS.BANK_WITHDRAW, amount) },
                { text: 'Take Loan', value: 'loan', action: (amount: number) => EventBus.publish(UI_EVENTS.BANK_LOAN, amount) },
                { text: 'Repay Loan', value: 'repay', action: (amount: number) => EventBus.publish(UI_EVENTS.BANK_REPAY, amount) }
            ];

            bankActions.forEach(choice => {
                this.choiceModal.addSecondaryButton(choice.text, 'payments', false, (e) => {
                    const amount = this.choiceModal.getInputValue();

                    if (choice.value === 'deposit' || choice.value === 'repay') {
                        this.spawnFeedback(e.currentTarget as HTMLElement, `-$${amount}`, 'error');
                    } else {
                        this.spawnFeedback(e.currentTarget as HTMLElement, `+$${amount}`, 'success');
                    }

                    choice.action(amount);
                    setTimeout(() => {
                        this.showLocationDashboard('Bank');
                    }, 100);
                });
            });
        }

        this.choiceModal.show({ title: location });
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
        this.choiceModal.hide();
    }

    showJobApplicationModal() {
        this.showLocationDashboard('Employment Agency');
    }

    renderActionCards(type: 'jobs' | 'college' | 'shopping', data: any[]) {
        const player = this.gameState ? this.gameState.getCurrentPlayer() : null;
        
        const cardList = createActionCardList(type, data, {
            player,
            onClick: (item, feedbackText, feedbackType) => {
                const cardElement = document.activeElement as HTMLElement;
                if (cardElement) {
                    this.spawnFeedback(cardElement.closest('.action-card') as HTMLElement, feedbackText, feedbackType);
                }
                
                if (type === 'jobs') {
                    const job = item as Job;
                    EventBus.publish(UI_EVENTS.APPLY_JOB, job.level);
                    setTimeout(() => {
                        this.showLocationDashboard('Employment Agency');
                    }, 100);
                } else if (type === 'college') {
                    const course = item as Course;
                    EventBus.publish(UI_EVENTS.TAKE_COURSE, course.id);
                    this.choiceModal.hide();
                } else if (type === 'shopping') {
                    const shoppingItem = item as Item;
                    EventBus.publish(UI_EVENTS.BUY_ITEM, shoppingItem.name);
                    this.choiceModal.hide();
                }
            }
        });

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
        // We skip "Home" to prevent accidental end-turn clicks at the start of a turn
        const isNewTurn = this.lastPlayerId !== null && this.lastPlayerId !== currentPlayer.id;
        const isNewLocation = this.lastLocation !== null && this.lastLocation !== currentPlayer.location;

        if (isNewLocation && !isNewTurn && !currentPlayer.isAI && currentPlayer.location !== 'Home') {
            setTimeout(() => {
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
            case 'Home':
                actions.push({
                    label: 'Rest / End Turn',
                    icon: 'bedtime',
                    primary: true,
                    className: 'btn-rest',
                    onClick: () => EventBus.publish(UI_EVENTS.REST_END_TURN)
                });
                break;
            case 'Employment Agency':
                actions.push({
                    label: 'Work Shift',
                    icon: 'work',
                    primary: true,
                    onClick: () => EventBus.publish(UI_EVENTS.WORK_SHIFT)
                });
                break;
            case 'Community College':
                actions.push({
                    label: 'Browse Courses',
                    icon: 'school',
                    primary: true,
                    onClick: () => this.showLocationDashboard('Community College')
                });
                break;
            case 'Shopping Mall':
                actions.push({
                    label: 'Browse Items',
                    icon: 'shopping_bag',
                    primary: true,
                    onClick: () => this.showLocationDashboard('Shopping Mall')
                });
                break;
            case 'Fast Food':
                actions.push({
                    label: 'Browse Menu',
                    icon: 'lunch_dining',
                    primary: true,
                    onClick: () => this.showLocationDashboard('Fast Food')
                });
                break;
            case 'Used Car Lot':
                actions.push({
                    label: 'View Inventory',
                    icon: 'directions_car',
                    primary: true,
                    onClick: () => EventBus.publish(UI_EVENTS.BUY_CAR)
                });
                break;
            case 'Bank':
                // Financial services actions (Deposit, Withdraw, etc.) are added 
                // separately in showLocationDashboard to handle the contextual input.
                break;
        }

        return actions;
    }

    showBankModal() {
        this.showLocationDashboard('Bank');
    }

    switchScreen(screenId: string): void {
        this.screenManager.switchScreen(screenId);
    }
}

export default UIManager;
