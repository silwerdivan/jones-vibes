import Player from './Player.js';
import { JOBS, COURSES, SHOPPING_ITEMS } from './gameData.js'; // LOCATIONS is unused, can be removed
import EventBus from '../EventBus.js';
import AIController from './AIController.js'; // --- 1. IMPORT THE AI CONTROLLER

class GameState {
    constructor(numberOfPlayers, isPlayer2AI = false) {
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

        this.aiController = isPlayer2AI ? new AIController() : null; // --- 2. INSTANTIATE THE AI CONTROLLER
        this.log = [];
    }

    _formatMoney(amount) {
        return `$${amount.toLocaleString()}`;
    }

    _getPlayerName(player) {
        return player.name || `Player ${player.id}`;
    }

    publishCurrentState() {
        EventBus.publish('stateChanged', this);
    }

    addLogMessage(message, category = 'info') {
        const formattedMessage = {
            text: message,
            category: category,
            timestamp: new Date().toLocaleTimeString()
        };
        this.log.unshift(formattedMessage);
        EventBus.publish('stateChanged', this);
    }
    getCurrentPlayer() {
        return this.players[this.currentPlayerIndex];
    }

    endTurn() {
        const currentPlayer = this.getCurrentPlayer();

        // 1. Apply daily expenses
        currentPlayer.spendCash(this.DAILY_EXPENSE);
        this.addLogMessage(
            `${this._getPlayerName(currentPlayer)} paid ${this._formatMoney(this.DAILY_EXPENSE)} for daily expenses.`,
            'expense'
        );

        // 2. Apply loan interest
        if (currentPlayer.loan > 0) {
            const interest = Math.round(currentPlayer.loan * 0.10); // 10% interest
            currentPlayer.loan += interest;
            this.addLogMessage(
                `${this._getPlayerName(currentPlayer)} was charged ${this._formatMoney(interest)} in loan interest.`,
                'warning'
            );
        }
        
        // 3. Reset time for the next turn
        currentPlayer.setTime(24);

        // 4. Reset location to Home
        currentPlayer.setLocation("Home");
        this.addLogMessage(
            `${this._getPlayerName(currentPlayer)} returned home.`,
            'info'
        );


        // Advance to the next player
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;

        if (this.currentPlayerIndex === 0) {
            this.turn++;
        }
        
        // --- 3. ADD AI TURN LOGIC ---
        const nextPlayer = this.getCurrentPlayer();
        if (nextPlayer.isAI && this.aiController) {
            // Use a timeout to give the player a moment to see the state change
            setTimeout(() => {
                this.processAITurn();
            }, 1500); // 1.5 second delay
        }

        EventBus.publish('stateChanged', this);
    }

    processAITurn() {
        const currentPlayer = this.getCurrentPlayer();
    this.addLogMessage(
        `🤔 ${this._getPlayerName(currentPlayer)} is contemplating their next move...`,
        'info'
    );
        const aiAction = this.aiController.takeTurn(this, currentPlayer);
        this.handleAIAction(aiAction);
    }

    // --- 4. NEW METHOD TO HANDLE THE AI'S CHOSEN ACTION ---
    handleAIAction(aiAction) {
        if (!aiAction || !aiAction.action) {
            this.endTurn(); // AI chooses to do nothing
            return;
        }

        // The 'pass' action should immediately end the turn.
        if (aiAction.action === 'pass') {
            this.addLogMessage(
                `${this._getPlayerName(this.getCurrentPlayer())} passes their turn.`,
                'info'
            );
            this.endTurn();
            return;
        }

        let success = false;
        let actionDescription = `AI decides to: ${aiAction.action}`;
        if (aiAction.params) {
            actionDescription += ` with params: ${JSON.stringify(aiAction.params)}`;
        }
        this.addLogMessage(actionDescription);

        // This switch executes the appropriate GameState method based on the AI's decision
        switch(aiAction.action) {
            case 'travel':
                success = this.travel(aiAction.params.destination);
                break;
            case 'workShift':
                success = this.workShift();
                break;
            case 'takeCourse':
                success = this.takeCourse(aiAction.params.courseId);
                break;
            case 'buyItem':
                success = this.buyItem(aiAction.params.itemName);
                break;
            case 'buyCar':
                success = this.buyCar();
                break;
            case 'deposit':
                success = this.deposit(aiAction.params.amount);
                break;
            case 'withdraw':
                success = this.withdraw(aiAction.params.amount);
                break;
            case 'takeLoan':
                success = this.takeLoan(aiAction.params.amount);
                break;
            case 'repayLoan':
                success = this.repayLoan(aiAction.params.amount);
                break;
            default:
                console.warn(`AI tried to perform an unknown action: ${aiAction.action}`);
                success = false;
                break;
        }

        // After an action, decide whether to continue the turn or end it.
        const playerHasTime = this.getCurrentPlayer().time > 0;

        if (success && playerHasTime) {
            this.checkWinCondition(this.getCurrentPlayer());
            this.addLogMessage(
                `${this._getPlayerName(this.getCurrentPlayer())} is deciding next move...`,
                'info'
            );
            setTimeout(() => this.processAITurn(), 1000);
        } else {
            if (!success) {
                this.addLogMessage(
                    `${this._getPlayerName(this.getCurrentPlayer())}'s action failed.`,
                    'warning'
                );
            }
            this.endTurn();
        }
    }

