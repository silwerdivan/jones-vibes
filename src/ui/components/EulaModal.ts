import BaseComponent from '../BaseComponent.js';
import { EULA_TEXT, EULA_CLAUSES } from '../../data/eula.js';
import EventBus from '../../EventBus.js';

export default class EulaModal extends BaseComponent<void> {
    private step1!: HTMLElement;
    private step2!: HTMLElement;
    private statusText!: HTMLElement;
    private textContainer!: HTMLElement;
    private scrollWrapper!: HTMLElement;
    private scrollNote!: HTMLElement;
    private continueButton!: HTMLButtonElement;
    private acceptButton!: HTMLButtonElement;
    private clauseCheckboxes: Map<string, HTMLInputElement> = new Map();
    private typewriterInterval: number | null = null;
    private currentStep: number = 1;

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
                    <div class="eula-status" id="eula-status-text">STATUS: PENDING_ACKNOWLEDGMENT</div>
                </header>
                
                <main class="eula-content">
                    <!-- STEP 1: LEGAL AGREEMENT -->
                    <div id="eula-step-1" class="eula-step-container">
                        <div class="eula-text-wrapper" id="eula-scroll-wrapper">
                            <div class="eula-text" id="eula-text-container"></div>
                        </div>
                        <footer class="eula-footer">
                            <div class="eula-footer-note" id="eula-scroll-note">SCROLL_TO_BOTTOM_TO_ENABLE_CONTINUE</div>
                            <button id="eula-continue-btn" class="btn btn-primary btn-glow" disabled style="width: 100%; min-height: 48px;">
                                <i class="material-icons">arrow_forward</i>
                                <span>[ CONTINUE TO CLAUSES ]</span>
                            </button>
                        </footer>
                    </div>

                    <!-- STEP 2: OPTIONAL ENHANCEMENTS -->
                    <div id="eula-step-2" class="eula-step-container hidden">
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
                        <footer class="eula-footer">
                            <button id="eula-accept-btn" class="btn btn-primary btn-glow" style="width: 100%; min-height: 48px;">
                                <i class="material-icons">check_circle</i>
                                <span>[ I ACCEPT & INITIALIZE ]</span>
                            </button>
                        </footer>
                    </div>
                </main>
            </div>
        `;
    }

    private initializeReferences(): void {
        this.step1 = this.element.querySelector('#eula-step-1')!;
        this.step2 = this.element.querySelector('#eula-step-2')!;
        this.statusText = this.element.querySelector('#eula-status-text')!;
        this.textContainer = this.element.querySelector('#eula-text-container')!;
        this.scrollWrapper = this.element.querySelector('#eula-scroll-wrapper')!;
        this.scrollNote = this.element.querySelector('#eula-scroll-note')!;
        this.continueButton = this.element.querySelector('#eula-continue-btn')!;
        this.acceptButton = this.element.querySelector('#eula-accept-btn')!;
        
        EULA_CLAUSES.forEach(clause => {
            const checkbox = this.element.querySelector(`#clause-${clause.id}`) as HTMLInputElement;
            if (checkbox) {
                this.clauseCheckboxes.set(clause.id, checkbox);
            }
        });
    }

    private setupEventListeners(): void {
        // Step 1 Scroll Logic
        this.scrollWrapper.addEventListener('scroll', () => {
            const { scrollTop, clientHeight, scrollHeight } = this.scrollWrapper;
            // Threshold of 20px as per Task 2
            if (scrollTop + clientHeight >= scrollHeight - 20) {
                this.continueButton.disabled = false;
                this.scrollNote.classList.add('hidden');
            }
        });

        // Step 1 to Step 2 Transition
        this.continueButton.addEventListener('click', () => {
            this.transitionToStep2();
        });

        // Final Acceptance
        this.acceptButton.addEventListener('click', () => {
            const selectedClauseIds = Array.from(this.clauseCheckboxes.entries())
                .filter(([_, checkbox]) => checkbox.checked)
                .map(([id, _]) => id);
            
            EventBus.publish('eulaAccepted', { selectedClauseIds });
        });
    }

    private transitionToStep2(): void {
        this.currentStep = 2;
        
        // Add a simple fade-out/fade-in animation
        this.step1.classList.add('fade-out');
        
        setTimeout(() => {
            this.step1.classList.add('hidden');
            this.step1.classList.remove('fade-out');
            
            this.step2.classList.remove('hidden');
            this.step2.classList.add('fade-in');
            
            this.statusText.textContent = 'STATUS: OPTIONAL_ENHANCEMENTS';
            this.statusText.style.color = 'var(--neon-cyan)';
        }, 300);
    }

    public startTypewriter(): void {
        if (this.typewriterInterval) clearInterval(this.typewriterInterval);
        
        this.textContainer.textContent = '';
        let index = 0;
        const text = EULA_TEXT.trim();
        
        this.typewriterInterval = window.setInterval(() => {
            if (index < text.length) {
                // Add 4 characters at a time for punchy speed
                this.textContainer.textContent += text.slice(index, index + 4);
                index += 4;
                
                // Auto-scroll as text is added
                this.scrollWrapper.scrollTop = this.scrollWrapper.scrollHeight;
            } else {
                if (this.typewriterInterval) clearInterval(this.typewriterInterval);
                this.typewriterInterval = null;
                
                // If text is short or container is large, user might not need to scroll
                // Check if already at bottom
                const { scrollTop, clientHeight, scrollHeight } = this.scrollWrapper;
                if (scrollTop + clientHeight >= scrollHeight - 20 || scrollHeight <= clientHeight) {
                    this.continueButton.disabled = false;
                    this.scrollNote.classList.add('hidden');
                }
            }
        }, 10);
    }

    protected _render(): void {
        // State-driven UI updates could go here if needed
    }

    public show(): void {
        this.element.classList.remove('hidden');
        
        // Reset to Step 1
        this.currentStep = 1;
        this.step1.classList.remove('hidden', 'fade-out', 'fade-in');
        this.step2.classList.add('hidden');
        this.step2.classList.remove('fade-in');
        
        this.statusText.textContent = 'STATUS: PENDING_ACKNOWLEDGMENT';
        this.statusText.style.color = 'var(--neon-yellow)';
        
        this.continueButton.disabled = true;
        this.scrollNote.classList.remove('hidden');
        
        this.startTypewriter();
    }

    public hide(): void {
        this.element.classList.add('fade-out-overlay');
        if (this.typewriterInterval) {
            clearInterval(this.typewriterInterval);
            this.typewriterInterval = null;
        }
        
        // Wait for animation to finish before adding hidden class
        setTimeout(() => {
            this.element.classList.add('hidden');
            this.element.classList.remove('fade-out-overlay');
        }, 500);
    }
}
