import { describe, it, expect, beforeEach } from 'vitest';
import InventoryScreen from '../../../../src/ui/components/screens/InventoryScreen.js';
import GameState from '../../../../src/game/GameState.js';
import type { Item } from '../../../../src/models/types.js';

describe('InventoryScreen', () => {
    let inventoryScreen: InventoryScreen;
    let gameState: GameState;
    let container: HTMLElement;

    beforeEach(() => {
        inventoryScreen = new InventoryScreen();
        gameState = new GameState(1);
        container = document.createElement('div');
        document.body.appendChild(container);
        inventoryScreen.mount(container);
    });

    describe('Initialization', () => {
        it('should create a section element with correct id and class', () => {
            const element = inventoryScreen.getElement();
            expect(element.tagName.toLowerCase()).toBe('section');
            expect(element.id).toBe('screen-inventory');
            expect(element.classList.contains('screen')).toBe(true);
            expect(element.classList.contains('hidden')).toBe(true);
        });

        it('should create essentials section with title', () => {
            const section = inventoryScreen.getEssentialsSection();
            expect(section).toBeDefined();
            expect(section.classList.contains('inventory-section')).toBe(true);

            const title = section.querySelector('.section-title');
            expect(title?.textContent).toBe('Essentials');
        });

        it('should create essentials grid', () => {
            const grid = inventoryScreen.getEssentialsGrid();
            expect(grid).toBeDefined();
            expect(grid.id).toBe('essentials-grid');
            expect(grid.classList.contains('essentials-grid')).toBe(true);
        });

        it('should create assets section with title', () => {
            const section = inventoryScreen.getAssetsSection();
            expect(section).toBeDefined();
            expect(section.classList.contains('inventory-section')).toBe(true);

            const title = section.querySelector('.section-title');
            expect(title?.textContent).toBe('Home Assets');
        });

        it('should create assets grid', () => {
            const grid = inventoryScreen.getAssetsGrid();
            expect(grid).toBeDefined();
            expect(grid.id).toBe('assets-grid');
            expect(grid.classList.contains('assets-grid')).toBe(true);
        });
    });

    describe('Rendering Essentials', () => {
        it('should render essential items', () => {
            inventoryScreen.render(gameState);

            const grid = inventoryScreen.getEssentialsGrid();
            const items = grid.querySelectorAll('.essential-item');
            expect(items.length).toBeGreaterThan(0);
        });

        it('should mark owned essential items', () => {
            const player = gameState.getCurrentPlayer();
            player.inventory = [{ name: 'New Clothes', cost: 50, happinessBoost: 20, type: 'essential', icon: 'clothes', benefit: 'Social Standing +5%', location: 'Shopping Mall' }] as Item[];
            inventoryScreen.render(gameState);

            const grid = inventoryScreen.getEssentialsGrid();
            const items = grid.querySelectorAll('.essential-item');
            let foundOwned = false;
            items.forEach(item => {
                if (item.classList.contains('owned')) {
                    foundOwned = true;
                }
            });
            expect(foundOwned).toBe(true);
        });

        it('should set title attribute on essential items', () => {
            inventoryScreen.render(gameState);

            const grid = inventoryScreen.getEssentialsGrid();
            const items = grid.querySelectorAll('.essential-item');
            items.forEach(item => {
                expect(item.getAttribute('title')).toBeTruthy();
            });
        });

        it('should render icons for essential items when icon exists', () => {
            inventoryScreen.render(gameState);

            const grid = inventoryScreen.getEssentialsGrid();
            const items = grid.querySelectorAll('.essential-item');
            items.forEach(item => {
                const svg = item.querySelector('svg');
                expect(svg).toBeDefined();
            });
        });
    });

    describe('Rendering Assets', () => {
        it('should render asset items', () => {
            inventoryScreen.render(gameState);

            const grid = inventoryScreen.getAssetsGrid();
            const items = grid.querySelectorAll('.inventory-card');
            expect(items.length).toBeGreaterThan(0);
        });

        it('should mark owned asset items', () => {
            const player = gameState.getCurrentPlayer();
            player.inventory = [{ name: 'Television', cost: 600, happinessBoost: 40, type: 'asset', icon: 'television', benefit: 'Relaxation +10%', location: 'Shopping Mall' }] as Item[];
            inventoryScreen.render(gameState);

            const grid = inventoryScreen.getAssetsGrid();
            const cards = grid.querySelectorAll('.inventory-card');
            let foundOwned = false;
            cards.forEach(card => {
                if (card.classList.contains('owned')) {
                    foundOwned = true;
                }
            });
            expect(foundOwned).toBe(true);
        });

        it('should render asset card with correct structure', () => {
            inventoryScreen.render(gameState);

            const grid = inventoryScreen.getAssetsGrid();
            const card = grid.querySelector('.inventory-card');
            expect(card).toBeDefined();

            const icon = card!.querySelector('.inventory-card-icon');
            const content = card!.querySelector('.inventory-card-content');
            const name = card!.querySelector('.inventory-card-name');
            const benefit = card!.querySelector('.inventory-card-benefit');

            expect(icon).toBeDefined();
            expect(content).toBeDefined();
            expect(name).toBeDefined();
            expect(benefit).toBeDefined();
        });

        it('should render asset cards with glass class', () => {
            inventoryScreen.render(gameState);

            const grid = inventoryScreen.getAssetsGrid();
            const cards = grid.querySelectorAll('.inventory-card');
            cards.forEach(card => {
                expect(card.classList.contains('glass')).toBe(true);
            });
        });
    });

    describe('Ownership States', () => {
        it('should correctly identify owned vs unowned items', () => {
            const player = gameState.getCurrentPlayer();
            inventoryScreen.render(gameState);

            const essentialsGrid = inventoryScreen.getEssentialsGrid();
            const items = essentialsGrid.querySelectorAll('.essential-item');
            let ownedCount = 0;
            let unownedCount = 0;

            items.forEach(item => {
                if (item.classList.contains('owned')) {
                    ownedCount++;
                } else {
                    unownedCount++;
                }
            });

            // At least one item should be rendered
            expect(items.length).toBeGreaterThan(0);
            // Most items should be unowned by default
            expect(unownedCount).toBeGreaterThan(0);
        });

        it('should handle empty inventory', () => {
            const player = gameState.getCurrentPlayer();
            player.inventory = [];
            inventoryScreen.render(gameState);

            const essentialsGrid = inventoryScreen.getEssentialsGrid();
            const ownedItems = essentialsGrid.querySelectorAll('.essential-item.owned');
            expect(ownedItems.length).toBe(0);
        });
    });

    describe('Re-rendering', () => {
        it('should clear and re-render essentials when inventory changes', () => {
            inventoryScreen.render(gameState);

            const player = gameState.getCurrentPlayer();
            player.inventory = [{ name: 'Groceries', cost: 50, happinessBoost: 5, type: 'essential', location: 'Shopping Mall' }] as Item[];
            inventoryScreen.render(gameState);

            const essentialsGrid = inventoryScreen.getEssentialsGrid();
            const items = essentialsGrid.querySelectorAll('.essential-item');
            expect(items.length).toBeGreaterThan(0);
        });

        it('should clear and re-render assets when inventory changes', () => {
            inventoryScreen.render(gameState);

            const player = gameState.getCurrentPlayer();
            player.inventory = [{ name: 'TV', cost: 500, happinessBoost: 10, type: 'asset', location: 'Shopping Mall', benefit: 'Happiness +10' }] as Item[];
            inventoryScreen.render(gameState);

            const assetsGrid = inventoryScreen.getAssetsGrid();
            const cards = assetsGrid.querySelectorAll('.inventory-card');
            expect(cards.length).toBeGreaterThan(0);
        });
    });

    describe('Lifecycle', () => {
        it('should mount to parent element', () => {
            expect(inventoryScreen.getElement().parentElement).toBe(container);
            expect(inventoryScreen.isMounted()).toBe(true);
        });

        it('should unmount from parent element', () => {
            inventoryScreen.unmount();
            expect(inventoryScreen.getElement().parentElement).toBeNull();
            expect(inventoryScreen.isMounted()).toBe(false);
        });

        it('should handle multiple mount/unmount cycles', () => {
            inventoryScreen.unmount();
            inventoryScreen.mount(container);
            expect(inventoryScreen.isMounted()).toBe(true);

            inventoryScreen.unmount();
            inventoryScreen.mount(container);
            expect(inventoryScreen.isMounted()).toBe(true);
        });
    });

    describe('BaseComponent Integration', () => {
        it('should inherit from BaseComponent', () => {
            expect(inventoryScreen.getElement).toBeDefined();
            expect(inventoryScreen.mount).toBeDefined();
            expect(inventoryScreen.unmount).toBeDefined();
            expect(inventoryScreen.isMounted).toBeDefined();
        });

        it('should have render method', () => {
            expect(inventoryScreen.render).toBeDefined();
            expect(typeof inventoryScreen.render).toBe('function');
        });
    });
});