    checkWinCondition(player) {
        if (this.gameOver) return;

        const cashCondition = player.cash >= 10000;
        const happinessCondition = player.happiness >= 80;
        const educationCondition = player.educationLevel >= 3; // Completed Community College
        const careerCondition = player.careerLevel >= 4; // Junior Manager

        if (cashCondition && happinessCondition && educationCondition && careerCondition) {
            this.gameOver = true;
            this.winner = player;
            this.addLogMessage(
                `🎉 ${this._getPlayerName(player)} has won the game!`,
                'success'
            );
            EventBus.publish('gameOver', this);
        }
    }

    getNextAvailableCourse() {
        const currentPlayer = this.getCurrentPlayer();
        return COURSES.find(course => course.educationMilestone === currentPlayer.educationLevel + 1) || null;
    }

    _getAvailableJobs(player) {
        return JOBS.filter(job => player.educationLevel >= job.educationRequired);
    }

    workShift() {
        const currentPlayer = this.getCurrentPlayer();

        if (currentPlayer.location !== 'Employment Agency') {
            this.addLogMessage(
                `${this._getPlayerName(currentPlayer)} must be at the Employment Agency to work.`,
                'error'
            );
            return false;
        }

        const availableJobs = this._getAvailableJobs(currentPlayer);
        if (availableJobs.length === 0) {
            this.addLogMessage(
                `No jobs available for ${this._getPlayerName(currentPlayer)}'s education level.`,
                'warning'
            );
            return false;
        }

        // Find the highest-level job from the available list
        const jobToWork = availableJobs.reduce((prev, current) => (prev.level > current.level) ? prev : current);

        if (currentPlayer.time < jobToWork.shiftHours) {
            this.addLogMessage(
                `${this._getPlayerName(currentPlayer)} doesn't have enough time to work as ${jobToWork.title}.`,
                'error'
            );
            return false;
        }

        // Deduct the shiftHours from the player's time.
        currentPlayer.deductTime(jobToWork.shiftHours);

        // Calculate earnings and add to cash.
        const earnings = jobToWork.wage * jobToWork.shiftHours;
        currentPlayer.addCash(earnings);

        // Update the player's careerLevel to jobToWork.level if it's an advancement.
        if (jobToWork.level > currentPlayer.careerLevel) {
            currentPlayer.careerLevel = jobToWork.level;
        }

        this.addLogMessage(
            `${this._getPlayerName(currentPlayer)} worked as ${jobToWork.title} and earned ${this._formatMoney(earnings)}.`,
            'log-success'
        );
        this.checkWinCondition(currentPlayer);
        EventBus.publish('stateChanged', this);
        return true;
    }

