import BaseComponent from '../../BaseComponent.js';
import GameState from '../../../game/GameState.js';
import Gauge from '../shared/Gauge.js';
import EventBus, { STATE_EVENTS } from '../../../EventBus.js';

export interface LifeScreenGauge {
    id: string;
    label: string;
    value: number;
    max: number;
    color: string;
}

export default class LifeScreen extends BaseComponent<GameState> {
    private lifeAvatar!: HTMLElement;
    private statusChips!: HTMLElement;
    private gaugeGrid!: HTMLElement;
    private financialOverview!: HTMLElement;
    private gauges: Map<string, Gauge> = new Map();

    constructor() {
        super('section', 'screen');

        this.createStructure();
    }

    private createStructure(): void {
        const mobileStatsHeader = document.createElement('div');
        mobileStatsHeader.className = 'mobile-life-stats';
        mobileStatsHeader.innerHTML = `
            <div class="stats-mobile-row">
                <div class="stat-pill">
                    <span class="pill-label">SANITY</span>
                    <span class="pill-value" id="pill-sanity">0</span>
                </div>
                <div class="stat-pill">
                    <span class="pill-label">CREDITS</span>
                    <span class="pill-value" id="pill-credits">₡0</span>
                </div>
            </div>
        `;

        const lifeHeader = document.createElement('div');
        lifeHeader.className = 'life-header card glass';

        const avatarContainer = document.createElement('div');
        avatarContainer.className = 'life-avatar-container';

        this.lifeAvatar = document.createElement('div');
        this.lifeAvatar.className = 'avatar-sm';
        this.lifeAvatar.id = 'life-avatar';
        this.lifeAvatar.textContent = 'P1';
        avatarContainer.appendChild(this.lifeAvatar);

        this.statusChips = document.createElement('div');
        this.statusChips.className = 'status-chips';
        this.statusChips.id = 'status-chips';

        lifeHeader.appendChild(avatarContainer);
        lifeHeader.appendChild(this.statusChips);

        this.gaugeGrid = document.createElement('div');
        this.gaugeGrid.className = 'gauge-grid';

        const gaugeConfigs: LifeScreenGauge[] = [
            { id: 'wealth', label: 'Credits (₡)', value: 0, max: 100, color: '#00E676' },
            { id: 'sanity', label: 'Sanity (🧠)', value: 0, max: 100, color: '#FFD600' },
            { id: 'education', label: 'Compliance Level', value: 0, max: 100, color: '#2979FF' },
            { id: 'career', label: 'Productivity Tier', value: 0, max: 100, color: '#FF00FF' }
        ];

        gaugeConfigs.forEach(config => {
            const gaugeCard = document.createElement('div');
            gaugeCard.className = 'gauge-card glass';
            gaugeCard.dataset.gauge = config.id;

            const gaugeContainer = document.createElement('div');
            gaugeContainer.className = 'gauge-svg-container';
            gaugeContainer.id = `gauge-${config.id}`;

            // Removed manual gaugeLabel creation here as Gauge component handles it
            gaugeCard.appendChild(gaugeContainer);
            this.gaugeGrid.appendChild(gaugeCard);

            const gauge = new Gauge();
            this.gauges.set(config.id, gauge);
            gaugeContainer.appendChild(gauge.getElement());
        });

        this.financialOverview = document.createElement('div');
        this.financialOverview.className = 'financial-overview card glass';

        this.element.appendChild(mobileStatsHeader);
        this.element.appendChild(lifeHeader);
        this.element.appendChild(this.gaugeGrid);
        this.element.appendChild(this.financialOverview);

        this.setupGranularSubscriptions();
    }

