import GameState from '../game/GameState';
import Player from '../game/Player';
import EventBus, { STATE_EVENTS } from '../EventBus';

interface TurnSummary {
    player: number;
    playerName: string;
    week: number;
    events: Array<{
        type: string;
        label: string;
        value: number;
        unit: string;
        icon: string;
    }>;
    totals: {
        cashChange: number;
        happinessChange: number;
    };
}

class TimeSystem {
    private gameState: GameState;

    constructor(gameState: GameState) {
        this.gameState = gameState;
    }

    private _formatMoney(amount: number): string {
        return `[OC]${amount.toLocaleString()}`;
    }

    private _getPlayerName(player: Player): string {
        return player.name || `Unit ${player.id}`;
    }

    endTurn(): TurnSummary {
        const currentPlayer = this.gameState.getCurrentPlayer();
        const summary: TurnSummary = {
            player: currentPlayer.id,
            playerName: this._getPlayerName(currentPlayer),
            week: this.gameState.turn,
            events: [],
            totals: {
                cashChange: 0,
                happinessChange: 0
            }
        };

        // 1. Add overall weekly earnings if any
        if (currentPlayer.weeklyIncome > 0) {
            summary.events.push({
                type: 'income',
                label: 'Yield: Cycles',
                value: currentPlayer.weeklyIncome,
                unit: '[OC]',
                icon: 'payments'
            });
        }

        // 2. Add overall weekly shopping/travel expenses if any
        if (currentPlayer.weeklyExpenses > 0) {
            summary.events.push({
                type: 'expense',
                label: 'Outflow: Logistics',
                value: -currentPlayer.weeklyExpenses,
                unit: '[OC]',
                icon: 'shopping_cart'
            });
        }

        // 3. Apply daily expenses (weekend)
        currentPlayer.spendCash(this.gameState.DAILY_EXPENSE);
        summary.events.push({
            type: 'expense',
            label: 'Hab-Unit Tax',
            value: -this.gameState.DAILY_EXPENSE,
            unit: '[OC]',
            icon: 'home'
        });

        this.gameState.addLogMessage(
            `${this._getPlayerName(currentPlayer)} deducted ${this._formatMoney(this.gameState.DAILY_EXPENSE)} for Hab-Unit maintenance.`,
            'expense'
        );
        EventBus.publish(STATE_EVENTS.CASH_CHANGED, { player: currentPlayer, amount: -this.gameState.DAILY_EXPENSE, gameState: this.gameState });

        // 4. Apply loan interest
        if (currentPlayer.loan > 0) {
            const interest = Math.round(currentPlayer.loan * 0.10); // 10% interest
            currentPlayer.loan += interest;
            // Record this as an expense in the tracker
            currentPlayer.weeklyExpenses += interest;
            
            summary.events.push({
                type: 'warning',
                label: 'Debt-Cost Accumulation',
                value: -interest,
                unit: '[OC]',
                icon: 'account_balance'
            });
            
            this.gameState.addLogMessage(
                `${this._getPlayerName(currentPlayer)} charged ${this._formatMoney(interest)} in credit-debt accumulation.`,
                'warning'
            );
            EventBus.publish(STATE_EVENTS.LOAN_CHANGED, { player: currentPlayer, amount: interest, gameState: this.gameState });
        }

        // 5. Apply hunger
        const hasOmniChill = currentPlayer.inventory.some(i => i.name === 'Omni-Chill');
        const hungerIncrease = hasOmniChill ? 10 : 20;
        currentPlayer.hunger = Math.min(100, (currentPlayer.hunger || 0) + hungerIncrease);
        if (currentPlayer.hunger > 50) {
            currentPlayer.updateHappiness(-5);
            summary.events.push({
                type: 'warning',
                label: 'Bio-Deficit Deduction',
                value: -5,
                unit: 'Morale',
                icon: 'restaurant'
            });
            this.gameState.addLogMessage(`${this._getPlayerName(currentPlayer)} bio-integrity at risk...`, 'warning');
            EventBus.publish(STATE_EVENTS.HAPPINESS_CHANGED, { player: currentPlayer, amount: -5, gameState: this.gameState });
        }
        EventBus.publish(STATE_EVENTS.HUNGER_CHANGED, { player: currentPlayer, amount: hungerIncrease, gameState: this.gameState });

        // 6. Apply morale gain (Cycle Rest)
        const hasHypnoScreen = currentPlayer.inventory.some(i => i.name === 'Hypno-Screen');
        const moraleGain = hasHypnoScreen ? 11 : 10;
        currentPlayer.updateHappiness(moraleGain);
        summary.events.push({
            type: 'success',
            label: 'Cycle Recovery',
            value: moraleGain,
            unit: 'Morale',
            icon: 'bedtime'
        });
        this.gameState.addLogMessage(
            `${this._getPlayerName(currentPlayer)} recovered ${moraleGain} Morale Quota during cycle recovery.`,
            'success'
        );
        EventBus.publish(STATE_EVENTS.HAPPINESS_CHANGED, { player: currentPlayer, amount: moraleGain, gameState: this.gameState });

        // 7. Add graduation events
        if (currentPlayer.weeklyGraduations && currentPlayer.weeklyGraduations.length > 0) {
            currentPlayer.weeklyGraduations.forEach(courseName => {
                summary.events.push({
                    type: 'success',
                    label: `Certified: ${courseName}`,
                    value: 0,
                    unit: 'NONE',
                    icon: 'school'
                });
            });
        }

        // 7. Calculate totals from tracked stats
        summary.totals.cashChange = currentPlayer.weeklyIncome - currentPlayer.weeklyExpenses;
        summary.totals.happinessChange = currentPlayer.weeklyHappinessChange;

        // Reset weekly stats for the next week
        currentPlayer.resetWeeklyStats();
        
        // 7. Reset time for the next turn, accounting for any deficit
        const timeDeficit = currentPlayer.timeDeficit;
        currentPlayer.setTime(24 - timeDeficit);
        
        if (timeDeficit > 0) {
            this.gameState.addLogMessage(
                `${this._getPlayerName(currentPlayer)} started with ${timeDeficit}CH deficit due to relocation protocol.`,
                'warning'
            );
            currentPlayer.timeDeficit = 0;
        }

        // 8. Reset location to Home
        currentPlayer.setLocation("Hab-Pod 404");
        this.gameState.activeLocationDashboard = null;
        this.gameState.activeChoiceContext = null;
        this.gameState.addLogMessage(
            `${this._getPlayerName(currentPlayer)} returned to Hab-Pod 404.`,
            'info'
        );

        // Ensure AI loading state is cleared if it was the AI's turn
        if (currentPlayer.isAI) {
            EventBus.publish('aiThinkingEnd');
        }

        // Persist summary in GameState
        this.gameState.pendingTurnSummary = summary;

        // Publish turn ended with summary
        EventBus.publish('turnEnded', summary);
        
        EventBus.publish(STATE_EVENTS.TURN_CHANGED, { 
            turn: this.gameState.turn, 
            player: this.gameState.getCurrentPlayer(),
            gameState: this.gameState 
        });
        EventBus.publish(STATE_EVENTS.TIME_CHANGED, { player: currentPlayer, gameState: this.gameState });
        EventBus.publish(STATE_EVENTS.LOCATION_CHANGED, { player: currentPlayer, location: 'Hab-Pod 404', gameState: this.gameState });
        EventBus.publish('stateChanged', this.gameState);
        return summary;
    }