    takeCourse(courseId) {
        const currentPlayer = this.getCurrentPlayer();
        const course = COURSES.find(c => c.id === courseId);

        if (currentPlayer.location !== 'Community College') {
            this.addLogMessage(
                `${this._getPlayerName(currentPlayer)} must be at the Community College to take a course.`,
                'error'
            );
            return false;
        }

        if (!course) {
            this.addLogMessage('Course not found.', 'error');
            return false;
        }

        if (currentPlayer.cash < course.cost) {
            this.addLogMessage(
                `${this._getPlayerName(currentPlayer)} needs ${this._formatMoney(course.cost)} to take ${course.name}.`,
                'error'
            );
            return false;
        }

        if (currentPlayer.time < course.time) {
            this.addLogMessage(
                `${this._getPlayerName(currentPlayer)} needs ${course.time} hours to take ${course.name}.`,
                'error'
            );
            return false;
        }

        currentPlayer.spendCash(course.cost);
        currentPlayer.deductTime(course.time);
        currentPlayer.advanceEducation(); // This will set educationLevel to course.educationMilestone

        this.addLogMessage(
            `${this._getPlayerName(currentPlayer)} completed ${course.name}! Education level is now ${currentPlayer.educationLevel}.`,
            'success'
        );
        this.checkWinCondition(currentPlayer);
        EventBus.publish('stateChanged', this);
        return true;
    }

    buyItem(itemName) {
        const currentPlayer = this.getCurrentPlayer();
        const item = SHOPPING_ITEMS.find(i => i.name === itemName);

        if (currentPlayer.location !== 'Shopping Mall') {
            this.addLogMessage(
                `${this._getPlayerName(currentPlayer)} must be at the Shopping Mall to shop.`,
                'error'
            );
            return false;
        }

        if (!item) {
            this.addLogMessage('Item not found.', 'error');
            return false;
        }

        if (currentPlayer.cash < item.cost) {
            this.addLogMessage(
                `${this._getPlayerName(currentPlayer)} needs ${this._formatMoney(item.cost)} to buy ${item.name}.`,
                'error'
            );
            return false;
        }

        currentPlayer.spendCash(item.cost);
        currentPlayer.updateHappiness(item.happinessBoost);

        this.addLogMessage(
            `${this._getPlayerName(currentPlayer)} bought ${item.name}! Happiness increased by ${item.happinessBoost}.`,
            'success'
        );
        this.checkWinCondition(currentPlayer);
        EventBus.publish('stateChanged', this);
        return true;
    }

    deposit(amount) {
        const currentPlayer = this.getCurrentPlayer();

        if (currentPlayer.location !== 'Bank') {
            this.addLogMessage(
                `${this._getPlayerName(currentPlayer)} must be at the Bank to deposit cash.`,
                'error'
            );
            return false;
        }

        if (amount <= 0) {
            this.addLogMessage('Deposit amount must be positive.', 'error');
            return false;
        }

        if (currentPlayer.deposit(amount)) {
            this.addLogMessage(
                `${this._getPlayerName(currentPlayer)} deposited ${this._formatMoney(amount)}.`,
                'success'
            );
            this.checkWinCondition(currentPlayer);
            EventBus.publish('stateChanged', this);
            return true;
        } else {
            this.addLogMessage(
                `${this._getPlayerName(currentPlayer)} doesn't have enough cash to deposit.`,
                'error'
            );
            return false;
        }
    }

    withdraw(amount) {
        const currentPlayer = this.getCurrentPlayer();

        if (currentPlayer.location !== 'Bank') {
            this.addLogMessage(
                `${this._getPlayerName(currentPlayer)} must be at the Bank to withdraw cash.`,
                'error'
            );
            return false;
        }

        if (amount <= 0) {
            this.addLogMessage('Withdrawal amount must be positive.', 'error');
            return false;
        }

        if (currentPlayer.withdraw(amount)) {
            this.addLogMessage(
                `${this._getPlayerName(currentPlayer)} withdrew ${this._formatMoney(amount)}.`,
                'success'
            );
            this.checkWinCondition(currentPlayer);
            EventBus.publish('stateChanged', this);
            return true;
        } else {
            this.addLogMessage(
                `${this._getPlayerName(currentPlayer)} doesn't have enough savings to withdraw.`,
                'error'
            );
            return false;
        }
    }

