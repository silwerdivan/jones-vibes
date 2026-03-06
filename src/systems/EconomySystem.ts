import Player from '../game/Player';
import GameState from '../game/GameState';
import { SHOPPING_ITEMS } from '../data/items';
import EventBus, { STATE_EVENTS } from '../EventBus';
import { GameCondition } from '../models/types';

class EconomySystem {
    private gameState: GameState;

    constructor(gameState: GameState) {
        this.gameState = gameState;
    }

    private _formatMoney(amount: number): string {
        return `₡${amount.toLocaleString()}`;
    }

    private _getPlayerName(player: Player): string {
        return player.name || `Player ${player.id}`;
    }

    private _checkAutoEndTurn(): void {
        // This is a bit of a leak, but necessary for parity with existing logic
        this.gameState._checkAutoEndTurn();
    }

    buyItem(itemName: string, isAIAction: boolean = false): boolean {
        if (this.gameState.isAIThinking && !isAIAction) {
            return false;
        }

        const currentPlayer = this.gameState.getCurrentPlayer();
        const item = SHOPPING_ITEMS.find(i => i.name === itemName);

        if (!item) {
            this.gameState.addLogMessage('Item not found.', 'error');
            return false;
        }

        if (currentPlayer.location !== item.location) {
            this.gameState.addLogMessage(
                `${this._getPlayerName(currentPlayer)} must be at ${item.location} to buy ${item.name}.`,
                'error'
            );
            return false;
        }

        // Prevent duplicate asset purchases (like Cyberware or Appliances)
        if (item.type === 'asset' && currentPlayer.inventory.some(i => i.name === item.name)) {
            this.gameState.addLogMessage(
                `${this._getPlayerName(currentPlayer)} already owns ${item.name}.`,
                'warning'
            );
            return false;
        }

        if (currentPlayer.credits < item.cost) {
            this.gameState.addLogMessage(
                `${this._getPlayerName(currentPlayer)} needs ${this._formatMoney(item.cost)} to buy ${item.name}.`,
                'error'
            );
            return false;
        }

        currentPlayer.spendCredits(item.cost);
        currentPlayer.updateSanity(item.sanityBoost);

        // Apply hunger reduction if the item has it
        if (item.hungerReduction) {
            currentPlayer.hunger = Math.max(0, currentPlayer.hunger - item.hungerReduction);
        } else if (item.name === 'Coffee') {
            // Fallback for legacy coffee if hungerReduction wasn't added to it
            currentPlayer.hunger = Math.max(0, currentPlayer.hunger - 30);
        }

        // Apply cyberware effects if present
        if (item.cyberwareEffect && item.cyberwareEffect.length > 0) {
            const condition: GameCondition = {
                id: `cyberware_${item.name.toLowerCase().replace(/\s+/g, '_')}`,
                name: item.name,
                description: item.benefit || `Cyberware implant: ${item.name}`,
                remainingDuration: Infinity,
                effects: item.cyberwareEffect,
                icon: item.icon
            };
            currentPlayer.addCondition(condition);
            this.gameState.addLogMessage(`${item.name} installed successfully!`, 'success');
        }

        // Add to inventory if it's an asset or certain essentials
        if (item.type === 'asset' || item.name === 'New Clothes') {
            if (!currentPlayer.inventory.some(i => i.name === item.name)) {
                currentPlayer.inventory.push(item);
            }
        }

        this.gameState.addLogMessage(
            `${this._getPlayerName(currentPlayer)} bought ${item.name}! Sanity increased by ${item.sanityBoost}.`,
            'success'
        );
        this.gameState.checkGameEndConditions(currentPlayer);
        EventBus.publish(STATE_EVENTS.CREDITS_CHANGED, { player: currentPlayer, amount: -item.cost, gameState: this.gameState });
        EventBus.publish(STATE_EVENTS.SANITY_CHANGED, { player: currentPlayer, amount: item.sanityBoost, gameState: this.gameState });
        if (item.hungerReduction) {
            EventBus.publish(STATE_EVENTS.HUNGER_CHANGED, { player: currentPlayer, amount: -item.hungerReduction, gameState: this.gameState });
        }
        if (item.maintenanceCost) {
            EventBus.publish(STATE_EVENTS.BURN_RATE_CHANGED, { player: currentPlayer, amount: item.maintenanceCost, gameState: this.gameState });
        }
        EventBus.publish(STATE_EVENTS.INVENTORY_CHANGED, { player: currentPlayer, gameState: this.gameState });
        EventBus.publish('stateChanged', this.gameState);
        this._checkAutoEndTurn();
        return true;
    }

