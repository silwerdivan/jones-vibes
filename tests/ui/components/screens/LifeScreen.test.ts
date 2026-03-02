import { describe, it, expect, beforeEach } from 'vitest';
import LifeScreen from '../../../../src/ui/components/screens/LifeScreen.js';
import GameState from '../../../../src/game/GameState.js';

describe('LifeScreen', () => {
    let lifeScreen: LifeScreen;
    let gameState: GameState;
    let container: HTMLElement;

    beforeEach(() => {
        lifeScreen = new LifeScreen();
        gameState = new GameState(1);
        container = document.createElement('div');
        document.body.appendChild(container);
        lifeScreen.mount(container);
    });

    describe('Initialization', () => {
        it('should create a section element with correct class', () => {
            const element = lifeScreen.getElement();
            expect(element.tagName.toLowerCase()).toBe('section');
            expect(element.classList.contains('screen')).toBe(true);
        });

        it('should create life header with avatar and status chips', () => {
            const avatar = lifeScreen.getLifeAvatar();
            const chips = lifeScreen.getStatusChips();

            expect(avatar).toBeDefined();
            expect(avatar.classList.contains('avatar-sm')).toBe(true);
            expect(chips).toBeDefined();
            expect(chips.id).toBe('status-chips');
        });

        it('should create gauge grid with 4 gauges', () => {
            const gaugeGrid = lifeScreen.getGaugeGrid();
            expect(gaugeGrid).toBeDefined();
            expect(gaugeGrid.classList.contains('gauge-grid')).toBe(true);

            const gaugeCards = gaugeGrid.querySelectorAll('.gauge-card');
            expect(gaugeCards.length).toBe(4);
        });

        it('should create gauges with correct IDs', () => {
            const expectedIds = ['wealth', 'happiness', 'education', 'career'];
            expectedIds.forEach(id => {
                const gauge = lifeScreen.getGauge(id);
                expect(gauge).toBeDefined();
            });
        });
    });

    describe('Rendering', () => {
        it('should update avatar for player 1', () => {
            gameState.currentPlayerIndex = 0;
            lifeScreen.render(gameState);

            const avatar = lifeScreen.getLifeAvatar();
            expect(avatar.textContent).toBe('P1');
            expect(avatar.dataset.player).toBe('1');
        });

        it('should update avatar for AI player', () => {
            // Set up 2 player game so we can test AI avatar
            const gameState2P = new GameState(2, true);
            gameState2P.currentPlayerIndex = 1;
            lifeScreen.render(gameState2P);

            const avatar = lifeScreen.getLifeAvatar();
            expect(avatar.textContent).toBe('AI');
            expect(avatar.dataset.player).toBe('2');
        });

        it('should render Optimal Buffer chip when time > 12', () => {
            const player = gameState.getCurrentPlayer();
            (player as any).time = 13;
            lifeScreen.render(gameState);

            const chips = lifeScreen.getStatusChips();
            const chip = chips.querySelector('.chip-success');
            expect(chip?.textContent).toBe('Optimal Buffer');
        });

        it('should render Hungry chip when hunger > 50', () => {
            const player = gameState.getCurrentPlayer();
            (player as any).hunger = 60;
            lifeScreen.render(gameState);

            const chips = lifeScreen.getStatusChips();
            const chip = chips.querySelector('.chip-warning');
            expect(chip?.textContent).toBe('Deficit Warning');
        });

        it('should render Starving chip when hunger > 80', () => {
            const player = gameState.getCurrentPlayer();
            (player as any).hunger = 85;
            lifeScreen.render(gameState);

            const chips = lifeScreen.getStatusChips();
            const chip = chips.querySelector('.chip-danger');
            expect(chip?.textContent).toBe('CRITICAL DEFICIT');
        });

        it('should render Nominal chip when hunger <= 50', () => {
            const player = gameState.getCurrentPlayer();
            (player as any).time = 12; // Not well-rested
            (player as any).hunger = 30;
            lifeScreen.render(gameState);

            const chips = lifeScreen.getStatusChips();
            const chip = chips.querySelector('.chip-success');
            expect(chip?.textContent).toBe('Nominal');
        });

        it('should render Negative Liquidity chip when loan > 0', () => {
            const player = gameState.getCurrentPlayer();
            (player as any).loan = 1000;
            lifeScreen.render(gameState);

            const chips = lifeScreen.getStatusChips();
            const debtChip = Array.from(chips.querySelectorAll('.chip-danger')).find(
                chip => chip.textContent === 'Negative Liquidity'
            );
            expect(debtChip).toBeDefined();
        });

        it('should render multiple status chips', () => {
            const player = gameState.getCurrentPlayer();
            (player as any).time = 15;
            (player as any).hunger = 90;
            (player as any).loan = 500;
            lifeScreen.render(gameState);

            const chips = lifeScreen.getStatusChips();
            const allChips = chips.querySelectorAll('.status-chip');
            expect(allChips.length).toBeGreaterThan(1);
        });
    });

    describe('Gauge Updates', () => {
        it('should update wealth gauge correctly', () => {
            const player = gameState.getCurrentPlayer();
            (player as any).cash = 5000;
            (player as any).savings = 3000;
            lifeScreen.render(gameState);

            const gauge = lifeScreen.getGauge('wealth');
            expect(gauge).toBeDefined();
            const element = gauge!.getElement();
            expect(element.querySelector('.gauge-percentage')?.textContent).toBe('80%');
        });

        it('should cap wealth gauge at 100%', () => {
            const player = gameState.getCurrentPlayer();
            (player as any).cash = 20000;
            (player as any).savings = 5000;
            lifeScreen.render(gameState);

            const gauge = lifeScreen.getGauge('wealth');
            const element = gauge!.getElement();
            expect(element.querySelector('.gauge-percentage')?.textContent).toBe('100%');
        });

        it('should update happiness gauge', () => {
            const player = gameState.getCurrentPlayer();
            (player as any).happiness = 75;
            lifeScreen.render(gameState);

            const gauge = lifeScreen.getGauge('happiness');
            const element = gauge!.getElement();
            expect(element.querySelector('.gauge-percentage')?.textContent).toBe('75%');
        });

        it('should update education gauge based on education level', () => {
            const player = gameState.getCurrentPlayer();
            (player as any).educationLevel = 3;
            lifeScreen.render(gameState);

            const gauge = lifeScreen.getGauge('education');
            const element = gauge!.getElement();
            expect(element.querySelector('.gauge-percentage')?.textContent).toBe('60%');
        });

        it('should update career gauge based on career level', () => {
            const player = gameState.getCurrentPlayer();
            (player as any).careerLevel = 2;
            lifeScreen.render(gameState);

            const gauge = lifeScreen.getGauge('career');
            const element = gauge!.getElement();
            expect(element.querySelector('.gauge-percentage')?.textContent).toBe('40%');
        });

        it('should apply correct colors to gauges', () => {
            lifeScreen.render(gameState);

            const configs = [
                { id: 'wealth', color: '#00E676' },
                { id: 'happiness', color: '#FFD600' },
                { id: 'education', color: '#2979FF' },
                { id: 'career', color: '#FF00FF' }
            ];

            configs.forEach(({ id, color }) => {
                const gauge = lifeScreen.getGauge(id);
                const element = gauge!.getElement();
                const circle = element.querySelector('.gauge-ring-fill');
                expect(circle?.getAttribute('style')).toContain(color);
            });
        });
    });

    describe('Lifecycle', () => {
        it('should mount to parent element', () => {
            expect(lifeScreen.getElement().parentElement).toBe(container);
            expect(lifeScreen.isMounted()).toBe(true);
        });

        it('should unmount from parent element', () => {
            lifeScreen.unmount();
            expect(lifeScreen.getElement().parentElement).toBeNull();
            expect(lifeScreen.isMounted()).toBe(false);
        });

        it('should handle multiple mount/unmount cycles', () => {
            lifeScreen.unmount();
            lifeScreen.mount(container);
            expect(lifeScreen.isMounted()).toBe(true);

            lifeScreen.unmount();
            lifeScreen.mount(container);
            expect(lifeScreen.isMounted()).toBe(true);
        });
    });

    describe('BaseComponent Integration', () => {
        it('should inherit from BaseComponent', () => {
            expect(lifeScreen.getElement).toBeDefined();
            expect(lifeScreen.mount).toBeDefined();
            expect(lifeScreen.unmount).toBeDefined();
            expect(lifeScreen.isMounted).toBeDefined();
        });

        it('should have render method', () => {
            expect(lifeScreen.render).toBeDefined();
            expect(typeof lifeScreen.render).toBe('function');
        });
    });
});
