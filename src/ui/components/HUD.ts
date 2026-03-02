import BaseComponent from '../BaseComponent.js';
import GameState from '../../game/GameState.js';
import ClockVisualization from '../ClockVisualization.js';
import EventBus, { STATE_EVENTS } from '../../EventBus.js';
import { LogMessage } from '../../models/types.js';

export default class HUD extends BaseComponent<GameState> {
    private hudCash!: HTMLElement;
    private hudWeek!: HTMLElement;
    private hudLocation!: HTMLElement;
    private orbP1!: HTMLElement;
    private orbP2!: HTMLElement;
    private terminalBadge!: HTMLElement;
    private timeRingP1!: HTMLElement;
    private timeRingP2!: HTMLElement;
    private terminalTrigger!: HTMLElement;
    private hudClockVisualizationP1: ClockVisualization | null = null;
    private hudClockVisualizationP2: ClockVisualization | null = null;
    private lastPlayerIndex: number = -1;
    private unreadEvents: number = 0;
    private newsTickerContent: HTMLElement | null = null;

    constructor() {
        super('header', 'hud glass');
        this.buildDOM();
        this.initializeReferences();
        this.initializeClockVisualizations();
        this.setupEventListeners();
        this.setupGranularSubscriptions();
    }

    private buildDOM(): void {
        this.element.innerHTML = `
            <div class="hud-left">
                <div class="hud-status-orbs">
                    <div class="status-orb active" id="orb-p1" data-orb="p1">
                        <div class="time-ring-container" data-time-ring="p1"></div>
                        <div class="orb-avatar" id="hud-avatar-p1" data-avatar="p1">P1</div>
                    </div>
                    <div class="status-orb inactive" id="orb-p2" data-orb="p2">
                        <div class="time-ring-container" data-time-ring="p2"></div>
                        <div class="orb-avatar" id="hud-avatar-p2" data-avatar="p2">AI</div>
                    </div>
                </div>
                <div class="hud-stats">
                    <div class="hud-stat-item">
                        <span class="hud-label">OMNI-CREDS</span>
                        <span class="hud-value currency" data-cash>[OC]0</span>
                    </div>
                </div>
            </div>
            <div class="hud-right">
                <div class="hud-terminal-btn" aria-label="Open Intel Terminal" data-terminal-trigger>
                    <i class="material-icons">terminal</i>
                    <span class="terminal-badge hidden" data-terminal-badge>0</span>
                </div>
                <div class="hud-stat-item text-right">
                    <span class="hud-label">CYCLE</span>
                    <span class="hud-value" data-week>1</span>
                </div>
                <div class="hud-stat-item text-right">
                    <span class="hud-label">SECTOR</span>
                    <span class="hud-value" data-location>Hab-Pod 404</span>
                </div>
            </div>
        `;
    }

    private initializeReferences(): void {
        this.orbP1 = this.element.querySelector('[data-orb="p1"]')!;
        this.orbP2 = this.element.querySelector('[data-orb="p2"]')!;
        this.timeRingP1 = this.element.querySelector('[data-time-ring="p1"]')!;
        this.timeRingP2 = this.element.querySelector('[data-time-ring="p2"]')!;
        this.hudCash = this.element.querySelector('[data-cash]')!;
        this.hudWeek = this.element.querySelector('[data-week]')!;
        this.hudLocation = this.element.querySelector('[data-location]')!;
        this.terminalBadge = this.element.querySelector('[data-terminal-badge]')!;
        this.terminalTrigger = this.element.querySelector('[data-terminal-trigger]')!;
    }

    private initializeClockVisualizations(): void {
        if (this.timeRingP1) {
            this.hudClockVisualizationP1 = new ClockVisualization(this.timeRingP1, {
                size: 52,
                strokeWidth: 4,
                backgroundColor: 'rgba(255, 0, 255, 0.1)',
                foregroundColor: '#FF00FF',
                textColor: 'transparent',
                showNumeric: false
            });
        }

        if (this.timeRingP2) {
            this.hudClockVisualizationP2 = new ClockVisualization(this.timeRingP2, {
                size: 52,
                strokeWidth: 4,
                backgroundColor: 'rgba(0, 255, 255, 0.1)',
                foregroundColor: '#00FFFF',
                textColor: 'transparent',
                showNumeric: false
            });
        }
    }

    private setupEventListeners(): void {
        EventBus.subscribe('gameEvent', () => {
            this.unreadEvents++;
            this.updateTerminalBadge();
        });

        this.orbP1.addEventListener('click', () => EventBus.publish('showPlayerStats', 1));
        this.orbP2.addEventListener('click', () => EventBus.publish('showPlayerStats', 2));

        this.terminalTrigger.addEventListener('click', () => {
            this.unreadEvents = 0;
            this.updateTerminalBadge();
            EventBus.publish('showIntelTerminal');
        });

        EventBus.subscribe('logIconClicked', () => {
            this.unreadEvents = 0;
            this.updateTerminalBadge();
            EventBus.publish('showIntelTerminal');
        });
    }