    private setupGranularSubscriptions(): void {
        // Subscribe to specific state changes for targeted updates
        this.subscribe(STATE_EVENTS.CREDITS_CHANGED, ({ gameState }: { gameState: GameState }) => {
            const player = gameState.getCurrentPlayer();
            this.updateGauges(player);
            this.renderFinancialOverview(player);
        });

        this.subscribe(STATE_EVENTS.SAVINGS_CHANGED, ({ gameState }: { gameState: GameState }) => {
            const player = gameState.getCurrentPlayer();
            this.updateGauges(player);
            this.renderFinancialOverview(player);
        });

        this.subscribe(STATE_EVENTS.DEBT_CHANGED, ({ gameState }: { gameState: GameState }) => {
            this.renderFinancialOverview(gameState.getCurrentPlayer());
            this.renderStatusChips(gameState.getCurrentPlayer());
        });

        this.subscribe(STATE_EVENTS.BURN_RATE_CHANGED, ({ gameState }: { gameState: GameState }) => {
            this.renderFinancialOverview(gameState.getCurrentPlayer());
        });

        this.subscribe(STATE_EVENTS.SANITY_CHANGED, ({ gameState }: { gameState: GameState }) => {
            this.updateGauges(gameState.getCurrentPlayer());
        });

        this.subscribe(STATE_EVENTS.HUNGER_CHANGED, ({ gameState }: { gameState: GameState }) => {
            this.renderStatusChips(gameState.getCurrentPlayer());
        });

        this.subscribe(STATE_EVENTS.EDUCATION_CHANGED, ({ gameState }: { gameState: GameState }) => {
            this.updateGauges(gameState.getCurrentPlayer());
        });

        this.subscribe(STATE_EVENTS.CAREER_CHANGED, ({ gameState }: { gameState: GameState }) => {
            this.updateGauges(gameState.getCurrentPlayer());
        });

        this.subscribe(STATE_EVENTS.PLAYER_CHANGED, ({ gameState }: { gameState: GameState }) => {
            this.render(gameState);
        });

        this.subscribe(STATE_EVENTS.TURN_CHANGED, ({ gameState }: { gameState: GameState }) => {
            this.render(gameState);
        });

        // Fallback for stateChanged events
        EventBus.subscribe('stateChanged', (gameState: GameState) => {
            this.render(gameState);
        });
    }

    protected _render(gameState: GameState): void {
        const player = gameState.getCurrentPlayer();
        const index = gameState.currentPlayerIndex;

        this.updateAvatar(index);
        this.renderStatusChips(player);
        this.updateGauges(player);
        this.renderFinancialOverview(player);
        this.updateMobileStats(player);
    }

    private updateMobileStats(player: any): void {
        const sanityPill = this.element.querySelector('#pill-sanity');
        const creditsPill = this.element.querySelector('#pill-credits');
        
        if (sanityPill) {
            sanityPill.textContent = Math.round(player.sanity).toString();
            sanityPill.className = `pill-value ${player.sanity <= 20 ? 'log-error' : ''}`;
        }
        
        if (creditsPill) {
            creditsPill.textContent = `₡${player.credits}`;
        }
    }

    private updateAvatar(playerIndex: number): void {
        const isPlayer1 = playerIndex === 0;
        this.lifeAvatar.textContent = isPlayer1 ? 'P1' : 'AI';
        this.lifeAvatar.dataset.player = isPlayer1 ? '1' : '2';
    }

