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
        return `$${amount.toLocaleString()}`;
    }

    private _getPlayerName(player: Player): string {
        return player.name || `Player ${player.id}`;
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
                label: 'Weekly Earnings',
                value: currentPlayer.weeklyIncome,
                unit: '$',
                icon: 'payments'
            });
        }

        // 2. Add overall weekly shopping/travel expenses if any
        if (currentPlayer.weeklyExpenses > 0) {
            summary.events.push({
                type: 'expense',
                label: 'Shopping & Travel',
                value: -currentPlayer.weeklyExpenses,
                unit: '$',
                icon: 'shopping_cart'
            });
        }

        // 3. Apply daily expenses (weekend)
        currentPlayer.spendCash(this.gameState.DAILY_EXPENSE);
        summary.events.push({
            type: 'expense',
            label: 'Weekend Expenses',
            value: -this.gameState.DAILY_EXPENSE,
            unit: '$',
            icon: 'home'
        });

        this.gameState.addLogMessage(
            `${this._getPlayerName(currentPlayer)} paid ${this._formatMoney(this.gameState.DAILY_EXPENSE)} for weekend expenses.`,
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
                label: 'Loan Interest',
                value: -interest,
                unit: '$',
                icon: 'account_balance'
            });
            
            this.gameState.addLogMessage(
                `${this._getPlayerName(currentPlayer)} was charged ${this._formatMoney(interest)} in loan interest.`,
                'warning'
            );
            EventBus.publish(STATE_EVENTS.LOAN_CHANGED, { player: currentPlayer, amount: interest, gameState: this.gameState });
        }

        // 5. Apply hunger
        currentPlayer.hunger = Math.min(100, (currentPlayer.hunger || 0) + 20);
        if (currentPlayer.hunger > 50) {
            currentPlayer.updateHappiness(-5);
            summary.events.push({
                type: 'warning',
                label: 'Hunger Penalty',
                value: -5,
                unit: 'Happiness',
                icon: 'restaurant'
            });
            this.gameState.addLogMessage(`${this._getPlayerName(currentPlayer)} is feeling hungry...`, 'warning');
            EventBus.publish(STATE_EVENTS.HAPPINESS_CHANGED, { player: currentPlayer, amount: -5, gameState: this.gameState });
        }
        EventBus.publish(STATE_EVENTS.HUNGER_CHANGED, { player: currentPlayer, amount: 20, gameState: this.gameState });

        // 6. Calculate totals from tracked stats
        summary.totals.cashChange = currentPlayer.weeklyIncome - currentPlayer.weeklyExpenses;
        summary.totals.happinessChange = currentPlayer.weeklyHappinessChange;

        // Reset weekly stats for the next week
        currentPlayer.resetWeeklyStats();
        
        // 7. Reset time for the next turn, accounting for any deficit
        const timeDeficit = currentPlayer.timeDeficit;
        currentPlayer.setTime(24 - timeDeficit);
        
        if (timeDeficit > 0) {
            this.gameState.addLogMessage(
                `${this._getPlayerName(currentPlayer)} started with ${timeDeficit} hour${timeDeficit > 1 ? 's' : ''} less due to incomplete travel.`,
                'warning'
            );
            currentPlayer.timeDeficit = 0;
        }

        // 8. Reset location to Home
        currentPlayer.setLocation("Home");
        this.gameState.activeLocationDashboard = null;
        this.gameState.activeChoiceContext = null;
        this.gameState.addLogMessage(
            `${this._getPlayerName(currentPlayer)} returned home.`,
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
        EventBus.publish(STATE_EVENTS.LOCATION_CHANGED, { player: currentPlayer, location: 'Home', gameState: this.gameState });
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
