import BaseComponent from '../../BaseComponent.js';
import GameState from '../../../game/GameState.js';

export default class PlaceholderScreen extends BaseComponent<GameState> {
    private title: string;
    private message: string;

    constructor(title: string, message: string) {
        super('section', 'screen');
        this.title = title;
        this.message = message;
        this.buildDOM();
    }

    private buildDOM(): void {
        this.element.innerHTML = `
            <div class="screen-placeholder card glass">
                <h2 class="placeholder-title">${this.title}</h2>
                <p class="placeholder-message">${this.message}</p>
                <div class="placeholder-status">
                    <span class="status-badge">Under Construction</span>
                </div>
            </div>
        `;
    }

    protected _render(gameState: GameState): void {
        // No dynamic content for now
    }
}
