import BaseComponent from '../../BaseComponent.js';
import GameState from '../../../game/GameState.js';
import Icons from '../../Icons.js';
import EventBus, { UI_EVENTS } from '../../../EventBus.js';

export default class SystemScreen extends BaseComponent<GameState> {
    constructor() {
        super('section', 'screen');
        this.buildDOM();
    }

    private buildDOM(): void {
        const container = document.createElement('div');
        container.className = 'screen-placeholder card glass';
        
        const iconContainer = document.createElement('div');
        iconContainer.className = 'placeholder-icon-container';
        iconContainer.innerHTML = Icons.system(48, 'var(--neon-cyan)');
        
        const title = document.createElement('h2');
        title.className = 'placeholder-title';
        title.textContent = 'System Menu';
        
        const message = document.createElement('p');
        message.className = 'placeholder-message';
        message.textContent = 'Manage your neural connection and simulation parameters.';
        
        const actionGrid = document.createElement('div');
        actionGrid.className = 'system-action-grid';
        actionGrid.style.display = 'grid';
        actionGrid.style.gridTemplateColumns = '1fr';
        actionGrid.style.gap = 'var(--space-md)';
        actionGrid.style.marginTop = 'var(--space-xl)';
        actionGrid.style.width = '100%';
        actionGrid.style.maxWidth = '300px';

        const restartBtn = document.createElement('button');
        restartBtn.className = 'btn btn-secondary';
        restartBtn.style.color = 'var(--neon-red)';
        restartBtn.style.borderColor = 'var(--neon-red)';
        restartBtn.innerHTML = `
            <span style="display: flex; align-items: center; justify-content: center; gap: var(--space-sm);">
                ${Icons.standby(20, 'var(--neon-red)')}
                Restart Simulation
            </span>
        `;
        
        restartBtn.onclick = () => this.handleRestart();
        
        actionGrid.appendChild(restartBtn);
        
        container.appendChild(iconContainer);
        container.appendChild(title);
        container.appendChild(message);
        container.appendChild(actionGrid);
        
        this.element.appendChild(container);
    }

    private handleRestart(): void {
        EventBus.publish(UI_EVENTS.RESTART_GAME);
    }

    protected _render(_gameState: GameState): void {
        // No dynamic content for now
    }
}
