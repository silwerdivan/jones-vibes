import Player from './Player';
import { JOBS } from '../data/jobs';
import { COURSES } from '../data/courses';
import EventBus, { STATE_EVENTS } from '../EventBus';
import AIController from './AIController';
import { Course, Job, AIAction, LogMessage, GameStateState, TurnSummary } from '../models/types';
import { LocationName } from '../data/locations';
import type EconomySystem from '../systems/EconomySystem';
import type TimeSystem from '../systems/TimeSystem';

class GameState {
    players: Player[];
    currentPlayerIndex: number;
    turn: number;
    DAILY_EXPENSE: number;
    gameOver: boolean;
    winner: Player | null;
    aiController: AIController | null;
    log: LogMessage[];
    pendingTurnSummary: TurnSummary | null = null;
    activeScreenId: string;
    activeLocationDashboard: string | null;
    activeChoiceContext: any | null;
    isAIThinking: boolean = false;

    constructor(numberOfPlayers: number, isPlayer2AI: boolean = false) {
        if (numberOfPlayers < 1 || numberOfPlayers > 2) {
            throw new Error("Game can only be played with 1 or 2 players.");
        }

        this.players = [];
        for (let i = 0; i < numberOfPlayers; i++) {
            const player = new Player(i + 1);
            if (i === 1 && isPlayer2AI) {
                player.isAI = true;
                player.name = "AI Opponent"; // Give AI a distinct name
            } else {
                player.isAI = false;
                player.name = `Player ${i + 1}`;
            }
            this.players.push(player);
        }

        this.currentPlayerIndex = 0;
        this.turn = 1;
        this.DAILY_EXPENSE = 50;
        this.gameOver = false;
        this.winner = null;

        this.aiController = isPlayer2AI ? new AIController() : null;
        this.log = [];
        this.activeScreenId = 'city';
        this.activeLocationDashboard = null;
        this.activeChoiceContext = null;

        // Subscribe to screen switches to keep persistence in sync
        EventBus.subscribe('screenSwitched', (data: { screenId: string }) => {
            if (this.activeScreenId !== data.screenId) {
                this.activeScreenId = data.screenId;
                EventBus.publish('stateChanged', this);
            }
        });

        // Subscribe to dashboard switches to keep persistence in sync
        EventBus.subscribe('dashboardSwitched', (data: { location: string | null }) => {
            if (this.activeLocationDashboard !== data.location) {
                this.activeLocationDashboard = data.location;
                EventBus.publish('stateChanged', this);
            }
        });

        // Subscribe to choice modal switches to keep persistence in sync
        EventBus.subscribe('choiceModalSwitched', (data: any | null) => {
            if (this.activeChoiceContext !== data) {
                this.activeChoiceContext = data;
                EventBus.publish('stateChanged', this);
            }
        });
    }

    toJSON(): GameStateState {
        // Strip functions from activeChoiceContext if it exists
        let serializableChoiceContext = null;
        if (this.activeChoiceContext) {
            serializableChoiceContext = {
                ...this.activeChoiceContext,
                choices: Array.isArray(this.activeChoiceContext.choices) 
                    ? this.activeChoiceContext.choices.map((c: any) => {
                        const { action, ...rest } = c;
                        return rest;
                    })
                    : []
            };
        }

        return {
            players: this.players.map(p => p.toJSON()),
            currentPlayerIndex: this.currentPlayerIndex,
            turn: this.turn,
            gameOver: this.gameOver,
            winnerId: this.winner ? this.winner.id : null,
            log: [...this.log],
            isPlayer2AI: !!this.aiController,
            pendingTurnSummary: this.pendingTurnSummary,
            activeScreenId: this.activeScreenId,
            activeLocationDashboard: this.activeLocationDashboard,
            activeChoiceContext: serializableChoiceContext,
            isAIThinking: this.isAIThinking
        };
    }

