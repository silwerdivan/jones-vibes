import GameState from '../../game/GameState.js';
import ClockVisualization from '../ClockVisualization.js';
import EventBus from '../../EventBus.js';

export class HUD {
    private hudCash: HTMLElement | null;
    private hudWeek: HTMLElement | null;
    private hudLocation: HTMLElement | null;
    private orbP1: HTMLElement | null;
    private orbP2: HTMLElement | null;
    private terminalBadge: HTMLElement | null;
    private newsTickerContent: HTMLElement | null;
    private hudClockVisualizationP1: ClockVisualization | null = null;
    private hudClockVisualizationP2: ClockVisualization | null = null;
    private lastPlayerIndex: number = -1;
    private unreadEvents: number = 0;

    constructor() {
        this.hudCash = document.getElementById('hud-cash');
        this.hudWeek = document.getElementById('hud-week');
        this.hudLocation = document.getElementById('hud-location');
        this.orbP1 = document.getElementById('orb-p1');
        this.orbP2 = document.getElementById('orb-p2');
        this.terminalBadge = document.getElementById('terminal-badge');
        this.newsTickerContent = document.getElementById('news-ticker-content');

        this.initializeClockVisualizations();
        this.setupEventListeners();
    }

    private initializeClockVisualizations() {
        if (document.getElementById('hud-time-ring-p1')) {
            this.hudClockVisualizationP1 = new ClockVisualization('hud-time-ring-p1', {
                size: 52,
                strokeWidth: 4,
                backgroundColor: 'rgba(255, 0, 255, 0.1)',
                foregroundColor: '#FF00FF',
                textColor: 'transparent',
                showNumeric: false
            });
        }

        if (document.getElementById('hud-time-ring-p2')) {
            this.hudClockVisualizationP2 = new ClockVisualization('hud-time-ring-p2', {
                size: 52,
                strokeWidth: 4,
                backgroundColor: 'rgba(0, 255, 255, 0.1)',
                foregroundColor: '#00FFFF',
                textColor: 'transparent',
                showNumeric: false
            });
        }
    }

    private setupEventListeners() {
        EventBus.subscribe('gameEvent', () => {
            this.unreadEvents++;
            this.updateTerminalBadge();
        });

        const orbP1 = document.getElementById('orb-p1');
        const orbP2 = document.getElementById('orb-p2');
        if (orbP1) orbP1.addEventListener('click', () => EventBus.publish('showPlayerStats', 1));
        if (orbP2) orbP2.addEventListener('click', () => EventBus.publish('showPlayerStats', 2));

        const terminalTrigger = document.getElementById('hud-terminal-trigger');
        if (terminalTrigger) {
            terminalTrigger.addEventListener('click', () => {
                this.unreadEvents = 0;
                this.updateTerminalBadge();
                EventBus.publish('showIntelTerminal');
            });
        }
        
        // Listen for log icon clicked (from mobile UI)
        EventBus.subscribe('logIconClicked', () => {
            this.unreadEvents = 0;
            this.updateTerminalBadge();
            EventBus.publish('showIntelTerminal');
        });
    }

    public update(gameState: GameState) {
        const player1 = gameState.players[0];
        const player2 = gameState.players.length > 1 ? gameState.players[1] : null;
        const currentPlayer = gameState.getCurrentPlayer();
        const currentPlayerIndex = gameState.currentPlayerIndex;

        // Update Orbs
        if (this.orbP1) {
            this.orbP1.classList.toggle('active', currentPlayerIndex === 0);
            this.orbP1.classList.toggle('inactive', currentPlayerIndex !== 0);
            if (this.lastPlayerIndex !== currentPlayerIndex && currentPlayerIndex === 0) {
                this.orbP1.classList.add('pulse');
                setTimeout(() => this.orbP1?.classList.remove('pulse'), 600);
            }
        }

        if (this.orbP2) {
            this.orbP2.classList.toggle('active', currentPlayerIndex === 1);
            this.orbP2.classList.toggle('inactive', currentPlayerIndex !== 1);
            if (this.lastPlayerIndex !== currentPlayerIndex && currentPlayerIndex === 1) {
                this.orbP2.classList.add('pulse');
                setTimeout(() => this.orbP2?.classList.remove('pulse'), 600);
            }
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
        if (this.hudCash) this.hudCash.textContent = `$${currentPlayer.cash}`;
        if (this.hudWeek) this.hudWeek.textContent = gameState.turn.toString();
        if (this.hudLocation) this.hudLocation.textContent = currentPlayer.location;

        // Update News Ticker
        if (this.newsTickerContent && gameState.log.length > 0) {
            const recentEvents = gameState.log
                .slice(-5)
                .map((entry: any) => typeof entry === 'string' ? entry : entry.text)
                .join('  •  ');
            this.newsTickerContent.textContent = recentEvents;
        }
    }

    private updateTerminalBadge() {
        if (this.terminalBadge) {
            if (this.unreadEvents > 0) {
                this.terminalBadge.textContent = this.unreadEvents > 99 ? '99+' : this.unreadEvents.toString();
                this.terminalBadge.classList.remove('hidden');
            } else {
                this.terminalBadge.classList.add('hidden');
            }
        }
    }
}
