import EventBus from '../../../EventBus.js';
import BaseComponent from '../../BaseComponent.js';

export default class ScreenManager extends BaseComponent<unknown> {
    private screens: Map<string, BaseComponent<unknown>>;
    private tabElements: Map<string, HTMLElement>;
    private screenElements: Map<string, HTMLElement>;
    private currentScreenId: string;
    private contentArea: HTMLElement;
    private tabBar: HTMLElement;

    constructor() {
        super('div', 'screen-manager');
        this.screens = new Map();
        this.tabElements = new Map();
        this.screenElements = new Map();
        this.currentScreenId = '';

        // Create content area and tab bar
        this.contentArea = document.createElement('main');
        this.contentArea.className = 'content-area';

        this.tabBar = document.createElement('nav');
        this.tabBar.className = 'tab-bar glass';

        this.element.appendChild(this.contentArea);
        this.element.appendChild(this.tabBar);
    }

    registerScreen(id: string, component: BaseComponent<unknown>): void {
        this.screens.set(id, component);

        // Create screen container
        const screenContainer = document.createElement('section');
        screenContainer.id = `screen-${id}`;
        screenContainer.className = 'screen hidden';
        screenContainer.appendChild(component.getElement());

        this.screenElements.set(id, screenContainer);
        this.contentArea.appendChild(screenContainer);

        // If this is the first screen, make it visible by default
        if (this.screens.size === 1) {
            this.currentScreenId = id;
            screenContainer.classList.remove('hidden');
        }
    }

    registerTab(id: string, iconName: string, label: string): void {
        const tabButton = document.createElement('button');
        tabButton.className = 'tab-item';
        tabButton.dataset.screen = id;
        tabButton.setAttribute('aria-label', label);

        const iconSpan = document.createElement('span');
        iconSpan.className = 'tab-icon';

        const labelSpan = document.createElement('span');
        labelSpan.className = 'tab-label';
        labelSpan.textContent = label;

        tabButton.appendChild(iconSpan);
        tabButton.appendChild(labelSpan);

        // Add click listener
        tabButton.addEventListener('click', () => {
            this.switchScreen(id);
        });

        this.tabElements.set(id, tabButton);
        this.tabBar.appendChild(tabButton);

        // Update active state if this is the current screen
        if (id === this.currentScreenId) {
            tabButton.classList.add('active');
        }

        // Store icon name for later use
        tabButton.dataset.iconName = iconName;
    }

    switchScreen(screenId: string): void {
        if (this.currentScreenId === screenId) return;
        if (!this.screens.has(screenId)) {
            console.warn(`Screen "${screenId}" is not registered`);
            return;
        }

        const previousScreenId = this.currentScreenId;
        this.currentScreenId = screenId;

        // Hide all screens
        this.screenElements.forEach((element, id) => {
            if (id === screenId) {
                element.classList.remove('hidden');
            } else {
                element.classList.add('hidden');
            }
        });

        // Update tab active states
        this.tabElements.forEach((tab, id) => {
            const iconSvg = tab.querySelector('.tab-icon svg');

            if (id === screenId) {
                tab.classList.add('active');
                if (iconSvg) {
                    iconSvg.setAttribute('stroke', '#00FFFF');
                }
            } else {
                tab.classList.remove('active');
                if (iconSvg) {
                    iconSvg.setAttribute('stroke', 'rgba(255, 255, 255, 0.5)');
                }
            }
        });

        // Publish event
        EventBus.publish('screenSwitched', {
            screenId,
            previousScreenId
        });
    }

    getCurrentScreenId(): string {
        return this.currentScreenId;
    }

    getScreenComponent(id: string): BaseComponent<unknown> | undefined {
        return this.screens.get(id);
    }

    protected _render(_gameState: unknown): void {
        // ScreenManager doesn't need to render itself, 
        // it manages the rendering of child screens
    }

    // Helper method to set tab icons after registration
    setTabIcon(screenId: string, iconSvg: string): void {
        const tab = this.tabElements.get(screenId);
        if (tab) {
            const iconContainer = tab.querySelector('.tab-icon');
            if (iconContainer) {
                iconContainer.innerHTML = iconSvg;

                // Update color if this is the active tab
                if (screenId === this.currentScreenId) {
                    const svg = iconContainer.querySelector('svg');
                    if (svg) {
                        svg.setAttribute('stroke', '#00FFFF');
                    }
                } else {
                    const svg = iconContainer.querySelector('svg');
                    if (svg) {
                        svg.setAttribute('stroke', 'rgba(255, 255, 255, 0.5)');
                    }
                }
            }
        }
    }

    // Get the content area element for mounting other components
    getContentArea(): HTMLElement {
        return this.contentArea;
    }

    // Get the tab bar element
    getTabBar(): HTMLElement {
        return this.tabBar;
    }

    // Get the icon name for a tab
    getTabIconName(screenId: string): string | undefined {
        const tab = this.tabElements.get(screenId);
        return tab?.dataset.iconName;
    }
}