    static fromJSON(data: GameStateState): GameState {
        const gameState = new GameState(data.players.length, data.isPlayer2AI);
        gameState.players = data.players.map(pData => Player.fromJSON(pData));
        gameState.currentPlayerIndex = data.currentPlayerIndex;
        gameState.turn = data.turn;
        gameState.gameOver = data.gameOver;
        if (data.winnerId !== null) {
            gameState.winner = gameState.players.find(p => p.id === data.winnerId) || null;
        }
        gameState.log = [...data.log];
        gameState.pendingTurnSummary = data.pendingTurnSummary || null;
        gameState.activeScreenId = data.activeScreenId || 'city';
        gameState.activeLocationDashboard = data.activeLocationDashboard || null;
        gameState.activeChoiceContext = data.activeChoiceContext || null;
        gameState.isAIThinking = data.isAIThinking || false;
        return gameState;
    }

    _formatMoney(amount: number): string {
        return `[OC]${amount.toLocaleString()}`;
    }

    _getPlayerName(player: Player): string {
        return player.name || `Unit ${player.id}`;
    }

    publishCurrentState(): void {
        EventBus.publish('stateChanged', this);
    }

    addLogMessage(message: string, category: string = 'info'): void {
        const formattedMessage: LogMessage = {
            text: message,
            category: category,
            timestamp: new Date().toLocaleTimeString()
        };
        this.log.unshift(formattedMessage);
        
        // Publish to event notification system
        EventBus.publish('gameEvent', formattedMessage);
        
        EventBus.publish('stateChanged', this);
    }

    getCurrentPlayer(): Player {
        return this.players[this.currentPlayerIndex];
    }

    processAITurn(): void {
        const currentPlayer = this.getCurrentPlayer();
        this.isAIThinking = true;
        this.addLogMessage(
            `🤔 ${this._getPlayerName(currentPlayer)} is calculating optimal protocols...`,
            'info'
        );
        if (this.aiController) {
            const aiAction = this.aiController.takeTurn(this, currentPlayer);
            this.handleAIAction(aiAction);
        }
    }

    handleAIAction(aiAction: AIAction): void {
        // 1) no action → end AI turn immediately
        if (!aiAction || !aiAction.action) {
            this.isAIThinking = false;
            EventBus.publish('aiThinkingEnd');
            if (this._timeSystem) this._timeSystem.endTurn();
            return;
        }

        // 2) explicit 'pass' → end AI turn
        if (aiAction.action === 'pass') {
            this.addLogMessage(
                `${this._getPlayerName(this.getCurrentPlayer())} bypasses cycle action.`,
                'info'
            );
            this.isAIThinking = false;
            EventBus.publish('aiThinkingEnd');
            if (this._timeSystem) this._timeSystem.endTurn();
            return;
        }

        // 3) otherwise, carry out the action
        let success = false;
        let actionDescription = `AI Protocol: ${aiAction.action}`;
        if (aiAction.params) {
            actionDescription += ` | Params: ${JSON.stringify(aiAction.params)}`;
        }
        this.addLogMessage(actionDescription, 'info');

        switch(aiAction.action) {
            case 'travel':
                success = this.travel(aiAction.params.destination);
                break;
            case 'workShift':
                success = this.workShift();
                break;
            case 'applyForJob':
                success = this.applyForJob(aiAction.params.jobLevel);
                break;
            case 'takeCourse':
                success = this.takeCourse(aiAction.params.courseId);
                break;
            case 'study':
                success = this.study();
                break;
            case 'buyItem':
                success = this._economySystem ? this._economySystem.buyItem(aiAction.params.itemName) : false;
                break;
            case 'buyCar':
                success = this._economySystem ? this._economySystem.buyCar() : false;
                break;
            case 'deposit':
                success = this._economySystem ? this._economySystem.deposit(aiAction.params.amount) : false;
                break;
            case 'withdraw':
                success = this._economySystem ? this._economySystem.withdraw(aiAction.params.amount) : false;
                break;
            case 'takeLoan':
                success = this._economySystem ? this._economySystem.takeLoan(aiAction.params.amount) : false;
                break;
            case 'repayLoan':
                success = this._economySystem ? this._economySystem.repayLoan(aiAction.params.amount) : false;
                break;
            default:
                console.warn(`AI tried an unknown action: ${aiAction.action}`);
                success = false;
                break;
        }

        const playerHasTime = this.getCurrentPlayer().time > 0;
        
        // Allow AI one more decision if they just traveled, even if time is 0,
        // to permit "instant" actions (buying food/items, banking) at the destination.
        const isExtraTurnAllowed = success && aiAction.action === 'travel' && !playerHasTime;

        if (success && (playerHasTime || isExtraTurnAllowed)) {
            // AI still has time or just arrived at a destination → decide next move
            this.checkGameEndConditions(this.getCurrentPlayer());
            this.addLogMessage(
                `${this._getPlayerName(this.getCurrentPlayer())} optimizing next sequence...`,
                'info'
            );
            // We stay in isAIThinking = true state
            setTimeout(() => this.processAITurn(), 1000);
        } else {
            // AI turn ends (either success but no time left, or action failed)
            if (!success) {
                this.addLogMessage(
                    `${this._getPlayerName(this.getCurrentPlayer())} sequence failure.`,
                    'warning'
                );
            }
            this.isAIThinking = false;
            EventBus.publish('aiThinkingEnd');
            if (this._timeSystem) this._timeSystem.endTurn();
        }
    }

