import BaseComponent from '../../BaseComponent.js';
import EventBus, { UI_EVENTS, STATE_EVENTS } from '../../../EventBus.js';
import Icons from '../../Icons.js';
import GameState from '../../../game/GameState.js';
import { LOCATIONS, LocationName } from '../../../data/locations.js';

export interface BentoCardConfig {
    location: LocationName;
    isActive: boolean;
    onClick: () => void;
}

export default class CityScreen extends BaseComponent<GameState> {
    private bentoGrid: HTMLElement;
    private locationHint: HTMLElement;

    constructor() {
        super('section', 'screen');

        this.bentoGrid = document.createElement('div');
        this.bentoGrid.id = 'city-bento-grid';
        this.bentoGrid.className = 'bento-grid';
        this.element.appendChild(this.bentoGrid);

        this.locationHint = document.createElement('div');
        this.locationHint.id = 'location-hint';
        this.locationHint.className = 'location-hint';
        this.element.appendChild(this.locationHint);

        this.setupGranularSubscriptions();
    }

    private setupGranularSubscriptions(): void {
        // Subscribe to location changes for targeted re-rendering
        this.subscribe(STATE_EVENTS.LOCATION_CHANGED, ({ gameState }: { gameState: GameState }) => {
            const currentPlayer = gameState.getCurrentPlayer();
            this.updateLocationDisplay(currentPlayer.location as LocationName);
        });

        // Subscribe to player changes
        this.subscribe(STATE_EVENTS.PLAYER_CHANGED, ({ gameState }: { gameState: GameState }) => {
            const currentPlayer = gameState.getCurrentPlayer();
            this.updateLocationDisplay(currentPlayer.location as LocationName);
        });

        // Full render on turn change (week advance)
        this.subscribe(STATE_EVENTS.TURN_CHANGED, ({ gameState }: { gameState: GameState }) => {
            this.render(gameState);
        });

        // Fallback for stateChanged events
        EventBus.subscribe('stateChanged', (gameState: GameState) => {
            this.render(gameState);
        });
    }

    private updateLocationDisplay(currentLocation: LocationName): void {
        // Re-render the bento grid to update active state
        this.renderBentoGrid(currentLocation);
        this.updateLocationHint(currentLocation);
    }

    protected _render(gameState: GameState): void {
        const currentPlayer = gameState.getCurrentPlayer();
        const currentLocation = currentPlayer.location as LocationName;

        this.renderBentoGrid(currentLocation);
        this.updateLocationHint(currentLocation);
    }

    private renderBentoGrid(currentLocation: LocationName): void {
        this.bentoGrid.innerHTML = '';

        LOCATIONS.forEach(location => {
            const card = this.createBentoCard({
                location,
                isActive: currentLocation === location,
                onClick: () => this.handleLocationClick(location, currentLocation)
            });
            this.bentoGrid.appendChild(card);
        });
    }

    private createBentoCard(config: BentoCardConfig): HTMLElement {
        const { location, isActive, onClick } = config;
        
        const card = document.createElement('div');
        card.className = `bento-card ${isActive ? 'active' : ''}`;
        
        const iconSvg = this.getLocationIcon(location);
        const summary = this.getLocationSummary(location);

        card.innerHTML = `
            <div class="bento-card-icon">${iconSvg}</div>
            <div class="bento-card-title">${location}</div>
            <div class="bento-card-info">${summary}</div>
        `;

        card.addEventListener('click', onClick);

        return card;
    }

    private getLocationIcon(location: LocationName): string {
        switch (location) {
            case 'Hab-Pod 404': return Icons.apartment(32, '#FF00FF');
            case 'Labor Sector': return Icons.agency(32, '#00FFFF');
            case 'Cognitive Re-Ed': return Icons.cyberChip(32, '#2979FF');
            case 'Consumpt-Zone': return Icons.smartBag(32, '#FFD600');
            case 'Sustenance Hub': return Icons.restaurant(32, '#FF9100');
            case 'Mobility-Asset': return Icons.hoverCar(32, '#00E676');
            case 'Cred-Debt Ctr': return Icons.cryptoVault(32, '#FF5252');
            default: return '';
        }
    }

    private getLocationSummary(location: LocationName): string {
        switch (location) {
            case 'Hab-Pod 404': return 'Cycle Rest and turn end';
            case 'Labor Sector': return 'Productivity shifts';
            case 'Cognitive Re-Ed': return 'Compliance training';
            case 'Consumpt-Zone': return 'Asset acquisition';
            case 'Sustenance Hub': return 'Nutrient intake';
            case 'Mobility-Asset': return 'Transit assets';
            case 'Cred-Debt Ctr': return 'Yield-Optimize (Banking)';
            default: return '';
        }
    }

    private handleLocationClick(location: LocationName, currentLocation: LocationName): void {
        if (currentLocation !== location) {
            EventBus.publish(UI_EVENTS.TRAVEL, location);
        } else {
            EventBus.publish('showLocationDashboard', location);
        }
    }

    private updateLocationHint(location: LocationName): void {
        let hintText = '';
        
        switch (location) {
            case 'Hab-Pod 404': hintText = 'Cycle Rest and finalize turn protocol here'; break;
            case 'Labor Sector': hintText = 'Execute productivity shifts to accumulate Omni-Creds'; break;
            case 'Cognitive Re-Ed': hintText = 'Increase compliance level for higher productivity tiers'; break;
            case 'Consumpt-Zone': hintText = 'Acquire assets and essentials for morale maintenance'; break;
            case 'Sustenance Hub': hintText = 'Minimize bio-deficit through nutrient intake'; break;
            case 'Mobility-Asset': hintText = 'Procure transit assets for enhanced travel efficiency'; break;
            case 'Cred-Debt Ctr': hintText = 'Manage liquidity and optimize yield through credit-debt protocols'; break;
            default: hintText = 'Initiate travel to alternative sectors';
        }
        
        this.locationHint.textContent = hintText;
    }

    getBentoGrid(): HTMLElement {
        return this.bentoGrid;
    }

    getLocationHint(): HTMLElement {
        return this.locationHint;
    }
}