    deposit(amount: number, isAIAction: boolean = false): boolean {
        if (this.gameState.isAIThinking && !isAIAction) {
            return false;
        }

        const currentPlayer = this.gameState.getCurrentPlayer();

        if (currentPlayer.location !== 'Cred-Debt Ctr') {
            this.gameState.addLogMessage(
                `${this._getPlayerName(currentPlayer)} must be at the Cred-Debt Ctr to deposit credits.`,
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
            EventBus.publish(STATE_EVENTS.CREDITS_CHANGED, { player: currentPlayer, amount: -amount, gameState: this.gameState });
            EventBus.publish(STATE_EVENTS.SAVINGS_CHANGED, { player: currentPlayer, amount: amount, gameState: this.gameState });
            EventBus.publish('stateChanged', this.gameState);
            this._checkAutoEndTurn();
            return true;
        } else {
            this.gameState.addLogMessage(
                `${this._getPlayerName(currentPlayer)} doesn't have enough credits to deposit.`,
                'error'
            );
            return false;
        }
    }

    withdraw(amount: number, isAIAction: boolean = false): boolean {
        if (this.gameState.isAIThinking && !isAIAction) {
            return false;
        }

        const currentPlayer = this.gameState.getCurrentPlayer();

        if (currentPlayer.location !== 'Cred-Debt Ctr') {
            this.gameState.addLogMessage(
                `${this._getPlayerName(currentPlayer)} must be at the Cred-Debt Ctr to withdraw credits.`,
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
            EventBus.publish(STATE_EVENTS.CREDITS_CHANGED, { player: currentPlayer, amount: amount, gameState: this.gameState });
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

    takeLoan(amount: number, isAIAction: boolean = false): boolean {
        if (this.gameState.isAIThinking && !isAIAction) {
            return false;
        }

        const currentPlayer = this.gameState.getCurrentPlayer();
        const MAX_LOAN = 2500;

        if (currentPlayer.location !== 'Cred-Debt Ctr') {
            this.gameState.addLogMessage(
                `${this._getPlayerName(currentPlayer)} must be at the Cred-Debt Ctr to take a loan.`,
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
        currentPlayer.addCredits(amount);
        this.gameState.addLogMessage(
            `${this._getPlayerName(currentPlayer)} took a loan of ${this._formatMoney(amount)}. Total loan: ${this._formatMoney(currentPlayer.loan)}.`,
            'warning'
        );
        this.gameState.checkGameEndConditions(currentPlayer);
        EventBus.publish(STATE_EVENTS.CREDITS_CHANGED, { player: currentPlayer, amount: amount, gameState: this.gameState });
        EventBus.publish(STATE_EVENTS.LOAN_CHANGED, { player: currentPlayer, amount: amount, gameState: this.gameState });
        EventBus.publish('stateChanged', this.gameState);
        this._checkAutoEndTurn();
        return true;
    }

    repayLoan(amount: number, isAIAction: boolean = false): boolean {
        if (this.gameState.isAIThinking && !isAIAction) {
            return false;
        }

        const currentPlayer = this.gameState.getCurrentPlayer();

        if (currentPlayer.location !== 'Cred-Debt Ctr') {
            this.gameState.addLogMessage(
                `${this._getPlayerName(currentPlayer)} must be at the Cred-Debt Ctr to repay a loan.`,
                'error'
            );
            return false;
        }

        if (amount <= 0) {
            this.gameState.addLogMessage('Repayment amount must be positive.', 'error');
            return false;
        }

        if (currentPlayer.credits < amount) {
            this.gameState.addLogMessage(
                `${this._getPlayerName(currentPlayer)} doesn't have enough credits to repay this amount.`,
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

        currentPlayer.spendCredits(amount);
        currentPlayer.repayLoan(amount);
        this.gameState.addLogMessage(
            `${this._getPlayerName(currentPlayer)} repaid ${this._formatMoney(amount)}. Remaining loan: ${this._formatMoney(currentPlayer.loan)}.`,
            'success'
        );
        this.gameState.checkGameEndConditions(currentPlayer);
        EventBus.publish(STATE_EVENTS.CREDITS_CHANGED, { player: currentPlayer, amount: -amount, gameState: this.gameState });
        EventBus.publish(STATE_EVENTS.LOAN_CHANGED, { player: currentPlayer, amount: -amount, gameState: this.gameState });
        EventBus.publish('stateChanged', this.gameState);
        this._checkAutoEndTurn();
        return true;
    }

    buyCar(isAIAction: boolean = false): boolean {
        if (this.gameState.isAIThinking && !isAIAction) {
            return false;
        }

        const currentPlayer = this.gameState.getCurrentPlayer();
        const CAR_COST = 3000;
        const TIME_COST = 4;

        if (currentPlayer.location !== 'Mobility-Asset') {
            this.gameState.addLogMessage(
                `${this._getPlayerName(currentPlayer)} must be at the Mobility-Asset to buy a car.`,
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

        if (currentPlayer.credits < CAR_COST) {
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

        currentPlayer.spendCredits(CAR_COST);
        currentPlayer.deductTime(TIME_COST);
        currentPlayer.giveCar();
        this.gameState.addLogMessage(
            `${this._getPlayerName(currentPlayer)} bought a car!`,
            'success'
        );
        this.gameState.checkGameEndConditions(currentPlayer);
        EventBus.publish(STATE_EVENTS.CREDITS_CHANGED, { player: currentPlayer, amount: -CAR_COST, gameState: this.gameState });
        EventBus.publish(STATE_EVENTS.TIME_CHANGED, { player: currentPlayer, gameState: this.gameState });
        EventBus.publish(STATE_EVENTS.INVENTORY_CHANGED, { player: currentPlayer, gameState: this.gameState });
        EventBus.publish('stateChanged', this.gameState);
        this._checkAutoEndTurn();
        return true;
    }
}

export default EconomySystem;