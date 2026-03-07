import BaseComponent from '../BaseComponent.js';
import { EULA_TEXT, EULA_CLAUSES } from '../../data/eula.js';
import EventBus from '../../EventBus.js';

export default class EulaModal extends BaseComponent<void> {
    private step1!: HTMLElement;
    private step2!: HTMLElement;
    private step3!: HTMLElement;
    private statusText!: HTMLElement;
    private textContainer!: HTMLElement;
    private scrollWrapper!: HTMLElement;
    private scrollNote!: HTMLElement;
    private continueButton!: HTMLButtonElement;
    private toStep3Button!: HTMLButtonElement;
    private acceptButton!: HTMLButtonElement;
    private clauseCheckboxes: Map<string, HTMLInputElement> = new Map();
    private typewriterInterval: number | null = null;
    private isPlayer2AI: boolean = true;

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
                    <h1 class="neon-text-cyan">NEURAL_SYNC_INIT_v5.0</h1>
                    <div class="eula-status" id="eula-status-text">STATUS: PENDING_ACKNOWLEDGMENT</div>
                </header>
                
                <main class="eula-content">
                    <!-- STEP 1: NEURO-SYNC AGREEMENT -->
                    <div id="eula-step-1" class="eula-step-container">
                        <div class="eula-text-wrapper" id="eula-scroll-wrapper">
                            <div class="eula-text" id="eula-text-container"></div>
                        </div>
                        <footer class="eula-footer">
                            <div class="eula-footer-note" id="eula-scroll-note">SCROLL_TO_BOTTOM_TO_ENABLE_CONTINUE</div>
                            <button id="eula-continue-btn" class="btn btn-primary btn-glow" disabled style="width: 100%; min-height: 48px;">
                                <i class="material-icons">arrow_forward</i>
                                <span>[ ACKNOWLEDGE & CONTINUE ]</span>
                            </button>
                        </footer>
                    </div>

                    <!-- STEP 2: NEURAL LINK CONFIGURATION (Opponent Setup) -->
                    <div id="eula-step-2" class="eula-step-container hidden">
                        <div class="eula-step-content">
                            <h2 class="section-title">OPPONENT_LINK_CONFIGURATION</h2>
                            <p class="flavor-text">Select your neural adversary protocol. AI protocols are optimized for ruthless efficiency.</p>
                            
                            <div class="opponent-toggle-group">
                                <div class="opponent-option active" data-opponent="ai">
                                    <div class="option-icon"><i class="material-icons">memory</i></div>
                                    <div class="option-info">
                                        <div class="option-title">AI_ADVERSARY</div>
                                        <div class="option-desc">S.A.N.I.T.Y. Neural Net v4.2</div>
                                    </div>
                                    <div class="option-check"><i class="material-icons">check_circle</i></div>
                                </div>
                                
                                <div class="opponent-option" data-opponent="human">
                                    <div class="option-icon"><i class="material-icons">person</i></div>
                                    <div class="option-info">
                                        <div class="option-title">HUMAN_PEER</div>
                                        <div class="option-desc">Local Neural Bridge (2-Player)</div>
                                    </div>
                                    <div class="option-check"><i class="material-icons">radio_button_unchecked</i></div>
                                </div>
                            </div>
                        </div>
                        <footer class="eula-footer">
                            <button id="eula-to-step-3-btn" class="btn btn-primary btn-glow" style="width: 100%; min-height: 48px;">
                                <i class="material-icons">arrow_forward</i>
                                <span>[ CONFIGURE OPTIONAL PROTOCOLS ]</span>
                            </button>
                        </footer>
                    </div>

                    <!-- STEP 3: OPTIONAL ENHANCEMENTS & FINAL SYNC -->
                    <div id="eula-step-3" class="eula-step-container hidden">
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
                                <i class="material-icons">sync</i>
                                <span>[ BEGIN NEURAL SYNC ]</span>
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
        this.step3 = this.element.querySelector('#eula-step-3')!;
        this.statusText = this.element.querySelector('#eula-status-text')!;
        this.textContainer = this.element.querySelector('#eula-text-container')!;
        this.scrollWrapper = this.element.querySelector('#eula-scroll-wrapper')!;
        this.scrollNote = this.element.querySelector('#eula-scroll-note')!;
        this.continueButton = this.element.querySelector('#eula-continue-btn')!;
        this.toStep3Button = this.element.querySelector('#eula-to-step-3-btn')!;
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
            if (scrollTop + clientHeight >= scrollHeight - 20) {
                this.continueButton.disabled = false;
                this.scrollNote.classList.add('hidden');
            }
        });

        // Transitions
        this.continueButton.addEventListener('click', () => {
            this.transitionToStep2();
        });

        this.toStep3Button.addEventListener('click', () => {
            this.transitionToStep3();
        });

        // Opponent Toggle Logic
        const opponentOptions = this.element.querySelectorAll('.opponent-option');
        opponentOptions.forEach(option => {
            option.addEventListener('click', () => {
                const target = (option as HTMLElement).dataset.opponent;
                this.isPlayer2AI = target === 'ai';
                
                opponentOptions.forEach(opt => {
                    opt.classList.toggle('active', opt === option);
                    const icon = opt.querySelector('.option-check i');
                    if (icon) {
                        icon.textContent = opt === option ? 'check_circle' : 'radio_button_unchecked';
                    }
                });
            });
        });

        // Final Acceptance
        this.acceptButton.addEventListener('click', () => {
            const selectedClauseIds = Array.from(this.clauseCheckboxes.entries())
                .filter(([_, checkbox]) => checkbox.checked)
                .map(([id, _]) => id);
            
            EventBus.publish('eulaAccepted', { 
                selectedClauseIds,
                isPlayer2AI: this.isPlayer2AI 
            });
        });
    }

    private transitionToStep2(): void {
        this.step1.classList.add('fade-out');
        setTimeout(() => {
            this.step1.classList.add('hidden');
            this.step1.classList.remove('fade-out');
            this.step2.classList.remove('hidden');
            this.step2.classList.add('fade-in');
            this.statusText.textContent = 'STATUS: NEURAL_LINK_CONFIG';
            this.statusText.style.color = 'var(--neon-cyan)';
        }, 300);
    }

    private transitionToStep3(): void {
        this.step2.classList.add('fade-out');
        setTimeout(() => {
            this.step2.classList.add('hidden');
            this.step2.classList.remove('fade-out');
            this.step3.classList.remove('hidden');
            this.step3.classList.add('fade-in');
            this.statusText.textContent = 'STATUS: OPTIONAL_ENHANCEMENTS';
            this.statusText.style.color = 'var(--neon-pink)';
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
        this.step1.classList.remove('hidden', 'fade-out', 'fade-in');
        this.step2.classList.add('hidden');
        this.step2.classList.remove('fade-in');
        this.step3.classList.add('hidden');
        this.step3.classList.remove('fade-in');
        
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
