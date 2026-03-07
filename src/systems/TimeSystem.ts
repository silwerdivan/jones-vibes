import GameState from '../game/GameState';
import Player from '../game/Player';
import EventBus, { STATE_EVENTS } from '../EventBus';
import { CONDITIONS } from '../data/conditions';

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
        creditsChange: number;
        sanityChange: number;
    };
}

class TimeSystem {
    private gameState: GameState;

    constructor(gameState: GameState) {
        this.gameState = gameState;
    }

    private _formatMoney(amount: number): string {
        return `₡${amount.toLocaleString()}`;
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
                creditsChange: 0,
                sanityChange: 0
            }
        };

        // 1. Add overall weekly earnings if any
        if (currentPlayer.weeklyIncome > 0) {
            summary.events.push({
                type: 'income',
                label: 'Yield: Cycles',
                value: currentPlayer.weeklyIncome,
                unit: '₡',
                icon: 'payments'
            });
        }

        // 2. Add overall weekly shopping/travel expenses if any
        if (currentPlayer.weeklyExpenses > 0) {
            summary.events.push({
                type: 'expense',
                label: 'Outflow: Logistics',
                value: -currentPlayer.weeklyExpenses,
                unit: '₡',
                icon: 'shopping_cart'
            });
        }

        // 3. Apply weekly Burn Rate
        const burnRate = currentPlayer.calculateBurnRate();
        const availableCredits = currentPlayer.credits;
        const paidAmount = Math.min(burnRate, availableCredits);
        const unpaidAmount = burnRate - paidAmount;

        if (paidAmount > 0) {
            currentPlayer.spendCredits(paidAmount);
        }

        if (unpaidAmount > 0) {
            currentPlayer.addDebt(unpaidAmount);
        }

        summary.events.push({
            type: unpaidAmount > 0 ? 'warning' : 'expense',
            label: unpaidAmount > 0 ? 'Burn Rate (Partial)' : 'Burn Rate',
            value: -paidAmount,
            unit: '₡',
            icon: 'home'
        });

        if (unpaidAmount > 0) {
            this.gameState.addLogMessage(
                `${this._getPlayerName(currentPlayer)} failed to cover full Burn Rate. Paid ${this._formatMoney(paidAmount)}, ${this._formatMoney(unpaidAmount)} added to debt.`,
                'warning'
            );
            EventBus.publish(STATE_EVENTS.DEBT_CHANGED, { player: currentPlayer, amount: unpaidAmount, gameState: this.gameState });
        } else {
            this.gameState.addLogMessage(
                `${this._getPlayerName(currentPlayer)} paid weekly Burn Rate of ${this._formatMoney(burnRate)}.`,
                'expense'
            );
        }
        
        if (paidAmount > 0) {
            EventBus.publish(STATE_EVENTS.CREDITS_CHANGED, { player: currentPlayer, amount: -paidAmount, gameState: this.gameState });
        }

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
                unit: '₡',
                icon: 'account_balance'
            });
            
            this.gameState.addLogMessage(
                `${this._getPlayerName(currentPlayer)} charged ${this._formatMoney(interest)} in credit-debt accumulation.`,
                'warning'
            );
            EventBus.publish(STATE_EVENTS.LOAN_CHANGED, { player: currentPlayer, amount: interest, gameState: this.gameState });
        }

        // 4.5 Apply Burn Rate debt interest and default condition
        if (currentPlayer.debt > 0) {
            const debtInterest = Math.round(currentPlayer.debt * 0.10); // 10% interest
            currentPlayer.addDebt(debtInterest);
            
            summary.events.push({
                type: 'warning',
                label: 'Service Interest',
                value: -debtInterest,
                unit: '₡',
                icon: 'warning'
            });
            
            this.gameState.addLogMessage(
                `${this._getPlayerName(currentPlayer)} charged ${this._formatMoney(debtInterest)} in subscription-debt interest.`,
                'warning'
            );
            
            // Apply SUBSCRIPTION_DEFAULT condition
            currentPlayer.addCondition({...CONDITIONS['SUBSCRIPTION_DEFAULT']});
            this.gameState.addLogMessage(
                `${this._getPlayerName(currentPlayer)} is in SUBSCRIPTION DEFAULT. Services limited.`,
                'danger'
            );
            
            EventBus.publish(STATE_EVENTS.DEBT_CHANGED, { player: currentPlayer, amount: debtInterest, gameState: this.gameState });
        }

        // 5. Apply hunger
        const hasThermalRegulator = currentPlayer.inventory.some(i => i.name === 'Thermal-Regulator');
        const hungerIncrease = hasThermalRegulator ? 10 : 20;
        currentPlayer.hunger = Math.min(100, (currentPlayer.hunger || 0) + hungerIncrease);
        if (currentPlayer.hunger > 50) {
            currentPlayer.updateSanity(-5);
            summary.events.push({
                type: 'warning',
                label: 'Bio-Deficit Deduction',
                value: -5,
                unit: 'Sanity',
                icon: 'restaurant'
            });
            this.gameState.addLogMessage(`${this._getPlayerName(currentPlayer)} bio-integrity at risk...`, 'warning');
            EventBus.publish(STATE_EVENTS.SANITY_CHANGED, { player: currentPlayer, amount: -5, gameState: this.gameState });
        }
        EventBus.publish(STATE_EVENTS.HUNGER_CHANGED, { player: currentPlayer, amount: hungerIncrease, gameState: this.gameState });

        // 5.5 Apply ambient sanity drain (Ambient Stress)
        const ambientDrain = -10;
        currentPlayer.updateSanity(ambientDrain);
        summary.events.push({
            type: 'warning',
            label: 'Ambient Stress',
            value: ambientDrain,
            unit: 'Sanity',
            icon: 'psychology'
        });
        this.gameState.addLogMessage(
            `${this._getPlayerName(currentPlayer)} experienced ${Math.abs(ambientDrain)} Sanity loss from ambient stress.`,
            'warning'
        );
        EventBus.publish(STATE_EVENTS.SANITY_CHANGED, { player: currentPlayer, amount: ambientDrain, gameState: this.gameState });

        // 6. Apply sanity gain (Cycle Rest)
        const hasHypnoScreen = currentPlayer.inventory.some(i => i.name === 'Hypno-Screen');
        const sanityGain = hasHypnoScreen ? 11 : 10;
        currentPlayer.updateSanity(sanityGain);
        summary.events.push({
            type: 'success',
            label: 'Cycle Recovery',
            value: sanityGain,
            unit: 'Sanity',
            icon: 'bedtime'
        });
        this.gameState.addLogMessage(
            `${this._getPlayerName(currentPlayer)} recovered ${sanityGain} Sanity during cycle recovery.`,
            'success'
        );
        EventBus.publish(STATE_EVENTS.SANITY_CHANGED, { player: currentPlayer, amount: sanityGain, gameState: this.gameState });

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
        summary.totals.creditsChange = currentPlayer.weeklyIncome - currentPlayer.weeklyExpenses;
        summary.totals.sanityChange = currentPlayer.weeklySanityChange;

        // Reset weekly stats for the next week
        currentPlayer.resetWeeklyStats();
        
        // 7. Reset time for the next turn, accounting for any deficit
        const timeDeficit = currentPlayer.timeDeficit;
        currentPlayer.setTime(24 - timeDeficit);
        
        // Tick conditions for the 24 hours that pass between turns (rest/sleep)
        this.gameState.eventManager.tickConditions(currentPlayer, 24);

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
            // Trigger global events at the start of a new week
            this.gameState.checkGlobalEvents();
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
