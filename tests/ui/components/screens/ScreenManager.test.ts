import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import ScreenManager from '../../../../src/ui/components/screens/ScreenManager.js';
import BaseComponent from '../../../../src/ui/BaseComponent.js';
import EventBus from '../../../../src/EventBus.js';

// Mock component for testing
class TestComponent extends BaseComponent<{ value: number }> {
    private name: string;
    public lastRenderedState: { value: number } | null = null;

    constructor(name: string) {
        super('div', 'test-component');
        this.name = name;
        this.element.dataset.name = name;
    }

    render(state: { value: number }): void {
        this.lastRenderedState = state;
        this.element.textContent = `Test Component: ${this.name}, Value: ${state.value}`;
    }

    getName(): string {
        return this.name;
    }
}

describe('ScreenManager', () => {
    let screenManager: ScreenManager;
    let container: HTMLElement;

    beforeEach(() => {
        // Create a container for testing
        container = document.createElement('div');
        container.id = 'test-container';
        document.body.appendChild(container);

        // Reset EventBus
        (EventBus as any).events = {};

        screenManager = new ScreenManager();
    });

    afterEach(() => {
        screenManager.unmount();
        container.remove();
    });

    describe('Initialization', () => {
        it('should create a screen manager with correct structure', () => {
            expect(screenManager.getElement()).toBeDefined();
            expect(screenManager.getElement().className).toBe('screen-manager');
        });

        it('should have content area and tab bar', () => {
            screenManager.mount(container);

            const contentArea = screenManager.getContentArea();
            const tabBar = screenManager.getTabBar();

            expect(contentArea).toBeDefined();
            expect(contentArea.className).toBe('content-area');
            expect(tabBar).toBeDefined();
            expect(tabBar.className).toBe('tab-bar glass');
        });

        it('should start with no current screen', () => {
            expect(screenManager.getCurrentScreenId()).toBe('');
        });
    });

    describe('Screen Registration', () => {
        it('should register a screen', () => {
            const component = new TestComponent('screen1');
            screenManager.registerScreen('screen1', component);

            expect(screenManager.getScreenComponent('screen1')).toBe(component);
        });

        it('should make the first registered screen visible by default', () => {
            const component = new TestComponent('screen1');
            screenManager.mount(container);
            screenManager.registerScreen('screen1', component);

            expect(screenManager.getCurrentScreenId()).toBe('screen1');

            const screenElement = container.querySelector('#screen-screen1');
            expect(screenElement?.classList.contains('hidden')).toBe(false);
        });

        it('should hide subsequent screens by default', () => {
            const component1 = new TestComponent('screen1');
            const component2 = new TestComponent('screen2');

            screenManager.mount(container);
            screenManager.registerScreen('screen1', component1);
            screenManager.registerScreen('screen2', component2);

            const screenElement2 = container.querySelector('#screen-screen2');
            expect(screenElement2?.classList.contains('hidden')).toBe(true);
        });

        it('should wrap component in a section element', () => {
            const component = new TestComponent('screen1');
            screenManager.mount(container);
            screenManager.registerScreen('screen1', component);

            const section = container.querySelector('#screen-screen1');
            expect(section?.tagName).toBe('SECTION');
            expect(section?.contains(component.getElement())).toBe(true);
        });
    });

    describe('Tab Registration', () => {
        it('should register a tab', () => {
            screenManager.mount(container);
            screenManager.registerTab('screen1', 'city', 'City');

            const tab = container.querySelector('[data-screen="screen1"]');
            expect(tab).toBeDefined();
            expect(tab?.classList.contains('tab-item')).toBe(true);
        });

        it('should set active class on tab for current screen', () => {
            const component = new TestComponent('screen1');
            screenManager.mount(container);
            screenManager.registerScreen('screen1', component);
            screenManager.registerTab('screen1', 'city', 'City');

            const tab = container.querySelector('[data-screen="screen1"]');
            expect(tab?.classList.contains('active')).toBe(true);
        });

        it('should store icon name in dataset', () => {
            screenManager.mount(container);
            screenManager.registerTab('screen1', 'city', 'City');

            expect(screenManager.getTabIconName('screen1')).toBe('city');
        });
    });

    describe('Screen Switching', () => {
        beforeEach(() => {
            screenManager.mount(container);
        });

        it('should switch to a different screen', () => {
            const component1 = new TestComponent('screen1');
            const component2 = new TestComponent('screen2');

            screenManager.registerScreen('screen1', component1);
            screenManager.registerScreen('screen2', component2);
            screenManager.registerTab('screen1', 'icon1', 'Screen 1');
            screenManager.registerTab('screen2', 'icon2', 'Screen 2');

            screenManager.switchScreen('screen2');

            expect(screenManager.getCurrentScreenId()).toBe('screen2');
        });

        it('should hide previous screen and show new screen', () => {
            const component1 = new TestComponent('screen1');
            const component2 = new TestComponent('screen2');

            screenManager.registerScreen('screen1', component1);
            screenManager.registerScreen('screen2', component2);

            const screen1Element = container.querySelector('#screen-screen1');
            const screen2Element = container.querySelector('#screen-screen2');

            expect(screen1Element?.classList.contains('hidden')).toBe(false);
            expect(screen2Element?.classList.contains('hidden')).toBe(true);

            screenManager.switchScreen('screen2');

            expect(screen1Element?.classList.contains('hidden')).toBe(true);
            expect(screen2Element?.classList.contains('hidden')).toBe(false);
        });

        it('should not switch if screen does not exist', () => {
            const component1 = new TestComponent('screen1');
            screenManager.registerScreen('screen1', component1);

            const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
            screenManager.switchScreen('nonexistent');

            expect(screenManager.getCurrentScreenId()).toBe('screen1');
            expect(consoleSpy).toHaveBeenCalledWith('Screen "nonexistent" is not registered');

            consoleSpy.mockRestore();
        });

        it('should not switch if already on the target screen', () => {
            const component1 = new TestComponent('screen1');
            screenManager.registerScreen('screen1', component1);

            const publishSpy = vi.spyOn(EventBus, 'publish');
            screenManager.switchScreen('screen1');

            expect(publishSpy).not.toHaveBeenCalledWith('screenSwitched', expect.anything());

            publishSpy.mockRestore();
        });

        it('should update tab active states on switch', () => {
            const component1 = new TestComponent('screen1');
            const component2 = new TestComponent('screen2');

            screenManager.registerScreen('screen1', component1);
            screenManager.registerScreen('screen2', component2);
            screenManager.registerTab('screen1', 'icon1', 'Screen 1');
            screenManager.registerTab('screen2', 'icon2', 'Screen 2');

            const tab1 = container.querySelector('[data-screen="screen1"]');
            const tab2 = container.querySelector('[data-screen="screen2"]');

            expect(tab1?.classList.contains('active')).toBe(true);
            expect(tab2?.classList.contains('active')).toBe(false);

            screenManager.switchScreen('screen2');

            expect(tab1?.classList.contains('active')).toBe(false);
            expect(tab2?.classList.contains('active')).toBe(true);
        });

        it('should publish screenSwitched event', () => {
            const component1 = new TestComponent('screen1');
            const component2 = new TestComponent('screen2');

            screenManager.registerScreen('screen1', component1);
            screenManager.registerScreen('screen2', component2);

            const publishSpy = vi.spyOn(EventBus, 'publish');
            screenManager.switchScreen('screen2');

            expect(publishSpy).toHaveBeenCalledWith('screenSwitched', {
                screenId: 'screen2',
                previousScreenId: 'screen1'
            });

            publishSpy.mockRestore();
        });
    });

    describe('Tab Icons', () => {
        beforeEach(() => {
            screenManager.mount(container);
        });

        it('should set tab icon SVG', () => {
            screenManager.registerTab('screen1', 'city', 'City');
            const svgString = '<svg><circle /></svg>';

            screenManager.setTabIcon('screen1', svgString);

            const tab = container.querySelector('[data-screen="screen1"]');
            const iconContainer = tab?.querySelector('.tab-icon');
            expect(iconContainer?.innerHTML).toContain('<svg');
            expect(iconContainer?.innerHTML).toContain('</svg>');
            expect(iconContainer?.innerHTML).toContain('circle');
        });

        it('should set active color for current tab icon', () => {
            const component = new TestComponent('screen1');
            screenManager.registerScreen('screen1', component);
            screenManager.registerTab('screen1', 'city', 'City');

            const svgString = '<svg stroke="rgba(255, 255, 255, 0.5)"><circle /></svg>';
            screenManager.setTabIcon('screen1', svgString);

            const tab = container.querySelector('[data-screen="screen1"]');
            const svg = tab?.querySelector('svg');
            expect(svg?.getAttribute('stroke')).toBe('#00FFFF');
        });

        it('should set inactive color for non-current tab icon', () => {
            const component1 = new TestComponent('screen1');
            const component2 = new TestComponent('screen2');

            screenManager.registerScreen('screen1', component1);
            screenManager.registerScreen('screen2', component2);
            screenManager.registerTab('screen1', 'city', 'City');
            screenManager.registerTab('screen2', 'life', 'Life');

            const svgString = '<svg><circle /></svg>';
            screenManager.setTabIcon('screen2', svgString);

            const tab = container.querySelector('[data-screen="screen2"]');
            const svg = tab?.querySelector('svg');
            expect(svg?.getAttribute('stroke')).toBe('rgba(255, 255, 255, 0.5)');
        });
    });

    describe('Lifecycle', () => {
        it('should mount and unmount correctly', () => {
            expect(screenManager.isMounted()).toBe(false);

            screenManager.mount(container);
            expect(screenManager.isMounted()).toBe(true);
            expect(container.contains(screenManager.getElement())).toBe(true);

            screenManager.unmount();
            expect(screenManager.isMounted()).toBe(false);
            expect(container.contains(screenManager.getElement())).toBe(false);
        });

        it('should render method exist and be callable', () => {
            expect(() => screenManager.render()).not.toThrow();
        });
    });
});
