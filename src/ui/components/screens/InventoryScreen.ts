import BaseComponent from '../../BaseComponent.js';
import GameState from '../../../game/GameState.js';
import { SHOPPING_ITEMS } from '../../../data/items.js';
import Icons from '../../Icons.js';
import type { Item, IconRegistry } from '../../../models/types.js';

export default class InventoryScreen extends BaseComponent<GameState> {
    private essentialsSection: HTMLElement;
    private essentialsGrid: HTMLElement;
    private assetsSection: HTMLElement;
    private assetsGrid: HTMLElement;

    constructor() {
        super('section', 'screen hidden');
        this.element.id = 'screen-inventory';

        this.essentialsSection = this.createSection('Essentials');
        this.essentialsGrid = this.createGrid('essentials-grid');
        this.essentialsSection.appendChild(this.essentialsGrid);

        this.assetsSection = this.createSection('Home Assets');
        this.assetsGrid = this.createGrid('assets-grid');
        this.assetsSection.appendChild(this.assetsGrid);

        this.element.appendChild(this.essentialsSection);
        this.element.appendChild(this.assetsSection);
    }

    private createSection(title: string): HTMLElement {
        const section = document.createElement('div');
        section.className = 'inventory-section';

        const heading = document.createElement('h3');
        heading.className = 'section-title';
        heading.textContent = title;

        section.appendChild(heading);
        return section;
    }

    private createGrid(id: string): HTMLElement {
        const grid = document.createElement('div');
        grid.id = id;
        grid.className = id === 'essentials-grid' ? 'essentials-grid' : 'assets-grid';
        return grid;
    }

    render(gameState: GameState): void {
        const player = gameState.getCurrentPlayer();

        this.renderEssentials(player.inventory);
        this.renderAssets(player.inventory);
    }

    private renderEssentials(inventory: Item[]): void {
        this.essentialsGrid.innerHTML = '';

        const essentials = SHOPPING_ITEMS.filter(item => item.type === 'essential' && item.icon);

        essentials.forEach(item => {
            const isOwned = inventory.some((i: Item) => i.name === item.name);
            const element = this.createEssentialItem(item, isOwned);
            this.essentialsGrid.appendChild(element);
        });
    }

    private createEssentialItem(item: Item, isOwned: boolean): HTMLElement {
        const div = document.createElement('div');
        div.className = `essential-item ${isOwned ? 'owned' : ''}`;
        div.title = item.name;

        if (item.icon) {
            const iconColor = isOwned ? '#00FFFF' : 'rgba(255,255,255,0.2)';
            const iconSvg = (Icons as unknown as IconRegistry)[item.icon](32, iconColor);
            div.innerHTML = iconSvg;
        }

        return div;
    }

    private renderAssets(inventory: Item[]): void {
        this.assetsGrid.innerHTML = '';

        const assets = SHOPPING_ITEMS.filter(item => item.type === 'asset');

        assets.forEach(item => {
            const isOwned = inventory.some((i: Item) => i.name === item.name);
            const card = this.createAssetCard(item, isOwned);
            this.assetsGrid.appendChild(card);
        });
    }

    private createAssetCard(item: Item, isOwned: boolean): HTMLElement {
        const card = document.createElement('div');
        card.className = `inventory-card glass ${isOwned ? 'owned' : ''}`;

        const iconContainer = document.createElement('div');
        iconContainer.className = 'inventory-card-icon';

        if (item.icon) {
            const iconColor = isOwned ? '#00FFFF' : 'rgba(255,255,255,0.2)';
            const iconSvg = (Icons as unknown as IconRegistry)[item.icon](40, iconColor);
            iconContainer.innerHTML = iconSvg;
        }

        const content = document.createElement('div');
        content.className = 'inventory-card-content';

        const name = document.createElement('div');
        name.className = 'inventory-card-name';
        name.textContent = item.name;

        const benefit = document.createElement('div');
        benefit.className = 'inventory-card-benefit';
        benefit.textContent = item.benefit || '';

        content.appendChild(name);
        content.appendChild(benefit);

        card.appendChild(iconContainer);
        card.appendChild(content);

        return card;
    }

    getEssentialsGrid(): HTMLElement {
        return this.essentialsGrid;
    }

    getAssetsGrid(): HTMLElement {
        return this.assetsGrid;
    }

    getEssentialsSection(): HTMLElement {
        return this.essentialsSection;
    }

    getAssetsSection(): HTMLElement {
        return this.assetsSection;
    }
}
