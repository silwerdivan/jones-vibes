import BaseComponent from '../BaseComponent.js';
import { GAME_INTRO_BODY, GAME_INTRO_CALLOUTS } from '../../data/eula.js';
import EventBus from '../../EventBus.js';

export default class EulaModal extends BaseComponent<void> {
    private statusText!: HTMLElement;
    private introText!: HTMLElement;
    private startButton!: HTMLButtonElement;
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
                    <h1 class="neon-text-cyan">WELCOME_TO_FASTLANE</h1>
                    <div class="eula-status" id="eula-status-text">STATUS: ORIENTATION_READY</div>
                </header>

                <main class="eula-content">
                    <section class="eula-step-container intro-screen">
                        <div class="eula-intro-copy">
                            <h2 class="section-title">WHAT_THIS_GAME_IS</h2>
                            <div class="eula-text intro-text" id="eula-text-container"></div>
                        </div>

                        <div class="intro-callouts">
                            ${GAME_INTRO_CALLOUTS.map(callout => `
                                <article class="intro-callout">
                                    <div class="intro-callout-label">${callout.label}</div>
                                    <p class="intro-callout-text">${callout.text}</p>
                                </article>
                            `).join('')}
                        </div>

                        <footer class="eula-footer">
                            <div class="eula-footer-note">ONE PLAYER STARTS NOW. AI HANDLES THE RIVAL SLOT.</div>
                            <button id="eula-accept-btn" class="btn btn-primary btn-glow intro-start-btn" style="width: 100%; min-height: 48px;">
                                <i class="material-icons">play_arrow</i>
                                <span>[ START THE RUN ]</span>
                            </button>
                        </footer>
                    </section>
                </main>
            </div>
        `;
    }

    private initializeReferences(): void {
        this.statusText = this.element.querySelector('#eula-status-text')!;
        this.introText = this.element.querySelector('#eula-text-container')!;
        this.startButton = this.element.querySelector('#eula-accept-btn')!;
    }

    private setupEventListeners(): void {
        this.startButton.addEventListener('click', () => {
            EventBus.publish('eulaAccepted');
        });
    }

    public startTypewriter(): void {
        if (this.typewriterInterval) {
            clearInterval(this.typewriterInterval);
        }

        this.introText.textContent = '';
        let index = 0;
        const text = GAME_INTRO_BODY.trim();

        this.typewriterInterval = window.setInterval(() => {
            if (index < text.length) {
                this.introText.textContent += text.slice(index, index + 3);
                index += 3;
            } else {
                if (this.typewriterInterval) {
                    clearInterval(this.typewriterInterval);
                }
                this.typewriterInterval = null;
            }
        }, 12);
    }

    protected _render(): void {}

    public show(): void {
        this.element.classList.remove('hidden');
        this.statusText.textContent = 'STATUS: ORIENTATION_READY';
        this.statusText.style.color = 'var(--neon-cyan)';
        this.startTypewriter();
    }

    public hide(): void {
        this.element.classList.add('fade-out-overlay');
        if (this.typewriterInterval) {
            clearInterval(this.typewriterInterval);
            this.typewriterInterval = null;
        }

        setTimeout(() => {
            this.element.classList.add('hidden');
            this.element.classList.remove('fade-out-overlay');
        }, 500);
    }
}
