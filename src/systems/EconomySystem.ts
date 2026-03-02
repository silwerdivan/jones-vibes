import Player from '../game/Player';
import GameState from '../game/GameState';
import { SHOPPING_ITEMS } from '../data/items';
import EventBus, { STATE_EVENTS } from '../EventBus';

class EconomySystem {
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

    private _checkAutoEndTurn(): void {
        // This is a bit of a leak, but necessary for parity with existing logic
        this.gameState._checkAutoEndTurn();
    }

    buyItem(itemName: string): boolean {
        const currentPlayer = this.gameState.getCurrentPlayer();
        const item = SHOPPING_ITEMS.find(i => i.name === itemName);

        if (currentPlayer.location !== 'Shopping Mall' && currentPlayer.location !== 'Fast Food') {
            this.gameState.addLogMessage(
                `${this._getPlayerName(currentPlayer)} must be at the Shopping Mall or Fast Food to shop.`,
                'error'
            );
            return false;
        }

        if (!item) {
            this.gameState.addLogMessage('Item not found.', 'error');
            return false;
        }

        if (currentPlayer.cash < item.cost) {
            this.gameState.addLogMessage(
                `${this._getPlayerName(currentPlayer)} needs ${this._formatMoney(item.cost)} to buy ${item.name}.`,
                'error'
            );
            return false;
        }

        currentPlayer.spendCash(item.cost);
        currentPlayer.updateHappiness(item.happinessBoost);

        // Apply hunger reduction if the item has it
        if (item.hungerReduction) {
            currentPlayer.hunger = Math.max(0, currentPlayer.hunger - item.hungerReduction);
        } else if (item.name === 'Coffee') {
            // Fallback for legacy coffee if hungerReduction wasn't added to it
            currentPlayer.hunger = Math.max(0, currentPlayer.hunger - 30);
        }

        // Add to inventory if it's an asset or certain essentials
        if (item.type === 'asset' || item.name === 'New Clothes') {
            if (!currentPlayer.inventory.some(i => i.name === item.name)) {
                currentPlayer.inventory.push(item);
            }
        }

        this.gameState.addLogMessage(
            `${this._getPlayerName(currentPlayer)} bought ${item.name}! Happiness increased by ${item.happinessBoost}.`,
            'success'
        );
        this.gameState.checkGameEndConditions(currentPlayer);
        EventBus.publish(STATE_EVENTS.CASH_CHANGED, { player: currentPlayer, amount: -item.cost, gameState: this.gameState });
        EventBus.publish(STATE_EVENTS.HAPPINESS_CHANGED, { player: currentPlayer, amount: item.happinessBoost, gameState: this.gameState });
        if (item.hungerReduction) {
            EventBus.publish(STATE_EVENTS.HUNGER_CHANGED, { player: currentPlayer, amount: -item.hungerReduction, gameState: this.gameState });
        }
        EventBus.publish(STATE_EVENTS.INVENTORY_CHANGED, { player: currentPlayer, gameState: this.gameState });
        EventBus.publish('stateChanged', this.gameState);
        this._checkAutoEndTurn();
        return true;
    }

    deposit(amount: number): boolean {
        const currentPlayer = this.gameState.getCurrentPlayer();

        if (currentPlayer.location !== 'Bank') {
            this.gameState.addLogMessage(
                `${this._getPlayerName(currentPlayer)} must be at the Bank to deposit cash.`,
                'error'
            );
            return false;
        }

        if (amount <= 0) {
            this.gameState.addLogMessage('Deposit amount must be positive.', 'error');
            return false;
        }

        if (currentPlayer.deposit(amount)) {
            this.gameState.addLogMessage(
                `${this._getPlayerName(currentPlayer)} deposited ${this._formatMoney(amount)}.`,
                'success'
            );
            this.gameState.checkGameEndConditions(currentPlayer);
            EventBus.publish(STATE_EVENTS.CASH_CHANGED, { player: currentPlayer, amount: -amount, gameState: this.gameState });
            EventBus.publish(STATE_EVENTS.SAVINGS_CHANGED, { player: currentPlayer, amount: amount, gameState: this.gameState });
            EventBus.publish('stateChanged', this.gameState);
            this._checkAutoEndTurn();
            return true;
        } else {
            this.gameState.addLogMessage(
                `${this._getPlayerName(currentPlayer)} doesn't have enough cash to deposit.`,
                'error'
            );
            return false;
        }
    }

    withdraw(amount: number): boolean {
        const currentPlayer = this.gameState.getCurrentPlayer();

        if (currentPlayer.location !== 'Bank') {
            this.gameState.addLogMessage(
                `${this._getPlayerName(currentPlayer)} must be at the Bank to withdraw cash.`,
                'error'
            );
            return false;
        }

        if (amount <= 0) {
            this.gameState.addLogMessage('Withdrawal amount must be positive.', 'error');
            return false;
        }

        if (currentPlayer.withdraw(amount)) {
            this.gameState.addLogMessage(
                `${this._getPlayerName(currentPlayer)} withdrew ${this._formatMoney(amount)}.`,
                'success'
            );
            this.gameState.checkGameEndConditions(currentPlayer);
            EventBus.publish(STATE_EVENTS.CASH_CHANGED, { player: currentPlayer, amount: amount, gameState: this.gameState });
            EventBus.publish(STATE_EVENTS.SAVINGS_CHANGED, { player: currentPlayer, amount: -amount, gameState: this.gameState });
            EventBus.publish('stateChanged', this.gameState);
            this._checkAutoEndTurn();
            return true;
        } else {
            this.gameState.addLogMessage(
                `${this._getPlayerName(currentPlayer)} doesn't have enough savings to withdraw.`,
                'error'
            );
            return false;
        }
    }