    private setupGranularSubscriptions(): void {
        // Subscribe to specific state changes for targeted updates
        this.subscribe(STATE_EVENTS.CASH_CHANGED, ({ gameState }: { gameState: GameState }) => {
            this.updateCash(gameState);
        });

        this.subscribe(STATE_EVENTS.TIME_CHANGED, ({ gameState }: { gameState: GameState }) => {
            this.updateClocks(gameState);
        });

        this.subscribe(STATE_EVENTS.PLAYER_CHANGED, ({ gameState }: { gameState: GameState }) => {
            this.updateOrbs(gameState);
            this.updateCash(gameState);
            this.updateClocks(gameState);
            this.updateLocation(gameState);
        });

        this.subscribe(STATE_EVENTS.LOCATION_CHANGED, ({ gameState }: { gameState: GameState }) => {
            this.updateLocation(gameState);
        });

        this.subscribe(STATE_EVENTS.TURN_CHANGED, ({ gameState }: { gameState: GameState }) => {
            this.updateWeek(gameState);
            this.updateOrbs(gameState);
            this.updateCash(gameState);
            this.updateClocks(gameState);
            this.updateLocation(gameState);
        });

        // Listen for stateChanged as a fallback for initial load and legacy updates
        EventBus.subscribe('stateChanged', (gameState: GameState) => {
            this.render(gameState);
        });
    }

    private updateCash(gameState: GameState): void {
        const currentPlayer = gameState.getCurrentPlayer();
        this.hudCash.textContent = `[OC]${currentPlayer.cash}`;
    }

    private updateWeek(gameState: GameState): void {
        this.hudWeek.textContent = gameState.turn.toString();
    }

    private updateLocation(gameState: GameState): void {
        const currentPlayer = gameState.getCurrentPlayer();
        this.hudLocation.textContent = currentPlayer.location;
    }

    private updateClocks(gameState: GameState): void {
        const player1 = gameState.players[0];
        const player2 = gameState.players.length > 1 ? gameState.players[1] : null;
        
        if (this.hudClockVisualizationP1) {
            this.hudClockVisualizationP1.updateTime(player1.time);
        }
        if (this.hudClockVisualizationP2 && player2) {
            this.hudClockVisualizationP2.updateTime(player2.time);
        }
    }

    private updateOrbs(gameState: GameState): void {
        const currentPlayerIndex = gameState.currentPlayerIndex;

        // Update Orbs
        this.orbP1.classList.toggle('active', currentPlayerIndex === 0);
        this.orbP1.classList.toggle('inactive', currentPlayerIndex !== 0);
        if (this.lastPlayerIndex !== currentPlayerIndex && currentPlayerIndex === 0) {
            this.orbP1.classList.add('pulse');
            setTimeout(() => this.orbP1.classList.remove('pulse'), 600);
        }

        this.orbP2.classList.toggle('active', currentPlayerIndex === 1);
        this.orbP2.classList.toggle('inactive', currentPlayerIndex !== 1);
        if (this.lastPlayerIndex !== currentPlayerIndex && currentPlayerIndex === 1) {
            this.orbP2.classList.add('pulse');
            setTimeout(() => this.orbP2.classList.remove('pulse'), 600);
        }

        this.lastPlayerIndex = currentPlayerIndex;
    }

    setNewsTickerContent(element: HTMLElement): void {
        this.newsTickerContent = element;
    }

    protected _render(gameState: GameState): void {
        const player1 = gameState.players[0];
        const player2 = gameState.players.length > 1 ? gameState.players[1] : null;
        const currentPlayer = gameState.getCurrentPlayer();
        const currentPlayerIndex = gameState.currentPlayerIndex;

        // Update Orbs
        this.orbP1.classList.toggle('active', currentPlayerIndex === 0);
        this.orbP1.classList.toggle('inactive', currentPlayerIndex !== 0);
        if (this.lastPlayerIndex !== currentPlayerIndex && currentPlayerIndex === 0) {
            this.orbP1.classList.add('pulse');
            setTimeout(() => this.orbP1.classList.remove('pulse'), 600);
        }

        this.orbP2.classList.toggle('active', currentPlayerIndex === 1);
        this.orbP2.classList.toggle('inactive', currentPlayerIndex !== 1);
        if (this.lastPlayerIndex !== currentPlayerIndex && currentPlayerIndex === 1) {
            this.orbP2.classList.add('pulse');
            setTimeout(() => this.orbP2.classList.remove('pulse'), 600);
        }

        this.lastPlayerIndex = currentPlayerIndex;

        // Update Clocks
        if (this.hudClockVisualizationP1) {
            this.hudClockVisualizationP1.updateTime(player1.time);
        }
        if (this.hudClockVisualizationP2 && player2) {
            this.hudClockVisualizationP2.updateTime(player2.time);
        }

        // Update Stats
        this.hudCash.textContent = `[OC]${currentPlayer.cash}`;
        this.hudWeek.textContent = gameState.turn.toString();
        this.hudLocation.textContent = currentPlayer.location;

        // Update News Ticker
        if (this.newsTickerContent && gameState.log.length > 0) {
            const recentEvents = gameState.log
                .slice(-5)
                .map((entry: LogMessage) => entry.text)
                .join('  •  ');
            this.newsTickerContent.textContent = recentEvents;
        }
    }

    private updateTerminalBadge(): void {
        if (this.unreadEvents > 0) {
            this.terminalBadge.textContent = this.unreadEvents > 99 ? '99+' : this.unreadEvents.toString();
            this.terminalBadge.classList.remove('hidden');
        } else {
            this.terminalBadge.classList.add('hidden');
        }
    }
}