    checkWinCondition(player: Player): void {
        if (this.gameOver) return;

        const totalWealth = player.cash + player.savings;
        const cashCondition = totalWealth >= 10000;
        const happinessCondition = player.happiness >= 80;
        const educationCondition = player.educationLevel >= 3; // Completed Community College
        const careerCondition = player.careerLevel >= 4; // Junior Manager

        if (cashCondition && happinessCondition && educationCondition && careerCondition) {
            this.gameOver = true;
            this.winner = player;
            this.addLogMessage(
                `🏆 ${this._getPlayerName(player)} has achieved Peak Compliance. Ascension authorized.`,
                'success'
            );
            EventBus.publish('gameOver', this);
        }
    }

    checkLoseCondition(player: Player): void {
        if (this.gameOver) return;

        // Turn 1 grace period: No game over until after the player's time drops below 24.
        // This handles cases where Clause B adds extra hours (e.g., 30 hours) 
        // or a 0-hour action is taken.
        if (this.turn === 1 && player.time >= 24) return;

        if (player.happiness <= 0) {
            this.gameOver = true;
            this.winner = null;
            this.addLogMessage(
                `💀 ${this._getPlayerName(player)}'s Morale Quota has bottomed out. OmniCorp has terminated your session.`,
                'error'
            );
            EventBus.publish('gameOver', this);
        } else if (player.hunger >= 100) {
            this.gameOver = true;
            this.winner = null;
            this.addLogMessage(
                `💀 ${this._getPlayerName(player)} has succumbed to Bio-Deficit. Critical metabolic failure.`,
                'error'
            );
            EventBus.publish('gameOver', this);
        }
    }

    checkGameEndConditions(player: Player): void {
        this.checkWinCondition(player);
        this.checkLoseCondition(player);
    }

    private _economySystem: EconomySystem | null = null;
    setEconomySystem(system: EconomySystem) {
        this._economySystem = system;
    }

    private _timeSystem: TimeSystem | null = null;
    setTimeSystem(system: TimeSystem) {
        this._timeSystem = system;
    }

    _checkAutoEndTurn(): void {
        const player = this.getCurrentPlayer();
        if (player.time <= 0 && !player.isAI && !this.gameOver) {
            setTimeout(() => {
                if (player.time <= 0) { // Double check if time is still 0
                    this.addLogMessage(`Cycle time exhausted. Turn finalization initiated.`, 'warning');
                    if (this._timeSystem) this._timeSystem.endTurn();
                }
            }, 1000);
        }
    }