    takeLoan(amount) {
        const currentPlayer = this.getCurrentPlayer();
        const MAX_LOAN = 2500;

        if (currentPlayer.location !== 'Bank') {
            this.addLogMessage(
                `${this._getPlayerName(currentPlayer)} must be at the Bank to take a loan.`,
                'error'
            );
            return false;
        }

        if (amount <= 0) {
            this.addLogMessage('Loan amount must be positive.', 'error');
            return false;
        }

        if (currentPlayer.loan + amount > MAX_LOAN) {
            this.addLogMessage(
                `Cannot exceed the ${this._formatMoney(MAX_LOAN)} loan cap. Current loan: ${this._formatMoney(currentPlayer.loan)}.`,
                'error'
            );
            return false;
        }

        currentPlayer.takeLoan(amount);
        currentPlayer.addCash(amount);
        this.addLogMessage(
            `${this._getPlayerName(currentPlayer)} took a loan of ${this._formatMoney(amount)}. Total loan: ${this._formatMoney(currentPlayer.loan)}.`,
            'warning'
        );
        this.checkWinCondition(currentPlayer);
        EventBus.publish('stateChanged', this);
        return true;
    }

    repayLoan(amount) {
        const currentPlayer = this.getCurrentPlayer();

        if (currentPlayer.location !== 'Bank') {
            this.addLogMessage(
                `${this._getPlayerName(currentPlayer)} must be at the Bank to repay a loan.`,
                'error'
            );
            return false;
        }

        if (amount <= 0) {
            this.addLogMessage('Repayment amount must be positive.', 'error');
            return false;
        }

        if (currentPlayer.cash < amount) {
            this.addLogMessage(
                `${this._getPlayerName(currentPlayer)} doesn't have enough cash to repay this amount.`,
                'error'
            );
            return false;
        }

        if (amount > currentPlayer.loan) {
            this.addLogMessage(
                `Repayment amount (${this._formatMoney(amount)}) cannot exceed outstanding loan (${this._formatMoney(currentPlayer.loan)}).`,
                'error'
            );
            return false;
        }

        currentPlayer.spendCash(amount);
        currentPlayer.repayLoan(amount);
        this.addLogMessage(
            `${this._getPlayerName(currentPlayer)} repaid ${this._formatMoney(amount)}. Remaining loan: ${this._formatMoney(currentPlayer.loan)}.`,
            'success'
        );
        this.checkWinCondition(currentPlayer);
        EventBus.publish('stateChanged', this);
        return true;
    }

    buyCar() {
        const currentPlayer = this.getCurrentPlayer();
        const CAR_COST = 3000;

        if (currentPlayer.location !== 'Used Car Lot') {
            this.addLogMessage(
                `${this._getPlayerName(currentPlayer)} must be at the Used Car Lot to buy a car.`,
                'error'
            );
            return false;
        }

        if (currentPlayer.hasCar) {
            this.addLogMessage(
                `${this._getPlayerName(currentPlayer)} already owns a car.`,
                'warning'
            );
            return false;
        }

        if (currentPlayer.cash < CAR_COST) {
            this.addLogMessage(
                `${this._getPlayerName(currentPlayer)} needs ${this._formatMoney(CAR_COST)} to buy a car.`,
                'error'
            );
            return false;
        }

        currentPlayer.spendCash(CAR_COST);
        currentPlayer.giveCar();
        this.addLogMessage(
            `${this._getPlayerName(currentPlayer)} bought a car!`,
            'success'
        );
        this.checkWinCondition(currentPlayer);
        EventBus.publish('stateChanged', this);
        return true;
    }

    travel(destination) {
        const currentPlayer = this.getCurrentPlayer();

        if (currentPlayer.location === destination) {
            this.addLogMessage(
                `${this._getPlayerName(currentPlayer)} is already at this location.`,
                'warning'
            );
            return false;
        }

        const travelTime = currentPlayer.hasCar ? 1 : 2;

        if (currentPlayer.time < travelTime) {
            this.addLogMessage(
                `${this._getPlayerName(currentPlayer)} doesn't have enough time to travel.`,
                'error'
            );
            return false;
        }

        currentPlayer.deductTime(travelTime);
        currentPlayer.setLocation(destination);
        this.addLogMessage(
            `${this._getPlayerName(currentPlayer)} traveled to ${destination}.`,
            'info'
        );
        this.checkWinCondition(currentPlayer);
        EventBus.publish('stateChanged', this);
        return true;
    }
}

export default GameState;