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
    private fabNextWeek: HTMLElement;
    private locationHint: HTMLElement;

    constructor() {
        super('section', 'screen');
        this.element.id = 'screen-city';

        this.bentoGrid = document.createElement('div');
        this.bentoGrid.id = 'city-bento-grid';
        this.bentoGrid.className = 'bento-grid';
        this.element.appendChild(this.bentoGrid);

        this.fabNextWeek = document.createElement('button');
        this.fabNextWeek.id = 'fab-next-week';
        this.fabNextWeek.className = 'fab hidden';
        this.fabNextWeek.innerHTML = `
            <i class="material-icons">bedtime</i>
            <span>Rest / End Turn</span>
        `;
        this.fabNextWeek.addEventListener('click', () => {
            EventBus.publish(UI_EVENTS.REST_END_TURN);
        });
        this.element.appendChild(this.fabNextWeek);

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
        this.updateFabVisibility(currentLocation);
        this.updateLocationHint(currentLocation);
    }

    protected _render(gameState: GameState): void {
        const currentPlayer = gameState.getCurrentPlayer();
        const currentLocation = currentPlayer.location as LocationName;

        this.renderBentoGrid(currentLocation);
        this.updateFabVisibility(currentLocation);
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
            case 'Home': return Icons.apartment(32, '#FF00FF');
            case 'Employment Agency': return Icons.agency(32, '#00FFFF');
            case 'Community College': return Icons.cyberChip(32, '#2979FF');
            case 'Shopping Mall': return Icons.smartBag(32, '#FFD600');
            case 'Fast Food': return Icons.restaurant(32, '#FF9100');
            case 'Used Car Lot': return Icons.hoverCar(32, '#00E676');
            case 'Bank': return Icons.cryptoVault(32, '#FF5252');
            default: return '';
        }
    }

    private getLocationSummary(location: LocationName): string {
        switch (location) {
            case 'Home': return 'Rest and end turn';
            case 'Employment Agency': return 'Find work';
            case 'Community College': return 'Study courses';
            case 'Shopping Mall': return 'Buy items';
            case 'Fast Food': return 'Eat food';
            case 'Used Car Lot': return 'Buy a car';
            case 'Bank': return 'Savings & Loans';
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

    private updateFabVisibility(currentLocation: LocationName): void {
        if (currentLocation === 'Home') {
            this.fabNextWeek.classList.remove('hidden');
        } else {
            this.fabNextWeek.classList.add('hidden');
        }
    }

    private updateLocationHint(location: LocationName): void {
        let hintText = '';
        
        switch (location) {
            case 'Home': hintText = 'Rest and end your turn here'; break;
            case 'Employment Agency': hintText = 'Find work and earn money'; break;
            case 'Community College': hintText = 'Improve your education for better jobs'; break;
            case 'Shopping Mall': hintText = 'Buy items to boost your happiness'; break;
            case 'Fast Food': hintText = 'Grab a quick bite to eat'; break;
            case 'Used Car Lot': hintText = 'Purchase a car for faster travel'; break;
            case 'Bank': hintText = 'Manage your finances: deposit, withdraw, or take a loan'; break;
            default: hintText = 'Travel to other locations';
        }
        
        this.locationHint.textContent = hintText;
    }

    getFabElement(): HTMLElement {
        return this.fabNextWeek;
    }

    getBentoGrid(): HTMLElement {
        return this.bentoGrid;
    }

    getLocationHint(): HTMLElement {
        return this.locationHint;
    }
}
