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
    private gauges: Map<string, Gauge> = new Map();

    constructor() {
        super('section', 'screen hidden');
        this.element.id = 'screen-life';

        this.createStructure();
    }

    private createStructure(): void {
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
            { id: 'wealth', label: 'Wealth', value: 0, max: 100, color: '#00E676' },
            { id: 'happiness', label: 'Happiness', value: 0, max: 100, color: '#FFD600' },
            { id: 'education', label: 'Education', value: 0, max: 100, color: '#2979FF' },
            { id: 'career', label: 'Career', value: 0, max: 100, color: '#FF00FF' }
        ];

        gaugeConfigs.forEach(config => {
            const gaugeCard = document.createElement('div');
            gaugeCard.className = 'gauge-card glass';
            gaugeCard.dataset.gauge = config.id;

            const gaugeContainer = document.createElement('div');
            gaugeContainer.className = 'gauge-svg-container';
            gaugeContainer.id = `gauge-${config.id}`;

            const gaugeLabel = document.createElement('div');
            gaugeLabel.className = 'gauge-label';
            gaugeLabel.textContent = config.label;

            gaugeCard.appendChild(gaugeContainer);
            gaugeCard.appendChild(gaugeLabel);
            this.gaugeGrid.appendChild(gaugeCard);

            const gauge = new Gauge();
            this.gauges.set(config.id, gauge);
            gaugeContainer.appendChild(gauge.getElement());
        });

        this.element.appendChild(lifeHeader);
        this.element.appendChild(this.gaugeGrid);

        this.setupGranularSubscriptions();
    }

    private setupGranularSubscriptions(): void {
        // Subscribe to specific state changes for targeted updates
        this.subscribe(STATE_EVENTS.CASH_CHANGED, ({ gameState }: { gameState: GameState }) => {
            this.updateGauges(gameState.getCurrentPlayer());
        });

        this.subscribe(STATE_EVENTS.SAVINGS_CHANGED, ({ gameState }: { gameState: GameState }) => {
            this.updateGauges(gameState.getCurrentPlayer());
        });

        this.subscribe(STATE_EVENTS.HAPPINESS_CHANGED, ({ gameState }: { gameState: GameState }) => {
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
    }

    private updateAvatar(playerIndex: number): void {
        const isPlayer1 = playerIndex === 0;
        this.lifeAvatar.textContent = isPlayer1 ? 'P1' : 'AI';
        this.lifeAvatar.dataset.player = isPlayer1 ? '1' : '2';
    }

    private renderStatusChips(player: {
        time: number;
        hunger: number;
        loan: number;
    }): void {
        this.statusChips.innerHTML = '';

        const chips: Array<{ text: string; className: string }> = [];

        if (player.time > 12) {
            chips.push({ text: 'Well-Rested', className: 'chip-success' });
        }

        if (player.hunger > 50) {
            chips.push({
                text: player.hunger > 80 ? 'Starving' : 'Hungry',
                className: player.hunger > 80 ? 'chip-danger' : 'chip-warning'
            });
        } else {
            chips.push({ text: 'Satiated', className: 'chip-success' });
        }

        if (player.loan > 0) {
            chips.push({ text: 'In Debt', className: 'chip-danger' });
        }

        chips.forEach(chipData => {
            const chip = document.createElement('span');
            chip.className = `status-chip ${chipData.className}`;
            chip.textContent = chipData.text;
            this.statusChips.appendChild(chip);
        });
    }

    private updateGauges(player: {
        cash: number;
        savings: number;
        happiness: number;
        educationLevel: number;
        careerLevel: number;
    }): void {
        const wealth = Math.min(100, Math.round(((player.cash + player.savings) / 10000) * 100));
        const happiness = player.happiness;
        const education = Math.min(100, Math.round((player.educationLevel / 5) * 100));
        const career = Math.min(100, Math.round((player.careerLevel / 5) * 100));

        const gaugeData: Array<{ id: string; value: number }> = [
            { id: 'wealth', value: wealth },
            { id: 'happiness', value: happiness },
            { id: 'education', value: education },
            { id: 'career', value: career }
        ];

        gaugeData.forEach(({ id, value }) => {
            const gauge = this.gauges.get(id);
            if (gauge) {
                const config = this.getGaugeConfig(id, value);
                gauge.render(config);
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
            wealth: { color: '#00E676', label: 'Wealth' },
            happiness: { color: '#FFD600', label: 'Happiness' },
            education: { color: '#2979FF', label: 'Education' },
            career: { color: '#FF00FF', label: 'Career' }
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