    private renderFinancialOverview(player: any): void {
        const burnRate = player.calculateBurnRate();
        const debt = player.debt || 0;
        this.financialOverview.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 8px;">
                <div style="font-size: 10px; font-weight: 800; color: var(--neon-cyan); text-transform: uppercase; letter-spacing: 1px;">Financial Overview</div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                    <div>
                        <div style="font-size: 8px; opacity: 0.7; text-transform: uppercase;">Weekly Burn Rate</div>
                        <div style="font-size: 18px; font-weight: 800; color: var(--neon-red);">₡${burnRate}</div>
                    </div>
                    <div>
                        <div style="font-size: 8px; opacity: 0.7; text-transform: uppercase;">Available Credits</div>
                        <div style="font-size: 18px; font-weight: 800; color: var(--neon-green);">₡${player.credits}</div>
                    </div>
                    ${debt > 0 ? `
                    <div style="grid-column: span 2; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 8px; margin-top: 4px;">
                        <div style="font-size: 8px; color: var(--neon-red); text-transform: uppercase;">Outstanding Debt</div>
                        <div style="font-size: 20px; font-weight: 800; color: var(--neon-red);">₡${debt}</div>
                    </div>
                    ` : ''}
                </div>
                <div style="font-size: 9px; opacity: 0.6; margin-top: 4px; line-height: 1.2;">
                    Your Burn Rate includes base Burn Rate and active subscription fees for installed Cyberware/Assets.
                </div>
            </div>
        `;
    }

    private renderStatusChips(player: {
        time: number;
        hunger: number;
        loan: number;
        debt: number;
    }): void {
        this.statusChips.innerHTML = '';

        const chips: Array<{ text: string; className: string }> = [];

        if (player.time > 12) {
            chips.push({ text: 'Optimal Buffer', className: 'chip-success' });
        }

        if (player.hunger > 50) {
            chips.push({
                text: player.hunger > 80 ? 'CRITICAL DRAIN (⚡)' : 'Energy Drain (⚡)',
                className: player.hunger > 80 ? 'chip-danger' : 'chip-warning'
            });
        } else {
            chips.push({ text: 'Nominal', className: 'chip-success' });
        }

        if (player.loan > 0) {
            chips.push({ text: 'Negative Liquidity', className: 'chip-danger' });
        }

        if (player.debt > 0) {
            chips.push({ text: 'IN DEBT', className: 'chip-danger' });
        }

        chips.forEach(chipData => {
            const chip = document.createElement('span');
            chip.className = `status-chip ${chipData.className}`;
            chip.textContent = chipData.text;
            this.statusChips.appendChild(chip);
        });
    }

    private updateGauges(player: {
        credits: number;
        savings: number;
        sanity: number;
        educationLevel: number;
        careerLevel: number;
    }): void {
        const wealth = Math.min(100, Math.round(((player.credits + player.savings) / 10000) * 100));
        const sanity = player.sanity;
        const education = Math.min(100, Math.round((player.educationLevel / 5) * 100));
        const career = Math.min(100, Math.round((player.careerLevel / 5) * 100));

        const gaugeData: Array<{ id: string; value: number }> = [
            { id: 'wealth', value: wealth },
            { id: 'sanity', value: sanity },
            { id: 'education', value: education },
            { id: 'career', value: career }
        ];

        gaugeData.forEach(({ id, value }) => {
            const gauge = this.gauges.get(id);
            if (gauge) {
                const config = this.getGaugeConfig(id, value);
                gauge.render(config);

                // Add visual warning for low sanity
                const gaugeCard = this.gaugeGrid.querySelector(`[data-gauge="${id}"]`);
                if (gaugeCard) {
                    if (id === 'sanity' && value <= 20) {
                        gaugeCard.classList.add('sanity-low');
                    } else {
                        gaugeCard.classList.remove('sanity-low');
                    }
                }
            }
        });
    }

    private getGaugeConfig(id: string, value: number): {
        value: number;
        max: number;
        color: string;
        label: string;
    } {
        const configs: Record<string, { color: string; label: string }> = {
            wealth: { color: '#00E676', label: 'Credits (₡)' },
            sanity: { color: '#FFD600', label: 'Sanity (🧠)' },
            education: { color: '#2979FF', label: 'Compliance Level' },
            career: { color: '#FF00FF', label: 'Productivity Tier' }
        };

        const config = configs[id];
        return {
            value,
            max: 100,
            color: config.color,
            label: config.label
        };
    }

    getLifeAvatar(): HTMLElement {
        return this.lifeAvatar;
    }

    getStatusChips(): HTMLElement {
        return this.statusChips;
    }

    getGaugeGrid(): HTMLElement {
        return this.gaugeGrid;
    }

    getGauge(id: string): Gauge | undefined {
        return this.gauges.get(id);
    }
}
