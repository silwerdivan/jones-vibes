import BaseComponent from '../BaseComponent.js';
import GameState from '../../game/GameState.js';
import EventBus, { STATE_EVENTS, UI_EVENTS } from '../../EventBus.js';
import { Course } from '../../models/types.js';

export default class CollegeDashboard extends BaseComponent<GameState> {
    private progressFill!: HTMLElement;
    private progressText!: HTMLElement;
    private studyButton!: HTMLElement;
    private enrollmentSection!: HTMLElement;
    private studySection!: HTMLElement;
    private computerBuffIndicator!: HTMLElement;

    constructor() {
        super('div', 'college-dashboard glass-panel');
        this.buildDOM();
        this.initializeReferences();
        this.setupEventListeners();
    }

    private buildDOM(): void {
        this.element.innerHTML = `
            <div id="enrollment-section" class="enrollment-section">
                <div class="degree-card glass-card">
                    <div class="degree-info">
                        <h3 data-next-degree-name>Associate's Degree</h3>
                        <p class="degree-benefit">Unlocks better career opportunities</p>
                    </div>
                    <div class="degree-cost">
                        <span class="cost-badge"><i class="material-icons">payments</i> <span data-next-degree-cost>$500</span></span>
                    </div>
                    <button class="btn btn-primary enroll-btn" data-enroll-btn>ENROLL NOW</button>
                </div>
            </div>

            <div id="study-section" class="study-section hidden">
                <div class="degree-progress-card glass-card">
                    <div class="progress-header">
                        <h3 data-current-degree-name>Associate's Degree</h3>
                        <span class="progress-percentage" data-progress-text>0 / 50 Credits</span>
                    </div>
                    <div class="progress-track">
                        <div class="progress-fill" data-progress-fill style="width: 0%"></div>
                    </div>
                    <div class="buff-indicator hidden" data-computer-buff>
                        <i class="material-icons">computer</i> PC Bonus Active: +25% Study Speed
                    </div>
                </div>

                <div class="study-actions">
                    <div class="action-badges">
                        <span class="badge badge-time"><i class="material-icons">schedule</i> 8H</span>
                        <span class="badge badge-happiness"><i class="material-icons">sentiment_very_dissatisfied</i> -5</span>
                        <span class="badge badge-credits" data-credits-gain><i class="material-icons">school</i> +8 Credits</span>
                    </div>
                    <button class="btn btn-primary study-btn" data-study-btn>ATTEND LECTURE</button>
                </div>
            </div>

            <div id="completed-section" class="completed-section hidden">
                <div class="glass-card text-center">
                    <i class="material-icons graduation-icon">school</i>
                    <h3>All Degrees Completed!</h3>
                    <p>You have reached the pinnacle of education.</p>
                </div>
            </div>
        `;
    }

    private initializeReferences(): void {
        this.enrollmentSection = this.element.querySelector('#enrollment-section')!;
        this.studySection = this.element.querySelector('#study-section')!;
        this.progressFill = this.element.querySelector('[data-progress-fill]')!;
        this.progressText = this.element.querySelector('[data-progress-text]')!;
        this.studyButton = this.element.querySelector('[data-study-btn]')!;
        this.computerBuffIndicator = this.element.querySelector('[data-computer-buff]')!;
    }

    private setupEventListeners(): void {
        this.studyButton.addEventListener('click', () => {
            EventBus.publish(UI_EVENTS.STUDY);
        });

        const enrollBtn = this.element.querySelector('[data-enroll-btn]')!;
        enrollBtn.addEventListener('click', () => {
            const nextCourse = this._lastState?.getNextAvailableCourse();
            if (nextCourse) {
                EventBus.publish(UI_EVENTS.TAKE_COURSE, nextCourse.id);
            }
        });

        this.subscribe(STATE_EVENTS.EDUCATION_CHANGED, () => {
             if (this._lastState) this.render(this._lastState);
        });
        
        this.subscribe(STATE_EVENTS.CASH_CHANGED, () => {
             if (this._lastState) this.render(this._lastState);
        });
        
        this.subscribe(STATE_EVENTS.PLAYER_CHANGED, () => {
             if (this._lastState) this.render(this._lastState);
        });
    }

    private _lastState: GameState | null = null;

    protected _render(gameState: GameState): void {
        this._lastState = gameState;
        const player = gameState.getCurrentPlayer();
        const nextCourse = gameState.getNextAvailableCourse();

        // Hide all sections initially
        this.enrollmentSection.classList.add('hidden');
        this.studySection.classList.add('hidden');
        this.element.querySelector('#completed-section')!.classList.add('hidden');

        if (!nextCourse) {
            this.element.querySelector('#completed-section')!.classList.remove('hidden');
            return;
        }

        const isEnrolled = player.educationCreditsGoal === nextCourse.requiredCredits;

        if (isEnrolled) {
            this.studySection.classList.remove('hidden');
            this.updateStudySection(gameState, nextCourse);
        } else {
            this.enrollmentSection.classList.remove('hidden');
            this.updateEnrollmentSection(gameState, nextCourse);
        }
    }

    private updateEnrollmentSection(gameState: GameState, nextCourse: Course): void {
        const player = gameState.getCurrentPlayer();
        const nameEl = this.element.querySelector('[data-next-degree-name]')!;
        const costEl = this.element.querySelector('[data-next-degree-cost]')!;
        const enrollBtn = this.element.querySelector('[data-enroll-btn]') as HTMLButtonElement;

        nameEl.textContent = nextCourse.name;
        costEl.textContent = `$${nextCourse.cost}`;
        
        const canAfford = player.cash >= nextCourse.cost;
        enrollBtn.disabled = !canAfford;
        
        if (!canAfford) {
            enrollBtn.title = "Not enough cash";
        } else {
            enrollBtn.title = "";
        }
    }

    private updateStudySection(gameState: GameState, nextCourse: Course): void {
        const player = gameState.getCurrentPlayer();
        const nameEl = this.element.querySelector('[data-current-degree-name]')!;
        const creditsGainEl = this.element.querySelector('[data-credits-gain]')!;
        const studyBtn = this.studyButton as HTMLButtonElement;

        nameEl.textContent = nextCourse.name;
        
        const progress = (player.educationCredits / nextCourse.requiredCredits) * 100;
        this.progressFill.style.width = `${progress}%`;
        this.progressText.textContent = `${player.educationCredits} / ${nextCourse.requiredCredits} Credits`;

        const hasComputer = player.inventory.some(item => item.name === 'Computer');
        const creditsGained = hasComputer ? 10 : 8;
        creditsGainEl.innerHTML = `<i class="material-icons">school</i> +${creditsGained} Credits`;

        if (hasComputer) {
            this.computerBuffIndicator.classList.remove('hidden');
            creditsGainEl.classList.add('buffed');
        } else {
            this.computerBuffIndicator.classList.add('hidden');
            creditsGainEl.classList.remove('buffed');
        }

        const canStudy = player.time >= 8 && player.happiness >= 5;
        studyBtn.disabled = !canStudy;

        if (player.time < 8) {
            studyBtn.title = "Not enough time (8H required)";
        } else if (player.happiness < 5) {
            studyBtn.title = "Too unhappy to study";
        } else {
            studyBtn.title = "";
        }
    }
}