    getNextAvailableCourse(): Course | null {
        const currentPlayer = this.getCurrentPlayer();
        return COURSES.find(course => course.educationMilestone === currentPlayer.educationLevel + 1) || null;
    }

    _getAvailableJobs(player: Player): Job[] {
        return JOBS.filter(job => player.educationLevel >= job.educationRequired);
    }

    workShift(): boolean {
        const currentPlayer = this.getCurrentPlayer();

        if (currentPlayer.location !== 'Labor Sector') {
            this.addLogMessage(
                `${this._getPlayerName(currentPlayer)} must be at Labor Sector for shift execution.`,
                'error'
            );
            return false;
        }

        // Check if player has an active job (careerLevel > 0)
        if (currentPlayer.careerLevel === 0) {
            this.addLogMessage(
                `${this._getPlayerName(currentPlayer)} must secure a position first.`,
                'error'
            );
            return false;
        }

        const availableJobs = this._getAvailableJobs(currentPlayer);
        if (availableJobs.length === 0) {
            this.addLogMessage(
                `No positions available for ${this._getPlayerName(currentPlayer)}'s compliance level.`,
                'warning'
            );
            return false;
        }

        // Find the highest-level job from the available list
        const jobToWork = availableJobs.reduce((prev, current) => (prev.level > current.level) ? prev : current);

        if (currentPlayer.time < jobToWork.shiftHours) {
            this.addLogMessage(
                `${this._getPlayerName(currentPlayer)} insufficient cycle time for ${jobToWork.title} shift.`,
                'error'
            );
            return false;
        }

        // Deduct the shiftHours from the player's time.
        currentPlayer.deductTime(jobToWork.shiftHours);

        // Calculate earnings and add to cash.
        const earnings = Math.round(jobToWork.wage * jobToWork.shiftHours * currentPlayer.wageMultiplier);
        currentPlayer.addCash(earnings);

        // Update the player's careerLevel to jobToWork.level if it's an advancement.
        if (jobToWork.level > currentPlayer.careerLevel) {
            currentPlayer.careerLevel = jobToWork.level;
        }

        this.addLogMessage(
            `Shift Completed: ${jobToWork.title}. Yield: ${this._formatMoney(earnings)}.`,
            'success'
        );
        this.checkGameEndConditions(currentPlayer);
        EventBus.publish(STATE_EVENTS.CASH_CHANGED, { player: currentPlayer, amount: earnings, gameState: this });
        EventBus.publish(STATE_EVENTS.TIME_CHANGED, { player: currentPlayer, gameState: this });
        if (jobToWork.level > currentPlayer.careerLevel) {
            EventBus.publish(STATE_EVENTS.CAREER_CHANGED, { player: currentPlayer, level: jobToWork.level, gameState: this });
        }
        EventBus.publish('stateChanged', this);
        this._checkAutoEndTurn();
        return true;
    }

