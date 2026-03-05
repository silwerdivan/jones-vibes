import BaseComponent from '../BaseComponent.js';
import GameState from '../../game/GameState.js';
import EventBus, { STATE_EVENTS } from '../../EventBus.js';

export enum MascotState {
    DEFAULT = 'default',
    PROFIT = 'profit',
    DEFICIT = 'deficit',
    HELPFUL = 'helpful'
}

export default class MascotUI extends BaseComponent<GameState> {
    private playerIndex: number;
    private isModalMode: boolean;
    private profitTimer: any = null;

    private static readonly ASSETS = {
        [MascotState.DEFAULT]: 'https://raw.githubusercontent.com/silwerdivan/jones-vibes/main/src/assets/ui/illustrations/default-smug-watchdog.png',
        [MascotState.PROFIT]: 'https://raw.githubusercontent.com/silwerdivan/jones-vibes/main/src/assets/ui/illustrations/profit-line-goes-up.png',
        [MascotState.DEFICIT]: 'https://raw.githubusercontent.com/silwerdivan/jones-vibes/main/src/assets/ui/illustrations/deficit-glitching-manager.png',
        [MascotState.HELPFUL]: 'https://raw.githubusercontent.com/silwerdivan/jones-vibes/main/src/assets/ui/illustrations/helpful-sarcastic-assistant.png'
    };

    constructor(playerIndex: number, isModalMode: boolean = false) {
        super('div', 'mascot-container');
        this.playerIndex = playerIndex;
        this.isModalMode = isModalMode;
        
        this.setupMascotSubscriptions();
    }

    private setupMascotSubscriptions(): void {
        // Step 2: Logic - Listen to STATE_EVENTS.CASH_CHANGED, TIME_CHANGED, PLAYER_CHANGED
        this.subscribe(STATE_EVENTS.CASH_CHANGED, (data: any) => {
            if (data.player && data.player.id === this.playerIndex + 1 && data.amount > 0) {
                this.triggerProfitState();
            }
            if (data.gameState) this.render(data.gameState);
        });

        this.subscribe(STATE_EVENTS.TIME_CHANGED, (data: any) => {
            if (data.gameState) this.render(data.gameState);
        });

        this.subscribe(STATE_EVENTS.PLAYER_CHANGED, (data: any) => {
            if (data.gameState) this.render(data.gameState);
        });

        // Fallback for general state changes
        this.subscribe('stateChanged', (gameState: GameState) => {
            if (gameState) this.render(gameState);
        });
        
        this.subscribe('mascotStateExpired', (data: any) => {
            if (data.playerIndex === this.playerIndex) {
                // The next regular render will pick up the state change
                // or we can force one if we have access to state.
                // Since HUD usually manages the main state, we'll let it happen there or on next event.
            }
        });
    }

    private triggerProfitState(): void {
        if (this.profitTimer) clearTimeout(this.profitTimer);
        
        this.profitTimer = setTimeout(() => {
            this.profitTimer = null;
            EventBus.publish('mascotStateExpired', { playerIndex: this.playerIndex });
        }, 2000);
    }

    protected _render(gameState: GameState): void {
        const player = gameState.players[this.playerIndex];
        if (!player) return;

        let newState = MascotState.DEFAULT;

        // Step 2 Logic Priority: Deficit (Bio-Deficit >= 50, Morale <= 20, Time <= 0) > Profit (2s timer) > Helpful (if isModalMode) > Default
        // Mapping: Bio-Deficit -> hunger, Morale -> happiness
        const isDeficit = player.hunger >= 50 || player.happiness <= 20 || player.time <= 0;
        
        if (isDeficit) {
            newState = MascotState.DEFICIT;
        } else if (this.profitTimer) {
            newState = MascotState.PROFIT;
        } else if (this.isModalMode) {
            newState = MascotState.HELPFUL;
        }

        const assetPath = MascotUI.ASSETS[newState];
        const glowClass = `mascot-${newState}`;

        this.element.innerHTML = `
            <img src="${assetPath}" alt="S.A.N.I.T.Y. Mascot" class="mascot-image ${glowClass}">
        `;
    }
}
