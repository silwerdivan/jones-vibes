import { describe, it, expect, beforeEach } from 'vitest';
import HUD from '../../../src/ui/components/HUD.js';
import GameState from '../../../src/game/GameState.js';
import type { LogMessage } from '../../../src/models/types.js';

describe('HUD', () => {
    let hud: HUD;
    let container: HTMLElement;
    let mockGameState: GameState;

    beforeEach(() => {
        // Reset DOM
        document.body.innerHTML = '';
        container = document.createElement('div');
        container.className = 'app-shell';
        document.body.appendChild(container);

        // Create mock GameState
        mockGameState = {
            players: [
                { id: 1, cash: 100, time: 24, location: 'Home', isAI: false },
                { id: 2, cash: 200, time: 20, location: 'Employment Agency', isAI: true }
            ],
            currentPlayerIndex: 0,
            turn: 1,
            log: [],
            getCurrentPlayer() {
                return this.players[this.currentPlayerIndex];
            }
        } as unknown as GameState;

        // Create HUD instance
        hud = new HUD();
    });

    describe('constructor', () => {
        it('should create HUD element with correct tag and classes', () => {
            const element = hud.getElement();
            expect(element.tagName).toBe('HEADER');
            expect(element.classList.contains('hud')).toBe(true);
            expect(element.classList.contains('glass')).toBe(true);
        });

        it('should build internal DOM structure', () => {
            const element = hud.getElement();
            expect(element.querySelector('[data-orb="p1"]')).not.toBeNull();
            expect(element.querySelector('[data-orb="p2"]')).not.toBeNull();
            expect(element.querySelector('[data-cash]')).not.toBeNull();
            expect(element.querySelector('[data-week]')).not.toBeNull();
            expect(element.querySelector('[data-location]')).not.toBeNull();
        });
    });

    describe('mount/unmount', () => {
        it('should mount to parent element', () => {
            hud.mount(container);
            expect(container.contains(hud.getElement())).toBe(true);
            expect(hud.isMounted()).toBe(true);
        });

        it('should unmount from parent element', () => {
            hud.mount(container);
            hud.unmount();
            expect(container.contains(hud.getElement())).toBe(false);
            expect(hud.isMounted()).toBe(false);
        });
    });

    describe('render', () => {
        beforeEach(() => {
            hud.mount(container);
        });

        it('should update cash display', () => {
            hud.render(mockGameState);
            const cashElement = hud.getElement().querySelector('[data-cash]');
            expect(cashElement?.textContent).toBe('$100');
        });

        it('should update week display', () => {
            hud.render(mockGameState);
            const weekElement = hud.getElement().querySelector('[data-week]');
            expect(weekElement?.textContent).toBe('1');
        });

        it('should update location display', () => {
            hud.render(mockGameState);
            const locationElement = hud.getElement().querySelector('[data-location]');
            expect(locationElement?.textContent).toBe('Home');
        });

        it('should set active class on current player orb', () => {
            hud.render(mockGameState);
            const orbP1 = hud.getElement().querySelector('[data-orb="p1"]');
            const orbP2 = hud.getElement().querySelector('[data-orb="p2"]');
            expect(orbP1?.classList.contains('active')).toBe(true);
            expect(orbP1?.classList.contains('inactive')).toBe(false);
            expect(orbP2?.classList.contains('active')).toBe(false);
            expect(orbP2?.classList.contains('inactive')).toBe(true);
        });

        it('should switch active player when currentPlayerIndex changes', () => {
            hud.render(mockGameState);
            mockGameState.currentPlayerIndex = 1;
            hud.render(mockGameState);
            
            const orbP1 = hud.getElement().querySelector('[data-orb="p1"]');
            const orbP2 = hud.getElement().querySelector('[data-orb="p2"]');
            expect(orbP1?.classList.contains('active')).toBe(false);
            expect(orbP2?.classList.contains('active')).toBe(true);
        });

        it('should update cash when player changes', () => {
            hud.render(mockGameState);
            mockGameState.currentPlayerIndex = 1;
            hud.render(mockGameState);
            
            const cashElement = hud.getElement().querySelector('[data-cash]');
            expect(cashElement?.textContent).toBe('$200');
        });
    });

    describe('news ticker', () => {
        it('should set news ticker content reference', () => {
            const tickerContent = document.createElement('div');
            tickerContent.id = 'news-ticker-content';
            hud.setNewsTickerContent(tickerContent);
            
            mockGameState.log = [
                { text: 'Test event 1' },
                { text: 'Test event 2' }
            ] as LogMessage[];
            
            hud.render(mockGameState);
            expect(tickerContent.textContent).toContain('Test event 1');
            expect(tickerContent.textContent).toContain('Test event 2');
        });
    });

    describe('extends BaseComponent', () => {
        it('should have getElement method', () => {
            expect(typeof hud.getElement).toBe('function');
        });

        it('should have mount method', () => {
            expect(typeof hud.mount).toBe('function');
        });

        it('should have unmount method', () => {
            expect(typeof hud.unmount).toBe('function');
        });

        it('should have isMounted method', () => {
            expect(typeof hud.isMounted).toBe('function');
        });

        it('should have render method', () => {
            expect(typeof hud.render).toBe('function');
        });
    });
});