    advanceTurn(): void {
        // Clear pending summary as we are moving to next turn
        this.gameState.pendingTurnSummary = null;

        // Advance to the next player
        this.gameState.currentPlayerIndex = (this.gameState.currentPlayerIndex + 1) % this.gameState.players.length;

        if (this.gameState.currentPlayerIndex === 0) {
            this.gameState.turn++;
        }
        
        const nextPlayer = this.gameState.getCurrentPlayer();
        
        EventBus.publish(STATE_EVENTS.PLAYER_CHANGED, { 
            previousPlayer: this.gameState.players[(this.gameState.currentPlayerIndex - 1 + this.gameState.players.length) % this.gameState.players.length],
            currentPlayer: nextPlayer,
            gameState: this.gameState 
        });
        
        // Notify state change for the new player's turn
        EventBus.publish('stateChanged', this.gameState);

        // ADD AI TURN LOGIC
        if (nextPlayer.isAI && this.gameState.aiController) {
            // Notify view to show loading
            this.gameState.isAIThinking = true;
            EventBus.publish('aiThinkingStart');
            EventBus.publish('stateChanged', this.gameState);
            
            // Delay AI processing so player can see the turn transition
            setTimeout(() => {
                this.gameState.processAITurn();
            }, 1000);
        }
    }
}

export default TimeSystem;