    takeCourse(courseId: number): boolean {
        const currentPlayer = this.getCurrentPlayer();
        const course = COURSES.find(c => c.id === courseId);

        if (currentPlayer.location !== 'Cognitive Re-Ed') {
            this.addLogMessage(
                `${this._getPlayerName(currentPlayer)} must be at Cognitive Re-Ed for enrollment.`,
                'error'
            );
            return false;
        }

        if (!course) {
            this.addLogMessage('Protocol not found.', 'error');
            return false;
        }

        // Only allow enrolling in the next level
        if (currentPlayer.educationLevel + 1 !== course.educationMilestone) {
             this.addLogMessage(
                `${this._getPlayerName(currentPlayer)} must complete prior compliance tiers.`,
                'error'
            );
            return false;
        }

        if (currentPlayer.cash < course.cost) {
            this.addLogMessage(
                `${this._getPlayerName(currentPlayer)} requires ${this._formatMoney(course.cost)} for ${course.name} enrollment.`,
                'error'
            );
            return false;
        }

        currentPlayer.spendCash(course.cost);
        // Enrollment doesn't take much time, let's say 1 hour
        const enrollmentTime = 1;
        if (currentPlayer.time < enrollmentTime) {
             this.addLogMessage(
                `${this._getPlayerName(currentPlayer)} requires 1CH for enrollment protocol.`,
                'error'
            );
            return false;
        }
        currentPlayer.deductTime(enrollmentTime);
        
        currentPlayer.setEducationGoal(course.requiredCredits);

        this.addLogMessage(
            `Protocol Enrollment: ${course.name}. Deduction: ${this._formatMoney(course.cost)}.`,
            'success'
        );
        
        EventBus.publish(STATE_EVENTS.CASH_CHANGED, { player: currentPlayer, amount: -course.cost, gameState: this });
        EventBus.publish(STATE_EVENTS.TIME_CHANGED, { player: currentPlayer, gameState: this });
        EventBus.publish('stateChanged', this);
        this._checkAutoEndTurn();
        return true;
    }

    study(): boolean {
        const currentPlayer = this.getCurrentPlayer();

        if (currentPlayer.location !== 'Cognitive Re-Ed') {
            this.addLogMessage(
                `${this._getPlayerName(currentPlayer)} must be at Cognitive Re-Ed to study.`,
                'error'
            );
            return false;
        }

        // Check if player is working toward a degree
        const nextCourse = COURSES.find(c => c.educationMilestone === currentPlayer.educationLevel + 1);
        if (!nextCourse) {
             this.addLogMessage(
                `${this._getPlayerName(currentPlayer)} has reached maximum compliance level!`,
                'info'
            );
            return false;
        }

        // Ensure player is enrolled (goal must match the next course's requirements)
        if (currentPlayer.educationCreditsGoal < nextCourse.requiredCredits) {
            this.addLogMessage(
                `${this._getPlayerName(currentPlayer)} must enroll in ${nextCourse.name} protocol before studying.`,
                'error'
            );
            return false;
        }

        const studyTime = 8;
        const happinessCost = 5;

        if (currentPlayer.time < studyTime) {
            this.addLogMessage(
                `${this._getPlayerName(currentPlayer)} requires ${studyTime}CH for study sequence.`,
                'error'
            );
            return false;
        }

        if (currentPlayer.happiness < happinessCost) {
             this.addLogMessage(
                `${this._getPlayerName(currentPlayer)}'s Morale Quota is insufficient for study. Required: ${happinessCost}.`,
                'error'
            );
            return false;
        }

        // Calculate credits
        const hasComputer = currentPlayer.inventory.some(item => item.name === 'Computer');
        const creditsGained = hasComputer ? 10 : 8;

        currentPlayer.deductTime(studyTime);
        currentPlayer.updateHappiness(-happinessCost);
        currentPlayer.addEducationCredits(creditsGained);

        this.addLogMessage(
            `Lecture attended. Credits accumulated: ${creditsGained}.`,
            'success'
        );

        // Check for graduation
        this._checkGraduation(currentPlayer);

        EventBus.publish(STATE_EVENTS.TIME_CHANGED, { player: currentPlayer, gameState: this });
        EventBus.publish(STATE_EVENTS.EDUCATION_CHANGED, { player: currentPlayer, level: currentPlayer.educationLevel, gameState: this });
        EventBus.publish('stateChanged', this);
        this._checkAutoEndTurn();
        return true;
    }