    takeLoan(amount: number): boolean {
        const currentPlayer = this.gameState.getCurrentPlayer();
        const MAX_LOAN = 2500;

        if (currentPlayer.location !== 'Bank') {
            this.gameState.addLogMessage(
                `${this._getPlayerName(currentPlayer)} must be at the Bank to take a loan.`,
                'error'
            );
            return false;
        }

        if (amount <= 0) {
            this.gameState.addLogMessage('Loan amount must be positive.', 'error');
            return false;
        }

        if (currentPlayer.loan + amount > MAX_LOAN) {
            this.gameState.addLogMessage(
                `Cannot exceed the ${this._formatMoney(MAX_LOAN)} loan cap. Current loan: ${this._formatMoney(currentPlayer.loan)}.`,
                'error'
            );
            return false;
        }

        currentPlayer.takeLoan(amount);
        currentPlayer.addCash(amount);
        this.gameState.addLogMessage(
            `${this._getPlayerName(currentPlayer)} took a loan of ${this._formatMoney(amount)}. Total loan: ${this._formatMoney(currentPlayer.loan)}.`,
            'warning'
        );
        this.gameState.checkGameEndConditions(currentPlayer);
        EventBus.publish(STATE_EVENTS.CASH_CHANGED, { player: currentPlayer, amount: amount, gameState: this.gameState });
        EventBus.publish(STATE_EVENTS.LOAN_CHANGED, { player: currentPlayer, amount: amount, gameState: this.gameState });
        EventBus.publish('stateChanged', this.gameState);
        this._checkAutoEndTurn();
        return true;
    }

    repayLoan(amount: number): boolean {
        const currentPlayer = this.gameState.getCurrentPlayer();

        if (currentPlayer.location !== 'Bank') {
            this.gameState.addLogMessage(
                `${this._getPlayerName(currentPlayer)} must be at the Bank to repay a loan.`,
                'error'
            );
            return false;
        }

        if (amount <= 0) {
            this.gameState.addLogMessage('Repayment amount must be positive.', 'error');
            return false;
        }

        if (currentPlayer.cash < amount) {
            this.gameState.addLogMessage(
                `${this._getPlayerName(currentPlayer)} doesn't have enough cash to repay this amount.`,
                'error'
            );
            return false;
        }

        if (amount > currentPlayer.loan) {
            this.gameState.addLogMessage(
                `Repayment amount (${this._formatMoney(amount)}) cannot exceed outstanding loan (${this._formatMoney(currentPlayer.loan)}).`,
                'error'
            );
            return false;
        }

        currentPlayer.spendCash(amount);
        currentPlayer.repayLoan(amount);
        this.gameState.addLogMessage(
            `${this._getPlayerName(currentPlayer)} repaid ${this._formatMoney(amount)}. Remaining loan: ${this._formatMoney(currentPlayer.loan)}.`,
            'success'
        );
        this.gameState.checkGameEndConditions(currentPlayer);
        EventBus.publish(STATE_EVENTS.CASH_CHANGED, { player: currentPlayer, amount: -amount, gameState: this.gameState });
        EventBus.publish(STATE_EVENTS.LOAN_CHANGED, { player: currentPlayer, amount: -amount, gameState: this.gameState });
        EventBus.publish('stateChanged', this.gameState);
        this._checkAutoEndTurn();
        return true;
    }

    buyCar(): boolean {
        const currentPlayer = this.gameState.getCurrentPlayer();
        const CAR_COST = 3000;
        const TIME_COST = 4;

        if (currentPlayer.location !== 'Used Car Lot') {
            this.gameState.addLogMessage(
                `${this._getPlayerName(currentPlayer)} must be at the Used Car Lot to buy a car.`,
                'error'
            );
            return false;
        }

        if (currentPlayer.hasCar) {
            this.gameState.addLogMessage(
                `${this._getPlayerName(currentPlayer)} already owns a car.`,
                'warning'
            );
            return false;
        }

        if (currentPlayer.cash < CAR_COST) {
            this.gameState.addLogMessage(
                `${this._getPlayerName(currentPlayer)} needs ${this._formatMoney(CAR_COST)} to buy a car.`,
                'error'
            );
            return false;
        }

        if (currentPlayer.time < TIME_COST) {
            this.gameState.addLogMessage(
                `${this._getPlayerName(currentPlayer)} needs ${TIME_COST} hours to buy a car.`,
                'error'
            );
            return false;
        }

        currentPlayer.spendCash(CAR_COST);
        currentPlayer.deductTime(TIME_COST);
        currentPlayer.giveCar();
        this.gameState.addLogMessage(
            `${this._getPlayerName(currentPlayer)} bought a car!`,
            'success'
        );
        this.gameState.checkGameEndConditions(currentPlayer);
        EventBus.publish(STATE_EVENTS.CASH_CHANGED, { player: currentPlayer, amount: -CAR_COST, gameState: this.gameState });
        EventBus.publish(STATE_EVENTS.TIME_CHANGED, { player: currentPlayer, gameState: this.gameState });
        EventBus.publish(STATE_EVENTS.INVENTORY_CHANGED, { player: currentPlayer, gameState: this.gameState });
        EventBus.publish('stateChanged', this.gameState);
        this._checkAutoEndTurn();
        return true;
    }
}

export default EconomySystem;
