import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import CityScreen from '../../../../src/ui/components/screens/CityScreen.js';
import GameState from '../../../../src/game/GameState.js';
import EventBus, { UI_EVENTS } from '../../../../src/EventBus.js';
import { LOCATIONS } from '../../../../src/data/locations.js';

describe('CityScreen', () => {
    let cityScreen: CityScreen;
    let gameState: GameState;
    let container: HTMLElement;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);

        gameState = new GameState(1, false);
        
        (EventBus as any).events = {};
        
        cityScreen = new CityScreen();
    });

    afterEach(() => {
        cityScreen.unmount();
        container.remove();
    });

    describe('initialization', () => {
        it('should create a screen section element', () => {
            const element = cityScreen.getElement();
            expect(element.tagName.toLowerCase()).toBe('section');
            expect(element.id).toBe('screen-city');
            expect(element.classList.contains('screen')).toBe(true);
        });

        it('should create bento grid container', () => {
            const grid = cityScreen.getBentoGrid();
            expect(grid).not.toBeNull();
            expect(grid.id).toBe('city-bento-grid');
            expect(grid.classList.contains('bento-grid')).toBe(true);
        });

        it('should create FAB button', () => {
            const fab = cityScreen.getFabElement();
            expect(fab).not.toBeNull();
            expect(fab.id).toBe('fab-next-week');
            expect(fab.classList.contains('fab')).toBe(true);
        });

        it('should create location hint element', () => {
            const hint = cityScreen.getLocationHint();
            expect(hint).not.toBeNull();
            expect(hint.id).toBe('location-hint');
            expect(hint.classList.contains('location-hint')).toBe(true);
        });

        it('should be unmounted initially', () => {
            expect(cityScreen.isMounted()).toBe(false);
        });
    });

    describe('render', () => {
        it('should render all location cards', () => {
            cityScreen.mount(container);
            cityScreen.render(gameState);

            const cards = cityScreen.getBentoGrid().querySelectorAll('.bento-card');
            expect(cards.length).toBe(LOCATIONS.length);
        });

        it('should mark current location as active', () => {
            gameState.getCurrentPlayer().location = 'Home';
            cityScreen.mount(container);
            cityScreen.render(gameState);

            const cards = cityScreen.getBentoGrid().querySelectorAll('.bento-card');
            const homeCard = Array.from(cards).find(card => 
                card.querySelector('.bento-card-title')?.textContent === 'Home'
            );
            expect(homeCard?.classList.contains('active')).toBe(true);
        });

        it('should show FAB when at Home', () => {
            gameState.getCurrentPlayer().location = 'Home';
            cityScreen.mount(container);
            cityScreen.render(gameState);

            expect(cityScreen.getFabElement().classList.contains('hidden')).toBe(false);
        });

        it('should hide FAB when not at Home', () => {
            gameState.getCurrentPlayer().location = 'Bank';
            cityScreen.mount(container);
            cityScreen.render(gameState);

            expect(cityScreen.getFabElement().classList.contains('hidden')).toBe(true);
        });

        it('should update location hint text', () => {
            gameState.getCurrentPlayer().location = 'Bank';
            cityScreen.mount(container);
            cityScreen.render(gameState);

            expect(cityScreen.getLocationHint().textContent).toContain('Manage your finances');
        });

        it('should render location icons', () => {
            cityScreen.mount(container);
            cityScreen.render(gameState);

            const cards = cityScreen.getBentoGrid().querySelectorAll('.bento-card');
            cards.forEach(card => {
                const icon = card.querySelector('.bento-card-icon');
                expect(icon).not.toBeNull();
                expect(icon?.innerHTML).toContain('svg');
            });
        });

        it('should render location summaries', () => {
            cityScreen.mount(container);
            cityScreen.render(gameState);

            const cards = cityScreen.getBentoGrid().querySelectorAll('.bento-card');
            cards.forEach(card => {
                const summary = card.querySelector('.bento-card-info');
                expect(summary).not.toBeNull();
                expect(summary?.textContent?.length).toBeGreaterThan(0);
            });
        });
    });

    describe('location click handling', () => {
        it('should publish TRAVEL event when clicking different location', () => {
            const mockPublish = vi.fn();
            EventBus.publish = mockPublish;

            gameState.getCurrentPlayer().location = 'Home';
            cityScreen.mount(container);
            cityScreen.render(gameState);

            const cards = cityScreen.getBentoGrid().querySelectorAll('.bento-card');
            const bankCard = Array.from(cards).find(card => 
                card.querySelector('.bento-card-title')?.textContent === 'Bank'
            );

            bankCard?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

            expect(mockPublish).toHaveBeenCalledWith(UI_EVENTS.TRAVEL, 'Bank');
        });

        it('should publish showLocationDashboard when clicking current location', () => {
            const mockPublish = vi.fn();
            EventBus.publish = mockPublish;

            gameState.getCurrentPlayer().location = 'Bank';
            cityScreen.mount(container);
            cityScreen.render(gameState);

            const cards = cityScreen.getBentoGrid().querySelectorAll('.bento-card');
            const bankCard = Array.from(cards).find(card => 
                card.querySelector('.bento-card-title')?.textContent === 'Bank'
            );

            bankCard?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

            expect(mockPublish).toHaveBeenCalledWith('showLocationDashboard', 'Bank');
        });
    });

    describe('FAB click handling', () => {
        it('should publish REST_END_TURN when FAB is clicked', () => {
            const mockPublish = vi.fn();
            EventBus.publish = mockPublish;

            cityScreen.mount(container);
            cityScreen.getFabElement().dispatchEvent(new MouseEvent('click', { bubbles: true }));

            expect(mockPublish).toHaveBeenCalledWith(UI_EVENTS.REST_END_TURN);
        });
    });

    describe('location hints', () => {
        it('should show correct hint for Home', () => {
            gameState.getCurrentPlayer().location = 'Home';
            cityScreen.mount(container);
            cityScreen.render(gameState);

            expect(cityScreen.getLocationHint().textContent).toBe('Rest and end your turn here');
        });

        it('should show correct hint for Employment Agency', () => {
            gameState.getCurrentPlayer().location = 'Employment Agency';
            cityScreen.mount(container);
            cityScreen.render(gameState);

            expect(cityScreen.getLocationHint().textContent).toBe('Find work and earn money');
        });

        it('should show correct hint for Community College', () => {
            gameState.getCurrentPlayer().location = 'Community College';
            cityScreen.mount(container);
            cityScreen.render(gameState);

            expect(cityScreen.getLocationHint().textContent).toBe('Improve your education for better jobs');
        });

        it('should show correct hint for Shopping Mall', () => {
            gameState.getCurrentPlayer().location = 'Shopping Mall';
            cityScreen.mount(container);
            cityScreen.render(gameState);

            expect(cityScreen.getLocationHint().textContent).toBe('Buy items to boost your happiness');
        });

        it('should show correct hint for Fast Food', () => {
            gameState.getCurrentPlayer().location = 'Fast Food';
            cityScreen.mount(container);
            cityScreen.render(gameState);

            expect(cityScreen.getLocationHint().textContent).toBe('Grab a quick bite to eat');
        });

        it('should show correct hint for Used Car Lot', () => {
            gameState.getCurrentPlayer().location = 'Used Car Lot';
            cityScreen.mount(container);
            cityScreen.render(gameState);

            expect(cityScreen.getLocationHint().textContent).toBe('Purchase a car for faster travel');
        });

        it('should show correct hint for Bank', () => {
            gameState.getCurrentPlayer().location = 'Bank';
            cityScreen.mount(container);
            cityScreen.render(gameState);

            expect(cityScreen.getLocationHint().textContent).toBe('Manage your finances: deposit, withdraw, or take a loan');
        });
    });

    describe('mount/unmount', () => {
        it('should mount to parent element', () => {
            cityScreen.mount(container);

            expect(container.contains(cityScreen.getElement())).toBe(true);
            expect(cityScreen.isMounted()).toBe(true);
        });

        it('should unmount from DOM', () => {
            cityScreen.mount(container);
            cityScreen.unmount();

            expect(container.contains(cityScreen.getElement())).toBe(false);
            expect(cityScreen.isMounted()).toBe(false);
        });
    });

    describe('re-rendering', () => {
        it('should update active state when location changes', () => {
            gameState.getCurrentPlayer().location = 'Home';
            cityScreen.mount(container);
            cityScreen.render(gameState);

            let cards = cityScreen.getBentoGrid().querySelectorAll('.bento-card');
            let homeCard = Array.from(cards).find(card => 
                card.querySelector('.bento-card-title')?.textContent === 'Home'
            );
            expect(homeCard?.classList.contains('active')).toBe(true);

            gameState.getCurrentPlayer().location = 'Bank';
            cityScreen.render(gameState);

            cards = cityScreen.getBentoGrid().querySelectorAll('.bento-card');
            homeCard = Array.from(cards).find(card => 
                card.querySelector('.bento-card-title')?.textContent === 'Home'
            );
            const bankCard = Array.from(cards).find(card => 
                card.querySelector('.bento-card-title')?.textContent === 'Bank'
            );

            expect(homeCard?.classList.contains('active')).toBe(false);
            expect(bankCard?.classList.contains('active')).toBe(true);
        });
    });
});