    private _checkGraduation(player: Player): void {
        const nextCourse = COURSES.find(c => c.educationMilestone === player.educationLevel + 1);
        if (!nextCourse) return;

        if (player.educationCredits >= nextCourse.requiredCredits) {
            player.advanceEducation(nextCourse.name);
            player.educationCredits = 0; // Reset for next degree
            
            player.setEducationGoal(0);

            this.addLogMessage(
                `🎓 Certification Achieved: ${nextCourse.name}. Tier update authorized.`,
                'success'
            );
            
            EventBus.publish('graduation', { player, course: nextCourse });
            this.checkGameEndConditions(player);
        }
    }

    travel(destination: LocationName): boolean {
        const currentPlayer = this.getCurrentPlayer();

        if (currentPlayer.location === destination) {
            this.addLogMessage(
                `${this._getPlayerName(currentPlayer)} is already at current sector.`,
                'warning'
            );
            return false;
        }

        const travelTime = currentPlayer.hasCar ? 1 : 2;

        if (currentPlayer.time < travelTime) {
            if (destination === 'Hab-Pod 404') {
                const deficit = travelTime - currentPlayer.time;
                currentPlayer.time = 0;
                currentPlayer.timeDeficit = deficit;
                currentPlayer.setLocation(destination);
                this.addLogMessage(
                    `${this._getPlayerName(currentPlayer)} relocated to ${destination} with ${deficit}CH deficit. Carryover applied.`,
                    'warning'
                );
                this.checkGameEndConditions(currentPlayer);
                EventBus.publish('stateChanged', this);
                this._checkAutoEndTurn();
                return true;
            }
            this.addLogMessage(
                `${this._getPlayerName(currentPlayer)} insufficient time for sector relocation.`,
                'error'
            );
            return false;
        }

        currentPlayer.deductTime(travelTime);
        currentPlayer.setLocation(destination);
        this.addLogMessage(
            `${this._getPlayerName(currentPlayer)} relocated to ${destination}.`,
            'info'
        );
        this.checkGameEndConditions(currentPlayer);
        EventBus.publish(STATE_EVENTS.TIME_CHANGED, { player: currentPlayer, gameState: this });
        EventBus.publish(STATE_EVENTS.LOCATION_CHANGED, { player: currentPlayer, location: destination, gameState: this });
        EventBus.publish('stateChanged', this);
        this._checkAutoEndTurn();
        return true;
    }

    applyForJob(jobLevel: number): boolean {
        const currentPlayer = this.getCurrentPlayer();
        
        // Find the job by level
        const job = JOBS.find(j => j.level === jobLevel);
        
        if (!job) {
            this.addLogMessage(
                `Position level ${jobLevel} not found in database.`,
                'error'
            );
            EventBus.publish('jobApplicationError', { player: currentPlayer, reason: 'Job not found' });
            return false;
        }
        
        // Check if player already has this job or a better one
        if (currentPlayer.careerLevel >= jobLevel) {
            this.addLogMessage(
                `${this._getPlayerName(currentPlayer)} already holds equivalent or superior tier.`,
                'info'
            );
            return false;
        }

        // Check if player meets education requirements
        if (currentPlayer.educationLevel < job.educationRequired) {
            this.addLogMessage(
                `Insufficient compliance for ${job.title}. Required: Tier ${job.educationRequired}.`,
                'error'
            );
            EventBus.publish('jobApplicationError', {
                player: currentPlayer,
                job: job,
                reason: 'Insufficient education'
            });
            return false;
        }
        
        // Set the player's career level to the job level
        currentPlayer.careerLevel = jobLevel;
        
        this.addLogMessage(
            `✅ Position Secured: ${job.title}. Productivity tier updated.`,
            'success'
        );
        EventBus.publish('jobApplicationSuccess', { player: currentPlayer, job: job });
        
        // Check win condition since career level might have changed
        this.checkGameEndConditions(currentPlayer);
        EventBus.publish(STATE_EVENTS.CAREER_CHANGED, { player: currentPlayer, level: jobLevel, gameState: this });
        EventBus.publish('stateChanged', this);
        this._checkAutoEndTurn();
        return true;
    }
}

export default GameState;