import BaseComponent from '../BaseComponent.js';
import { EULA_TEXT, EULA_CLAUSES } from '../../data/eula.js';
import EventBus from '../../EventBus.js';

export default class EulaModal extends BaseComponent<void> {
    private textContainer!: HTMLElement;
    private acceptButton!: HTMLButtonElement;
    private clauseCheckboxes: Map<string, HTMLInputElement> = new Map();
    private typewriterInterval: number | null = null;

    constructor() {
        super('div', 'modal-overlay eula-modal-overlay');
        this.buildDOM();
        this.initializeReferences();
        this.setupEventListeners();
    }

    private buildDOM(): void {
        this.element.innerHTML = `
            <div class="eula-container glass">
                <div class="scanlines"></div>
                <header class="eula-header">
                    <h1 class="neon-text-cyan">OMNILIFE_OS_LICENSE_v4.2</h1>
                    <div class="eula-status">STATUS: PENDING_ACKNOWLEDGMENT</div>
                </header>
                
                <main class="eula-content">
                    <div class="eula-text-wrapper">
                        <div class="eula-text" id="eula-text-container"></div>
                    </div>

                    <div class="eula-clauses-section">
                        <h2 class="section-title">OPTIONAL_PROTOCOL_ENHANCEMENTS</h2>
                        <div class="clauses-grid">
                            ${EULA_CLAUSES.map(clause => `
                                <label class="clause-card" for="clause-${clause.id}">
                                    <div class="clause-checkbox-wrapper">
                                        <input type="checkbox" id="clause-${clause.id}" data-clause-id="${clause.id}">
                                        <span class="custom-checkbox"></span>
                                    </div>
                                    <div class="clause-info">
                                        <div class="clause-title">${clause.title}</div>
                                        <div class="clause-desc">${clause.description}</div>
                                        <div class="clause-impact">
                                            <span class="impact-benefit">${clause.benefit}</span>
                                            <span class="impact-divider">|</span>
                                            <span class="impact-penalty">${clause.penalty}</span>
                                        </div>
                                    </div>
                                </label>
                            `).join('')}
                        </div>
                    </div>
                </main>

                <footer class="eula-footer">
                    <div class="eula-footer-note">SCROLL_TO_BOTTOM_TO_ENABLE_ACCEPTANCE</div>
                    <button id="eula-accept-btn" class="btn btn-primary btn-glow" disabled>
                        <i class="material-icons">check_circle</i>
                        <span>[ I ACCEPT ]</span>
                    </button>
                </footer>
            </div>
        `;
    }

    private initializeReferences(): void {
        this.textContainer = this.element.querySelector('#eula-text-container')!;
        this.acceptButton = this.element.querySelector('#eula-accept-btn')!;
        
        EULA_CLAUSES.forEach(clause => {
            const checkbox = this.element.querySelector(`#clause-${clause.id}`) as HTMLInputElement;
            if (checkbox) {
                this.clauseCheckboxes.set(clause.id, checkbox);
            }
        });
    }

    private setupEventListeners(): void {
        const scrollWrapper = this.element.querySelector('.eula-text-wrapper')!;
        scrollWrapper.addEventListener('scroll', () => {
            const { scrollTop, clientHeight, scrollHeight } = scrollWrapper;
            if (scrollTop + clientHeight >= scrollHeight - 10) {
                this.acceptButton.disabled = false;
                this.element.querySelector('.eula-footer-note')?.classList.add('hidden');
            }
        });

        this.acceptButton.addEventListener('click', () => {
            const selectedClauseIds = Array.from(this.clauseCheckboxes.entries())
                .filter(([_, checkbox]) => checkbox.checked)
                .map(([id, _]) => id);
            
            EventBus.publish('eulaAccepted', { selectedClauseIds });
        });
    }

    public startTypewriter(): void {
        if (this.typewriterInterval) clearInterval(this.typewriterInterval);
        
        this.textContainer.textContent = '';
        let index = 0;
        const text = EULA_TEXT.trim();
        
        // Speed up typewriter by adding multiple characters per frame or using a short interval
        this.typewriterInterval = window.setInterval(() => {
            if (index < text.length) {
                // Add 3 characters at a time for better speed/feel
                this.textContainer.textContent += text.slice(index, index + 3);
                index += 3;
                
                // Auto-scroll as text is added
                const scrollWrapper = this.element.querySelector('.eula-text-wrapper')!;
                scrollWrapper.scrollTop = scrollWrapper.scrollHeight;
            } else {
                if (this.typewriterInterval) clearInterval(this.typewriterInterval);
                this.typewriterInterval = null;
            }
        }, 10);
    }

    protected _render(): void {
        // Nothing specific to update on state change for now
    }

    public show(): void {
        this.element.classList.remove('hidden');
        this.startTypewriter();
    }

    public hide(): void {
        this.element.classList.add('hidden');
        if (this.typewriterInterval) {
            clearInterval(this.typewriterInterval);
            this.typewriterInterval = null;
        }
    }
}
